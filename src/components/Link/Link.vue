<template>
  <!-- 如果是禁用状态，则href和target失效，否则传递正确的href和target -->
  <a
    class="el-link"
    :class="linkClass"
    :href="disabled || !href ? '' : href"
    :target="disabled || !href ? undefined : target"
    @click="handleClick"
  >
    <el-icon v-if="icon" :icon="icon"></el-icon>
    <span class="el-link__inner">
      <slot>Link</slot>
    </span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LinkProps, linkEmits } from './types'
import ElIcon from '../Icon/Icon.vue'

// 设置组件选项
defineOptions({
  name: 'ElLink'
})

// 提供属性的默认值
const props = withDefaults(defineProps<LinkProps>(), {
  type: 'primary',
  underline: false,
  disabled: false,
  target: '_self'
})

// 声明组件发射的事件
// defineEmits(linkEmits)：使用 defineEmits 声明组件可能会触发的事件，
// linkEmits 是事件的类型定义，通常包含如 click 之类的事件。
// 这个组件通过 handleClick 方法触发 click 事件。
const emits = defineEmits(linkEmits)

// 计算Link的类名 linkClass 计算属性
// 计算 linkClass，它是一个包含多个类名的数组，最终会被动态绑定到 <a> 标签的 class 属性：
// el-link--${type}：根据 type 选择链接的类型（如 primary）。
// is-underline：如果 underline 为 true，则给链接添加 is-underline 类，表示链接有下划线。
// is-disabled：如果 disabled 为 true，则给链接添加 is-disabled 类，表示链接处于禁用状态。
const linkClass = computed(() => {
  const { type, underline, disabled } = props
  return [
    `el-link--${type}`,
    {
      'is-underline': underline,
      'is-disabled': disabled
    }
  ]
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emits('click', event)
  }
}
</script>