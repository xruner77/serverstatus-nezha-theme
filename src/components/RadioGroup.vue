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
import { ref, watch, nextTick, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue'])
const props = defineProps<{ modelValue: string; options: string[] }>()
const groupRef = ref<HTMLElement | null>(null)

function isElementVerticallyInView(element: Element) {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight

  // Check if the element's top or bottom is within the viewport's vertical bounds.
  return rect.top <= windowHeight && rect.bottom >= 0
}

function handleSelect(item: string) {
  if (item !== props.modelValue) {
    emit('update:modelValue', item)
  }
}

function updateSelector(value: string) {
  if (!groupRef.value) return

  // check if css is loaded
  const style = window.getComputedStyle(groupRef.value)
  if (style.getPropertyValue('display') === 'block') {
    setTimeout(() => updateSelector(value), 100)
    return
  }

  const idx = props.options.indexOf(value)
  if (idx >= 0) {
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
          // only scroll when it is vertically in view
          if (isElementVerticallyInView(el)) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
          }
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
  () => [props.modelValue, props.options, groupRef.value],
  ([value]) => {
    nextTick(() => updateSelector(value as string))
  },
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
