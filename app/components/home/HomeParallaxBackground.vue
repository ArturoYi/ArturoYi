<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useWindowScroll, useMouse } from "@vueuse/core";

const isMounted = ref(false);
const { y: scrollY } = useWindowScroll();
const { x: mouseX, y: mouseY } = useMouse();

onMounted(() => {
  isMounted.value = true;
});

// 平滑轻柔的微视差位移
const parallaxOffset = computed(() => {
  if (!isMounted.value) return { x: 0, y: 0 };
  const sx = (mouseX.value - window.innerWidth / 2) * 0.015;
  const sy = scrollY.value * 0.08;
  return { x: sx, y: -sy };
});

const spotlightStyle = computed(() => {
  if (!isMounted.value) return { transform: "translate3d(0, 0, 0)" };
  const sx = (mouseX.value - window.innerWidth / 2) * 0.03;
  const sy = (mouseY.value - window.innerHeight / 2) * 0.03;
  return {
    transform: `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`,
  };
});
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none"
  >
    <!-- 极简微点阵背景 (Subtle Dot Matrix) -->
    <div
      class="dot-grid absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
      :style="{
        transform: `translate3d(0, ${(parallaxOffset.y * 0.2).toFixed(1)}px, 0)`,
      }"
    />

    <!-- 柔和环境光斑 1 (顶部主视觉中性柔光) -->
    <div
      class="ambient-glow absolute top-[-15%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-neutral-200/50 dark:bg-neutral-800/25 blur-[130px]"
      :style="spotlightStyle"
    />

    <!-- 柔和环境微光 2 (带极其克制的品牌主色微光) -->
    <div
      class="ambient-glow absolute top-[40%] right-[-5%] h-[400px] w-[500px] rounded-full bg-primary/[0.04] dark:bg-primary/[0.06] blur-[140px]"
      :style="{
        transform: `translate3d(${parallaxOffset.x}px, ${(parallaxOffset.y * 0.3).toFixed(1)}px, 0)`,
      }"
    />

    <!-- 柔和环境微光 3 (底部中性环境光) -->
    <div
      class="ambient-glow absolute bottom-[10%] left-[-5%] h-[450px] w-[550px] rounded-full bg-neutral-200/40 dark:bg-neutral-800/20 blur-[130px]"
      :style="{
        transform: `translate3d(${-parallaxOffset.x}px, ${(parallaxOffset.y * 0.2).toFixed(1)}px, 0)`,
      }"
    />
  </div>
</template>

<style scoped>
.dot-grid {
  background-image: radial-gradient(
    currentColor 0.75px,
    transparent 0.75px
  );
  background-size: 24px 24px;
  color: rgb(163 163 163 / 0.3);
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
}

.dark .dot-grid {
  color: rgb(255 255 255 / 0.15);
}

.ambient-glow {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
</style>
