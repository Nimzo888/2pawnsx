import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tempo } from "tempo-devtools/dist/vite";

// Add this block of code for Babel plugin
const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push("tempo-devtools/dist/babel-plugin");
}

// https://vitejs.dev/config/
export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    esbuildOptions: {
      target: "es2020",
    },
  },
  plugins: [
    react({
      // Use Babel for React Refresh
      babel: {
        plugins: [
          ...conditionalPlugins,
          // Add additional babel plugins if needed
        ],
        // Ensure we're using the correct preset versions
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
      },
      // Explicitly set the refresh implementation
      fastRefresh: true,
    }),
    tempo(),
  ],
  // Enhanced HMR options
  server: {
    hmr: {
      overlay: false, // Disable the default HMR overlay
      // Increase timeout for HMR operations
      timeout: 5000,
    },
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Server config moved above
  esbuild: {
    target: "es2020",
  },
  build: {
    target: "es2020",
  },
});
