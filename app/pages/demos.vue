<script setup lang="ts">
import { demoProjects } from "../../config/demos";
import { normalizeCategoryToken } from "../utils/category-tabs";
import { resolveDemoCategoryMeta } from "../utils/demos";

definePageMeta({
  layout: "archive",
});

const route = useRoute();
const { categories } = useSubNavigation();

const activeCategoryToken = computed(() => {
  const raw = typeof route.query.cat === "string" ? route.query.cat : "";
  return raw ? normalizeCategoryToken(raw) : undefined;
});

const filteredDemos = computed(() => {
  const token = activeCategoryToken.value;
  if (!token) return demoProjects;
  return demoProjects.filter(
    (demo) => normalizeCategoryToken(demo.category) === token,
  );
});

const heading = computed(() => {
  if (!activeCategoryToken.value) {
    return { title: "示例项目", description: `共 ${filteredDemos.value.length} 个` };
  }
  const meta = resolveDemoCategoryMeta(activeCategoryToken.value, categories.value);
  return {
    title: `${meta.title} 示例`,
    description: `共 ${filteredDemos.value.length} 个`,
  };
});

useSeo({
  title: "示例项目",
  description: "文档配套的可运行示例，按栏目分类，可直接下载。",
  type: "website",
});
</script>

<template>
  <UPage>
    <UPageHeader
      :title="heading.title"
      :description="heading.description"
    />

    <UPageBody>
      <div v-if="!filteredDemos.length" class="text-muted text-sm">
        该分类暂无示例。
      </div>

      <div v-else class="flex flex-col gap-3">
        <DemoDownload
          v-for="item in filteredDemos"
          :key="item.id"
          :demo="item.id"
          flush
        />
      </div>
    </UPageBody>

    <template #right>
      <UPageAside aria-hidden="true" />
    </template>
  </UPage>
</template>
