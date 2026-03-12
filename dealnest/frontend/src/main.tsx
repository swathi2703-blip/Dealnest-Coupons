import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyAccountModeTheme, getAccountMode } from "@/lib/accountMode";

applyAccountModeTheme(getAccountMode());

createRoot(document.getElementById("root")!).render(<App />);
