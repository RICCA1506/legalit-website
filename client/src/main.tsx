import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener("unhandledrejection", (e) => {
  if (!(e.reason instanceof Error)) {
    e.preventDefault();
  }
});

window.addEventListener("error", (e) => {
  if (e.error === null || e.error === undefined || !(e.error instanceof Error)) {
    if (import.meta.env.DEV) {
      console.warn("[suppressed non-Error throw]", e.message, e.filename, e.lineno);
    }
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
