<script setup lang="ts">
const route = useRoute();
const { sidebarNavigation } = useSubNavigation();

const contentNavVariants = useUIConfig("contentNavigation");

/** 左栏只有 2/10 列，长标题必须截断，避免撑破菜单。 */
const navUi = {
  list: "min-w-0",
  listWithChildren: "min-w-0",
  item: "min-w-0",
  itemWithChildren: "min-w-0",
  link: "min-w-0",
  linkLabel: "min-w-0 truncate",
  linkTitle: "min-w-0 truncate",
  linkText: "min-w-0 truncate",
  // Docus 默认把折叠箭头藏掉；分组可折叠后需要显示。
  linkTrailing: "inline-flex",
};
</script>

<template>
  <!-- 带子页面的分组可折叠；当前文章所在分组默认展开，换页后仍展开该分组 -->
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
    :ui="navUi"
  />
</template>
