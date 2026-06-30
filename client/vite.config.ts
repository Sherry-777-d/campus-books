import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // 把 /api 开头的请求代理到后端 3001 端口
      "/api": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
});
