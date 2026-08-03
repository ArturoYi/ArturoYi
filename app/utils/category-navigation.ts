import type { ContentNavigationItem } from "@nuxt/content";

/** 取导航项 stem 的第一段，对应 content 下的一级文件夹名（如 `1.guide`） */
export function getTopLevelStem(item: ContentNavigationItem): string | undefined {
  return item.stem?.split("/")[0];
}

/** 判断顶层导航节点是否属于「有 .navigation.yml 的分类目录」 */
export function isCategoryNavItem(
  item: ContentNavigationItem,
  categoryStems: ReadonlySet<string>,
): boolean {
  const root = getTopLevelStem(item);
  return !!root && categoryStems.has(root);
}

/**
 * 将 Content 整棵导航的顶层拆成：
 * - categories：顶栏/AppHeaderBottom 用的栏目
 * - uncategorizedRoots：非栏目顶层节点（归档「全部」仍包含其下 md，不在此单独成 Tab）
 */
export function splitTopLevelNavigation(
  navigation: ContentNavigationItem[],
  categoryStems: ReadonlySet<string>,
) {
  const categories: ContentNavigationItem[] = [];
  const uncategorizedRoots: ContentNavigationItem[] = [];

  for (const item of navigation) {
    if (isCategoryNavItem(item, categoryStems)) {
      categories.push(item);
    } else {
      uncategorizedRoots.push(item);
    }
  }

  return { categories, uncategorizedRoots };
}

/** 根据当前路由 path 匹配所属栏目（精确或前缀） */
export function findActiveCategory(
  categories: ContentNavigationItem[],
  path: string,
): ContentNavigationItem | undefined {
  return categories.find(
    (item) => path === item.path || path.startsWith(`${item.path}/`),
  );
}
