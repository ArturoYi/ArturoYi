<script setup lang="ts">
import type { Collections } from "@nuxt/content";
import { articleMatchesCategoryStem } from "../utils/category-tabs";

const ITEMS_PER_PAGE = 10;

definePageMeta({
  layout: "archive",
});

type ArticlePreview = Pick<
  Collections["docs"],
  "title" | "path" | "description" | "stem"
> & {
  meta?: Record<string, unknown>;
};

function isArticlePage(page: ArticlePreview): boolean {
  if (!page.path || page.path.includes(".navigation")) {
    return false;
  }

  const lastStemSegment = (page.stem ?? "").split("/").pop() ?? "";
  return lastStemSegment !== "index";
}

const route = useRoute();
const { activeCategoryStem } = useSubNavigation();

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

const articles = computed(() =>
  (pages.value ?? [])
    .filter(isArticlePage)
    .sort((a, b) => (a.stem ?? "").localeCompare(b.stem ?? "", "zh-CN")),
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

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return filteredArticles.value.slice(start, start + ITEMS_PER_PAGE);
});

/** 全部 Tab 进入文档加 scope=all（无侧栏）；栏目 Tab 进入保留栏目侧栏 */
function articleTo(article: ArticlePreview) {
  if (activeCategoryStem.value) {
    return article.path;
  }
  return { path: article.path, query: { scope: "all" } };
}

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
            :key="article.stem ?? article.path"
            spotlight
            class="w-full"
            :to="articleTo(article)"
            :title="article.title ?? '未命名'"
            :description="article.description"
          />
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
