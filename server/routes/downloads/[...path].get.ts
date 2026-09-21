import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";

/**
 * 拦截 /downloads/** ，避免缺失 zip 时落到 Docus [...slug] 变成整页 404。
 * 文件存在则按附件输出；不存在返回普通 HTTP 404。
 */
export default defineEventHandler((event) => {
  const raw = getRouterParam(event, "path") ?? "";
  const segments = raw.split("/").filter(Boolean);
  if (
    !segments.length ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const relative = segments.join("/");
  if (extname(relative).toLowerCase() !== ".zip") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const root = resolve(process.cwd(), "public", "downloads");
  const file = resolve(join(root, relative));
  if (file !== root && !file.startsWith(root + sep)) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const filename = segments.at(-1) ?? "demo.zip";
  setHeader(event, "Content-Type", "application/zip");
  setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);
  return sendStream(event, createReadStream(file));
});
