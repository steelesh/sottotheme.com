import { announce } from "./status.ts";

const hero = document.querySelector<HTMLElement>(".hero");
const swatches = [...document.querySelectorAll<HTMLElement>(".swatch")];
const callouts = [...document.querySelectorAll<HTMLElement>(".callout")];

export function hold(role?: string) {
  if (!hero) return;
  if (role) hero.dataset.role = role;
  else delete hero.dataset.role;
  for (const swatch of swatches) swatch.setAttribute("aria-pressed", String(swatch.dataset.role === role));
  for (const callout of callouts) callout.toggleAttribute("data-held", callout.dataset.role === role);
  const name = swatches.find((swatch) => swatch.dataset.role === role)?.getAttribute("aria-label");
  announce(name ? `Showing ${name}` : "");
}

addEventListener("click", (event) => {
  const target = event.target as Element;
  const token = target.closest<HTMLElement>(".line .tok[data-role]");
  const role = (target.closest<HTMLElement>(".swatch") ?? token)?.dataset.role;
  if (getSelection()?.toString() || (token && event.detail > 1)) return;
  if (role || hero?.dataset.role) hold(role === hero?.dataset.role ? undefined : role);
});

addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hero?.dataset.role) hold();
});
