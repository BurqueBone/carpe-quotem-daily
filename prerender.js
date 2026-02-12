import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes to pre-render (public, SEO-important pages only)
const routesToPrerender = [
  "/",
  "/life-compass-calibration",
  "/carpe-diem",
  "/resource-collection",
];

async function prerender() {
  const template = fs.readFileSync(
    path.resolve(__dirname, "dist/index.html"),
    "utf-8"
  );

  const { render } = await import("./dist/server/entry-server.js");

  for (const url of routesToPrerender) {
    const appHtml = render(url);
    const html = template.replace("<!--app-html-->", appHtml);

    const filePath = `dist${url === "/" ? "/index" : url}.html`;
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(path.resolve(__dirname, filePath), html);
    console.log("Pre-rendered:", filePath);
  }
}

prerender();
