export interface BlockMatch {
  kind: "block";
  from: number;
  to: number;
  tex: string;
}

export interface InlineMatch {
  kind: "inline";
  from: number;
  to: number;
  tex: string;
}

export type MathMatch = BlockMatch | InlineMatch;
