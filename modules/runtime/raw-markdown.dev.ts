import { readRawMarkdown } from "./raw-markdown-files";

export function readDevRawMarkdown(pagePath: string): string | null {
  return readRawMarkdown(pagePath);
}
