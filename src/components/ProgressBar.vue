<template>
  <div class="outer">
    <div class="inner" :style="{ width: progress + '%' }" :class="color" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { progress } = defineProps<{
  progress: number
}>()

const color = computed(() => {
  if (progress < 70) return 'success'
  if (progress < 90) return 'warning'
  return 'danger'
})
</script>

<style lang="css" scoped>
.outer {
  position: relative;
  height: 3px;
  background-color: var(--color-gray);
  border-radius: 3px;
  overflow: hidden;
}

.inner {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  transition: width 0.2s ease;

  &.success {
    background-color: var(--color-green-500);
  }

  &.warning {
    background-color: var(--color-orange-500);
  }

  &.danger {
    background-color: var(--color-red-500);
  }
}
</style>
