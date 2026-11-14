// Click any word to see where its color is used.

import { Theme } from "sotto";

const theme = new Theme("Sotto", { dark: true, accents: 5 });

export function paint(word, part = "voice", bold = false) {
  const color = theme.color(part) ?? "#dcdae7";
  const tag = bold ? "b" : "span";
  return `<${tag} style="color: ${color}">${word}</${tag}>`;
}

theme.colors = {
  call: "#dda9a9", // functions, booleans
  said: "#cdb496", // strings, numbers
  form: "#b1cbc3", // types, properties
  rest: "#8ba8bb", // keywords
  aside: "#c6b7d7", // parameters
};
