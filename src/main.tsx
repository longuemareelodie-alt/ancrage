import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerfMetrics } from "./lib/perfMetrics";

initPerfMetrics();

createRoot(document.getElementById("root")!).render(<App />);
