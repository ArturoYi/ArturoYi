<script setup lang="ts">
defineProps<{
  mobile?: boolean
}>()
</script>

<template>
  <UButton
    to="/articles"
    label="文章"
    color="neutral"
    variant="ghost"
    :block="mobile"
    :class="mobile ? 'lg:hidden' : 'hidden lg:inline-flex'"
  />
</template>
