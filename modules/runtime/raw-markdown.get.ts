import sources from "#raw-markdown-sources";
import { pagePathFromRawRequest } from "./raw-markdown-path";

/**
 * /raw/**.md。
 * 部署在 Cloudflare Workers 上时没有 content/ 目录，Content 的 D1 查询也会 500。
 * 生产环境直接返回构建期打进包里的原文；开发环境仍读磁盘，改完文章不用重编。
 */
export default defineEventHandler(async (event) => {
  const pagePath = pagePathFromRawRequest(event.path);
  if (!pagePath) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page not found",
      fatal: true,
    });
  }

  const markdown = import.meta.dev
    ? (await import("./raw-markdown.dev")).readDevRawMarkdown(pagePath)
    : sources[pagePath];

  if (typeof markdown !== "string") {
    throw createError({
      statusCode: 404,
      statusMessage: "Page not found",
      fatal: true,
    });
  }

  setHeader(event, "Content-Type", "text/markdown; charset=utf-8");
  return markdown;
});
