<script setup lang="ts">
// 移动端 header 抽屉：归档页 = 全部分类 Tab；文档页 = 当前栏目目录树
const route = useRoute();
const {
  showCategorySidebar,
  sidebarNavigation,
  subNavigationMode,
  sections,
} = useSubNavigation();

const contentNavVariants = useUIConfig("contentNavigation");
const navMenuVariants = useUIConfig("navigationMenu");
</script>

<template>
  <div class="flex flex-col gap-2">
    <AppHeaderCTA mobile />

    <template v-if="showCategorySidebar">
      <USeparator class="lg:hidden" />
      <UContentNavigation
        :key="route.path"
        collapsible
        default-open
        :highlight="contentNavVariants.highlight ?? true"
        :highlight-color="contentNavVariants.highlightColor"
        :variant="contentNavVariants.variant ?? 'link'"
        :color="contentNavVariants.color"
        :navigation="sidebarNavigation"
        class="min-w-0"
        :ui="{
          list: 'min-w-0',
          listWithChildren: 'min-w-0',
          item: 'min-w-0',
          itemWithChildren: 'min-w-0',
          link: 'min-w-0',
          linkTitle: 'min-w-0 truncate',
          linkTrailing: 'inline-flex',
        }"
      />
    </template>

    <template
      v-else-if="subNavigationMode === 'header' && sections.length"
    >
      <USeparator class="lg:hidden" />
      <UNavigationMenu
        :items="sections"
        :highlight="navMenuVariants.highlight ?? true"
        :highlight-color="navMenuVariants.highlightColor"
        :variant="navMenuVariants.variant ?? 'pill'"
        :color="navMenuVariants.color"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </div>
</template>
