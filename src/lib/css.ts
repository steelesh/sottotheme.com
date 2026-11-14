import { createHash } from "node:crypto";
import palette from "sotto/palette.json";

const colors = Object.entries(palette.colors);
const inks = colors.filter(([name, { group }]) => (group === "text" || group === "accent") && name !== "breath" && name !== "trace").map(([name]) => name);
const busy = ".swatch:is(:hover,:focus-visible)";

export const tokens = `:root{${colors.map(([name, { hex }]) => `--${name.replaceAll("_", "-")}:${hex}`).join(";")}}${inks
  .map((name) => `[data-role="${name}"]{--c:var(--${name})}`)
  .join("")}`;

export function seal(css: string): `sha256-${string}` {
  return `sha256-${createHash("sha256").update(css).digest("base64")}`;
}

export function order(count: number) {
  return Array.from({ length: count - 1 }, (_, index) => `.palette li:nth-child(${index + 2}){--i:${index + 1}}`).join("");
}

export const paint = inks.map((name) => `.t-${name}{color:var(--${name})}`).join("");

export function hush(roles: readonly string[]) {
  const selectors = roles.map((role) => {
    const hovered = `.hero:has(.swatch[data-role="${role}"]:is(:hover,:focus-visible))`;
    const held = `.hero[data-role="${role}"]:not(:has(${busy}))`;
    return `:where(${hovered},${held}) .tok:not(.t-${role})`;
  });
  return `${selectors.join(",")}{opacity:var(--quiet)}`;
}

export function current(ids: readonly string[]) {
  const selectors = ids.map((id) => `.window:has(#${id}:target) .tab[href="#${id}"]`);
  const edges = "inset 0 1px var(--call),inset 1px 0 var(--hairline),inset -1px 0 var(--hairline)";
  return `${selectors.join(",")},.window:not(:has(.pane:target)) .tab:first-child{color:var(--voice);background:var(--still);box-shadow:${edges}}`;
}
