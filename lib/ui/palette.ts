export type Accent = {
  bg: string;
  bgHover: string;
  text: string;
  stripe: string;
};

const PALETTE: Record<string, Accent> = {
  "#3b82f6": { bg: "#e8f0fe", bgHover: "#dde7fb", text: "#1f3c88", stripe: "#4876d6" },
  "#10b981": { bg: "#e3f5ed", bgHover: "#d6efe2", text: "#0a5e42", stripe: "#2a9266" },
  "#f59e0b": { bg: "#fdf2dd", bgHover: "#faeac8", text: "#7a4a0b", stripe: "#c4811f" },
  "#ef4444": { bg: "#fce9e6", bgHover: "#f9dad5", text: "#8b1a14", stripe: "#c8443a" },
  "#8b5cf6": { bg: "#efeafb", bgHover: "#e5ddf7", text: "#4b2e9a", stripe: "#7858c4" },
  "#ec4899": { bg: "#fce7f1", bgHover: "#f8d4e3", text: "#7e1e4d", stripe: "#c8447d" },
  "#14b8a6": { bg: "#def5f1", bgHover: "#cfefe9", text: "#0b5e56", stripe: "#32978b" },
  "#f97316": { bg: "#fdebdc", bgHover: "#fadcc2", text: "#7e320a", stripe: "#c85d1c" },
};

const FALLBACK: Accent = {
  bg: "#f1efea",
  bgHover: "#ebe8df",
  text: "#3a3934",
  stripe: "#8a877f",
};

export function accentFor(hex: string): Accent {
  return PALETTE[hex.toLowerCase()] ?? FALLBACK;
}
