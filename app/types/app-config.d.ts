declare module "nuxt/schema" {
  interface AppConfigInput {
    seo?: {
      title?: string;
      titleTemplate?: string;
      description?: string;
    };
    /** 归档页分类 Tab 等扩展配置（Docus schema 仅含 sub） */
    navigation?: {
      sub?: "header" | "aside" | string;
      allLabel?: string;
      allIcon?: string;
      articlesPath?: string;
    };
  }

  interface AppConfig {
    seo: {
      title: string;
      titleTemplate: string;
      description: string;
    };
  }
}

declare module "@nuxt/schema" {
  interface AppConfigInput {
    seo?: {
      title?: string;
      titleTemplate?: string;
      description?: string;
    };
    navigation?: {
      sub?: "header" | "aside" | string;
      allLabel?: string;
      allIcon?: string;
      articlesPath?: string;
    };
  }

  interface AppConfig {
    seo: {
      title: string;
      titleTemplate: string;
      description: string;
    };
  }
}

export {};
