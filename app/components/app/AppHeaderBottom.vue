<script setup lang="ts">
// 归档页专用：顶栏第二行展示「全部」+ 各分类（UNavigationMenu）
const { sections } = useSubNavigation();

const navMenuVariants = useUIConfig("navigationMenu");
</script>

<template>
  <USeparator class="hidden lg:flex" />

  <UContainer class="hidden lg:flex items-center justify-between">
    <UNavigationMenu
      v-if="sections.length"
      :items="sections"
      :highlight="navMenuVariants.highlight ?? true"
      :highlight-color="navMenuVariants.highlightColor"
      :variant="navMenuVariants.variant ?? 'pill'"
      :color="navMenuVariants.color"
      class="-mx-2.5 -mb-px"
    />

    <AppHeaderBottomRight />
  </UContainer>
</template>
