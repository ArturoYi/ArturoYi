import type { ContentNavigationItem } from "@nuxt/content";

/** 顶栏 UNavigationMenu 使用的 Tab 项（归档页 AppHeaderBottom） */
export type CategoryTabItem = {
  label: string;
  icon?: string;
  to: string | { path: string; query?: Record<string, string> };
  active?: boolean;
};

/** 从导航分类节点取 content 一级目录 stem，用于 ?cat= 筛选 */
export function getCategoryStemFromItem(
  item: ContentNavigationItem,
): string | undefined {
  return item.stem?.split("/")[0];
}

/** 文章 stem 是否属于某分类目录（如 1.guide/...） */
export function articleMatchesCategoryStem(
  stem: string | undefined,
  categoryStem: string,
): boolean {
  if (!stem) return false;
  return stem === categoryStem || stem.startsWith(`${categoryStem}/`);
}

/** 去掉栏目目录的排序前缀：`5.flutter` → `flutter` */
export function stripCategoryOrderPrefix(stem: string): string {
  return stem.replace(/^\d+\./, "");
}

/** 栏目 / frontmatter 类型写成可比较的小写 token */
export function normalizeCategoryToken(value: string): string {
  return stripCategoryOrderPrefix(value.trim()).toLowerCase();
}

/** 读取 frontmatter `categories`（可写 slug、目录名或栏目标题） */
export function listArticleCategoryTokens(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );
}

/**
 * 文章是否属于某栏目：落在该目录下，或 frontmatter.categories 点名了该栏目。
 * token 可为 `flutter`、`5.flutter`、`Flutter`。
 */
export function articleBelongsToCategory(options: {
  stem?: string;
  categoryTokens?: readonly string[];
  categoryStem: string;
  categoryTitle?: string;
}): boolean {
  if (articleMatchesCategoryStem(options.stem, options.categoryStem)) {
    return true;
  }

  const accepted = new Set<string>([
    normalizeCategoryToken(options.categoryStem),
  ]);
  if (options.categoryTitle?.trim()) {
    accepted.add(options.categoryTitle.trim().toLowerCase());
  }

  return (options.categoryTokens ?? []).some((token) => {
    const trimmed = token.trim();
    return (
      accepted.has(normalizeCategoryToken(trimmed)) ||
      accepted.has(trimmed.toLowerCase())
    );
  });
}

/** 「全部」列表上展示的栏目名：目录归属 + frontmatter 交叉归属，去重 */
export function articleCategoryLabels(options: {
  stem?: string;
  categoryTokens?: readonly string[];
  categories: ReadonlyArray<Pick<ContentNavigationItem, "title" | "stem">>;
}): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();

  const add = (title: string | undefined) => {
    const value = title?.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    labels.push(value);
  };

  const resolveToken = (token: string): string | undefined => {
    const normalized = normalizeCategoryToken(token);
    const lower = token.trim().toLowerCase();
    const match = options.categories.find((item) => {
      const stem = getCategoryStemFromItem(item as ContentNavigationItem);
      if (!stem) return false;
      return (
        normalizeCategoryToken(stem) === normalized ||
        item.title?.trim().toLowerCase() === lower
      );
    });
    return match?.title;
  };

  const root = options.stem?.split("/")[0];
  if (root) {
    const home = options.categories.find(
      (item) => getCategoryStemFromItem(item as ContentNavigationItem) === root,
    );
    add(home?.title);
  }

  for (const token of options.categoryTokens ?? []) {
    add(resolveToken(token));
  }

  if (!labels.length && root) {
    add("杂乱");
  }

  return labels;
}

/** 首页成长时间线使用的「年度总结」栏目（标题或一级目录名） */
const ANNUAL_REVIEW_RE = /年度总结|annual[-_]?review/i;

export function isAnnualReviewCategory(options: {
  title?: string;
  stem?: string;
}): boolean {
  if (options.title && ANNUAL_REVIEW_RE.test(options.title)) return true;
  const root = options.stem?.split("/")[0] ?? "";
  return ANNUAL_REVIEW_RE.test(root);
}

/**
 * 构建归档页 AppHeaderBottom 的 Tab 列表：
 * 首位为「全部」（所有 md），其后为各 content 分类。
 */
export function buildArchiveCategoryTabs(options: {
  categories: ContentNavigationItem[];
  allLabel: string;
  allIcon: string;
  articlesPath: string;
  activeCategoryStem: string | undefined;
}): CategoryTabItem[] {
  const tabs: CategoryTabItem[] = [
    {
      label: options.allLabel,
      icon: options.allIcon,
      to: options.articlesPath,
      active: !options.activeCategoryStem,
    },
  ];

  for (const item of options.categories) {
    const stem = getCategoryStemFromItem(item);
    tabs.push({
      label: item.title,
      icon: item.icon as string | undefined,
      to: stem
        ? { path: options.articlesPath, query: { cat: stem } }
        : options.articlesPath,
      active: !!stem && options.activeCategoryStem === stem,
    });
  }

  return tabs;
}

/** 文档页是否为「全部」阅读模式（无左侧栏目树） */
export function isAllScopeRoute(options: {
  layout: string | undefined;
  scopeQuery: unknown;
  activeCategory: ContentNavigationItem | undefined;
}): boolean {
  if (options.layout !== "docs") return false;
  if (options.scopeQuery === "all") return true;
  if (!options.activeCategory) return true;
  return false;
}

/** 文档页是否展示当前栏目的左侧导航（及移动端栏目 toggle） */
export function shouldShowCategorySidebar(options: {
  layout: string | undefined;
  allScope: boolean;
  activeCategory: ContentNavigationItem | undefined;
}): boolean {
  return (
    options.layout === "docs" &&
    !!options.activeCategory &&
    !options.allScope
  );
}
