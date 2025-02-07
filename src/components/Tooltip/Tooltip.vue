<template>
  <!-- Tooltip 组件的根容器 -->
  <div
    class="el-tooltip"
    ref="popperContainerNode"
    v-on="outerEvents"
  >


    <!-- 触发 Tooltip 显示的元素 -->
    <div
      class="el-tooltip__trigger"
      ref="triggerNode"
      v-on="events"
    >
      <!-- 插槽内容 -->
      <slot />
    </div>


    <!-- Tooltip 弹出框的过渡效果 -->
    <Transition :name="transition">
      <!-- Tooltip 弹出框 -->
      <!-- v-on="obj"  用于绑定一系列事件名和对应的事件处理函数-->
      <div
        v-if="isOpen"
        class="el-tooltip__popper"
        ref="popperNode"
        v-on="dropdownEvents"
      >
        <!-- 内容插槽 -->
        <slot name="content">
          {{content}}
        </slot>
        <!-- Popper.js 箭头 -->
        <div id="arrow" data-popper-arrow></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onUnmounted, computed } from 'vue'
import { createPopper } from '@popperjs/core'
import type { Instance } from '@popperjs/core'
import { debounce } from 'lodash-es'
import type { TooltipProps, TooltipEmits, TooltipInstance } from './types'
import useClickOutside from '../../hooks/useClickOutside'

// 设置组件的名称为 elTooltip
defineOptions({
  name: 'elTooltip'
})

// 使用 withDefaults 定义 props，默认值为 TooltipProps 的默认值
/*
  props 通过 defineProps 定义，withDefaults 设置了默认值。包括：
  placement：Tooltip 显示的位置，默认为 bottom。
  trigger：触发显示 Tooltip 的方式，默认为 hover。
  transition：Tooltip 的过渡动画，默认为 fade。
  openDelay 和 closeDelay：显示和隐藏的延迟时间。
*/
const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'bottom',
  trigger: 'hover',
  transition: 'fade',
  openDelay: 0,
  closeDelay: 0,
})

// 定义组件的事件触发器 emits
const emits = defineEmits<TooltipEmits>()

// 创建 ref 对象来存储组件的状态和元素引用
// isOpen：表示 Tooltip 是否打开。
// popperNode、triggerNode 和 popperContainerNode 分别引用 Tooltip 弹出框、触发元素和根容器。
const isOpen = ref(false)
const popperNode = ref<HTMLElement>()
const triggerNode = ref<HTMLElement>()
const popperContainerNode = ref<HTMLElement>()

// popperInstance：存储 Popper.js 实例，用于管理 Tooltip 的位置。
// events、outerEvents、dropdownEvents：分别用于绑定触发器、外部事件和 Tooltip 弹出框的事件。
let popperInstance: null | Instance = null
let events: Record<string, any> = reactive({})
let outerEvents: Record<string, any> = reactive({})
let dropdownEvents: Record<string, any> = reactive({})

// 计算关闭的延迟时间
const closeDelay = computed(() => 
  props.trigger === 'hover' && props.closeDelay === 0
  ? 50 : props.closeDelay
)

// 初始化打开和关闭的次数
let openTimes = 0
let closeTimes = 0

// 计算 Popper.js 实例的选项
// popperOptions：计算 Popper.js 的配置
// 主要包括 placement（显示位置）和 offset（位置偏移），以及额外的 popperOptions 配置。
/*
  这段代码是使用 Popper.js 库来创建一个动态配置选项 popperOptions，
  通过 computed 属性来计算并返回一个配置对象。Popper.js 用于处理弹出框的定位，
  像工具提示、下拉菜单等 UI 元素的位置。通过这段代码，
  可以灵活地设置弹出框的显示位置（placement）和偏移量（offset），以及任何额外的自定义选项。
*/
const popperOptions = computed(() => {
  // 每当 props.placement 或 props.popperOptions 发生变化时，popperOptions 会重新计算。
  return {
    
    placement: props.placement,

    /*
      popperOptions：是一个计算属性，返回的是一个对象，包含了 Popper.js 的配置选项。它由三个部分组成：
          placement：这个属性指定了弹出框的位置，比如 top, bottom, left, right 等，决定了弹出框相对于目标元素的位置。这里它的值来自 props.placement，即从父组件传递过来的 placement 参数。
          modifiers：这个属性是一个数组，包含了多个修改器（modifiers）。在 Popper.js 中，修改器用于调整弹出框的行为或样式。这个例子中，我们定义了一个 offset 修改器，它可以用来调整弹出框的偏移位置。这里它的配置是 offset: [0, 9]，意味着弹出框在垂直方向上会有一个 9px 的偏移。这个修改器的定义格式如下：
          name: 'offset'：指定修改器的名字为 offset，用于调整弹出框的位置。
          options: { offset: [0, 9] }：配置了 offset 的值，表示 X 轴方向没有偏移，Y 轴方向偏移 9px。
      ...props.popperOptions：通过扩展运算符 ...，我们把父组件传递过来的 popperOptions 对象合并到返回的配置中。这样，popperOptions 可以接收额外的配置项，允许灵活的自定义。
    */
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 9],
        },
      }
    ],
    ...props.popperOptions
  }
})

// 定义打开和关闭 Tooltip 的函数
// open 和 close：分别打开和关闭 Tooltip，更新 isOpen 状态并触发 visible-change 事件。
const open = () => {
  openTimes++
  isOpen.value = true
  emits('visible-change', true)
}

const close = () => {
  closeTimes++
  isOpen.value = false
  emits('visible-change', false)
}

