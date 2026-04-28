// ── Helpers ──────────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sp(cls: string, text: string): string {
  return `<span class="${cls}">${esc(text)}</span>`;
}

// ── Keyword sets (mirror the Neovim highlight groups) ─────────────────────────
const KWS = new Set([
  'async', 'fn', 'let', 'const', 'impl', 'where', 'self', 'super', 'crate',
  'mut', 'ref', 'move', 'in', 'as', 'if', 'else', 'for', 'while', 'match',
  'break', 'continue', 'loop', 'unsafe', 'dyn', 'extern', 'static',
  'pub', 'true', 'false', 'mod', 'await',
]);

const KWT = new Set(['struct', 'enum', 'trait', 'type']); // @keyword.type  → waveAqua1
const KWI = new Set(['use']);                              // @keyword.import → sumiInk6
const TBI = new Set([                                     // @type.builtin   → springBlue
  'str', 'i8', 'i16', 'i32', 'i64', 'i128',
  'u8', 'u16', 'u32', 'u64', 'u128', 'f32', 'f64',
  'bool', 'char', 'usize', 'isize',
]);

// ── Tokenizer ─────────────────────────────────────────────────────────────────
// Returns an HTML string with <span class="XX">…</span> tokens.
// CSS classes map to --tok-* custom properties set by CodePreviewComponent.
//
// Class → semantic role → palette key
//   kw  keyword             cherryRed
//   ki  import (use)        sumiInk6
//   kt  keyword.type        waveAqua1
//   kr  return (italic)     cherryRed
//   fc  fn / method call    waveAqua1
//   ty  TypeName            waveAqua1
//   bt  builtin type        springBlue
//   sx  string              stringMuted
//   nm  number              carpYellow
//   cm  comment (italic)    fujiGray
//   op  operator            autumnRed
//   mc  macro!              sumiInk6
//   at  #[attribute]        springBlue
//   md  module path         springBlue
//   pr  .property           dragonBlue
//   br  bracket             sumiInk6
//   tx  identifier/var      oldWhite

export function tokenizeRust(src: string): string {
  let o = '';
  let i = 0;
  let pv = '';   // last meaningful non-whitespace character

  while (i < src.length) {
    const c = src[i];

    // ── Raw string  r##"..."##  ──────────────────────────────────────────────
    if (c === 'r' && src[i + 1] === '#') {
      let j = i + 1, hashes = 0;
      while (src[j] === '#') { hashes++; j++; }
      if (src[j] === '"') {
        const endMarker = '"' + '#'.repeat(hashes);
        const e = src.indexOf(endMarker, j + 1);
        if (e >= 0) {
          o += sp('sx', src.slice(i, e + endMarker.length));
          i = e + endMarker.length;
          pv = '"';
          continue;
        }
      }
    }

    // ── Line comment  // …  ──────────────────────────────────────────────────
    if (c === '/' && src[i + 1] === '/') {
      const e = src.indexOf('\n', i);
      const text = e < 0 ? src.slice(i) : src.slice(i, e);
      o += sp('cm', text);
      i += text.length;
      pv = '/';
      continue;
    }

    // ── String literal  "…"  ────────────────────────────────────────────────
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && !(src[j] === '"' && src[j - 1] !== '\\')) j++;
      o += sp('sx', src.slice(i, j + 1));
      i = j + 1;
      pv = '"';
      continue;
    }

    // ── Attribute  #[…]  ────────────────────────────────────────────────────
    if (c === '#' && src[i + 1] === '[') {
      let j = i + 2, depth = 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '[') depth++;
        if (src[j] === ']') depth--;
        j++;
      }
      o += sp('at', src.slice(i, j));
      i = j;
      pv = ']';
      continue;
    }

    // ── Whitespace ──────────────────────────────────────────────────────────
    if (c === '\n' || c === ' ' || c === '\t') { o += c; i++; continue; }

    // ── Identifier / keyword ────────────────────────────────────────────────
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const w = src.slice(i, j);

      // Macro call:  word!  (but not  !=)
      if (src[j] === '!' && (j + 1 >= src.length || src[j + 1] !== '=')) {
        o += sp('mc', w + '!');
        i = j + 1;
        pv = '!';
        continue;
      }

      if (KWI.has(w)) o += sp('ki', w); // use
      else if (KWT.has(w)) o += sp('kt', w); // struct/enum…
      else if (w === 'return') o += sp('kr', w); // return italic
      else if (KWS.has(w)) o += sp('kw', w); // keyword
      else if (TBI.has(w)) o += sp('bt', w); // builtin type
      else if (/^[A-Z]/.test(w)) o += sp('ty', w); // TypeName
      else if (src[j] === '(') o += sp('fc', w); // fn / method
      else if (src[j] === ':' && src[j + 1] === ':') o += sp('md', w); // module::
      else if (pv === '.') o += sp('pr', w); // .property
      else o += sp('tx', w); // variable

      i = j;
      pv = w[w.length - 1];
      continue;
    }

    // ── Number ──────────────────────────────────────────────────────────────
    if (/\d/.test(c)) {
      let j = i;
      while (j < src.length && /[\d_]/.test(src[j])) j++;
      o += sp('nm', src.slice(i, j));
      i = j;
      pv = '0';
      continue;
    }

    // ── Multi-char tokens ────────────────────────────────────────────────────
    if (c === ':' && src[i + 1] === ':') { o += '::'; i += 2; pv = ':'; continue; }
    if (c === '-' && src[i + 1] === '>') { o += sp('op', '->'); i += 2; pv = '>'; continue; }
    if (c === '.' && src[i + 1] !== '.') { o += '.'; i++; pv = '.'; continue; }

    // ── Brackets ────────────────────────────────────────────────────────────
    if ('(){}[]'.includes(c)) { o += sp('br', c); i++; pv = c; continue; }

    // ── Operators ───────────────────────────────────────────────────────────
    if ('&|+*/%^~?!<>='.includes(c)) { o += sp('op', esc(c)); i++; pv = c; continue; }

    // ── Default  (; , : …) ──────────────────────────────────────────────────
    o += esc(c);
    i++;
  }

  return o;
}

// Returns a padded string "  1\n  2\n  3\n…" for the gutter div.
export function buildLineNumbers(src: string): string {
  const count = src.split('\n').length;
  return Array.from({ length: count }, (_, idx) =>
    String(idx + 1).padStart(3, ' ')
  ).join('\n');
}
