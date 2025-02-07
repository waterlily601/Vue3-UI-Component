<template lang="">
  <section
    :class="containerClass"
  >
  <!-- 动态绑定 containerClass，用于控制容器的布局方向（水平或垂直）。 -->
    <slot></slot>
    <!-- <slot></slot>：插槽机制，允许 Container 组件内部嵌套其他子组件，如 ElHeader、ElFooter、ElMain、ElAside。 -->
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots} from 'vue'
import type { Component, VNode } from 'vue'
defineOptions({
  name: 'ElContainer'
})
interface ContainerProps {
  direction: 'horizontal' | 'vertical'
}

// 用于获取组件的 slot 插槽内容，它可以用来判断 Container 组件的子组件是什么。
const slots = useSlots()

// 判断布局方向是否是Vertical
const isVertical = computed(() => {

  // 如果 props.direction 明确指定为 'vertical'，返回 true（垂直布局）。
  // 如果 props.direction 明确指定为 'horizontal'，返回 false（水平布局）。
  // 如果 props.direction 未指定，则通过 slots.default() 获取插槽中的所有子组件。
  // 检查子组件是否包含 ElHeader 或 ElFooter，如果包含，则自动设为垂直布局（vertical）。
  // 如果没有 ElHeader 或 ElFooter，默认设为水平布局（horizontal）。

  // 如果props.direction等于'vertical'，返回true
  if (props.direction === 'vertical') {
    return true
  } else if(props.direction === 'horizontal') {
    // 如果props.direction等于'horizontal'，返回false
    return false
  }
  // 如果插槽存在且有默认插槽内容
  if(slots && slots.default) {
    // 使用slots.default获取默认插槽中的所有vNode节点
    const vNodes: VNode[] = slots.default()
    // 遍历 vNode节点数组，如果存在el-header/el-footer
    return vNodes.some(vNode => {
      // 将 vNode.type 断言为 Component 类型，然后获取组件类型属性 name
      const tag = (vNode.type as Component).name
      return tag === 'ElHeader' || tag === 'ElFooter'
    })
  } else {
    // 插槽不存在或者没有默认插槽内容，返回false
    return false
  }
})


/* 
'horizontal' | 'vertical'
子元素中有 el-header 或 el-footer 时为 vertical，否则为 horizontal
根据是否包含 el-header 或 el-footer 子组件设置容器的方向
*/
const props = defineProps<ContainerProps>()
const containerClass = computed(() => {
  return {
    'el-container': true,
    'el-container-horizontal': !isVertical.value,
    'el-container-vertical': isVertical.value
  }
})
// 如果 isVertical 为 true，添加 .el-container-vertical 样式。
// 如果 isVertical 为 false，添加 .el-container-horizontal 样式。
// 无论如何，都会添加 .el-container 作为基础样式。
</script>
<style>
</style>