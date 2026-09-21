import type { ContentNavigationItem } from "@nuxt/content";
import {
  demoProjects,
  listDemoCategoryTokens,
} from "../../config/demos";
import type { CategoryTabItem } from "./category-tabs";
import {
  getCategoryStemFromItem,
  normalizeCategoryToken,
} from "./category-tabs";

const FALLBACK_CATEGORY_TITLES: Record<string, string> = {
  android: "Android",
  ios: "iOS",
  flutter: "Flutter",
  web: "Web",
  other: "其他",
};

export function fallbackDemoCategoryTitle(category: string): string {
  const token = normalizeCategoryToken(category);
  return FALLBACK_CATEGORY_TITLES[token] ?? category;
}

export function resolveDemoCategoryMeta(
  category: string,
  navCategories: ReadonlyArray<Pick<ContentNavigationItem, "title" | "stem" | "icon">>,
): { title: string; icon?: string; token: string } {
  const token = normalizeCategoryToken(category);
  const match = navCategories.find((item) => {
    const stem = getCategoryStemFromItem(item as ContentNavigationItem);
    return !!stem && normalizeCategoryToken(stem) === token;
  });

  return {
    token,
    title: match?.title?.trim() || fallbackDemoCategoryTitle(category),
    icon: typeof match?.icon === "string" ? match.icon : undefined,
  };
}

/**
 * /demos 顶栏 Tab：全部 + 至少有一个示例的栏目。
 * query.cat 使用短 slug（android），与文章归档的 3.android 区分。
 */
export function buildDemoCategoryTabs(options: {
  categories: ContentNavigationItem[];
  allLabel: string;
  allIcon: string;
  demosPath: string;
  activeCategoryToken: string | undefined;
}): CategoryTabItem[] {
  const demoTokens = new Set(
    listDemoCategoryTokens().map((token) => normalizeCategoryToken(token)),
  );
  const tabs: CategoryTabItem[] = [
    {
      label: options.allLabel,
      icon: options.allIcon,
      to: options.demosPath,
      active: !options.activeCategoryToken,
    },
  ];
  const seen = new Set<string>();

  const pushTab = (label: string, token: string, icon?: string) => {
    if (seen.has(token)) return;
    seen.add(token);
    tabs.push({
      label,
      icon,
      to: { path: options.demosPath, query: { cat: token } },
      active: options.activeCategoryToken === token,
    });
  };

  for (const item of options.categories) {
    const stem = getCategoryStemFromItem(item);
    if (!stem) continue;
    const token = normalizeCategoryToken(stem);
    if (!demoTokens.has(token)) continue;
    pushTab(item.title, token, item.icon as string | undefined);
  }

  for (const demo of demoProjects) {
    const token = normalizeCategoryToken(demo.category);
    if (!demoTokens.has(token) || seen.has(token)) continue;
    pushTab(fallbackDemoCategoryTitle(demo.category), token);
  }

  return tabs;
}
