<script setup lang="ts">
const notes = [
  "够用就好，别堆。",
  "细节过得去，自己才过得去。",
  "慢慢来，别停。",
  "写下来，免得忘。",
];
</script>

<template>
  <section class="relative py-16 sm:py-24">
    <div class="max-w-xl mx-auto px-4 sm:px-6">
      <p class="text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-6">
        写给自己。
      </p>
      <ul class="space-y-3">
        <li
          v-for="note in notes"
          :key="note"
          class="text-base sm:text-lg text-neutral-800 dark:text-neutral-200"
        >
          {{ note }}
        </li>
      </ul>
    </div>
  </section>
</template>
