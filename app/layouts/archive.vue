<script setup lang="ts">
const { subNavigationMode } = useSubNavigation();

useHead({
  htmlAttrs: {
    class: computed(() =>
      subNavigationMode.value === "header" ? "docus-sub-header" : undefined,
    ),
  },
});
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <!-- 占位侧栏：与 docs 布局同宽，不展示导航 -->
          <UPageAside aria-hidden="true" />
        </template>
        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>

<style>
@media (min-width: 1024px) {
  html.docus-sub-header {
    /* 64px base header + 48px sub-navigation bar */
    --ui-header-height: 112px;
  }
}
</style>
