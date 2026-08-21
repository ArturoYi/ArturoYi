export default defineAppConfig({
  // Docus 主题核心配置
  docus: {
    // 站点默认语言，影响 UI 文案与日期格式
    locale: "zh-CN",
    // 强制配色模式：留空则跟随系统并显示切换按钮；设为 light/dark 会锁定主题并隐藏按钮
    // colorMode: "dark",
  },

  // AI 助手相关功能开关
  assistant: {
    // 是否显示页面右下角悬浮 AI 输入框
    floatingInput: false,
    // 是否启用「用 AI 解释」功能
    explainWithAi: false,
  },

  // 导航栏布局配置
  navigation: {
    // sub=header 时 AppHeaderBottom 挂在顶栏；仅 archive 布局启用
    sub: "header",
    // 归档页 Tab 首位：集合内所有 md
    allLabel: "全部",
    allIcon: "i-lucide-library",
    articlesPath: "/articles",
  },

  // 全局 SEO 元信息
  seo: {
    // 站点默认标题
    title: "ArturoYi",
    // 页面标题模板，%s 会被替换为当前页标题
    titleTemplate: "%s · ArturoYi",
    // 站点默认描述，用于 meta description 与社交分享
    description: "个人技术博客与知识库 — 记录学习、实践与思考",
  },

  // 页头区域配置
  header: {
    // 页头显示的文字标题
    title: "ArturoYi",
    logo: {
      // 浅色模式下的 Logo 图片 URL，留空则仅显示文字标题
      light: "",
      // 深色模式下的 Logo 图片 URL
      dark: "",
      // Logo 图片的 alt 文本，用于无障碍访问
      alt: "ArturoYi",
    },
  },

  // 站内搜索配置
  search: {
    // 是否启用全文搜索（Full-Text Search）
    fts: true,
  },

  // 页脚/侧栏社交链接，键名对应图标（i-simple-icons-${key}）
  // GitHub 链接由下方 github 配置统一提供，勿重复写入 socials
  socials: {
    // x: "https://x.com/nuxt_js",
    // discord: "https://discord.com/invite/ps2h6QT",
    // nuxt: "https://nuxt.com",
  },

  // 文章目录（Table of Contents）配置
  toc: {
    // 目录区块的标题文字
    title: "On this page",
    // 目录底部附加区块，可放置相关链接
    bottom: {
      title: "Community",
      links: [
        {
          // 链接图标，使用 Iconify 类名
          icon: "i-lucide-book-open",
          // 链接显示文字
          label: "Nuxt UI docs",
          // 跳转地址
          to: "https://ui.nuxt.com/getting-started/installation/nuxt",
          // 在新标签页打开
          target: "_blank",
        },
      ],
    },
  },

  // GitHub 仓库集成，用于页眉/页脚图标与「编辑此页」等链接
  github: {
    // 仓库地址
    url: "https://github.com/ArturoYi/ArturoYi",
    // 默认分支名
    branch: "main",
    // 内容文件在仓库中的根目录
    rootDir: "content",
  },
  ui: undefined
});
