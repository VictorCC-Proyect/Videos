import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base relativa: la app se sirve desde una subcarpeta en GitHub Pages.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  worker: { format: "es" },
});
