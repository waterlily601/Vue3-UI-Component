<template>
  <!-- 这会将父组件传递给 Icon 组件的所有属性（除 props 外的其他属性）传递给根元素 <i>。 -->
  <i class="el-icon" :style="iconStyle" v-bind="$attrs">
    <!-- 将父组件传递给 Icon 组件的所有 props 动态地传递给内部的 font-awesome-icon 组件 -->
    <font-awesome-icon v-bind="iconProps" />
  </i>
</template>
<script setup lang="ts">
// 引入FontAwesomeIcon 组件
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 引入FontAwesomeIcon 组件接收的props
import type { IconProps } from './types'
// omit函数用于排除对象的属性，传递处理的对象和排除的属性名称数组
import { omit } from 'lodash-es'
import { computed } from 'vue'
defineOptions({
  name: 'ElIcon',
  // inheritAttrs: false：禁用了 Vue 的默认行为，即默认将 attrs（非 props 的属性）传递到根元素。
  // 我们通过 v-bind="$attrs" 来手动控制将 attrs 传递给 <i> 元素。
  inheritAttrs: false
})
const props = defineProps<IconProps>()
// 过滤掉props中传递的color属性
const iconProps = computed(() => {
  return omit(props, ['color'])
})
// 根据是否传递color属性来决定 icon的颜色
const iconStyle = computed(() => {
  const { color } = props
  if(!color) return {}
  return {
    '--color': color
  }
})
</script>