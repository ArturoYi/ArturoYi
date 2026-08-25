<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  articleMatchesCategoryStem,
  getCategoryStemFromItem,
  isAnnualReviewCategory,
} from "../../utils/category-tabs";

interface TimelineItem {
  year: string;
  stage: string;
  title: string;
  subtitle: string;
  summary: string;
  points: string[];
  tags: string[];
  image: string;
  imageAlt: string;
  path: string;
}

const { categories } = useSubNavigation();

const { data: pages } = await useAsyncData("home-growth-timeline", () =>
  queryCollection("docs")
    .where("path", "NOT LIKE", "%.navigation")
    .select("title", "path", "description", "stem", "meta")
    .all(),
);

type ArticlePreview = NonNullable<typeof pages.value>[number];

function isArticlePage(page: ArticlePreview): boolean {
  if (!page.path || page.path.includes(".navigation")) return false;
  const lastStemSegment = (page.stem ?? "").split("/").pop() ?? "";
  return lastStemSegment !== "index";
}

function readMeta(page: ArticlePreview): Record<string, unknown> {
  return (page.meta ?? {}) as Record<string, unknown>;
}

function pickString(page: ArticlePreview, key: string): string {
  const meta = readMeta(page);
  const rec = page as unknown as Record<string, unknown>;
  const value = meta[key] ?? rec[key];
  return typeof value === "string" ? value : "";
}

function pickStringList(page: ArticlePreview, key: string): string[] {
  const meta = readMeta(page);
  const rec = page as unknown as Record<string, unknown>;
  const value = meta[key] ?? rec[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function pickDateValue(page: ArticlePreview): string | Date | undefined {
  const meta = readMeta(page);
  const rec = page as unknown as Record<string, unknown>;
  const value = meta.date ?? rec.date;
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
  const year = Number(extractYear(page));
  return Number.isFinite(year) && year > 0 ? Date.UTC(year, 0, 1) : 0;
}

function extractYear(page: ArticlePreview): string {
  const raw = pickDateValue(page);
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return String(raw.getFullYear());
  }
  if (typeof raw === "string") {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());
    const yearInDate = raw.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearInDate) return yearInDate[1]!;
  }
  const fromStem = (page.stem ?? "").match(/(?:^|\/)(\d{4})(?:\.|$|\/)/);
  if (fromStem) return fromStem[1]!;
  const fromTitle = (page.title ?? "").match(/\b(20\d{2}|19\d{2})\b/);
  return fromTitle?.[1] ?? "";
}

const annualStem = computed(() => {
  const match = categories.value.find((item) =>
    isAnnualReviewCategory({ title: item.title, stem: item.stem }),
  );
  return match ? getCategoryStemFromItem(match) : undefined;
});

const timelineData = computed<TimelineItem[]>(() => {
  const stem = annualStem.value;
  return (pages.value ?? [])
    .filter(isArticlePage)
    .filter((page) =>
      stem
        ? articleMatchesCategoryStem(page.stem, stem)
        : isAnnualReviewCategory({ stem: page.stem }),
    )
    .sort((a, b) => articleTimestamp(a) - articleTimestamp(b))
    .map((page) => {
      const year = extractYear(page);
      const title = page.title ?? "未命名";
      return {
        year,
        stage: pickString(page, "stage") || (year ? `${year}` : "年度总结"),
        title,
        subtitle: pickString(page, "subtitle") || page.description || "",
        summary: pickString(page, "summary") || page.description || "",
        points: pickStringList(page, "points"),
        tags: pickStringList(page, "tags"),
        image: pickString(page, "image") || pickString(page, "cover"),
        imageAlt: pickString(page, "imageAlt") || title,
        path: page.path,
      };
    });
});

