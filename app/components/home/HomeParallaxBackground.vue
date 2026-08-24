<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useWindowScroll, useMouse } from "@vueuse/core";

const isMounted = ref(false);
const reduceMotion = ref(false);
const { y: scrollY } = useWindowScroll();
const { x: mouseX, y: mouseY } = useMouse();

onMounted(() => {
  isMounted.value = true;
  reduceMotion.value = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
});

const canAnimate = computed(() => isMounted.value && !reduceMotion.value);

const gridStyle = computed(() => {
  if (!canAnimate.value) return {};
  const offset = scrollY.value * 0.18;
  return {
    transform: `translate3d(0, ${(-offset).toFixed(1)}px, 0)`,
  };
});

const spotlightStyle = computed(() => {
  if (!canAnimate.value) {
    return {
      background:
        "radial-gradient(520px circle at 50% 28%, color-mix(in srgb, var(--ui-primary) 14%, transparent), transparent 62%)",
    };
  }
  return {
    background: `radial-gradient(460px circle at ${mouseX.value}px ${mouseY.value}px, color-mix(in srgb, var(--ui-primary) 18%, transparent), transparent 62%)`,
  };
});

const orbAStyle = computed(() => {
  if (!canAnimate.value) return {};
  const x =
    (mouseX.value - (import.meta.client ? window.innerWidth / 2 : 0)) * 0.04;
  const y = scrollY.value * -0.12;
  return {
    transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`,
  };
});

const orbBStyle = computed(() => {
  if (!canAnimate.value) return {};
  const x =
    (mouseX.value - (import.meta.client ? window.innerWidth / 2 : 0)) * -0.05;
  const y = scrollY.value * -0.08;
  return {
    transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`,
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

    <div class="absolute inset-0 transition-[background] duration-200 ease-out" :style="spotlightStyle" />

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
