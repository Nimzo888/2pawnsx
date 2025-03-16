// vite.config.ts
import path from "path";
import { defineConfig } from "file:///app/node_modules/vite/dist/node/index.js";
import react from "file:///app/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { tempo } from "file:///app/node_modules/tempo-devtools/dist/vite/index.js";
var __vite_injected_original_dirname = "/app";
var conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push("tempo-devtools/dist/babel-plugin");
}
var vite_config_default = defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    esbuildOptions: {
      target: "es2020"
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [...conditionalPlugins]
      }
    }),
    tempo()
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    allowedHosts: process.env.TEMPO === "true" ? true : void 0
  },
  esbuild: {
    target: "es2020"
  },
  build: {
    target: "es2020"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjsgLy8gQ2hhbmdlZCB0byB1c2UgQmFiZWwgcGx1Z2luIGluc3RlYWQgb2YgU1dDXG5pbXBvcnQgeyB0ZW1wbyB9IGZyb20gXCJ0ZW1wby1kZXZ0b29scy9kaXN0L3ZpdGVcIjtcblxuLy8gQWRkIHRoaXMgYmxvY2sgb2YgY29kZSBmb3IgQmFiZWwgcGx1Z2luXG5jb25zdCBjb25kaXRpb25hbFBsdWdpbnMgPSBbXTtcbmlmIChwcm9jZXNzLmVudi5URU1QTyA9PT0gXCJ0cnVlXCIpIHtcbiAgY29uZGl0aW9uYWxQbHVnaW5zLnB1c2goXCJ0ZW1wby1kZXZ0b29scy9kaXN0L2JhYmVsLXBsdWdpblwiKTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIlxuICAgICAgPyBcIi9cIlxuICAgICAgOiBwcm9jZXNzLmVudi5WSVRFX0JBU0VfUEFUSCB8fCBcIi9cIixcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZW50cmllczogW1wic3JjL21haW4udHN4XCIsIFwic3JjL3RlbXBvYm9vay8qKi8qXCJdLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KHtcbiAgICAgIGJhYmVsOiB7XG4gICAgICAgIHBsdWdpbnM6IFsuLi5jb25kaXRpb25hbFBsdWdpbnNdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICB0ZW1wbygpLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgcHJlc2VydmVTeW1saW5rczogdHJ1ZSxcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgYWxsb3dlZEhvc3RzOiBwcm9jZXNzLmVudi5URU1QTyA9PT0gXCJ0cnVlXCIgPyB0cnVlIDogdW5kZWZpbmVkLFxuICB9LFxuICBlc2J1aWxkOiB7XG4gICAgdGFyZ2V0OiBcImVzMjAyMFwiLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4TCxPQUFPLFVBQVU7QUFDL00sU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsYUFBYTtBQUh0QixJQUFNLG1DQUFtQztBQU16QyxJQUFNLHFCQUFxQixDQUFDO0FBQzVCLElBQUksUUFBUSxJQUFJLFVBQVUsUUFBUTtBQUNoQyxxQkFBbUIsS0FBSyxrQ0FBa0M7QUFDNUQ7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUNFLFFBQVEsSUFBSSxhQUFhLGdCQUNyQixNQUNBLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxFQUNwQyxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsZ0JBQWdCLG9CQUFvQjtBQUFBLElBQzlDLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixPQUFPO0FBQUEsUUFDTCxTQUFTLENBQUMsR0FBRyxrQkFBa0I7QUFBQSxNQUNqQztBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLGtCQUFrQjtBQUFBLElBQ2xCLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGNBQWMsUUFBUSxJQUFJLFVBQVUsU0FBUyxPQUFPO0FBQUEsRUFDdEQ7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
