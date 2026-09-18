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
  quote: string;
  points: string[];
  tags: string[];
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
      const summary = pickString(page, "summary") || page.description || "";
      const quote =
        pickString(page, "quote") || summary || page.description || title;
      return {
        year,
        stage: pickString(page, "stage") || (year ? `${year}` : "年度总结"),
        title,
        subtitle: pickString(page, "subtitle") || page.description || "",
        summary,
        quote,
        points: pickStringList(page, "points"),
        tags: pickStringList(page, "tags"),
        path: page.path,
      };
    });
});

const copiedPath = ref<string | null>(null);
let copyTimer: ReturnType<typeof setTimeout> | null = null;

async function copyQuote(text: string, path: string) {
  if (!text) return;
  try {
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    copiedPath.value = path;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copiedPath.value = null;
    }, 2000);
  } catch (err) {
    console.error("复制失败", err);
  }
}

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
  if (copyTimer) clearTimeout(copyTimer);
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
    <!-- 头部区域 -->
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

    <!-- 空数据提示 -->
    <div v-if="!timelineData.length" class="max-w-xl mx-auto px-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
      暂无年度总结文章。
    </div>

    <!-- 时间轴主体 -->
    <div v-else class="relative max-w-5xl mx-auto px-4 sm:px-6">
      <!-- 贯穿居中时间轴线 -->
      <div
        aria-hidden="true"
        class="absolute left-6 md:left-1/2 top-4 bottom-8 -translate-x-1/2 w-px bg-gradient-to-b from-neutral-200 via-neutral-300 dark:from-neutral-800 dark:via-neutral-700 to-transparent"
      />

      <div class="space-y-16 sm:space-y-24">
        <div
          v-for="(item, index) in timelineData"
          :key="item.path"
          class="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-14"
          :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
        >
          <!-- 背景流动年份水印 -->
          <div
            class="pointer-events-none absolute select-none text-7xl sm:text-9xl font-black font-mono tracking-tighter opacity-[0.03] dark:opacity-[0.04] -z-10 leading-none transition-transform duration-100 ease-out"
            :class="index % 2 === 0 ? 'left-2 md:left-8' : 'right-2 md:right-8'"
            :style="getWatermarkStyle(index)"
          >
            {{ item.year }}
          </div>

          <!-- 时间轴节点圆点（微光双环） -->
          <div
            class="absolute left-6 md:left-1/2 -translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 z-10 flex items-center justify-center"
          >
            <div class="relative flex items-center justify-center">
              <div class="h-4 w-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-primary shadow-xs ring-4 ring-neutral-100/80 dark:ring-neutral-900/80" />
            </div>
          </div>

          <!-- 侧 A：开放式轻量足迹区（无多余背景框，聚焦年份与技术要点，与对侧文案 0 重复） -->
          <div
            class="w-full md:w-1/2 pl-12 md:pl-0"
            :class="index % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'"
          >
            <div class="space-y-3">
              <!-- 年份大字与阶段徽标 -->
              <div
                class="flex items-center gap-3"
                :class="index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'"
              >
                <span class="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white">
                  {{ item.year }}
                </span>
                <span class="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                  {{ item.stage }}
                </span>
              </div>

              <!-- 文章标题链接（简洁可点） -->
              <NuxtLink
                :to="item.path"
                class="group/link inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <span>{{ item.title }}</span>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="h-4 w-4 text-neutral-400 group-hover/link:text-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                />
              </NuxtLink>

              <!-- 这一年的关键技术/行动足迹（极客终端命令行点阵） -->
              <div
                v-if="item.points.length"
                class="space-y-1.5 pt-1"
                :class="index % 2 === 0 ? 'md:flex md:flex-col md:items-end' : ''"
              >
                <div
                  v-for="(point, pIdx) in item.points"
                  :key="pIdx"
                  class="flex items-start gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 leading-relaxed"
                  :class="index % 2 === 0 ? 'md:flex-row-reverse text-left md:text-right' : 'text-left'"
                >
                  <span class="text-primary font-bold select-none shrink-0">&gt;</span>
                  <span>{{ point }}</span>
                </div>
              </div>

              <!-- 标签胶囊群 -->
              <div
                v-if="item.tags.length"
                class="flex flex-wrap gap-1.5 pt-1"
                :class="index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'"
              >
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-100/60 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 border border-neutral-200/40 dark:border-neutral-700/40"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 侧 B：黑白极客年度金句卡片（主题自适应，复制相融，500ms 悬浮缩放，视觉核心聚焦） -->
          <div class="w-full md:w-1/2 pl-12 md:pl-0">
            <NuxtLink
              :to="item.path"
              class="group/quote relative block rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-500 ease-out hover:scale-[1.02] overflow-hidden"
            >
              <!-- 悬浮背景淡光晕 -->
              <div
                class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl transition-transform duration-500 ease-out group-hover/quote:scale-150"
              />

              <!-- 顶部极客工具栏与复制按钮 -->
              <div class="flex items-center justify-between gap-2 mb-4">
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1 select-none">
                    <span class="h-2 w-2 rounded-full bg-red-400/80 dark:bg-red-500/70" />
                    <span class="h-2 w-2 rounded-full bg-amber-400/80 dark:bg-amber-500/70" />
                    <span class="h-2 w-2 rounded-full bg-emerald-400/80 dark:bg-emerald-500/70" />
                  </div>
                  <span class="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                    // {{ item.year }}_THOUGHT
                  </span>
                </div>

                <!-- 复制按钮：无缝相融于浅色/深色背景 -->
                <button
                  type="button"
                  :title="copiedPath === item.path ? '已复制到剪贴板' : '复制年度独白'"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-200 border cursor-pointer select-none"
                  :class="
                    copiedPath === item.path
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/30 shadow-xs'
                      : 'text-neutral-400 dark:text-neutral-500 bg-neutral-100/60 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 hover:text-neutral-800 dark:hover:text-neutral-200 border-neutral-200/50 dark:border-neutral-700/50'
                  "
                  @click.prevent.stop="copyQuote(item.quote, item.path)"
                >
                  <UIcon
                    :name="copiedPath === item.path ? 'i-lucide-check' : 'i-lucide-copy'"
                    class="h-3.5 w-3.5 transition-transform duration-200"
                    :class="{ 'scale-110': copiedPath === item.path }"
                  />
                  <span>{{ copiedPath === item.path ? "已复制" : "复制" }}</span>
                </button>
              </div>

              <!-- 黑底白字 / 白底黑字 核心独白文案 -->
              <div
                class="relative p-4 sm:p-5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-950/70 backdrop-blur-xs transition-colors duration-300"
              >
                <span
                  class="pointer-events-none absolute -top-1.5 left-2 text-3xl font-serif text-neutral-300 dark:text-neutral-700 select-none leading-none"
                >
                  “
                </span>
                <p
                  class="relative z-10 text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed"
                >
                  {{ item.quote }}
                </p>
              </div>

              <!-- 底部直达链接 -->
              <div
                class="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs font-mono text-neutral-400 dark:text-neutral-500"
              >
                <span>{{ item.stage }}</span>
                <div class="flex items-center gap-1 group-hover/quote:text-neutral-900 dark:group-hover/quote:text-white transition-colors">
                  <span>完整复盘</span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="h-3.5 w-3.5 transition-transform duration-500 ease-out group-hover/quote:translate-x-1"
                  />
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


