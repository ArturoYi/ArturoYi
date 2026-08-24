<script setup lang="ts">
import HomeParallaxBackground from "../components/home/HomeParallaxBackground.vue";
import HomeHeroTerminal from "../components/home/HomeHeroTerminal.vue";
import HomeTechMatrix from "../components/home/HomeTechMatrix.vue";
import HomeGrowthTimeline from "../components/home/HomeGrowthTimeline.vue";
import HomeGeekManifesto from "../components/home/HomeGeekManifesto.vue";

const title = "ArturoYi · 开发者与创造者";
const description =
  "全栈开发者与技术探索者。记录 Nuxt 4、Vue 3、TypeScript 与工程化实践，沉淀以年为尺的成长轨迹。";

useSeo({
  title,
  description,
  type: "website",
});

defineOgImage("Landing", {
  title: title.slice(0, 60),
  description: formatOgDescription(title, description),
});

const scrollToTimeline = () => {
  const el = document.getElementById("growth-timeline");
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-neutral-900">
    <!-- 全局视差点阵与鼠标跟随光晕 -->
    <HomeParallaxBackground />

    <div class="relative z-10">
      <!-- 顶部 Hero 区域 -->
      <section class="relative pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-28">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <!-- 左侧：沉稳专注的个人介绍 -->
          <div class="lg:col-span-7 text-left space-y-6">
            <!-- 状态标签 -->
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 text-xs font-mono text-neutral-600 dark:text-neutral-300">
              <span class="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>ArturoYi</span>
            </div>

            <!-- 主标题：写给自己看 -->
            <h1 class="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              对自己说话。
            </h1>

            <!-- 简介 -->
            <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              写代码，记一点笔记。尽量少说。
            </p>

            <!-- 按钮组 -->
            <div class="flex flex-wrap items-center gap-3 pt-1">
              <UButton
                size="lg"
                color="neutral"
                variant="solid"
                class="font-medium cursor-pointer"
                icon="i-lucide-git-commit"
                trailing-icon="i-lucide-arrow-down"
                @click="scrollToTimeline"
              >
                成长历程
              </UButton>

              <UButton
                size="lg"
                color="neutral"
                variant="outline"
                to="/articles"
                icon="i-lucide-book-open"
                trailing-icon="i-lucide-arrow-right"
                class="font-medium"
              >
                阅读博客
              </UButton>

              <UButton
                size="lg"
                color="neutral"
                variant="ghost"
                to="https://github.com/ArturoYi/ArturoYi"
                target="_blank"
                icon="i-simple-icons-github"
                aria-label="GitHub"
              />
            </div>
          </div>

          <!-- 右侧：Q 版头像 -->
          <div class="lg:col-span-5">
            <HomeHeroTerminal />
          </div>
        </div>
      </div>
    </section>

    <!-- 技术栈图标 -->
    <HomeTechMatrix />

    <!-- 以年为单位的成长历程时间线 -->
    <HomeGrowthTimeline />

    <!-- 写给自己 -->
    <HomeGeekManifesto />

    <!-- 底部极简探索 CTA -->
    <section class="relative py-16 sm:py-20 border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div class="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h3 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
          持续记录，持续创造
        </h3>
        <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          欢迎浏览更多技术思考与笔记，或在 GitHub 交流探讨。
        </p>
        <div class="pt-2 flex justify-center gap-3">
          <UButton
            color="neutral"
            to="/articles"
            size="md"
            icon="i-lucide-book-open"
          >
            浏览所有文章
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            to="https://github.com/ArturoYi/ArturoYi"
            target="_blank"
            size="md"
            icon="i-simple-icons-github"
          >
            GitHub
          </UButton>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>
