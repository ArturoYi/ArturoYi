<script setup lang="ts">
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
};
</script>

<template>
  <UContentNavigation
    :collapsible="false"
    :highlight="contentNavVariants.highlight ?? true"
    :highlight-color="contentNavVariants.highlightColor"
    :variant="contentNavVariants.variant ?? 'link'"
    :color="contentNavVariants.color"
    :navigation="sidebarNavigation"
    class="min-w-0"
    :ui="navUi"
  />
</template>
