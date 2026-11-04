<script setup lang="ts">
import type { ContentNavigationItem, PageCollections } from "@nuxt/content";
import * as nuxtUiLocales from "#ui/locale";

const appConfig = useAppConfig();
const { seo } = appConfig;
useDocusShortcuts();
const site = useSiteConfig();
const { locale, locales, isEnabled, switchLocalePath } = useDocusI18n();
const { isEnabled: isAssistantEnabled } = useAssistant();

const nuxtUiLocale = computed(
  () =>
    nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales] ||
    nuxtUiLocales.en,
);
const lang = computed(() => nuxtUiLocale.value.code);
const dir = computed(() => nuxtUiLocale.value.dir);
const collectionName = computed(() =>
  isEnabled.value ? `docs_${locale.value}` : "docs",
);

useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang,
    dir,
  },
});

useSeoMeta({
  titleTemplate: seo.titleTemplate,
  title: seo.title,
  description: seo.description,
  ogSiteName: site.name,
  twitterCard: "summary_large_image",
});

if (isEnabled.value) {
  const route = useRoute();
  const defaultLocale = useRuntimeConfig().public.i18n!.defaultLocale!;
  onMounted(() => {
    const currentLocale = route.path.split("/")[1];
    if (!locales.some((locale) => locale.code === currentLocale)) {
      return navigateTo(switchLocalePath(defaultLocale) as string);
    }
  });
}

const { data: navigation } = await useAsyncData(
  () => `navigation_${collectionName.value}`,
  () =>
    queryCollectionNavigation(
      collectionName.value as keyof PageCollections,
    ),
  {
    transform: (data: ContentNavigationItem[]) =>
      transformNavigation(data, isEnabled.value, locale.value),
    watch: [locale],
  },
);

provide("navigation", navigation);

// archive 页 subNavigationMode=header 时启用 .docus-sub-header（AppHeaderBottom）
const { subNavigationMode } = useSubNavigation(navigation);
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <div class="flex">
      <div
        class="flex-1 min-w-0"
        :class="{ 'docus-sub-header': subNavigationMode === 'header' }"
      >
        <AppHeader v-if="$route.meta.header !== false" />
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
        <AppFooter v-if="$route.meta.footer !== false" />

        <ClientOnly>
          <AppSearch :navigation="navigation" />
          <AppBackToTop />
          <LazyAssistantFloatingInput v-if="isAssistantEnabled" />
        </ClientOnly>
      </div>

      <ClientOnly v-if="isAssistantEnabled">
        <LazyAssistantPanel />
      </ClientOnly>
    </div>
  </UApp>
</template>

<style>
@media (min-width: 1024px) {
  .docus-sub-header {
    /* 64px base header + 48px sub-navigation bar */
    --ui-header-height: 112px;
  }
}

/* 文档栏是 flex/grid 子项，默认 min-width:auto 会被宽图、长代码撑开 */
[data-slot="center"] {
  min-width: 0;
  max-width: 100%;
}

/* 截图写了 width 和 max-w-*。max-width 只能有一个值，否则桌面宽度上限和手机 100% 会互相覆盖 */
[data-slot="center"] img {
  max-width: 100%;
  height: auto;
}

[data-slot="center"] img.max-w-xs { max-width: min(100%, 20rem); }
[data-slot="center"] img.max-w-sm { max-width: min(100%, 24rem); }
[data-slot="center"] img.max-w-md { max-width: min(100%, 28rem); }
[data-slot="center"] img.max-w-lg { max-width: min(100%, 32rem); }
[data-slot="center"] img.max-w-xl { max-width: min(100%, 36rem); }
[data-slot="center"] img.max-w-2xl { max-width: min(100%, 42rem); }

/* 行内代码是 inline-block，长标识符不会换行，会把整页撑出视口 */
[data-slot="center"] code.inline-block {
  max-width: 100%;
  overflow-wrap: anywhere;
}

/* 代码块文件名是 flex 子项，默认按整段路径撑开。窄屏截断，并给右上角复制按钮留出位置 */
[data-slot="center"] div:has(> pre) {
  min-width: 0;
  max-width: 100%;
}

[data-slot="center"] div:has(> pre) > div:first-child {
  min-width: 0;
  padding-inline-end: 2.75rem;
}

[data-slot="center"] div:has(> pre) > div:first-child > span.text-sm\/6 {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
