<template>
  <div class="mini-panel flex">
    <slot name="icon" />
    <div class="v-flex content">
      <span class="title font-sm">{{ title }}</span>
      <span class="body">{{ body }}</span>
      <ProgressBar v-if="progress" :progress="Number(progress)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from './ProgressBar.vue'
defineProps<{
  icon?: string
  title: string
  body: string
  progress?: string
}>()
</script>

<style lang="css" scoped>
@import '../assets/common.less';
.mini-panel {
  align-items: center;
  flex: 0 0 50px;
  min-width: 50px;

  & + .mini-panel {
    margin-left: 20px;
  }
}

.content {
  justify-content: start;
  margin-left: 5px;
  flex: 1 1 99%;

  .title {
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
  }

  .body {
    font-size: 11px;
    text-transform: capitalize;
    font-weight: 600;
    white-space: nowrap;
  }
}
</style>
