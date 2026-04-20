#!/usr/bin/env bun
import { $ } from "bun";
import { basename, dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";

const DEVICE_DIMENSIONS: Record<string, { width: string; height: string }> = {
  "paper-pro": { width: "179.7mm", height: "239.6mm" },
  "paper-pro-move": { width: "91.8mm", height: "163.2mm" },
};

const [htmlArg] = Bun.argv.slice(2);

if (!htmlArg) {
  console.error(
    "Usage: bun scripts/render.ts <path-to-template-html>\n\n" +
      "Example:\n" +
      "  bun scripts/render.ts templates/system-agnostic/lazy-gm-session-prep/paper-pro/en.html",
  );
  process.exit(1);
}

const htmlPath = resolve(htmlArg);
const file = Bun.file(htmlPath);

if (!(await file.exists())) {
  console.error(`Template not found: ${htmlPath}`);
  process.exit(1);
}

const deviceDir = dirname(htmlPath);
const templateDir = dirname(deviceDir);
const lang = basename(htmlPath, ".html");
const device = basename(deviceDir);
const templateName = basename(templateDir);

const dims = DEVICE_DIMENSIONS[device];
if (!dims) {
  console.error(
    `Unknown device "${device}". Known: ${Object.keys(DEVICE_DIMENSIONS).join(", ")}`,
  );
  process.exit(1);
}

const outDir = resolve("output");
await mkdir(outDir, { recursive: true });
const outPath = `${outDir}/${templateName}.${device}.${lang}.pdf`;

console.log(`Rendering ${htmlPath} -> ${outPath} (${dims.width} × ${dims.height})`);
await $`bunx pagedjs-cli ${htmlPath} -o ${outPath} --width ${dims.width} --height ${dims.height}`;
