<script setup lang="ts">
const principles = [
  {
    tag: "01",
    title: "专注本质",
    subtitle: "Simplicity & Focus",
    desc: "不盲目堆砌复杂设计，以清晰的逻辑与直观的架构解决核心问题。",
  },
  {
    tag: "02",
    title: "敬畏细节",
    subtitle: "Craftsmanship",
    desc: "在每一个像素对齐、动效缓动与边界异常处理中倾注对品质的坚持。",
  },
  {
    tag: "03",
    title: "持续进化",
    subtitle: "Continuous Learning",
    desc: "保持对前沿技术的敏锐与开放，以终身学习者的姿态拥抱变革。",
  },
  {
    tag: "04",
    title: "乐于分享",
    subtitle: "Open & Connect",
    desc: "将踩坑与实践沉淀为文字，在开源与知识共享中与同伴共同成长。",
  },
];
</script>

<template>
  <section class="relative py-16 sm:py-24">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="mb-12 text-center max-w-xl mx-auto">
        <h3 class="text-xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          开发理念与原则
        </h3>
        <p class="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          指导日常编码、架构决策与持续学习的核心观念
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="p in principles"
          :key="p.tag"
          class="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/60 p-5 backdrop-blur-xs flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
              <span>{{ p.tag }}</span>
              <span>{{ p.subtitle }}</span>
            </div>
            <h4 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
              {{ p.title }}
            </h4>
            <p class="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {{ p.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
