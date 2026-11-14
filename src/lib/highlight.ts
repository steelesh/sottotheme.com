import { type BundledLanguage, codeToTokens, type ThemeRegistration } from "shiki";
import palette from "sotto/palette.json";
import theme from "sotto/themes/vscode/themes/sotto-color-theme.json";
import type { Source } from "../data/files.ts";

export type Token = { role: string; text: string; bold: boolean; underline: boolean };
export type Line = { number: number; tokens: Token[]; current: boolean };

const roles = new Map(Object.entries(palette.colors).map(([name, { hex }]) => [hex, name]));
const registration = { ...theme, name: "sotto" } as unknown as ThemeRegistration;
const bold = 2;
const underline = 4;

export async function tokenize(code: string, lang: string): Promise<Token[][]> {
  const { tokens } = await codeToTokens(code, { lang: lang as BundledLanguage, theme: registration });
  return tokens.map((line) =>
    line.flatMap((token) => {
      const [, lead = "", core = "", tail = ""] = token.content.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? [];
      const role = roles.get(token.color?.toLowerCase() ?? "") ?? "voice";
      const style = { role, bold: ((token.fontStyle ?? 0) & bold) !== 0, underline: ((token.fontStyle ?? 0) & underline) !== 0 };
      return [lead, core, tail].filter(Boolean).map((text) => ({ ...style, text }));
    }),
  );
}

export async function highlight(source: Source): Promise<Line[]> {
  const lines = await tokenize(source.code.trimEnd(), source.lang);
  return lines.map((tokens, index) => ({ number: index + 1, tokens, current: index + 1 === source.current }));
}
