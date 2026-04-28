import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EditorPalette, ThemeKey } from './Palette.types';
import { PaletteGeneratorService } from './PaletteGeneratorService';
import { buildLineNumbers, tokenizeRust } from './rust_tokenizer';


// ── Rust source ───────────────────────────────────────────────────────────────
const RUST_SOURCE = `mod mods;
use mods::HealthModule;
use mods::UrlModule;
// use mods::RedirectModule;
use murgamu::prelude::*;
use murgamu::{MurMainResult, MurServer, mur_env};
#[murgamu::main]
async fn main() -> MurMainResult {
\tlet database_url = mur_env("DATABASE_URL")?;
\tlet pool = sqlx::postgres::PgPoolOptions::new()
\t\t.max_connections(20)
\t\t.connect(&database_url)
\t\t.await
\t\t.expect("Failed to connect to database");
\t\t//   sqlx::raw_sql(INIT_SQL)
\t\t// .execute(&pool)
\t\t// .await
\t\t// .expect("Failed to initialize database");
\tMurServer::new()
\t\t.service(PsqlPool(pool))
\t\t.module(HealthModule::new())
\t\t.module(UrlModule::new())
\t\t.bind("0.0.0.0:3000")?
\t\t.run()
\t\t.await
}
#[derive(Clone)]
pub struct Clonable;
#[injectable]
pub struct PsqlPool(pub sqlx::PgPool);
const INIT_SQL: &str = r##"CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(16) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    click_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_urls_url ON urls(url);
CREATE TABLE clicks (
    id BIGSERIAL PRIMARY KEY,
    url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_urls_code ON urls(code);
CREATE INDEX idx_urls_created_at ON urls(created_at DESC);
CREATE INDEX idx_clicks_url_id ON clicks(url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
"##;`;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface LegendEntry {
  color: string;
  label: string;
}

export const ALL_THEMES: ThemeKey[] = ['auto', 'blue', 'teal', 'purple', 'green', 'rose'];

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePreviewComponent implements OnInit {
  /** Override the initial theme from the parent. */
  @Input() initialTheme: ThemeKey = 'auto';

  // ── State ──────────────────────────────────────────────────────────────────
  palette!: EditorPalette;
  highlightedHtml: SafeHtml = '';
  lineNumbersText = '';
  legend: LegendEntry[] = [];
  luaOutput = '';
  copied = false;
  selectedTheme: ThemeKey = 'auto';
  readonly themes = ALL_THEMES;

  constructor(
    private readonly gen: PaletteGeneratorService,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.selectedTheme = this.initialTheme;
    this.applyPalette();
  }

  // ── Public actions ─────────────────────────────────────────────────────────
  randomize(): void {
    this.applyPalette();
  }

  async copyLua(): Promise<void> {
    await navigator.clipboard.writeText(this.luaOutput);
    this.copied = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  // ── CSS custom properties ──────────────────────────────────────────────────
  // Bound via [ngStyle] on the root element so every descendant inherits them,
  // including the spans injected by [innerHTML] (which bypass view encapsulation).
  get cssVars(): Record<string, string> {
    const p = this.palette;
    return {
      // ── Backgrounds ─────────────────────────────────────────────────────
      '--tok-bg':   p.sumiInk0,   // editor background
      '--tok-bg2':  p.sumiInk2,   // titlebar / float
      '--tok-bg3':  p.sumiInk3,   // borders / dividers
      '--tok-bdr':  p.sumiInk4,   // hover / pmenu
      '--tok-ind':  p.sumiInk5,   // indent / whitespace

      // ── Foregrounds ──────────────────────────────────────────────────────
      '--tok-txt':  p.oldWhite,   // default text
      '--tok-mut':  p.fujiGray,   // muted / filename label
      '--tok-ln':   p.katanaGray, // line numbers

      // ── Token colors (mirror the Neovim highlight groups) ─────────────
      '--tok-kw':   p.cherryRed,    // @keyword
      '--tok-ki':   p.sumiInk6,     // @keyword.import  (use)
      '--tok-kt':   p.waveAqua1,    // @keyword.type    (struct / enum)
      '--tok-kr':   p.cherryRed,    // @keyword.return  (italic)
      '--tok-fc':   p.waveAqua1,    // @function / @function.method
      '--tok-ty':   p.waveAqua1,    // @type
      '--tok-bt':   p.springBlue,   // @type.builtin
      '--tok-sx':   p.stringMuted,  // @string
      '--tok-nm':   p.carpYellow,   // @number
      '--tok-cm':   p.fujiGray,     // @comment
      '--tok-op':   p.autumnRed,    // @operator
      '--tok-mc':   p.sumiInk6,     // @function.macro
      '--tok-at':   p.springBlue,   // @attribute
      '--tok-md':   p.springBlue,   // @module
      '--tok-pr':   p.dragonBlue,   // @property / @variable.member
      '--tok-br':   p.sumiInk6,     // @punctuation.bracket
      '--tok-tx':   p.oldWhite,     // @variable (default identifier)
    };
  }

  // ── Palette bar colors (top strip) ────────────────────────────────────────
  get paletteBarColors(): string[] {
    return this.legend.map(e => e.color);
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private applyPalette(): void {
    this.palette          = this.gen.generate(this.selectedTheme);
    this.luaOutput        = this.gen.toLua(this.palette);
    this.highlightedHtml  = this.sanitizer.bypassSecurityTrustHtml(
      tokenizeRust(RUST_SOURCE),
    );
    this.lineNumbersText  = buildLineNumbers(RUST_SOURCE);
    this.legend           = this.buildLegend();
    this.cdr.markForCheck();
  }

  private buildLegend(): LegendEntry[] {
    const p = this.palette;
    return [
      { color: p.sumiInk0,    label: 'sumiInk0 · bg' },
      { color: p.sumiInk2,    label: 'sumiInk2 · float' },
      { color: p.sumiInk5,    label: 'sumiInk5 · indent' },
      { color: p.cherryRed,   label: 'cherryRed · keyword' },
      { color: p.autumnRed,   label: 'autumnRed · operator' },
      { color: p.samuraiRed,  label: 'samuraiRed · error' },
      { color: p.carpYellow,  label: 'carpYellow · number' },
      { color: p.waveAqua1,   label: 'waveAqua1 · fn/type' },
      { color: p.dragonBlue,  label: 'dragonBlue · prop' },
      { color: p.stringMuted, label: 'stringMuted · string' },
      { color: p.fujiGray,    label: 'fujiGray · comment' },
      { color: p.springBlue,  label: 'springBlue · module/attr' },
      { color: p.sumiInk6,    label: 'sumiInk6 · macro/incl' },
      { color: p.oniViolet,   label: 'oniViolet' },
      { color: p.oldWhite,    label: 'oldWhite · text' },
      { color: p.katanaGray,  label: 'katanaGray · lineNr' },
    ];
  }
}
