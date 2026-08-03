import { proseCodeIcons } from "./config/prose-code-icons";

export default defineNuxtConfig({
  // content-categories 模块会在 setup 中覆盖 contentCategoryStems
  runtimeConfig: {
    public: {
      contentCategoryStems: [],
    },
  },
  // 继承 Docus 文档主题，获得文档站点预设布局与组件
  extends: ["docus"],

  // 站点元信息，供 SEO、sitemap、OG 标签等模块使用
  site: {
    // 站点名称
    name: "ArturoYi",
    // 站点 canonical URL，优先读取环境变量
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://arturoyi.dev",
    // 站点描述
    description: "个人技术博客与知识库 — 记录学习、实践与思考",
  },

  // 启用服务端渲染，首屏更快且利于 SEO
  ssr: true,

  // Nitro 服务端引擎配置
  nitro: {
    prerender: {
      // 预渲染时自动爬取页面内链接并继续预渲染
      crawlLinks: true,
      // 单个路由预渲染失败时不中断整体构建
      failOnError: false,
    },
  },

  // 自定义 Nuxt 模块
  modules: [
    // 扫描 content 一级目录的 .navigation.yml，写入 runtimeConfig
    "./modules/content-categories",
    // 草稿过滤：frontmatter 中 draft: true 的文档不进入导航
    function draftFilterModule(_options, nuxt) {
      // Content 注册此 hook 于 NuxtHooks；Nuxt.hooks 类型为 NuxtHooks$1
      nuxt.hooks.hook(
        "content:file:afterParse" as never,
        ((ctx: { content: { draft?: unknown; navigation?: unknown } }) => {
          if (ctx.content.draft === true) {
            ctx.content.navigation = false;
          }
        }) as never,
      );
    },
  ],

  // 路由级别规则，覆盖全局预渲染与 robots 行为
  routeRules: {
    // 默认所有路由静态预渲染
    "/**": { prerender: true },
  },

  // @nuxt/content 内容模块配置
  content: {
    experimental: {
      // 使用原生 SQLite 连接器，提升本地查询性能
      sqliteConnector: "native",
    },
    build: {
      markdown: {
        remarkPlugins: {
          // 启用 GitHub Flavored Markdown（表格、任务列表、删除线等）
          "remark-gfm": {},
        },
        highlight: {
          // Shiki 语法高亮支持的语言列表
          langs: [
            "bash",
            "diff",
            "json",
            "js",
            "ts",
            "tsx",
            "jsx",
            "html",
            "css",
            "scss",
            "vue",
            "shell",
            "mdc",
            "md",
            "yaml",
            "python",
            "rust",
            "go",
            "java",
            "sql",
          ],
        },
      },
    },
  },

  // @nuxtjs/llms 模块配置，生成 llms.txt 供 AI 爬虫读取
  llms: {
    // 站点域名，与 site.url 保持一致
    domain: process.env.NUXT_PUBLIC_SITE_URL || "https://arturoyi.dev",
    title: "ArturoYi",
    description: "个人技术博客与知识库 — 记录学习、实践与思考",
  },

  // @nuxt/icon 图标模块配置
  icon: {
    clientBundle: {
      // 与 docus 默认一致：扫描 app 模板中的 i-* 类名；勿仅用 icons 覆盖以免丢失 scan
      scan: true,
      includeCustomCollections: true,
      // 动态来源图标（prose 文件名映射、.navigation.yml、socials 拼接等）scan 扫不到
      icons: [...proseCodeIcons],
    },
  },

  // Nuxt 生命周期钩子
  hooks: {
    // pnpm 无法解析 @nuxtjs/mdc 模块添加的嵌套 optimizeDeps 路径，改为扁平包名
    "vite:extendConfig"(config) {
      if (config.optimizeDeps?.include) {
        config.optimizeDeps.include = config.optimizeDeps.include.map(
          (id: string) =>
            typeof id === "string" ? id.replace(/^@nuxtjs\/mdc > /, "") : id,
        );
      }
    },
  },
});
