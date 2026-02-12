import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If root has real pre-rendered content (from SSG), hydrate. Otherwise, create fresh.
if (rootElement.innerHTML.trim() && !rootElement.innerHTML.includes("<!--app-html-->")) {
  hydrateRoot(rootElement, app);
} else {
  rootElement.innerHTML = "";
  createRoot(rootElement).render(app);
}
