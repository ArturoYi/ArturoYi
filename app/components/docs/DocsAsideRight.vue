<script setup lang="ts">
import type { DocsCollectionItem } from "@nuxt/content";

/**
 * 文档页右侧栏（由内层 UPage #right 挂载，见 docus app/pages/[[lang]]/[...slug].vue）。
 *
 * 无 TOC 时仍保留 UPageAside 占位，使内层 UPage 的 right 槽位有效、正文保持 lg:col-span-6。
 * 有 TOC 时在 Aside 内渲染 UContentToc；移动端菜单/TOC 条见 DocsAsideMobileBar。
 */
const props = defineProps<{
  page?: DocsCollectionItem | null;
}>();

const links = computed(() => props.page?.body?.toc?.links || []);

const { subNavigationMode } = useSubNavigation();
const appConfig = useAppConfig();
const { t } = useDocusI18n();

const contentTocVariants = useUIConfig("contentToc");
</script>

<template>
  <UPageAside :aria-hidden="!links.length ? true : undefined">
    <UContentToc
      v-if="links.length"
      :highlight="contentTocVariants.highlight ?? true"
      :highlight-color="contentTocVariants.highlightColor"
      :highlight-variant="contentTocVariants.highlightVariant ?? 'circuit'"
      :color="contentTocVariants.color"
      :title="appConfig.toc?.title || t('docs.toc')"
      :links="links"
      :class="{ 'hidden lg:block': subNavigationMode }"
    >
      <template #bottom>
        <DocsAsideRightBottom />
      </template>
    </UContentToc>

    <DocsAsideMobileBar :links="links" />
  </UPageAside>
</template>
