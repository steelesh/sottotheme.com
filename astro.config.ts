import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://sottotheme.com",
  trailingSlash: "always",
  prefetch: true,
  build: { inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  security: {
    csp: { directives: ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"] },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
});
