import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { queryCollection } from "@nuxt/content/server";
import { withLeadingSlash } from "ufo";
import collections from "#content/manifest";

/**
 * 优先返回 content/ 原文，避免 minimark stringify 把 Shiki CSS / HTML 表格倒进 Markdown。
 */
export default defineEventHandler(async (event) => {
  const llmsConfig = useRuntimeConfig(event).llms as
    | { contentRawMarkdown?: false | { excludeCollections?: string[] } }
    | undefined;

  const slug = getRouterParams(event)["slug.md"];
  if (!slug?.endsWith(".md") || llmsConfig?.contentRawMarkdown === false) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page not found",
      fatal: true,
    });
  }

  let path = withLeadingSlash(slug.replace(/\.md$/, ""));
  if (path.endsWith("/index")) {
    path = path.slice(0, -6);
  }

  const excludeCollections =
    (typeof llmsConfig?.contentRawMarkdown === "object" &&
      llmsConfig.contentRawMarkdown.excludeCollections) ||
    [];

  const pageCollections = Object.entries(collections)
    .filter(
      ([key, value]) =>
        (value as { type?: string }).type === "page" &&
        !excludeCollections.includes(key),
    )
    .map(([key]) => key);

  for (const collection of pageCollections) {
    const page = await queryCollection(event, collection as never)
      .select("stem", "extension")
      .path(path)
      .first();

    if (!page?.stem || !page.extension) continue;

    const source = await readSourceMarkdown(page.stem, page.extension);
    if (source !== null) {
      setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
      return source;
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
});

async function readSourceMarkdown(
  stem: string,
  extension: string,
): Promise<string | null> {
  const root = resolve(process.cwd(), "content");
  const file = resolve(join(root, `${stem}.${extension}`));
  if (file === root || !file.startsWith(root + sep)) {
    return null;
  }

  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}
