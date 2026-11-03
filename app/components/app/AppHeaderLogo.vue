<script setup lang="ts">
const appConfig = useAppConfig();
const { hasLogo, headerLightUrl, headerDarkUrl, contextMenuItems } =
  useLogoAssets();
</script>

<template>
  <UContextMenu v-if="hasLogo" :items="contextMenuItems">
    <UColorModeImage
      :light="headerLightUrl"
      :dark="headerDarkUrl"
      :alt="appConfig.header?.logo?.alt || appConfig.header?.title"
      width="800"
      height="800"
      :class="['h-6 w-auto shrink-0', appConfig.header?.logo?.class]"
    />
  </UContextMenu>
  <span v-else>
    {{ appConfig.header?.title || "{appConfig.header.title}" }}
  </span>
</template>
