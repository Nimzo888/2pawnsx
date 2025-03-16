import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// Add this block of code for SWC plugin
const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
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
      plugins: [...conditionalPlugins],
      jsxImportSource: "react",
      tsDecorators: true,
      // Use custom HMR handling instead of SWC refresh
      refresh: false,
    }),
    tempo(),
  ],
  // Add custom HMR options
  server: {
    hmr: {
      overlay: false, // Disable the default HMR overlay
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
