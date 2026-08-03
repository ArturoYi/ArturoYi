import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { defineNuxtModule } from "@nuxt/kit";

/**
 * Nuxt 模块：在构建/开发启动时扫描 content/ 一级目录，
 * 将有 `.navigation.yml` 的文件夹视为「文档分类」，供顶栏 Tab 与侧栏截断使用。
 */
export default defineNuxtModule({
  meta: { name: "content-categories" },
  setup(_options, nuxt) {
    // content 根目录（与 Docus docs 集合 source.cwd 一致）
    const contentDir = join(nuxt.options.rootDir, "content");
    let stems: string[] = [];

    try {
      // 只处理 content 下的一级子目录
      stems = readdirSync(contentDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        // 约定：存在 .navigation.yml 的目录 = 顶栏分类（指南 / 写作等）
        .filter((entry) =>
          existsSync(join(contentDir, entry.name, ".navigation.yml")),
        )
        // stem 与 Content 导航项 stem 的首段对齐，如 "1.guide"
        .map((entry) => entry.name);
    } catch {
      // content 目录不存在时保持空列表，避免阻断 dev/build
      stems = [];
    }

    // 注入 public runtimeConfig，客户端 composable 只读、不参与 fs
    nuxt.options.runtimeConfig.public.contentCategoryStems = stems;
  },
});
