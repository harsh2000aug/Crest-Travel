import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Existing pages share global selectors; keep their styles available on every route.
  build: { cssCodeSplit: false },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
