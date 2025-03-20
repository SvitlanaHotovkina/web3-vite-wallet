import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: "/",
  server: {
    host: "0.0.0.0", // Разрешаем доступ из Docker
    port: 5173, // Внутри контейнера Vite запускается на 5173
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
});
