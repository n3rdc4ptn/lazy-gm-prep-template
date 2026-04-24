#!/usr/bin/env bun
import { $, Glob } from "bun";
import { basename, dirname, resolve } from "node:path";
import { mkdir, unlink } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

const DEVICE_DIMENSIONS: Record<string, { width: string; height: string }> = {
  "paper-pro": { width: "179.7mm", height: "239.6mm" },
  "paper-pro-move": { width: "91.8mm", height: "163.2mm" },
};

const TARGET_PAGES = 10;

const outDir = resolve("output");
await mkdir(outDir, { recursive: true });

async function expandToTargetPages(
  srcPath: string,
  destPath: string,
  targetPages: number,
): Promise<void> {
  const srcBytes = await Bun.file(srcPath).bytes();
  const src = await PDFDocument.load(srcBytes);
  const srcPageCount = src.getPageCount();
  if (srcPageCount === 0) {
    throw new Error(`Source PDF has no pages: ${srcPath}`);
  }

  const dest = await PDFDocument.create();
  const indices = Array.from({ length: srcPageCount }, (_, i) => i);
  const copied = await dest.copyPages(src, indices);

  for (let i = 0; i < targetPages; i++) {
    dest.addPage(copied[i % srcPageCount]);
  }

  const bytes = await dest.save();
  await Bun.write(destPath, bytes);
}

async function renderOne(htmlPath: string): Promise<void> {
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
      `Unknown device "${device}" for ${htmlPath}. Known: ${Object.keys(DEVICE_DIMENSIONS).join(", ")}`,
    );
    process.exit(1);
  }

  const baseName = `${templateName}.${device}.${lang}`;
  const tmpPath = `${outDir}/.${baseName}.single.pdf`;
  const outPath = `${outDir}/${baseName}.pdf`;

  console.log(
    `Rendering ${htmlPath} -> ${outPath} (${dims.width} × ${dims.height}, ×${TARGET_PAGES})`,
  );
  try {
    await $`bunx pagedjs-cli ${htmlPath} -o ${tmpPath} --width ${dims.width} --height ${dims.height}`.quiet();
    await expandToTargetPages(tmpPath, outPath, TARGET_PAGES);
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

const [htmlArg] = Bun.argv.slice(2);

if (htmlArg) {
  await renderOne(resolve(htmlArg));
} else {
  const glob = new Glob("templates/**/*.html");
  const paths: string[] = [];
  for await (const p of glob.scan({ cwd: resolve(".") })) {
    paths.push(resolve(p));
  }
  paths.sort();

  if (paths.length === 0) {
    console.error("No templates found under templates/**/*.html");
    process.exit(1);
  }

  console.log(`Rendering ${paths.length} templates...\n`);
  for (const p of paths) {
    await renderOne(p);
  }
}
