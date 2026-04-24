import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initPerfMetrics } from "./lib/perfMetrics";

initPerfMetrics();

createRoot(document.getElementById("root")!).render(<App />);
