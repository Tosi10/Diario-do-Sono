import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const rootDir = dirname(fileURLToPath(import.meta.url));

function inlineStructuredData(): Plugin {
  return {
    name: "inline-structured-data",
    transformIndexHtml(html) {
      const jsonPath = resolve(rootDir, "public/structured-data.json");
      try {
        const data = readFileSync(jsonPath, "utf8").trim();
        return html.replace(
          "<!-- SEO_JSON_LD -->",
          `<script type="application/ld+json">${data}</script>`
        );
      } catch {
        console.warn("[seo] public/structured-data.json missing — run prebuild");
        return html;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineStructuredData()],
});
