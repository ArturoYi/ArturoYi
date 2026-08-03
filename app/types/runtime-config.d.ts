/** 为 content-categories 模块注入的 public runtimeConfig 提供 TypeScript 类型 */
declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    /** content 下带 .navigation.yml 的一级目录名，如 ["1.guide", "2.writing"] */
    contentCategoryStems: string[];
  }
}

export {};
