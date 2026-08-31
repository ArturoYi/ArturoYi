<script setup lang="ts">
import {
  articleMatchesCategoryStem,
  getCategoryStemFromItem,
} from "../utils/category-tabs";

const ITEMS_PER_PAGE = 10;

definePageMeta({
  layout: "archive",
});

const route = useRoute();
const { activeCategoryStem, categories } = useSubNavigation();

function paginationTo(page: number) {
  const cat = typeof route.query.cat === "string" ? route.query.cat : undefined;
  const query: Record<string, string> = {};
  if (page > 1) query.page = String(page);
  if (cat) query.cat = cat;
  if (page <= 1 && !cat) {
    return { path: "/articles" };
  }
  return { path: "/articles", query };
}

const { data: pages } = await useAsyncData("articles-all", () =>
  queryCollection("docs")
    .where("path", "NOT LIKE", "%.navigation")
    .select("title", "path", "description", "stem", "meta")
    .all(),
);

type ArticlePreview = NonNullable<typeof pages.value>[number];

type ArticleListItem = {
  key: string;
  title: string;
  description: string | undefined;
  to: string | { path: string; query: { scope: string } };
  dateLabel: string;
  dateTime: string;
  category: string;
  tags: string[];
  hasMeta: boolean;
};

function isArticlePage(page: ArticlePreview): boolean {
  if (!page.path || page.path.includes(".navigation")) {
    return false;
  }

  const lastStemSegment = (page.stem ?? "").split("/").pop() ?? "";
  return lastStemSegment !== "index";
}

function readMeta(page: ArticlePreview): Record<string, unknown> {
  return (page.meta ?? {}) as Record<string, unknown>;
}

function pickField(page: ArticlePreview, key: string): unknown {
  return readMeta(page)[key] ?? (page as unknown as Record<string, unknown>)[key];
}

function pickTags(page: ArticlePreview): string[] {
  const value = pickField(page, "tags");
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function pickDateValue(page: ArticlePreview): string | Date | undefined {
  const value = pickField(page, "date");
  if (value instanceof Date || typeof value === "string") return value;
  return undefined;
}

function articleTimestamp(page: ArticlePreview): number {
  const raw = pickDateValue(page);
  if (raw instanceof Date) return raw.getTime();
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function formatArticleDate(page: ArticlePreview): {
  label: string;
  datetime: string;
} | undefined {
  const raw = pickDateValue(page);
  if (!raw) return undefined;

  const dateOnly =
    typeof raw === "string" ? raw.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  const date = dateOnly
    ? new Date(
        Date.UTC(
          Number(dateOnly[1]),
          Number(dateOnly[2]) - 1,
          Number(dateOnly[3]),
        ),
      )
    : raw instanceof Date
      ? raw
      : new Date(raw);

  if (Number.isNaN(date.getTime())) return undefined;

  return {
    label: new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(date),
    datetime: date.toISOString().slice(0, 10),
  };
}

function articleCategoryLabel(page: ArticlePreview): string {
  if (activeCategoryStem.value) return "";
  const root = page.stem?.split("/")[0];
  if (!root) return "";
  const match = categories.value.find(
    (item) => getCategoryStemFromItem(item) === root,
  );
  // 无 .navigation.yml 的目录（如 content/blog）不单独成 Tab，在「全部」里标为杂乱
  return match?.title ?? "杂乱";
}

const articles = computed(() =>
  (pages.value ?? [])
    .filter(isArticlePage)
    .sort((a, b) => {
      const byDate = articleTimestamp(b) - articleTimestamp(a);
      if (byDate !== 0) return byDate;
      return (a.stem ?? "").localeCompare(b.stem ?? "", "zh-CN");
    }),
);

/** 「全部」Tab：所有 md；?cat= 只筛某一栏目 */
const filteredArticles = computed(() => {
  const stem = activeCategoryStem.value;
  if (!stem) return articles.value;
  return articles.value.filter((a) => articleMatchesCategoryStem(a.stem, stem));
});

const totalCount = computed(() => filteredArticles.value.length);

const pageCount = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / ITEMS_PER_PAGE)),
);

const currentPage = computed(() => {
  const parsed = Number(route.query.page);
  const page = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
  return Math.min(page, pageCount.value);
});

/** 全部 Tab 进入文档加 scope=all（无侧栏）；栏目 Tab 进入保留栏目侧栏 */
function articleTo(article: ArticlePreview) {
  if (activeCategoryStem.value) {
    return article.path;
  }
  return { path: article.path, query: { scope: "all" } };
}

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return filteredArticles.value
    .slice(start, start + ITEMS_PER_PAGE)
    .map((article): ArticleListItem => {
      const date = formatArticleDate(article);
      const category = articleCategoryLabel(article);
      const tags = pickTags(article);
      return {
        key: article.stem ?? article.path,
        title: article.title ?? "未命名",
        description: article.description ?? undefined,
        to: articleTo(article),
        dateLabel: date?.label ?? "",
        dateTime: date?.datetime ?? "",
        category,
        tags,
        hasMeta: Boolean(date || category || tags.length),
      };
    });
});

useSeo({
  title: "文章列表",
  description: "全部 Markdown 文档归档",
  type: "website",
});
</script>

<template>
  <UPage>
    <UPageHeader :description="`共 ${totalCount} 篇`" />

    <UPageBody>
      <div v-if="!filteredArticles.length" class="text-muted text-sm">
        暂无文章。
      </div>

      <template v-else>
        <!-- 列表 key 用 stem：纯中文文件名 slugify 后 path 可能重复 -->
        <div class="flex flex-col gap-3">
          <UPageCard
            v-for="article in paginatedArticles"
            :key="article.key"
            spotlight
            class="w-full"
            :to="article.to"
            :title="article.title"
            :description="article.description"
            :ui="{ footer: 'pt-3' }"
          >
            <template v-if="article.hasMeta" #footer>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <time
                  v-if="article.dateLabel"
                  class="text-muted tabular-nums"
                  :datetime="article.dateTime"
                >
                  {{ article.dateLabel }}
                </time>
                <span v-if="article.category" class="text-muted">
                  {{ article.category }}
                </span>
                <span v-if="article.tags.length" class="text-dimmed">
                  {{ article.tags.join(" · ") }}
                </span>
              </div>
            </template>
          </UPageCard>
        </div>

        <div
          v-if="totalCount > ITEMS_PER_PAGE"
          class="mt-10 flex justify-center"
        >
          <UPagination
            :page="currentPage"
            :total="totalCount"
            :items-per-page="ITEMS_PER_PAGE"
            :to="paginationTo"
            show-edges
            :sibling-count="1"
          />
        </div>
      </template>
    </UPageBody>

    <template #right>
      <UPageAside aria-hidden="true" />
    </template>
  </UPage>
</template>
