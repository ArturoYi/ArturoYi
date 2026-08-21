<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";

const { y } = useWindowScroll();
const visible = computed(() => y.value > 320);

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}
</script>

<template>
  <Transition name="back-to-top">
    <div
      v-show="visible"
      class="fixed bottom-6 end-6 z-50"
    >
      <UTooltip text="返回顶部">
        <UButton
          icon="i-lucide-arrow-up"
          color="neutral"
          variant="outline"
          size="md"
          square
          aria-label="返回顶部"
          class="shadow-md backdrop-blur-md bg-white/80 dark:bg-neutral-900/80"
          @click="scrollToTop"
        />
      </UTooltip>
    </div>
  </Transition>
</template>

<style scoped>
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
