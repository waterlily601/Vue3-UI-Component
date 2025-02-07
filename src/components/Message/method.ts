import { render, h, shallowReactive } from 'vue'
import type { CreateMessageProps, MessageContext } from './types'

// 导入消息组件
import MessageConstructor from './Message.vue'
import useZIndex from '../../hooks/useZIndex'


// render：Vue 的渲染函数，用来将虚拟 DOM 渲染到真实 DOM 中。
// h：Vue 的 createVNode 函数，用来创建虚拟节点（vNode）。
// shallowReactive：Vue 3 的响应式 API，用于创建一个响应式对象（这里用于存储消息实例）。
// CreateMessageProps 和 MessageContext：从 ./types 导入的类型定义，用于类型约束。
// MessageConstructor：导入的消息组件，后续通过 h 函数动态渲染。
// useZIndex：自定义的钩子，用于获取下一个可用的 z-index。


// 计数器，用于生成唯一的消息 id，避免消息组件 ID 冲突。
let seed = 1

// 存储消息实例的数组，使用 shallowReactive 创建响应式数组，这样可以响应数组的变化。
const instances: MessageContext[] = shallowReactive([])

// 创建消息函数
export const createMessage = (props: CreateMessageProps) => {
  // 获取下一个可用的 z-index
  // 调用自定义钩子 useZIndex 获取下一个可用的 z-index，以确保消息层级正确。
  const { nextZIndex } = useZIndex()

  // 生成消息 id
  const id = `message_${seed++}`

  // 创建消息容器
  const container = document.createElement('div')

  // 销毁消息函数


  // destory：销毁消息实例的函数。
  // 通过 id 查找消息实例在 instances 数组中的索引。
  // 如果找到了该实例，使用 splice 删除它。
  // 使用 render(null, container) 清空 container 中的内容，删除消息的 DOM 元素。
  const destory = () => {
    // 从实例数组中找到并删除当前消息实例
    const idx = instances.findIndex(instance => instance.id === id)
    if (idx === -1) return
    instances.splice(idx, 1)
    // 渲染 null 来清空消息容器
    render(null, container)
  }

  // 手动销毁消息函数
  // 查找指定 id 的消息实例。
  // 如果找到了该实例，修改其 Vue 实例（vm）的 visible 值为 false，即隐藏该消息。
  const manualDestroy = () => {
    const instance = instances.find(instance => instance.id === id)
    if (instance) {
      instance.vm.exposed!.visible.value = false
    }
  }

  // 合并新的 props
  const newProps = {
    ...props,
    id,
    zIndex: nextZIndex(), // 设置 z-index
    onDestory: destory // 设置销毁函数
  }

  // vnode：使用 h 函数创建消息组件的虚拟节点，并传递合并后的 newProps。
  // render(vnode, container)：将虚拟节点渲染到 container 中，即将消息组件挂载到 container。

  // 通过 h 函数 创建消息vNode
  const vnode = h(MessageConstructor, newProps)
  
  // 渲染消息 vnode 到容器中
  render(vnode, container)

  // 将容器中的第一个元素添加到 body 中
  document.body.appendChild(container.firstElementChild!)

  // 获取组件实例
  const vm = vnode.component!

  // 创建消息实例对象
  const instance = {
    id,
    vnode,
    vm,
    props: newProps,
    destory: manualDestroy // 手动销毁函数
  }

  // 将消息实例对象添加到实例数组中
  instances.push(instance)

  return instance
}

// 获取最后一个消息实例
export const getLastInstance = () => {
  return instances.at(-1)
}

// 获取上一个实例的底部偏移量:
// getLastBottomOffset：获取指定 id 的消息组件的上一个实例的底部偏移量。
// 查找消息实例所在的位置，如果是第一个实例，返回 0。
// 否则，返回前一个消息实例的底部偏移量，供下一个消息组件使用。
export const getLastBottomOffset = (id: string) => {
  const idx = instances.findIndex(instance => instance.id === id)
  if (idx <= 0) {
    return 0
  } else {
    const prev = instances[idx - 1]
    return prev.vm.exposed!.bottomOffset.value
  }
}

// 关闭所有消息
export const closeAll = () => {
  instances.forEach(instance => {
    instance.destory()
  })
}