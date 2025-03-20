import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ Видаляємо `.tsx`, TypeScript сам знайде файл
import "./index.css"; // ✅ Должно быть обязательно

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
