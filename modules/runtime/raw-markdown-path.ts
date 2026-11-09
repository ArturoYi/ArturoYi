import { withLeadingSlash, withoutTrailingSlash } from "ufo";

const SEMVER_REGEX = /^\d+(?:\.\d+)*(?:\.x)?$/;

/**
 * 与 @nuxt/content 的 path-meta 一致：去掉 `0.` / `06.` 这类排序前缀，
 * `index` 落到目录路径。当前文件名已是小写 kebab-case，再转小写即可对齐。
 */
export function contentPathFromRelative(stem: string): string {
  const joined = stem
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => refineUrlPart(part).toLowerCase())
    .join("/");
  const path = withoutTrailingSlash(withLeadingSlash(joined));
  return path || "/";
}

export function pagePathFromRawRequest(requestPath: string): string | null {
  const pathname = requestPath.split("?")[0]?.split("#")[0] ?? "";
  const marker = "/raw/";
  const index = pathname.indexOf(marker);
  if (index === -1) return null;

  let slug = pathname.slice(index + marker.length);
  if (!slug.endsWith(".md")) return null;
  try {
    slug = decodeURIComponent(slug);
  } catch {
    return null;
  }

  let page = withLeadingSlash(slug.slice(0, -3));
  if (page.endsWith("/index")) {
    page = page.slice(0, -"/index".length);
  }
  return page || "/";
}

export function isUnpublishedSource(source: string): boolean {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match?.[1]) return false;
  return /^publish:\s*false\s*$/m.test(match[1]);
}

function refineUrlPart(name: string): string {
  const base = name.split(/[/:]/).pop() ?? name;
  if (SEMVER_REGEX.test(base)) return base;
  return base
    .replace(/(\d+\.)?(.*)/, "$2")
    .replace(/^index(\.draft)?$/, "")
    .replace(/\.draft$/, "");
}
