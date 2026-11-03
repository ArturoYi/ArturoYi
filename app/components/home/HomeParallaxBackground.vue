<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useThrottleFn } from "@vueuse/core";

const isMounted = ref(false);
const reduceMotion = ref(false);
const scrollY = ref(0);
const updateScroll = useThrottleFn(() => {
  scrollY.value = window.scrollY;
}, 32);

onMounted(() => {
  isMounted.value = true;
  reduceMotion.value = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
});

onUnmounted(() => {
  if (!import.meta.client) return;
  window.removeEventListener("scroll", updateScroll);
});

const canAnimate = computed(() => isMounted.value && !reduceMotion.value);

const gridStyle = computed(() => {
  if (!canAnimate.value) return {};
  const offset = scrollY.value * 0.18;
  return {
    transform: `translate3d(0, ${(-offset).toFixed(1)}px, 0)`,
  };
});

const orbAStyle = computed(() => {
  if (!canAnimate.value) return {};
  return {
    transform: `translate3d(0, ${(scrollY.value * -0.12).toFixed(1)}px, 0)`,
  };
});

const orbBStyle = computed(() => {
  if (!canAnimate.value) return {};
  return {
    transform: `translate3d(0, ${(scrollY.value * -0.08).toFixed(1)}px, 0)`,
  };
});
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
  >
    <div
      class="dot-grid absolute -top-24 inset-x-0 h-[calc(100%+12rem)] opacity-70 dark:opacity-50"
      :style="gridStyle"
    />

    <div
      class="absolute top-[-8%] left-[12%] h-[28rem] w-[28rem] rounded-full bg-primary/15 dark:bg-primary/20 blur-[90px]"
      :style="orbAStyle"
    />
    <div
      class="absolute top-[38%] right-[-8%] h-[24rem] w-[32rem] rounded-full bg-sky-400/10 dark:bg-sky-400/20 blur-[100px]"
      :style="orbBStyle"
    />
  </div>
</template>

<style scoped>
.dot-grid {
  background-image: radial-gradient(currentColor 1.15px, transparent 1.15px);
  background-size: 22px 22px;
  color: rgb(115 115 115 / 0.42);
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 35%, transparent 82%);
}

.dark .dot-grid {
  color: rgb(255 255 255 / 0.28);
}
</style>
