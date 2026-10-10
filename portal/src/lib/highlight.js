// @ts-check
/**
 * Tiny regex syntax highlighter. Produces DOM spans (never HTML strings).
 * Each language is an ordered rule list; the first rule that matches at the cursor wins.
 */

/** @typedef {[RegExp, string]} Rule */

const STR = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y;
const NUM = /(?<![\w#.-])-?\d*\.?\d+(?:px|rem|em|%|vw|vh|cqi|s|ms|fr|ch|deg)?\b/y;

/** @type {Record<string, Rule[]>} */
const LANGS = {
  html: [
    [/<!--[\s\S]*?-->/y, "com"],
    [/<\/?[a-zA-Z][\w-]*/y, "tag"],
    [/\/?>/y, "tag"],
    [/[\w:-]+(?==)/y, "attr"],
    [STR, "str"],
  ],
  css: [
    [/\/\*[\s\S]*?\*\//y, "com"],
    [STR, "str"],
    [/@[\w-]+/y, "kw"],
    [/(?<=(?:^|[{}])\s*)[^{};@/\s][^{};]*?(?=\s*\{)/y, "tag"],
    [/--[\w-]+/y, "prop"],
    [/(?<=[{;]\s*)[\w-]+(?=\s*:)/y, "prop"],
    [/[\w-]+(?=\()/y, "fn"],
    [/#[0-9a-fA-F]{3,8}\b/y, "num"],
    [NUM, "num"],
  ],
  js: [
    [/\/\/.*|\/\*[\s\S]*?\*\//y, "com"],
    [/"(?:[^"\\\n]|\\.)*"(?=\s*:)/y, "prop"],
    [STR, "str"],
    [/`[^`]*`/y, "str"],
    [/\b(?:const|let|var|if|else|return|import|from|export|default|function|true|false|null|undefined|new|await|async|interface|type|extends)\b/y, "kw"],
    [/[\w$]+(?=\()/y, "fn"],
    [NUM, "num"],
  ],
  yaml: [
    [/#.*/y, "com"],
    [/[\w.-]+(?=:(?:\s|$))/y, "prop"],
    [STR, "str"],
    [/(?<=^|\n)\s*-(?=\s)/y, "kw"],
    [NUM, "num"],
  ],
  bash: [
    [/(?<=^|\n|\s)#.*/y, "com"],
    [STR, "str"],
    [/[A-Z_][A-Z0-9_]*(?==)/y, "prop"],
    [/(?<=(?:^|\n)\s*)[\w.-]+/y, "fn"],
    [/(?<=\s)--?[\w-]+/y, "attr"],
  ],
  markdown: [
    [/```[\s\S]*?```/y, "str"],
    [/(?<=^|\n)#{1,6} .*/y, "kw"],
    [/(?<=^|\n)>.*/y, "com"],
    [/`[^`\n]+`/y, "str"],
    [/!?\[[^\]\n]*\]\([^)\n]*\)/y, "attr"],
    [/\*\*[^*\n]+\*\*/y, "tag"],
    [/(?<=^|\n)\s*(?:[-*+]|\d+\.)(?=\s)/y, "num"],
    [/\|/y, "com"],
  ],
};

/** @type {Record<string, string>} */
const ALIAS = { json: "js", ts: "js", tsx: "js", jsx: "js", yml: "yaml", sh: "bash", shell: "bash", md: "markdown", vue: "html" };

/**
 * @param {string} lang
 * @param {string} code
 * @returns {DocumentFragment}
 */
export function highlight(lang, code) {
  const rules = LANGS[ALIAS[lang] ?? lang];
  const frag = document.createDocumentFragment();
  if (!rules) {
    frag.append(code);
    return frag;
  }
  let plain = "";
  let i = 0;
  outer: while (i < code.length) {
    for (const [re, cls] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length) {
        if (plain) { frag.append(plain); plain = ""; }
        const span = document.createElement("span");
        span.className = `tk-${cls}`;
        span.textContent = m[0];
        frag.append(span);
        i += m[0].length;
        continue outer;
      }
    }
    plain += code[i++];
  }
  if (plain) frag.append(plain);
  return frag;
}
