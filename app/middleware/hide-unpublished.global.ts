/**
 * `publish: false` 的文档不对外展示。归档和侧栏另有过滤，这里挡住直接打开的地址。
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path.length > 1 ? to.path.replace(/\/$/, "") : to.path;
  if (shouldSkipUnpublishedCheck(path)) return;

  const page = await queryCollection("docs")
    .path(path)
    .select("meta")
    .first();

  if (!page) return;

  const meta = (page.meta ?? {}) as { publish?: unknown };
  if (meta.publish === false) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page not found",
      fatal: true,
    });
  }
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
