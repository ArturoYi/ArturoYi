<script setup lang="ts">
/**
 * Nuxt UI v3 的 UDivider 在 v4 中由 USeparator 承担同类职责。
 * 保留 UDivider 名称以兼容旧版 Docus / 文档模板中的 MDC 组件名。
 */
defineOptions({ inheritAttrs: false });
</script>

<template>
  <USeparator v-bind="$attrs">
    <slot />
  </USeparator>
</template>
