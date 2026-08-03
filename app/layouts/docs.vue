<script setup lang="ts">
/**
 * 文档布局：包裹 docus 的 [[...slug]] 文档页（内层还有一层 UPage + #right TOC）。
 *
 * 栏宽由 @nuxt/ui 的 UPage 网格决定（lg:grid-cols-10）：
 * - 外层 UPage（本文件）：#left = 栏目导航区（2 列）
 * - 内层 UPage（node_modules/docus/.../[...slug].vue）：#right = TOC（2 列），中间正文 6 列
 * 仅当内外层同时存在 #left 与 #right 时，正文才是 lg:col-span-6；缺一侧会变宽（8 或 10 列）。
 *
 * 「全部阅读 / scope=all」等无栏目树时仍渲染左侧占位，与有栏目 + 有 TOC 的页面保持同一版心宽度。
 */
const { showCategorySidebar } = useSubNavigation();
</script>

<template>
  <UMain>
    <UContainer>
      <UPage>
        <!-- 始终提供 #left，避免 v-if 去掉 slot 导致外层 center 扩满 10 列 -->
        <template #left>
          <UPageAside v-if="showCategorySidebar">
            <DocsAsideLeftTop />
            <DocsAsideLeftBody />
          </UPageAside>
          <UPageAside v-else aria-hidden="true" />
        </template>
        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>
