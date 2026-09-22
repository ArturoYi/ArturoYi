import { addServerHandler, createResolver, defineNuxtModule } from "@nuxt/kit";

/**
 * 替换 @nuxt/content 内置的 /raw/**.md。
 * 内置实现从 AST 反序列化，会把 Shiki <style> 哈希类名写进正文。
 */
export default defineNuxtModule({
  meta: { name: "raw-markdown" },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.hook("nitro:config", (config) => {
      config.handlers = (config.handlers || []).filter((handler) => {
        const file = String(handler.handler || "");
        return !file.includes("features/llms/runtime/server/routes/raw");
      });
    });

    addServerHandler({
      route: "/raw/**:slug.md",
      method: "get",
      handler: resolve("./runtime/raw-markdown.get"),
    });
  },
});
