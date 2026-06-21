import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const frontendHost = "127.0.0.1";
const frontendDevPort = process.env.PORT ? Number(process.env.PORT) : 3000;
const frontendPreviewPort = process.env.PORT ? Number(process.env.PORT) : 3001;

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: frontendHost,
    port: frontendDevPort,
    // Don't fail when 3000 is taken; fall through to the next free port.
    strictPort: false,
    // Accept tunnel hosts (cloudflared/ngrok) in dev.
    allowedHosts: [".trycloudflare.com", ".ngrok-free.app", ".ngrok.app"],
  },
  preview: {
    host: frontendHost,
    port: frontendPreviewPort,
    strictPort: false,
    allowedHosts: [".trycloudflare.com", ".ngrok-free.app", ".ngrok.app"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      input: {
        main: "index.html",
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
          )
            return "vendor-react";
          return "vendor";
        },
      },
    },
  },
});
