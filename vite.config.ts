import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ['e2e/**', 'node_modules/**'],
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
});
