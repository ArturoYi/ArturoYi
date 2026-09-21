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
  const href =
    props.src ?? (filename ? demoDownloadPath({ category, filename }) : "");

  return {
    title:
      props.title ??
      listed.value?.title ??
      (filename ? filename.replace(/\.zip$/i, "") : "未命名示例"),
    description: props.description ?? listed.value?.description ?? "",
    category,
    filename,
    href,
    docs: props.docs ?? listed.value?.docs,
    icon: props.icon ?? listed.value?.icon ?? "i-lucide-package",
    assetKey: filename ? demoAssetKey({ category, filename }) : "",
  };
});

const unknownDemo = computed(
  () => Boolean(props.demo) && !listed.value && !props.src && !props.filename,
);

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

          <p class="text-dimmed text-xs">
            <span v-if="resolved.filename">{{ resolved.filename }}</span>
            <template v-if="sizeLabel">
              <span v-if="resolved.filename"> · </span>
              {{ sizeLabel }}
            </template>
            <template v-else-if="resolved.filename">
              <span> · </span>
              示例包尚未放入仓库
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
          v-if="asset && resolved.href"
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
