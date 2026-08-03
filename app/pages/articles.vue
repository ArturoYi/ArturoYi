<script setup lang="ts">
import type { Collections } from "@nuxt/content";

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

function paginationTo(page: number) {
  if (page <= 1) {
    return { path: "/articles" };
  }
  return { path: "/articles", query: { page: String(page) } };
}

const route = useRoute();

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

const totalCount = computed(() => articles.value.length);

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
  return articles.value.slice(start, start + ITEMS_PER_PAGE);
});

useSeo({
  title: "文章列表",
  description: "content 目录下全部文章归档",
  type: "website",
});
</script>

<template>
  <UPage>
    <UPageHeader
      title="文章列表"
      :description="`共 ${totalCount} 篇（不含 index.md 与导航配置）`"
    />

    <UPageBody>
      <div v-if="!articles.length" class="text-muted text-sm">暂无文章。</div>

      <template v-else>
        <ul class="space-y-3">
          <li
            v-for="article in paginatedArticles"
            :key="article.path"
            class="border border-default rounded-lg px-4 py-3 hover:bg-elevated/50 transition-colors"
          >
            <NuxtLink
              :to="article.path"
              class="font-medium text-highlighted hover:underline"
            >
              {{ article.title }}
            </NuxtLink>
            <p
              v-if="article.description"
              class="mt-1 text-sm text-muted line-clamp-2"
            >
              {{ article.description }}
            </p>
            <p class="mt-2 text-xs text-dimmed font-mono">
              {{ article.path }}
            </p>
          </li>
        </ul>

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
      <!-- 占位目录区：与正文页右侧 TOC 同宽，使 UPageBody 宽度一致 -->
      <UPageAside aria-hidden="true" />
    </template>
  </UPage>
</template>
