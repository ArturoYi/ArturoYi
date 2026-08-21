<script setup lang="ts">
import { ref, computed } from "vue";
import { useMouseInElement } from "@vueuse/core";

const cardRef = ref<HTMLElement | null>(null);
const { elementX, elementY, isOutside, elementWidth, elementHeight } = useMouseInElement(cardRef);

// 克制平滑的微 3D 视差
const cardTransform = computed(() => {
  if (isOutside.value || !elementWidth.value || !elementHeight.value) {
    return "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  }
  const x = elementX.value / elementWidth.value - 0.5;
  const y = elementY.value / elementHeight.value - 0.5;
  const rotateX = -y * 6;
  const rotateY = x * 6;
  return `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
});

const activeTab = ref<"config" | "about">("config");
</script>

<template>
  <div
    ref="cardRef"
    class="relative group transition-transform duration-300 ease-out will-change-transform"
    :style="{ transform: cardTransform }"
  >
    <!-- 卡片微光阴影 -->
    <div
      class="absolute -inset-0.5 rounded-2xl bg-neutral-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
    />

    <!-- 代码窗口主体 -->
    <div
      class="relative rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden text-left transition-colors duration-300"
    >
      <!-- 窗口顶栏 -->
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/60 dark:bg-neutral-950/40"
      >
        <!-- 三点按钮 -->
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700 inline-block" />
          <span class="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700 inline-block" />
          <span class="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700 inline-block" />
        </div>

        <!-- 标签页切换 -->
        <div class="flex items-center gap-1 bg-neutral-200/50 dark:bg-neutral-800/50 p-0.5 rounded-lg text-xs font-mono">
          <button
            type="button"
            class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
            :class="
              activeTab === 'config'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            "
            @click="activeTab = 'config'"
          >
            arturo.config.ts
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
            :class="
              activeTab === 'about'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            "
            @click="activeTab = 'about'"
          >
            profile.json
          </button>
        </div>

        <!-- 状态指示 -->
        <div class="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>ready</span>
        </div>
      </div>

      <!-- 代码内容区域 -->
      <div class="p-5 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto min-h-[250px]">
        <!-- Tab 1: arturo.config.ts -->
        <div v-if="activeTab === 'config'" class="space-y-1 text-neutral-800 dark:text-neutral-200">
          <div>
            <span class="text-neutral-400 dark:text-neutral-500">// 开发者配置与工程哲学</span>
          </div>
          <div>
            <span class="text-violet-600 dark:text-violet-400 font-medium">export default</span>
            <span class="text-neutral-900 dark:text-white font-medium"> defineConfig</span>
            <span class="text-neutral-400">({</span>
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">author:</span>
            <span class="text-emerald-600 dark:text-emerald-400"> 'ArturoYi'</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">role:</span>
            <span class="text-emerald-600 dark:text-emerald-400"> 'Full Stack Developer'</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">stack:</span>
            <span class="text-neutral-400">[</span>
            <span class="text-sky-600 dark:text-sky-400">'Nuxt 4'</span>,
            <span class="text-sky-600 dark:text-sky-400"> 'Vue 3'</span>,
            <span class="text-sky-600 dark:text-sky-400"> 'TypeScript'</span>,
            <span class="text-sky-600 dark:text-sky-400"> 'Nitro'</span>
            <span class="text-neutral-400">]</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">focus:</span>
            <span class="text-emerald-600 dark:text-emerald-400"> 'Architecture & User Experience'</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">philosophy:</span>
            <span class="text-neutral-600 dark:text-neutral-300"> 'Clean code, thoughtful craft, constant curiosity.'</span>
          </div>
          <div>
            <span class="text-neutral-400">});</span>
          </div>
        </div>

        <!-- Tab 2: profile.json -->
        <div v-else class="space-y-1 text-neutral-800 dark:text-neutral-200">
          <div><span class="text-neutral-400">{</span></div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">"status":</span>
            <span class="text-emerald-600 dark:text-emerald-400"> "shipping ideas to reality"</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">"passion":</span>
            <span class="text-sky-600 dark:text-sky-400"> ["Modern Web", "System Design", "AI Native Tools"]</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">"location":</span>
            <span class="text-neutral-600 dark:text-neutral-300"> "Earth / Remote"</span>,
          </div>
          <div class="pl-4">
            <span class="text-neutral-500 dark:text-neutral-400">"mindset":</span>
            <span class="text-neutral-600 dark:text-neutral-300"> "Stay humble, build with precision."</span>
          </div>
          <div><span class="text-neutral-400">}</span></div>
        </div>
      </div>

      <!-- 底部简练状态行 -->
      <div class="px-5 py-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-950/20 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
        <span>TypeScript 5.9</span>
        <span>UTF-8</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保证 Vue SFC 样式块结构完整与 HMR 缓存安全 */
</style>
