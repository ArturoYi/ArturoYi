<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { joinURL, withTrailingSlash } from "ufo";
import { mdcToCommonMarkdown } from "../../utils/mdc-to-common-markdown";

/**
 * 覆盖 Docus 的「复制页面」菜单。
 * 在此增删 items 即可自定义下拉项。
 */
const route = useRoute();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();
const site = useSiteConfig();
const appBaseURL = runtimeConfig.app?.baseURL || "/";
const siteUrl = computed(
  () => String(site.url || "https://chenyiren.top").replace(/\/+$/, ""),
);
const mcpRoute =
  (runtimeConfig.public.mcp as { route?: string } | undefined)?.route || "/mcp";

const { copy, copied } = useClipboard();
const { t } = useDocusI18n();

const markdownLink = computed(
  () =>
    `${window?.location?.origin}${withTrailingSlash(appBaseURL)}raw${route.path}.md`,
);
const mcpServerUrl = computed(
  () => `${window?.location?.origin}${joinURL(appBaseURL, mcpRoute)}`,
);
const mcpDeeplink = computed(
  () => `${window?.location?.origin}${joinURL(appBaseURL, mcpRoute, "deeplink")}`,
);

const items = computed(() => [
  [
    {
      label: "复制 Markdown",
      icon: "i-lucide-file-text",
      onSelect() {
        copyCommonMarkdown();
      },
    },
    {
      label: t("docs.copy.link"),
      icon: "i-lucide-link",
      onSelect() {
        copy(markdownLink.value);
      },
    },
    {
      label: t("docs.copy.view"),
      icon: "i-simple-icons:markdown",
      target: "_blank",
      to: markdownLink.value,
    },
    {
      label: t("docs.copy.gpt"),
      icon: "i-simple-icons:openai",
      target: "_blank",
      to: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read ${markdownLink.value} so I can ask questions about it.`)}`,
    },
    {
      label: t("docs.copy.claude"),
      icon: "i-simple-icons:anthropic",
      target: "_blank",
      to: `https://claude.ai/new?q=${encodeURIComponent(`Read ${markdownLink.value} so I can ask questions about it.`)}`,
    },
  ],
  [
    {
      label: "Copy MCP Server URL",
      icon: "i-lucide-link",
      onSelect() {
        copy(mcpServerUrl.value);
        toast.add({
          title: "Copied to clipboard",
          icon: "i-lucide-check-circle",
        });
      },
    },
    {
      label: "Add MCP Server",
      icon: "i-simple-icons:cursor",
      target: "_blank",
      to: mcpDeeplink.value,
    },
  ],
]);

async function fetchPageMarkdown() {
  return await $fetch<string>(`/raw${route.path}.md`);
}

async function copyPage() {
  const page = await fetchPageMarkdown();
  copy(page);
}

async function copyCommonMarkdown() {
  try {
    const page = await fetchPageMarkdown();
    await copy(mdcToCommonMarkdown(page, { siteUrl: siteUrl.value }));
    toast.add({
      title: "已复制 Markdown",
      description: "自定义组件已转为通用语法",
      icon: "i-lucide-check-circle",
    });
  } catch (error) {
    console.error("复制 Markdown 失败", error);
    toast.add({
      title: "复制失败",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
  }
}
</script>

<template>
  <UFieldGroup size="sm">
    <UButton
      :label="t('docs.copy.page')"
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      color="neutral"
      variant="soft"
      :ui="{
        leadingIcon: 'text-neutral size-3.5',
      }"
      @click="copyPage"
    />

    <UDropdownMenu
      size="sm"
      :items="items"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8,
      }"
    >
      <UButton
        icon="i-lucide-chevron-down"
        color="neutral"
        variant="soft"
        class="border-l border-muted"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
