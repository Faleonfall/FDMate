import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Specs live in __spec__ folders next to the code. The suffix picks the kind
// by what a spec exercises: unit for one module's logic with nothing rendered,
// ui for one component or hook rendered on its own, int for anything that
// checks real storage or goes deeper than what the ui shows.
export default defineConfig({
  base: "./",
  // .env and .env.example sit at the repo root next to the Firebase config.
  envDir: "..",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    // Fail on a busy port instead of moving to the next one, so a second
    // dev server never starts unnoticed.
    strictPort: true,
    // Accept tunnel hosts (cloudflared/ngrok) in dev.
    allowedHosts: [".trycloudflare.com", ".ngrok-free.app", ".ngrok.app"],
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
            return "vendor-react";
          return "vendor";
        },
      },
    },
  },
  test: {
    // Blank every outside service's config, so tests never reach it.
    env: {
      VITE_FIREBASE_API_KEY: "",
      VITE_FIREBASE_AUTH_DOMAIN: "",
      VITE_FIREBASE_DATABASE_URL: "",
      VITE_FIREBASE_PROJECT_ID: "",
      VITE_FIREBASE_STORAGE_BUCKET: "",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "",
      VITE_FIREBASE_APP_ID: "",
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/__spec__/*.spec.unit.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "ui",
          include: ["src/**/__spec__/*.spec.ui.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["src/__spec__/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "int",
          include: ["src/**/__spec__/*.spec.int.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["src/__spec__/setup.ts"],
        },
      },
    ],
  },
});
