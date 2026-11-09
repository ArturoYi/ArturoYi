import { join } from "node:path";
import { addServerHandler, createResolver, defineNuxtModule } from "@nuxt/kit";
import { collectRawMarkdown } from "./runtime/raw-markdown-files";

const SOURCES_ID = "#raw-markdown-sources";

/**
 * 替换内置的 /raw/**.md。
 * Content 从 AST 反序列化，会把 Shiki 哈希类名写进正文。
 * Docus 的 agent-discovery 也注册了 /raw/**，会先匹配并挡住这里的原文路由。
 * 原文打进 Nitro 虚拟模块。Workers 上没有 content/，Content 数据库查询也会 500。
 */
export default defineNuxtModule({
  meta: { name: "raw-markdown" },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const contentDir = join(nuxt.options.rootDir, "content");

    nuxt.hook("nitro:config", (config) => {
      const sources = collectRawMarkdown(contentDir);
      config.virtual ||= {};
      config.virtual[SOURCES_ID] = `export default ${JSON.stringify(sources)}\n`;

      config.handlers = (config.handlers ?? []).filter((handler) => {
        const file = String(handler?.handler ?? "");
        return (
          !file.includes("features/llms/runtime/server/routes/raw") &&
          !file.includes("nuxt-agent-discovery/dist/runtime/server/routes/raw")
        );
      });
    });

    addServerHandler({
      route: "/raw/**:slug.md",
      method: "get",
      handler: resolve("./runtime/raw-markdown.get"),
    });
  },
});
