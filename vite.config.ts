import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
// import eslint from 'vite-plugin-eslint2';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    checker({
      typescript: true,
    }),
    // eslint({
    //   // Optional: configure the plugin
    //   // cache: false, // Disable cache (default: true)
    //   fix: true, // Enable auto-fixing (default: false)
    //   include: ['src/**/*.ts', 'src/**/*.tsx'],
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
