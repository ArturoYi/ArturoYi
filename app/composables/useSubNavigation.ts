import type { ContentNavigationItem } from "@nuxt/content";
import {
  buildArchiveCategoryTabs,
  getCategoryStemFromItem,
  isAllScopeRoute,
  shouldShowCategorySidebar,
} from "../utils/category-tabs";
import {
  findActiveCategory,
  splitTopLevelNavigation,
} from "../utils/category-navigation";

/** 沿导航树取第一个叶子 path（默认跳转） */
export function getFirstPagePath(item: ContentNavigationItem): string {
  let current = item;
  while (current.children?.length) {
    current = current.children[0]!;
  }
  return current.path;
}

/**
 * 分类导航状态（归档页顶栏 Tab + 文档页侧栏）。
 *
 * - archive 布局：AppHeaderBottom 展示「全部」+ 各分类（sections）
 * - docs 布局：不展示 AppHeaderBottom；仅 showCategorySidebar 时展示左侧栏目树
 */
export function useSubNavigation(
  providedNavigation?: Ref<ContentNavigationItem[] | null | undefined>,
) {
  const route = useRoute();
  const appConfig = useAppConfig();
  const navigation =
    providedNavigation ?? inject<Ref<ContentNavigationItem[]>>("navigation");

  const categoryStems = computed(
    () =>
      new Set(
        (useRuntimeConfig().public.contentCategoryStems as string[]) ?? [],
      ),
  );

  const navConfig = computed(
    () =>
      appConfig.navigation as
        | {
            sub?: "header" | "aside";
            allLabel?: string;
            allIcon?: string;
            articlesPath?: string;
          }
        | undefined,
  );

  const allLabel = computed(() => navConfig.value?.allLabel ?? "全部");
  const allIcon = computed(() => navConfig.value?.allIcon ?? "i-lucide-library");
  const articlesPath = computed(
    () => navConfig.value?.articlesPath ?? "/articles",
  );

  const categories = computed(() => {
    const nav = navigation?.value ?? [];
    return splitTopLevelNavigation(nav, categoryStems.value).categories;
  });

  const activeCategory = computed(() =>
    findActiveCategory(categories.value, route.path),
  );

  /** 归档页 ?cat= 当前选中的 content 一级目录 stem */
  const activeCategoryStem = computed(() =>
    typeof route.query.cat === "string" ? route.query.cat : undefined,
  );

  const isAllScope = computed(() =>
    isAllScopeRoute({
      layout: route.meta.layout as string | undefined,
      scopeQuery: route.query.scope,
      activeCategory: activeCategory.value,
    }),
  );

  /** 文档页：是否显示左侧栏目树 + 移动端 header toggle 内的栏目菜单 */
  const showCategorySidebar = computed(() =>
    shouldShowCategorySidebar({
      layout: route.meta.layout as string | undefined,
      allScope: isAllScope.value,
      activeCategory: activeCategory.value,
    }),
  );

  /** 兼容旧名 */
  const showCategoryChrome = showCategorySidebar;

  /**
   * 顶栏第二行（AppHeaderBottom）仅在归档页启用；
   * 文档页永远不挂载 AppHeaderBottom。
   */
  const subNavigationMode = computed(() => {
    if (route.meta.layout !== "archive") return undefined;
    return navConfig.value?.sub;
  });

  /** 供 AppHeaderBottom UNavigationMenu 使用：全部 + 各分类 */
  const sections = computed(() => {
    if (route.meta.layout !== "archive") return [];
    return buildArchiveCategoryTabs({
      categories: categories.value,
      allLabel: allLabel.value,
      allIcon: allIcon.value,
      articlesPath: articlesPath.value,
      activeCategoryStem: activeCategoryStem.value,
    });
  });

  const archiveCategoryTabs = sections;

  /** 移动/桌面侧栏：当前栏目下的子树（不含栏目根节点） */
  const sidebarNavigation = computed(() => {
    if (!showCategorySidebar.value) return [];
    return activeCategory.value?.children ?? [];
  });

  /** 移动文档菜单抽屉标题 */
  const currentSection = computed(() => {
    if (!showCategorySidebar.value) return undefined;
    return activeCategory.value;
  });

  /** 文档页且需展示栏目时，显示移动端 header 菜单 toggle */
  const showMobileCategoryMenu = computed(
    () =>
      route.meta.layout === "docs" && showCategorySidebar.value,
  );

  /**
   * 移动端顶栏汉堡菜单：归档页展示「全部 + 分类」Tab，文档页展示当前栏目目录树。
   */
  const showMobileHeaderNav = computed(() => {
    if (showMobileCategoryMenu.value) return true;
    return (
      route.meta.layout === "archive" &&
      subNavigationMode.value === "header" &&
      sections.value.length > 0
    );
  });

  return {
    subNavigationMode,
    showCategorySidebar,
    showCategoryChrome,
    showMobileCategoryMenu,
    showMobileHeaderNav,
    isAllScope,
    sections,
    archiveCategoryTabs,
    currentSection,
    sidebarNavigation,
    categories,
    allLabel,
    articlesPath,
    activeCategoryStem,
    getCategoryStemFromItem,
  };
}
