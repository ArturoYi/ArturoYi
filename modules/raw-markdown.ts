import { addServerHandler, createResolver, defineNuxtModule } from "@nuxt/kit";

/**
 * 替换内置的 /raw/**.md。
 * Content 从 AST 反序列化，会把 Shiki 哈希类名写进正文。
 * Docus 5.15 的 agent-discovery 也注册了 /raw/**，会先匹配并挡住这里的原文路由。
 */
export default defineNuxtModule({
  meta: { name: "raw-markdown" },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.hook("nitro:config", (config) => {
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
