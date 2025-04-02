<template>
  <div class="card" :class="{ [color]: true, selected }">
    <div class="card-header">
      {{ title }}
    </div>
    <div class="card-body">
      <div v-if="content !== undefined" class="content">
        <Dot :color="color" :glow="glow" /> {{ content }}
      </div>
      <slot v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import Dot from './Dot.vue'

defineProps<{
  title: string
  color: string
  glow?: boolean
  selected?: boolean
  content?: string | number
}>()
</script>

<style lang="less" scoped>
@import '../assets/common.less';

.card {
  .card-base;
  cursor: pointer;

  &.blue {
    --border-color: var(--color-blue-500);
  }

  &.green {
    --border-color: var(--color-green-500);
  }

  &.red {
    --border-color: var(--color-red-500);
  }

  &.yellow {
    --border-color: var(--color-orange-500);
  }

  &.purple {
    --border-color: var(--color-purple-500);
  }

  &:hover,
  &.selected {
    border-color: var(--border-color);
  }

  &.selected {
    box-shadow: 0 0 0 2px var(--border-color);
  }

  .card-header {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  .card-body {
    padding-top: 7px;
    font-size: 18px;
    font-weight: 600;
    vertical-align: middle;
  }
}
</style>
