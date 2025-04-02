<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <i class="dot" :class="{ [color]: true, glow: glow }" :title="title" />
</template>

<script setup lang="ts">
defineProps<{
  color: string
  title?: string
  glow?: boolean
}>()
</script>

<style lang="css" scoped>
.dot {
  display: inline-block;
  border-radius: 50%;
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  vertical-align: middle;
  --color: transpanent;
  background-color: var(--color);

  &.blue {
    --color: var(--color-blue-500);
  }

  &.green {
    --color: var(--color-green-500);
  }

  &.red {
    --color: var(--color-red-500);
  }

  &.yellow {
    --color: var(--color-orange-500);
  }

  &.purple {
    --color: var(--color-purple-500);
  }
}

.glow::after {
  display: block;
  content: '';
  position: absolute;
  background-color: var(--color);
  border-radius: 50%;
  width: 8px;
  height: 8px;
  animation: glow 1.5s infinite linear;
}

@keyframes glow {
  0% {
    scale: 1;
    opacity: 0.8;
  }
  50% {
    scale: 2;
    opacity: 0;
  }
  100% {
    scale: 2;
    opacity: 0;
  }
}
</style>
