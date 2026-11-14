import type { APIRoute } from "astro";
import palette from "sotto/palette.json";
import { site } from "../data/site.ts";

export const GET: APIRoute = () => {
  const manifest = {
    name: site.name,
    icons: [
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-mask.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    theme_color: palette.colors.pitch.hex,
    background_color: palette.colors.pitch.hex,
  };
  return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/manifest+json" } });
};
