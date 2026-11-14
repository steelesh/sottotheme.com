import install from "../files/install.md?raw";
import sotto from "../files/sotto.js?raw";

export type Source = { id: string; name: string; lang: "javascript" | "markdown"; code: string; current?: number };

export const files: Source[] = [
  { id: "sotto", name: "sotto.js", lang: "javascript", code: sotto, current: 10 },
  { id: "install", name: "install.md", lang: "markdown", code: install },
];
