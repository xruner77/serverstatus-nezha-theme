<template>
  <div class="radio-group">
    <div class="scroller" ref="groupRef">
      <div class="selector" :style="selectorStyle"></div>
      <div
        class="radio-button"
        v-for="item in options"
        :key="item"
        :class="{ active: modelValue === item }"
        @click="() => handleSelect(item)"
      >
        <span>{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps<{ modelValue: string; options: string[] }>()
const groupRef = ref<HTMLElement | null>(null)

function handleSelect(item: string) {
  if (item !== props.modelValue) {
    emit('update:modelValue', item)
  }
}

const selectorStyle = ref<Record<string, string>>({})
watch(
  () => [props.modelValue, groupRef.value],
  ([value]) => {
    const idx = props.options.indexOf(value as string)
    if (idx >= 0 && groupRef.value) {
      const el = groupRef.value.children[idx + 1]
      if (el) {
        const parentRect = groupRef.value.getBoundingClientRect()
        const rect = el.getBoundingClientRect()
        selectorStyle.value = {
          width: `${rect.width}px`,
          left: `${rect.left - parentRect.left}px`,
        }
        nextTick(() => {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
        })
      }
    }
  },
  { immediate: true },
)
</script>

<style lang="less" scoped>
.selector {
  position: absolute;
  height: 28px;
  top: 4px;
  background-color: var(--color-highlight);
  border-radius: 30px;
  transition: all 0.2s;
  box-shadow: var(--color-shadow);
}

.radio-group {
  overflow: auto;
  border-radius: 30px;
  background-color: var(--color-gray);

  .scroller {
    position: relative;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    display: inline-block;
    padding: 4px;

    .radio-button {
      display: inline-block;
      padding: 0 12px;
      line-height: 28px;
      cursor: pointer;
      color: #aaa49f;
      position: relative;
      transition: all 0.2s;

      &:hover {
        color: rgb(90, 90, 90);
      }

      &.active {
        color: var(--color-text);
      }
    }
  }
}
</style>
