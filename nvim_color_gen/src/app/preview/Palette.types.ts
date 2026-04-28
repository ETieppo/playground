export type ThemeKey = 'blue' | 'teal' | 'purple' | 'green' | 'rose' | 'auto';

export interface EditorPalette {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  sumiInk0: string;   // bg principal (mais escuro)
  sumiInk1: string;   // bg NormalNC
  sumiInk2: string;   // bg float / cursorline
  sumiInk3: string;   // bg selection / fold
  sumiInk4: string;   // bg hover / pmenu sel
  sumiInk5: string;   // indent / whitespace
  sumiInk6: string;   // texto muted / include / escape
  // ── Diff / virtual text ────────────────────────────────────────────────────
  waveBlue1: string;
  waveBlue2: string;
  // ── Winter (bg diagnóstico virtual text) ───────────────────────────────────
  winterGreen: string;
  winterYellow: string;
  winterRed: string;
  winterBlue: string;
  // ── Acentos quentes ────────────────────────────────────────────────────────
  cherryRed: string;
  autumnRed: string;
  samuraiRed: string;
  waveRed: string;
  // ── Amarelo / warn ─────────────────────────────────────────────────────────
  roninYellow: string;
  carpYellow: string;
  springBlue: string;
  // ── Teal dominante ─────────────────────────────────────────────────────────
  waveAqua1: string;
  crystalBlue: string;
  dragonBlue: string;
  oniViolet: string;
  // ── Strings ────────────────────────────────────────────────────────────────
  stringMuted: string;
  // ── Sucesso semântico ──────────────────────────────────────────────────────
  autumnGreen: string;
  springGreen: string;
  // ── Neutros ────────────────────────────────────────────────────────────────
  oldWhite: string;
  fujiWhite: string;
  fujiGray: string;
  katanaGray: string;
  darkBlue: string;
}

export interface PaletteSection {
  label: string;
  keys: (keyof EditorPalette)[];
}

export const PALETTE_SECTIONS: PaletteSection[] = [
  {
    label: 'Fundos',
    keys: ['sumiInk0', 'sumiInk1', 'sumiInk2', 'sumiInk3', 'sumiInk4', 'sumiInk5', 'sumiInk6'],
  },
  {
    label: 'Diff / Virtual Text BG',
    keys: ['waveBlue1', 'waveBlue2', 'winterGreen', 'winterYellow', 'winterRed', 'winterBlue'],
  },
  {
    label: 'Acentos Quentes',
    keys: ['cherryRed', 'autumnRed', 'samuraiRed', 'waveRed', 'roninYellow', 'carpYellow'],
  },
  {
    label: 'Teal / Azul / Violeta',
    keys: ['springBlue', 'waveAqua1', 'crystalBlue', 'dragonBlue', 'oniViolet'],
  },
  {
    label: 'Strings / Sucesso / Neutros',
    keys: ['stringMuted', 'autumnGreen', 'springGreen', 'oldWhite', 'fujiWhite', 'fujiGray', 'katanaGray', 'darkBlue'],
  },
];
