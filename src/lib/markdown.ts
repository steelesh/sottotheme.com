import { type Token, tokenize } from "./highlight.ts";

export type Inline = { kind: "text" | "code"; text: string } | { kind: "link"; text: string; href: string };
export type Row = { tokens: Token[]; copy?: string };
export type Block = { kind: "text"; parts: Inline[] } | { kind: "code"; lang: string; rows: Row[] } | { kind: "path"; steps: string[] };
export type Topic = { title: string; blocks: Block[] };

const definition = /^\[(\w+)\]: (\S+)$/gm;
const span = /`([^`]+)`|\[([^\]]+)\]\[(\w+)\]/g;

function inline(text: string, links: Map<string, string>): Inline[] {
  const parts: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(span)) {
    const at = match.index ?? 0;
    const [whole, code, label = "", key = ""] = match;
    if (at > last) parts.push({ kind: "text", text: text.slice(last, at) });
    parts.push(code ? { kind: "code", text: code } : { kind: "link", text: label, href: links.get(key) ?? "" });
    last = at + whole.length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

async function rows(code: string, lang: string): Promise<Row[]> {
  const lines = await tokenize(code, lang);
  const [only] = lines;
  return lines.length === 1 && only ? [{ tokens: only, copy: only.map(({ text }) => text).join("") }] : lines.map((tokens) => ({ tokens }));
}

export async function render(source: string): Promise<Topic[]> {
  const links = new Map([...source.matchAll(definition)].map((match) => [match[1] ?? "", match[2] ?? ""] as const));
  const topics: Topic[] = [];
  for (const chunk of source
    .replace(definition, "")
    .trim()
    .split(/\n{2,}/)) {
    const title = chunk.match(/^## (.+)$/)?.[1];
    const [, lang, code] = chunk.match(/^```(\w+)\n([\s\S]*)\n```$/) ?? [];
    if (title) topics.push({ title, blocks: [] });
    else if (lang && code) topics.at(-1)?.blocks.push({ kind: "code", lang, rows: await rows(code, lang) });
    else {
      const parts = inline(chunk.replaceAll("\n", " "), links);
      const [only] = parts;
      const path = parts.length === 1 && only?.kind === "code" ? only.text.split(" > ") : [];
      topics.at(-1)?.blocks.push(path.length > 1 ? { kind: "path", steps: path } : { kind: "text", parts });
    }
  }
  return topics;
}
