<template>
  <div class="card" :class="color">
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
  content?: string | number
}>()
</script>

<style lang="less" scoped>
@import '../assets/common.less';

.card {
  .card-base;

  &:hover {
    &.blue {
      border-color: var(--color-blue);
    }

    &.green {
      border-color: var(--color-green);
    }

    &.red {
      border-color: var(--color-red);
    }

    &.yellow {
      border-color: var(--color-yellow);
    }

    &.purple {
      border-color: var(--color-purple);
    }
  }

  .card-header {
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    cursor: default;
  }

  .card-body {
    padding-top: 7px;
    cursor: default;
    font-size: 18px;
    font-weight: 800;
    vertical-align: middle;
  }
}
</style>
