import { hold } from "./palette.ts";

const tabs = [...document.querySelectorAll<HTMLAnchorElement>(".tab")];
const panes = [...document.querySelectorAll<HTMLElement>(".pane")];

function mark() {
  const current = tabs.find((tab) => tab.hash === location.hash) ?? tabs[0];
  for (const tab of tabs) {
    if (tab === current) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
}

function rewind() {
  for (const pane of panes) pane.scrollTo(0, 0);
}

for (const tab of tabs) tab.addEventListener("click", rewind);

document.querySelector(".lockup")?.addEventListener("click", (event) => {
  const click = event as MouseEvent;
  if (click.button || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return;
  event.preventDefault();
  location.hash = tabs[0]?.hash ?? "";
  rewind();
  scrollTo(0, 0);
});

addEventListener("hashchange", () => {
  hold();
  mark();
  rewind();
});

mark();
