<script setup lang="ts">
import {
  demoAssetKey,
  demoDownloadPath,
  findDemoById,
  formatByteSize,
} from "../../config/demos";
import { resolveDemoCategoryMeta } from "../utils/demos";

const props = defineProps<{
  /** config/demos.ts 中的 id */
  demo?: string;
  title?: string;
  description?: string;
  category?: string;
  filename?: string;
  /** 外链。设置后主按钮打开该地址，不再下载 zip */
  href?: string;
  /** 覆盖默认 /downloads/<category>/<filename> */
  src?: string;
  docs?: string;
  icon?: string;
  hideDocs?: boolean;
  /** 目录页去掉外边距，由父级 gap 控制间距 */
  flush?: boolean;
}>();

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const { categories } = useSubNavigation();

const listed = computed(() =>
  props.demo ? findDemoById(props.demo) : undefined,
);

const resolved = computed(() => {
  const category = props.category ?? listed.value?.category ?? "other";
  const filename = props.filename ?? listed.value?.filename ?? "";
  const externalHref = props.href ?? listed.value?.href ?? "";
  const href =
    props.src ??
    (externalHref || (filename ? demoDownloadPath({ category, filename }) : ""));

  return {
    title:
      props.title ??
      listed.value?.title ??
      (filename ? filename.replace(/\.zip$/i, "") : "未命名示例"),
    description: props.description ?? listed.value?.description ?? "",
    category,
    filename,
    href,
    external: Boolean(externalHref) && !props.src,
    docs: props.docs ?? listed.value?.docs,
    icon: props.icon ?? listed.value?.icon ?? "i-lucide-package",
    assetKey: filename ? demoAssetKey({ category, filename }) : "",
  };
});

const unknownDemo = computed(
  () =>
    Boolean(props.demo) &&
    !listed.value &&
    !props.src &&
    !props.filename &&
    !props.href,
);

const externalAction = computed(() => {
  const href = resolved.value.href;
  if (!resolved.value.external || !href) return undefined;
  let github = false;
  let hint = href;
  try {
    const url = new URL(href);
    github = url.hostname === "github.com";
    const parts = url.pathname.split("/").filter(Boolean);
    hint = github && parts.length >= 2 ? `${parts[0]}/${parts[1]}` : url.hostname;
  } catch {
    github = href.includes("github.com");
  }
  return {
    label: github ? "打开 GitHub" : "打开链接",
    icon: github ? "i-simple-icons-github" : "i-lucide-external-link",
    hint,
  };
});

const asset = computed(() => {
  const key = resolved.value.assetKey;
  if (!key) return undefined;
  const assets = (runtimeConfig.public.demoAssets ?? {}) as Record<
    string,
    { size: number }
  >;
  return assets[key];
});

const sizeLabel = computed(() =>
  asset.value ? formatByteSize(asset.value.size) : undefined,
);

const categoryMeta = computed(() =>
  resolveDemoCategoryMeta(resolved.value.category, categories.value),
);

const showDocsLink = computed(() => {
  if (props.hideDocs || !resolved.value.docs) return false;
  return route.path !== resolved.value.docs;
});
</script>

<template>
  <UPageCard
    v-if="unknownDemo"
    class="not-prose"
    :class="flush ? 'w-full' : 'my-6'"
    variant="subtle"
  >
    <p class="text-muted text-sm">
      未找到示例「{{ demo }}」，请在
      <code>config/demos.ts</code>
      中登记。
    </p>
  </UPageCard>

  <UPageCard
    v-else
    spotlight
    class="not-prose w-full"
    :class="flush ? undefined : 'my-6'"
  >
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 items-start gap-3">
        <div
          class="bg-elevated text-highlighted flex size-10 shrink-0 items-center justify-center rounded-lg"
        >
          <UIcon :name="resolved.icon" class="size-5" />
        </div>

        <div class="min-w-0 space-y-1.5">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-highlighted font-medium">
              {{ resolved.title }}
            </p>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
              :icon="categoryMeta.icon"
            >
              {{ categoryMeta.title }}
            </UBadge>
          </div>

          <p v-if="resolved.description" class="text-muted text-sm leading-relaxed">
            {{ resolved.description }}
          </p>

          <p v-if="externalAction || resolved.filename" class="text-dimmed text-xs">
            <template v-if="externalAction">
              {{ externalAction.hint }}
            </template>
            <template v-else>
              <span v-if="resolved.filename">{{ resolved.filename }}</span>
              <template v-if="sizeLabel">
                <span v-if="resolved.filename"> · </span>
                {{ sizeLabel }}
              </template>
              <template v-else-if="resolved.filename">
                <span> · </span>
                示例包尚未放入仓库
              </template>
            </template>
          </p>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <UButton
          v-if="showDocsLink"
          :to="resolved.docs"
          color="neutral"
          variant="ghost"
          size="sm"
        >
          查看文档
        </UButton>

        <UButton
          v-if="externalAction"
          :href="resolved.href"
          target="_blank"
          external
          color="neutral"
          size="sm"
          :icon="externalAction.icon"
        >
          {{ externalAction.label }}
        </UButton>
        <UButton
          v-else-if="asset && resolved.href"
          :href="resolved.href"
          :download="resolved.filename"
          external
          color="neutral"
          size="sm"
          icon="i-lucide-download"
        >
          下载示例
        </UButton>
        <UButton
          v-else
          disabled
          color="neutral"
          size="sm"
          icon="i-lucide-download"
        >
          下载示例
        </UButton>
      </div>
    </div>
  </UPageCard>
</template>
