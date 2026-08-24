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
