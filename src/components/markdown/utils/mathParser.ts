import { MathMatch } from "../plugins/types/mathTypes";

export function collectMathMatches(text: string): MathMatch[] {
  const matches: MathMatch[] = [];
  let i = 0;

  while (i < text.length) {
    // ── Block math: $$ ... $$ ─────────────────────────────────────────────
    if (text[i] === "$" && text[i + 1] === "$") {
      const openStart = i;
      const contentFrom = i + 2;
      i += 2;

      const closeIdx = text.indexOf("$$", i);
      if (closeIdx === -1) {
        i++;
        continue;
      }

      const fullTo = closeIdx + 2;
      const tex = text.slice(contentFrom, closeIdx);
      matches.push({ kind: "block", from: openStart, to: fullTo, tex });
      i = fullTo;
      continue;
    }

    // ── Inline math: $...$ ────────────────────────────────────────────────
    if (text[i] === "$") {
      const openStart = i;
      i += 1;

      if (
        i >= text.length ||
        text[i] === " " ||
        text[i] === "\n" ||
        text[i] === "\r"
      ) {
        continue;
      }

      let j = i;
      let found = false;
      while (j < text.length && text[j] !== "\n") {
        if (text[j] === "$") {
          if (text[j - 1] === " ") break;
          const inner = text.slice(i, j);
          if (inner.length > 0) {
            matches.push({
              kind: "inline",
              from: openStart,
              to: j + 1,
              tex: inner,
            });
            found = true;
            i = j + 1;
          }
          break;
        }
        j++;
      }
      if (!found) continue;
      continue;
    }

    i++;
  }

  return matches;
}
