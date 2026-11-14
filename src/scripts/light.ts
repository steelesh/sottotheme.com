const hero = document.querySelector<HTMLElement>(".hero");
const editor = document.querySelector<HTMLElement>(".window");
const reach = 260;

if (hero && editor && matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
  let frame = 0;
  let x = 0;
  let y = 0;
  addEventListener(
    "pointermove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const { left, right, top, bottom } = editor.getBoundingClientRect();
        const gap = Math.hypot(Math.max(left - x, 0, x - right), Math.max(top - y, 0, y - bottom));
        hero.style.setProperty("--light", (x / innerWidth).toFixed(3));
        editor.style.setProperty("--px", `${Math.round(x - left)}px`);
        editor.style.setProperty("--py", `${Math.round(y - top)}px`);
        editor.style.setProperty("--near", Math.max(0, 1 - gap / reach).toFixed(3));
      });
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => editor.style.setProperty("--near", "0"));
}
