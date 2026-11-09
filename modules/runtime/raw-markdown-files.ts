import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  contentPathFromRelative,
  isUnpublishedSource,
} from "./raw-markdown-path";

/** 扫 content/，path → 原文。未发布稿不进入这张表。 */
export function collectRawMarkdown(contentDir: string): Record<string, string> {
  const sources: Record<string, string> = {};
  for (const file of listMarkdown(contentDir)) {
    const stem = relative(contentDir, file).split(sep).join("/").replace(/\.md$/i, "");
    const pagePath = contentPathFromRelative(stem);
    const source = readFileSync(file, "utf8");
    if (isUnpublishedSource(source)) continue;
    sources[pagePath] = source;
  }
  return sources;
}

export function readRawMarkdown(
  pagePath: string,
  contentDir = join(process.cwd(), "content"),
): string | null {
  for (const file of listMarkdown(contentDir)) {
    const stem = relative(contentDir, file).split(sep).join("/").replace(/\.md$/i, "");
    if (contentPathFromRelative(stem) !== pagePath) continue;
    const source = readFileSync(file, "utf8");
    if (isUnpublishedSource(source)) return null;
    return source;
  }
  return null;
}

function listMarkdown(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdown(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}
