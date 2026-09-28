import { existsSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { addTemplate, defineNuxtModule } from "@nuxt/kit";

type ParsedContent = {
  draft?: unknown;
  publish?: unknown;
  navigation?: unknown;
  path?: unknown;
  title?: string;
  description?: string;
  seo?: { title?: string; description?: string };
  meta?: { draft?: unknown; publish?: unknown };
};

const PATHS_ALIAS = "#unpublished-content-paths";

function normalizeContentPath(path: string) {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

/**
 * 未发布稿不进导航，并把 path 写成客户端常量。
 * 路由中间件只查这张表，避免浏览器为了判断 publish 去下载整库 SQL。
 */
export default defineNuxtModule({
  meta: { name: "draft-filter" },
  setup(_options, nuxt) {
    const unpublishedPaths = new Set<string>();

    const render = () =>
      `export const unpublishedContentPaths = ${JSON.stringify([...unpublishedPaths])};\n`;

    const template = addTemplate({
      filename: "unpublished-content-paths.mjs",
      getContents: render,
    });

    nuxt.options.alias ||= {};
    nuxt.options.alias[PATHS_ALIAS] = template.dst;

    const persist = () => {
      writeFileSync(template.dst, render());
    };

    nuxt.hook("nitro:config", (config) => {
      config.alias ||= {};
      config.alias[PATHS_ALIAS] = template.dst;
    });

    // 命中内容缓存时 afterParse 不会跑，名单以数据库为准
    nuxt.hook("ready", () => {
      const loaded = readUnpublishedPaths(contentDatabaseFile(nuxt));
      if (!loaded) return;
      unpublishedPaths.clear();
      for (const path of loaded) unpublishedPaths.add(path);
      persist();
    });

    nuxt.hook(
      "content:file:afterParse" as never,
      ((ctx: { collection?: { name?: string }; content: ParsedContent }) => {
        const draft = ctx.content.draft ?? ctx.content.meta?.draft;
        const publish = ctx.content.publish ?? ctx.content.meta?.publish;
        if (draft === true || publish === false) {
          ctx.content.navigation = false;
          // 搜索索引读的是标题和描述，清空后未发布稿不会被搜到
          ctx.content.title = "";
          ctx.content.description = "";
          if (ctx.content.seo) {
            ctx.content.seo.title = "";
            ctx.content.seo.description = "";
          }
        }

        if (ctx.collection?.name !== "docs") return;
        if (typeof ctx.content.path !== "string" || ctx.content.path === "") {
          return;
        }

        const path = normalizeContentPath(ctx.content.path);
        if (publish === false) unpublishedPaths.add(path);
        else unpublishedPaths.delete(path);
        persist();
      }) as never,
    );
  },
});

function contentDatabaseFile(nuxt: {
  options: {
    rootDir: string;
    runtimeConfig: { content?: { localDatabase?: { filename?: string } } };
  };
}) {
  const filename =
    nuxt.options.runtimeConfig.content?.localDatabase?.filename ??
    ".data/content/contents.sqlite";
  return isAbsolute(filename) ? filename : join(nuxt.options.rootDir, filename);
}

/** 缓存命中时不会走 afterParse，从已写入的 docs 表回读 publish: false */
function readUnpublishedPaths(file: string): string[] | undefined {
  if (!existsSync(file)) return undefined;

  let db: DatabaseSync | undefined;
  try {
    db = new DatabaseSync(file, { readOnly: true });
    const rows = db
      .prepare("SELECT path, meta FROM _content_docs")
      .all() as Array<{ path?: string; meta?: unknown }>;
    const paths: string[] = [];
    for (const row of rows) {
      if (typeof row.path !== "string" || row.path === "") continue;
      if (!isUnpublishedMeta(row.meta)) continue;
      paths.push(normalizeContentPath(row.path));
    }
    return paths;
  } catch (error) {
    console.warn("[draft-filter] 读取未发布文档名单失败", error);
    return undefined;
  } finally {
    db?.close();
  }
}

function isUnpublishedMeta(meta: unknown): boolean {
  let value = meta;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return false;
    }
  }
  if (!value || typeof value !== "object") return false;
  return (value as { publish?: unknown }).publish === false;
}
