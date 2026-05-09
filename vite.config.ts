import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Shim for the workspace API client — points to our local replacement
      "@workspace/api-client-react": path.resolve(__dirname, "src/lib/api-client-shim.ts"),
    },
  },
  server: {
    port: 4173,
    proxy: {
      // Forward /api calls to the backend running on port 3000
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
