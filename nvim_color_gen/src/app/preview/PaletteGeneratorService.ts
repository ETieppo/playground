import { Injectable } from '@angular/core';
import { EditorPalette, ThemeKey } from './Palette.types';

// ─── Faixas de hue base por tema ────────────────────────────────────────────
const THEME_HUE_RANGES: Record<Exclude<ThemeKey, 'auto'>, [number, number]> = {
  blue:   [200, 225],
  teal:   [175, 200],
  purple: [250, 280],
  green:  [140, 165],
  rose:   [330, 355],
};

const ALL_THEMES = Object.keys(THEME_HUE_RANGES) as Exclude<ThemeKey, 'auto'>[];

@Injectable({ providedIn: 'root' })
export class PaletteGeneratorService {

  // ── Ponto de entrada público ───────────────────────────────────────────────

  generate(theme: ThemeKey = 'auto'): EditorPalette {
    const resolved = theme === 'auto'
      ? ALL_THEMES[this.randInt(0, ALL_THEMES.length - 1)]
      : theme;

    return this.buildPalette(resolved);
  }

  /** Serializa a paleta no formato `local p = { … }` do Neovim/Lua. */
  toLua(palette: EditorPalette): string {
    const maxKeyLen = Math.max(...Object.keys(palette).map(k => k.length));
    const entries = (Object.entries(palette) as [keyof EditorPalette, string][])
      .map(([key, value]) => `  ${key.padEnd(maxKeyLen)} = '${value}',`)
      .join('\n');

    return `local p = {\n${entries}\n}`;
  }

  // ── Geração da paleta ──────────────────────────────────────────────────────

  private buildPalette(theme: Exclude<ThemeKey, 'auto'>): EditorPalette {
    const [hMin, hMax] = THEME_HUE_RANGES[theme];

    // Hue principal dos fundos
    const bgH  = this.rand(hMin, hMax);
    const bgS  = this.rand(8, 22);

    // Hues derivados
    const accentH  = (bgH + this.rand(155, 205)) % 360; // complementar → teal/azul
    const warnH    = this.rand(38, 52);                  // ouro / amarelo
    const redH     = this.rand(350, 375) % 360;          // vermelho quente
    const violetH  = (bgH + this.rand(60, 90)) % 360;   // análogo deslocado → violeta

    return {
      // ── Fundos – escuros, com tint sutil de hue ──────────────────────────
      sumiInk0:     this.hsl(bgH, bgS,       this.rand(3.5, 6)),
      sumiInk1:     this.hsl(bgH, bgS,       this.rand(6,   9)),
      sumiInk2:     this.hsl(bgH, bgS + 2,   this.rand(8,  12)),
      sumiInk3:     this.hsl(bgH, bgS + 3,   this.rand(11, 16)),
      sumiInk4:     this.hsl(bgH, bgS + 5,   this.rand(15, 21)),
      sumiInk5:     this.hsl(bgH, bgS + 7,   this.rand(20, 27)),
      sumiInk6:     this.hsl(bgH, this.rand(15, 28), this.rand(52, 65)),

      // ── Diff / virtual text BG ───────────────────────────────────────────
      waveBlue1:    this.hsl(bgH, bgS,       this.rand(6,   9)),
      waveBlue2:    this.hsl(bgH, bgS + 3,   this.rand(11, 16)),

      // ── Winter – bg tinted para diagnósticos ─────────────────────────────
      winterGreen:  this.hsl((bgH + 140) % 360, this.rand(8, 18),  this.rand(6, 10)),
      winterYellow: this.hsl(warnH,              this.rand(8, 18),  this.rand(6, 10)),
      winterRed:    this.hsl(redH,               this.rand(8, 18),  this.rand(6, 10)),
      winterBlue:   this.hsl(bgH, bgS,           this.rand(6,  9)),

      // ── Acentos quentes – vermelho vibrante ──────────────────────────────
      cherryRed:    this.hsl(redH, this.rand(85, 100), this.rand(32, 42)),
      autumnRed:    this.hsl(redH, this.rand(88, 100), this.rand(40, 50)),
      samuraiRed:   this.hsl(redH, this.rand(90, 100), this.rand(50, 60)),
      waveRed:      this.hsl(redH, this.rand(90, 100), this.rand(50, 60)),

      // ── Amarelo / ouro ────────────────────────────────────────────────────
      roninYellow:  this.hsl(warnH, this.rand(75, 88), this.rand(58, 68)),
      carpYellow:   this.hsl(warnH, this.rand(75, 88), this.rand(58, 68)),
      springBlue:   this.hsl(bgH,   this.rand(35, 55), this.rand(28, 38)),

      // ── Teal / azul / violeta ─────────────────────────────────────────────
      waveAqua1:    this.hsl(accentH, this.rand(30, 45), this.rand(32, 42)),
      crystalBlue:  this.hsl(accentH, this.rand(30, 45), this.rand(32, 42)),
      dragonBlue:   this.hsl(accentH, this.rand(35, 50), this.rand(40, 50)),
      oniViolet:    this.hsl(violetH, this.rand(50, 68), this.rand(55, 65)),

      // ── Strings ───────────────────────────────────────────────────────────
      stringMuted:  this.hsl(bgH, this.rand(12, 22), this.rand(40, 50)),

      // ── Sucesso semântico ─────────────────────────────────────────────────
      autumnGreen:  this.hsl(accentH, this.rand(35, 50), this.rand(40, 50)),
      springGreen:  this.hsl(accentH, this.rand(30, 45), this.rand(32, 42)),

      // ── Neutros ───────────────────────────────────────────────────────────
      oldWhite:     this.hsl(warnH, this.rand(22, 35), this.rand(88, 93)),
      fujiWhite:    this.hsl(bgH,   this.rand(20, 35), this.rand(88, 93)),
      fujiGray:     this.hsl(bgH,   this.rand(12, 22), this.rand(35, 45)),
      katanaGray:   this.hsl(bgH,   this.rand(10, 20), this.rand(24, 32)),
      darkBlue:     this.hsl(bgH,   bgS,               this.rand(3.5, 6)),
    };
  }

  // ── Conversão HSL → Hex ───────────────────────────────────────────────────

  private hsl(h: number, s: number, l: number): string {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));

    const S = s / 100;
    const L = l / 100;
    const c = (1 - Math.abs(2 * L - 1)) * S;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = L - c / 2;

    let r = 0, g = 0, b = 0;

    if      (h < 60)  { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else              { r = c; b = x; }

    const toHex = (n: number) =>
      Math.round((n + m) * 255).toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // ── Helpers de aleatoriedade ──────────────────────────────────────────────

  /** Float aleatório em [a, b) */
  private rand(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  /** Inteiro aleatório em [a, b] */
  private randInt(a: number, b: number): number {
    return Math.floor(this.rand(a, b + 1));
  }
}
