<script setup lang="ts">
interface TechStackItem {
  name: string;
  category: string;
  icon: string;
  desc: string;
}

const stats = [
  {
    number: "6+",
    unit: "Years",
    label: "持续编程与实践",
  },
  {
    number: "50+",
    unit: "Articles",
    label: "技术文章与笔记沉淀",
  },
  {
    number: "100%",
    unit: "Dedication",
    label: "对细节与体验的追求",
  },
  {
    number: "AI Native",
    unit: "Workflow",
    label: "智能协作与工程提效",
  },
];

const techArsenal: TechStackItem[] = [
  {
    name: "Vue 3 & Nuxt 4",
    category: "Frontend & FullStack",
    icon: "i-vscode-icons-file-type-vue",
    desc: "Composition API, SSR, 页面架构与性能打磨",
  },
  {
    name: "TypeScript",
    category: "Language",
    icon: "i-vscode-icons-file-type-typescript-official",
    desc: "严谨类型定义、泛型设计与可维护性保障",
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    icon: "i-vscode-icons-file-type-tailwind",
    desc: "原子化设计系统、响应式与深浅色模式切换",
  },
  {
    name: "Node.js & Nitro",
    category: "Backend Engine",
    icon: "i-vscode-icons-file-type-node",
    desc: "轻量高效的服务端接口与 Serverless 部署",
  },
  {
    name: "Vite & Tooling",
    category: "Build Tools",
    icon: "i-vscode-icons-file-type-vite",
    desc: "极速热更新、打包优化与工程化流水线配置",
  },
  {
    name: "AI Agents",
    category: "Intelligence",
    icon: "i-lucide-bot",
    desc: "智能上下文工作流与新一代人机协作探索",
  },
];
</script>

<template>
  <section class="relative py-16 sm:py-24 border-y border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-900/20">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <!-- 关键指标（数字区） -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
        <div
          v-for="(stat, idx) in stats"
          :key="idx"
          class="rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-900/60 p-4 sm:p-5 backdrop-blur-xs"
        >
          <div class="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tracking-tight">
            {{ stat.number }}
          </div>
          <div class="mt-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {{ stat.label }}
          </div>
          <div class="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
            {{ stat.unit }}
          </div>
        </div>
      </div>

      <!-- 技术栈标题 -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          <h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            技术栈与工具箱
          </h3>
          <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            专注在现代前端与全栈工程领域，精选核心工具链
          </p>
        </div>
      </div>

      <!-- 技术栈卡片矩阵 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in techArsenal"
          :key="item.name"
          class="group rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 p-4 backdrop-blur-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
        >
          <div class="flex items-center gap-3 mb-2.5">
            <div class="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
              <UIcon :name="item.icon" class="h-5 w-5" />
            </div>
            <div>
              <div class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {{ item.name }}
              </div>
              <div class="text-[11px] font-mono text-neutral-400">
                {{ item.category }}
              </div>
            </div>
          </div>
          <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {{ item.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