const scrollY = ref(0);
const isMounted = ref(false);

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  isMounted.value = true;
  window.addEventListener("scroll", handleScroll, { passive: true });
  scrollY.value = window.scrollY;
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const getWatermarkStyle = (index: number) => {
  if (!isMounted.value) return {};
  const offset = (scrollY.value - index * 260) * 0.04;
  return {
    transform: `translate3d(0, ${offset.toFixed(1)}px, 0)`,
  };
};
</script>

<template>
  <section id="growth-timeline" class="relative py-20 sm:py-28">
    <div class="max-w-4xl mx-auto px-4 text-center mb-16 sm:mb-20">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-mono font-medium tracking-wide uppercase mb-3 border border-neutral-200/60 dark:border-neutral-700/60">
        <UIcon name="i-lucide-git-commit" class="h-3.5 w-3.5 text-primary" />
        <span>GROWTH LOG · 成长历程</span>
      </div>
      <h2 class="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
        年度总结
      </h2>
      <p class="mt-3 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
        每年记录一下，为了放心去忘记
      </p>
    </div>

    <div v-if="!timelineData.length" class="max-w-xl mx-auto px-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
      暂无年度总结文章。
    </div>

    <div v-else class="relative max-w-5xl mx-auto px-4 sm:px-6">
      <div
        aria-hidden="true"
        class="absolute left-6 md:left-1/2 top-4 bottom-8 -translate-x-1/2 w-px bg-neutral-200 dark:bg-neutral-800"
      />

      <div class="space-y-12 sm:space-y-20">
        <div
          v-for="(item, index) in timelineData"
          :key="item.path"
          class="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
          :class="index % 2 === 0 ? 'md:flex-row-reverse' : ''"
        >
          <div
            class="pointer-events-none absolute select-none text-7xl sm:text-9xl font-black font-mono tracking-tighter opacity-[0.03] dark:opacity-[0.04] -z-10 leading-none transition-transform duration-100 ease-out"
            :class="index % 2 === 0 ? 'right-2 md:right-8' : 'left-2 md:left-8'"
            :style="getWatermarkStyle(index)"
          >
            {{ item.year }}
          </div>

          <div
            class="absolute left-6 md:left-1/2 -translate-x-1/2 top-7 md:top-1/2 md:-translate-y-1/2 z-10 flex items-center justify-center"
          >
            <div class="h-4 w-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-primary shadow-xs" />
          </div>

          <div class="w-full md:w-1/2 pl-12 md:pl-0" :class="{ 'md:w-full': !item.image }">
            <NuxtLink
              :to="item.path"
              class="group relative block rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300"
            >
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xl sm:text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                    {{ item.year }}
                  </span>
                  <span class="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                    {{ item.stage }}
                  </span>
                </div>
                <span class="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  阅读全文 →
                </span>
              </div>

              <h3 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {{ item.title }}
              </h3>
              <p v-if="item.subtitle" class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3">
                {{ item.subtitle }}
              </p>

              <p v-if="item.summary" class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
                {{ item.summary }}
              </p>

              <div
                v-if="item.points.length"
                class="space-y-1.5 mb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80"
              >
                <div
                  v-for="(point, pIdx) in item.points"
                  :key="pIdx"
                  class="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  <span class="text-primary font-bold">·</span>
                  <span>{{ point }}</span>
                </div>
              </div>

              <div
                v-if="item.tags.length"
                class="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80"
              >
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400"
                >
                  {{ tag }}
                </span>
              </div>
            </NuxtLink>
          </div>

          <div v-if="item.image" class="w-full md:w-1/2 pl-12 md:pl-0">
            <NuxtLink
              :to="item.path"
              class="group/img relative block rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100 dark:bg-neutral-900 shadow-xs transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <div class="relative aspect-[16/9] overflow-hidden">
                <img
                  :src="item.image"
                  :alt="item.imageAlt"
                  loading="lazy"
                  class="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover/img:scale-105 opacity-90 group-hover/img:opacity-100"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90">
                  <span class="text-xs font-mono font-medium truncate">
                    {{ item.year }} · {{ item.stage }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
