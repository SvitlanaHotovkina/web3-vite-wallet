import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Указываем, что Vite должен запускаться на 5000 порту
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Доступно извне
    port: 5000, // Меняем стандартный 5173 на 5000
    strictPort: true, // Гарантирует, что порт не изменится автоматически
  },
});
