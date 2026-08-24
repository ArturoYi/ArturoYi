<script setup lang="ts">
const tools = [
  { name: "Vue", icon: "i-vscode-icons-file-type-vue" },
  { name: "TypeScript", icon: "i-vscode-icons-file-type-typescript-official" },
  { name: "Tailwind CSS", icon: "i-vscode-icons-file-type-tailwind" },
  { name: "Node.js", icon: "i-vscode-icons-file-type-node" },
  { name: "Vite", icon: "i-vscode-icons-file-type-vite" },
  { name: "AI Agents", icon: "i-lucide-bot" },
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
          class="h-8 w-8 sm:h-9 sm:w-9 text-neutral-500 dark:text-neutral-400"
        />
      </div>
    </div>
  </section>
</template>
