import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `base` must match your GitHub repository name, because GitHub Pages serves the
// site at https://<username>.github.io/<repo-name>/
export default defineConfig({
  base: "/may-plans/",
  plugins: [react(), tailwindcss()],
});
