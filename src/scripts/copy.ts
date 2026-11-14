import { announce, retract } from "./status.ts";

const linger = 1600;

for (const control of document.querySelectorAll<HTMLElement>("[data-copy]")) {
  let timer = 0;
  control.addEventListener("click", async () => {
    const value = control.dataset.copy ?? "";
    const note = `Copied ${value}`;
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      announce("Copying is blocked in this browser");
      return;
    }
    control.dataset.copied = "";
    announce(note);
    timer = window.setTimeout(() => {
      delete control.dataset.copied;
      retract(note);
    }, linger);
  });
}
