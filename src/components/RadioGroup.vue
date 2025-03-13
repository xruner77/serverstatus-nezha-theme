<template>
  <span class="radio-group">
    <span class="scroller" ref="groupRef">
      <span class="selector" :style="selectorStyle"></span>
      <span
        class="radio-button"
        v-for="item in options"
        :key="item"
        :class="{ active: modelValue === item }"
        @click="() => handleSelect(item)"
      >
        <span>{{ item }}</span>
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps<{ modelValue: string; options: string[] }>()
const groupRef = ref<HTMLElement | null>(null)

function handleSelect(item: string) {
  if (item !== props.modelValue) {
    emit('update:modelValue', item)
  }
}

function updateSelector(value: string) {
  const idx = props.options.indexOf(value)
  if (idx >= 0 && groupRef.value) {
    const children = groupRef.value.getElementsByClassName('radio-button')
    const el = children[idx]
    if (el) {
      const parentRect = groupRef.value.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      const newStyle = {
        width: `${rect.width}px`,
        left: `${rect.left - parentRect.left}px`,
      }
      if (
        newStyle.width !== selectorStyle.value.width ||
        newStyle.left !== selectorStyle.value.left
      ) {
        selectorStyle.value = newStyle
        nextTick(() => {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
        })
      }
    } else {
      selectorStyle.value = {
        visibility: 'hidden',
      }
    }
  }
}

const selectorStyle = ref<Record<string, string>>({})
watch(
  () => [props.modelValue, props.options],
  ([value]) => updateSelector(value as string),
)
onMounted(() => updateSelector(props.modelValue))
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
