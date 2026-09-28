import { unpublishedContentPaths } from "#unpublished-content-paths";

/**
 * `publish: false` 的文档不对外展示。归档和侧栏另有过滤，这里挡住直接打开的地址。
 * 名单在构建期生成，中间件不再查询 docs，避免浏览器下载整库 SQL。
 */
const unpublishedContentPathSet = new Set(unpublishedContentPaths);

export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.length > 1 ? to.path.replace(/\/$/, "") : to.path;
  if (shouldSkipUnpublishedCheck(path)) return;
  if (!unpublishedContentPathSet.has(path)) return;

  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
});

function shouldSkipUnpublishedCheck(path: string) {
  return (
    path === "/" ||
    path === "/articles" ||
    path.startsWith("/articles/") ||
    path === "/demos" ||
    path.startsWith("/demos/") ||
    path.startsWith("/raw/") ||
    path.startsWith("/__") ||
    path.startsWith("/downloads/")
  );
}
