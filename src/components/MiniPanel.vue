<template>
  <div class="mini-panel flex">
    <slot name="icon" />
    <div class="v-flex content">
      <span class="title font-sm">{{ title }}</span>
      <span class="body" :class="{ capitalize }">{{ body }}</span>
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
  capitalize?: boolean
}>()
</script>

<style lang="css" scoped>
@import '../assets/common.less';
.mini-panel {
  align-items: center;
  flex: 1 1 60px;
  min-width: 60px;
  max-width: 70px;
  overflow: visible;

  & + .mini-panel {
    margin-left: 3px;
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
    font-weight: 600;
    white-space: nowrap;

    &.capitalize {
      text-transform: capitalize;
    }
  }
}
</style>
