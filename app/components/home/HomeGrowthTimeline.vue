<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

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
}

const timelineData: TimelineItem[] = [
  {
    year: "2020",
    stage: "启程 · 起步",
    title: "初识编程与计算机基础",
    subtitle: "从第一行代码体会创造的乐趣",
    summary:
      "在终端敲下第一行程序，探索数据结构、基础算法与网页结构。初次体验到将逻辑思维具象为屏幕交互的奇妙。",
    points: [
      "掌握核心计算机基础与编程逻辑",
      "独立完成首批前端练习作品与静态页面",
      "建立版本管理习惯与极客探索欲",
    ],
    tags: ["JavaScript", "HTML/CSS", "算法基础", "Git"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2020 编程起步",
  },
  {
    year: "2021",
    stage: "探索 · 全栈",
    title: "拥抱现代组件化与前后端交互",
    subtitle: "深入 Vue 生态与全链路开发",
    summary:
      "系统学习 Vue 响应式原理与组件化思想，并延伸至 Node.js 服务端、数据库设计与 API 架构，独立完成多个全栈小项目。",
    points: [
      "熟练掌握 Vue 3 核心与生态工具",
      "实践 Node.js 接口开发与数据库操作",
      "从单点开发转向全流程项目交付",
    ],
    tags: ["Vue 3", "Node.js", "Express", "RESTful API"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2021 前端探索与组件化",
  },
  {
    year: "2022",
    stage: "规范 · 工程化",
    title: "全面推行 TypeScript 与工程化标准",
    subtitle: "严谨类型与现代构建体系",
    summary:
      "将 TypeScript 引入主力开发流程，借助严谨类型构筑代码安全护城河。深入 Vite 构建优化、代码规范与自动化流水线。",
    points: [
      "全面拥抱 TypeScript 强类型开发",
      "优化 Vite 构建流程与打包分包策略",
      "推行 ESLint / Prettier 与自动化 CI 规范",
    ],
    tags: ["TypeScript", "Vite", "Pinia", "CI/CD", "Docker"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2022 工程化与规范",
  },
  {
    year: "2023",
    stage: "深耕 · 架构",
    title: "深入 Nuxt 全栈与 Web 体验优化",
    subtitle: "SSR 渲染、边缘计算与性能打磨",
    summary:
      "专注于 Nuxt 3 / Nitro 架构，深耕服务端渲染、首屏加载优化与 Core Web Vitals 指标调优，追求毫秒级的响应与极佳的交互质感。",
    points: [
      "深入 Nuxt 服务端渲染与水合机制",
      "针对关键性能指标进行系统性重构与调优",
      "探索边缘计算与无服务器架构实践",
    ],
    tags: ["Nuxt 3", "Nitro", "SSR", "Web 性能优化", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2023 Nuxt全栈与性能打磨",
  },
  {
    year: "2024",
    stage: "沉淀 · 开放",
    title: "开源协作与技术知识库建设",
    subtitle: "模块沉淀与深度经验输出",
    summary:
      "主导 Monorepo 多包管理实践，提炼通用组件与工具库。重构个人知识库，撰写深度技术思考与架构复盘，在交流中持续进化。",
    points: [
      "维护高质量开源组件与工具包",
      "沉淀几十篇结构化技术博文与实践笔记",
      "推行组件设计模式与领域驱动思维",
    ],
    tags: ["Monorepo", "开源协作", "知识库沉淀", "架构设计"],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2024 开源协作与沉淀",
  },
  {
    year: "2025",
    stage: "跃迁 · 智能",
    title: "融入 AI Native 新工作流与交互",
    subtitle: "大模型 Agent 赋能研发与产品重塑",
    summary:
      "紧跟大模型发展浪潮，将 AI Agent、智能上下文编排与自动化工具链融入日常研发，探索全新人机协同与智能化交互形态。",
    points: [
      "落地智能化研发工作流与 Agent 编排",
      "探索 LLM 驱动的新型交互与产品形态",
      "保持高敏锐度与快速上手新技术的能力",
    ],
    tags: ["AI Native", "LLM Agents", "自动化", "新交互形态"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2025 AI Native 智能化研发",
  },
  {
    year: "2026",
    stage: "前瞻 · 远方",
    title: "专注本质，持续打造有价值的作品",
    subtitle: "保持年轻好奇，探索无界可能",
    summary:
      "以终身学习者的心态面对快速迭代的技术浪潮。保持年轻纯粹的热爱，在每个细节中追求简洁、优雅与可靠。",
    points: [
      "深耕前沿 Web 与跨端开发生态",
      "坚持用作品表达技术与审美理念",
      "以开放谦逊的态度持续精进",
    ],
    tags: ["Keep Shipping", "技术审美", "持续进化", "探索无界"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    imageAlt: "2026 眺望未来",
  },
];

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

// 轻柔的年份水印微视差
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
    <!-- 章节标题 -->
    <div class="max-w-4xl mx-auto px-4 text-center mb-16 sm:mb-20">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-mono font-medium tracking-wide uppercase mb-3 border border-neutral-200/60 dark:border-neutral-700/60">
        <UIcon name="i-lucide-git-commit" class="h-3.5 w-3.5 text-primary" />
        <span>GROWTH LOG · 成长历程</span>
      </div>
      <h2 class="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
        以年为尺，记录每一步技术轨迹
      </h2>
      <p class="mt-3 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
        从初探编程到架构探索，记录这几年间在代码、工程与思考中的蜕变历程。
      </p>
    </div>

    <!-- 时间轴 -->
    <div class="relative max-w-5xl mx-auto px-4 sm:px-6">
      <!-- 极简时间轴中线 -->
      <div
        aria-hidden="true"
        class="absolute left-6 md:left-1/2 top-4 bottom-8 -translate-x-1/2 w-px bg-neutral-200 dark:bg-neutral-800"
      />

      <!-- 节点列表 -->
      <div class="space-y-12 sm:space-y-20">
        <div
          v-for="(item, index) in timelineData"
          :key="item.year"
          class="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
          :class="index % 2 === 0 ? 'md:flex-row-reverse' : ''"
        >
          <!-- 背景年份水印（极低调微视差） -->
          <div
            class="pointer-events-none absolute select-none text-7xl sm:text-9xl font-black font-mono tracking-tighter opacity-[0.03] dark:opacity-[0.04] -z-10 leading-none transition-transform duration-100 ease-out"
            :class="index % 2 === 0 ? 'right-2 md:right-8' : 'left-2 md:left-8'"
            :style="getWatermarkStyle(index)"
          >
            {{ item.year }}
          </div>

          <!-- 时间轴节点指示点 -->
          <div
            class="absolute left-6 md:left-1/2 -translate-x-1/2 top-7 md:top-1/2 md:-translate-y-1/2 z-10 flex items-center justify-center"
          >
            <div class="h-4 w-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-primary shadow-xs" />
          </div>

          <!-- 卡片内容主体（半宽） -->
          <div class="w-full md:w-1/2 pl-12 md:pl-0">
            <div
              class="group relative rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300"
            >
              <!-- 年份与阶段 -->
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <span class="text-xl sm:text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                    {{ item.year }}
                  </span>
                  <span class="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60">
                    {{ item.stage }}
                  </span>
                </div>
              </div>

              <h3 class="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {{ item.title }}
              </h3>
              <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3">
                {{ item.subtitle }}
              </p>

              <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
                {{ item.summary }}
              </p>

              <!-- 要点列表 -->
              <div class="space-y-1.5 mb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                <div
                  v-for="(point, pIdx) in item.points"
                  :key="pIdx"
                  class="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300"
                >
                  <span class="text-primary font-bold">·</span>
                  <span>{{ point }}</span>
                </div>
              </div>

              <!-- 标签 -->
              <div class="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 配图区（另一侧半宽，低调质感） -->
          <div class="w-full md:w-1/2 pl-12 md:pl-0">
            <div
              class="group/img relative rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100 dark:bg-neutral-900 shadow-xs transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <div class="relative aspect-[16/9] overflow-hidden">
                <img
                  :src="item.image"
                  :alt="item.imageAlt"
                  loading="lazy"
                  class="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover/img:scale-105 opacity-90 hover:opacity-100"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white/90">
                  <span class="text-xs font-mono font-medium truncate">
                    {{ item.year }} · {{ item.stage }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
