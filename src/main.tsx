import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

// If root has real pre-rendered content (from SSG), hydrate. Otherwise, create fresh.
if (rootElement.innerHTML.trim() && !rootElement.innerHTML.includes("<!--app-html-->")) {
  hydrateRoot(rootElement, app);
} else {
  rootElement.innerHTML = "";
  createRoot(rootElement).render(app);
}
