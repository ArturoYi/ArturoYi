<script setup lang="ts">
/**
 * Nuxt UI v3 的 UGrid 在 v4 中已更名为 UPageGrid。
 * MDC 中仍可能使用 ::u-grid（渲染为 UGrid），此组件作为别名避免 MDCRenderer 解析失败。
 */
defineOptions({ inheritAttrs: false });
</script>

<template>
  <UPageGrid v-bind="$attrs">
    <slot />
  </UPageGrid>
</template>
