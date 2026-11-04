<template>
  <div aria-hidden="true" class="dot-grid" />
</template>

<style scoped>
.dot-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  background-image: radial-gradient(rgb(115 115 115 / 0.294) 1.15px, transparent 1.15px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 35%, transparent 82%);
}

.dark .dot-grid {
  background-image: radial-gradient(rgb(255 255 255 / 0.14) 1.15px, transparent 1.15px);
}
</style>
