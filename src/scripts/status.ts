const live = document.querySelector<HTMLElement>("[data-status]");

export function announce(text: string) {
  if (live) live.textContent = text;
}

export function retract(text: string) {
  if (live?.textContent === text) live.textContent = "";
}