// 使用 lodash 中的 debounce 函数创建打开和关闭的防抖函数
// openDebounce 和 closeDebounce：对 open 和 close 函数进行防抖处理。
const openDebounce = debounce(open, props.openDelay)
const closeDebounce = debounce(close, closeDelay.value)

// 最终的打开和关闭函数，用于取消之前的防抖操作并调用新的防抖函数
//openFinal 和 closeFinal：确保在防抖时取消之前的操作，并执行新的防抖操作。
// 解释：openFinal 和 closeFinal 这两个函数是确保在执行新的防抖操作时，
// 先取消掉之前的操作，以避免多个防抖事件同时触发。

const openFinal = () => {
  closeDebounce.cancel()
  openDebounce()
}

const closeFinal = () => {
  openDebounce.cancel()
  closeDebounce()
}

// 切换 Tooltip 的显示状态
// togglePopper：切换 Tooltip 显示和隐藏状态。
const togglePopper = () => {
  if (isOpen.value) {
    closeFinal()
  } else {
    openFinal()
  }
}

// 监听点击组件外部的事件，以关闭 Tooltip
// 使用 useClickOutside hook 监听点击外部事件，
// 点击外部时如果 trigger 为 click 且 Tooltip 显示，则关闭 Tooltip，并触发 click-outside 事件。

/*
  这部分代码使用了一个名为 useClickOutside 的 hook（自定义钩子），
  它的作用是监听点击事件，并检查点击是否发生在指定的元素之外。
*/
useClickOutside(popperContainerNode, () => {

  /*
    props.trigger === 'click'：判断 Tooltip 的触发方式是否为 click。trigger 是从父组件传递的一个属性，决定了 Tooltip 的触发方式（比如：点击、悬停等）。
    isOpen.value：这是一个响应式变量，表示 Tooltip 是否当前处于打开状态。如果 isOpen.value 为 true，表示 Tooltip 已经显示。
    !props.manual：这是另一个属性，表示是否是手动控制 Tooltip 的显示。若为 false，则意味着 Tooltip 由外部控制开关，而不是手动操作
  */
  if (props.trigger === 'click' && isOpen.value && !props.manual) {
    closeFinal()
  }
  if (isOpen.value) {
    /*
      如果 Tooltip 当前处于显示状态（isOpen.value 为 true），那么会触发 click-outside 事件，告诉外部 Tooltip 已经被点击关闭。
      emits('click-outside', true) 触发一个名为 click-outside 的自定义事件，并传递参数 true，表示用户点击了外部区域。
    */
    emits('click-outside', true)
  }
})


// 根据触发方式和手动控制属性来绑定事件
// 根据 trigger 属性的值，动态绑定鼠标悬浮或点击事件到相应的元素上。
/* hover 触发方式：绑定鼠标悬浮事件（mouseenter 和 mouseleave）来控制弹出框的显示与关闭。
mouseenter：当鼠标进入元素时，调用 openFinal 来显示 Tooltip 或弹出框。
mouseleave：当鼠标离开元素时，调用 closeFinal 来关闭 Tooltip 或弹出框。
click 触发方式：绑定点击事件（click）来切换弹出框的显示状态，调用 togglePopper 来进行显示或隐藏的切换。*/
const attachEvents = () => {
  if (props.trigger === 'hover') {

    /*
      该条件表示 Tooltip 或弹出框是通过鼠标悬浮触发的。
      当鼠标进入某个元素时，通过 mouseenter 事件调用 openFinal 方法，打开 Tooltip 或弹出框。
      当鼠标离开某个元素时，通过 mouseleave 事件调用 closeFinal 方法，关闭 Tooltip 或弹出框。
      同时，dropdownEvents['mouseenter'] 也会绑定到 openFinal，这通常是用来处理下拉菜单的显示。
    */
    events['mouseenter'] = openFinal
    outerEvents['mouseleave'] = closeFinal
    dropdownEvents['mouseenter'] = openFinal
  } else if (props.trigger === 'click') {
    events['click'] = togglePopper
  }
}

// 如果非手动控制，则绑定事件
// 如果 manual 为 false，则自动绑定事件。
if (!props.manual) {
  attachEvents()
}

// 监听手动控制属性的变化，动态绑定或取消事件
// 监听 manual 属性变化，动态绑定或取消事件。
watch(() => props.manual, (isManual) => {
  if (isManual) {
    events = {}
    outerEvents = {}    
  } else {
    attachEvents()
  }
})

// 监听触发方式属性的变化，重新绑定事件
// 监听 trigger 属性的变化，重新绑定事件。
watch(() => props.trigger, (newTrigger, oldTrigger) => {
  if (newTrigger !== oldTrigger) {
    events = {}
    outerEvents = {}
    attachEvents()
  }
})

// 监听 isOpen 变量的变化，创建或销毁 Popper.js 实例
// 监听 isOpen 状态，打开时创建 Popper.js 实例，关闭时销毁实例。
watch(isOpen, (newValue) => {
  if (newValue) {
    if (triggerNode.value && popperNode.value) {
      popperInstance = createPopper(triggerNode.value, popperNode.value, popperOptions.value)
    } else {
      popperInstance?.destroy()
    }
  }
}, { flush: 'post'})

// 在组件销毁时销毁 Popper.js 实例
// 组件销毁时销毁 Popper.js 实例
onUnmounted(() => {
  popperInstance?.destroy()
})

// 暴露给父组件的方法
defineExpose<TooltipInstance>({
  'show': openFinal,
  'hide': closeFinal
})
</script>
