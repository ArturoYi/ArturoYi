<script setup lang="ts">
defineProps<{
  mobile?: boolean
}>()

const appConfig = useAppConfig();
const nav = computed(
  () =>
    appConfig.navigation as
      | { articlesPath?: string; demosPath?: string; demosLabel?: string }
      | undefined,
);
</script>

<template>
  <div
    class="flex"
    :class="mobile ? 'flex-col gap-1 lg:hidden' : 'hidden items-center lg:flex'"
  >
    <UButton
      :to="nav?.articlesPath ?? '/articles'"
      label="文章"
      color="neutral"
      variant="ghost"
      :block="mobile"
    />
    <UButton
      :to="nav?.demosPath ?? '/demos'"
      :label="nav?.demosLabel ?? '示例'"
      color="neutral"
      variant="ghost"
      :block="mobile"
    />
  </div>
</template>
