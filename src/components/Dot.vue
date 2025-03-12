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

  &.blue {
    background-color: var(--color-blue);
    --color: var(--color-blue);
  }

  &.green {
    background-color: var(--color-green);
    --color: var(--color-green);
  }

  &.red {
    background-color: var(--color-red);
    --color: var(--color-red);
  }

  &.yellow {
    background-color: var(--color-yellow);
    --color: var(--color-yellow);
  }

  &.purple {
    background-color: var(--color-purple);
    --color: var(--color-purple);
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
  animation: glow 1s infinite ease-in;
}

@keyframes glow {
  0% {
    scale: 1;
    opacity: 0.8;
  }
  100% {
    scale: 2;
    opacity: 0;
  }
}
</style>
