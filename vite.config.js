import { defineConfig } from "vite";

export default defineConfig({
  base: "/space-typer",
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
  }
});
