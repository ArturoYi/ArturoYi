/** 为 content-categories 模块注入的 public runtimeConfig 提供 TypeScript 类型 */
declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    /** content 下带 .navigation.yml 的一级目录名，如 ["1.guide", "2.writing"] */
    contentCategoryStems: string[];
    /** @nuxtjs/i18n 注入的客户端 i18n 配置（启用多语言时存在） */
    i18n?: {
      defaultLocale?: string;
    };
  }
}

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    contentCategoryStems: string[];
    i18n?: {
      defaultLocale?: string;
    };
  }
}

export {};
