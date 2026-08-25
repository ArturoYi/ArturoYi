<script setup lang="ts">
const tools = [
  { name: "Android", icon: "i-logos-android-icon" },
  { name: "iOS", icon: "i-logos-apple", class: "dark:invert" },
  { name: "Flutter", icon: "i-logos-flutter" },
  { name: "Vue", icon: "i-logos-vue" },
];
</script>

<template>
  <section class="relative py-10 sm:py-14 border-y border-neutral-200/60 dark:border-neutral-800/60">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-center gap-7 sm:gap-10">
        <UIcon
          v-for="item in tools"
          :key="item.name"
          :name="item.icon"
          :aria-label="item.name"
          class="h-8 w-8 sm:h-9 sm:w-9"
          :class="item.class"
        />
      </div>
    </div>
  </section>
</template>
