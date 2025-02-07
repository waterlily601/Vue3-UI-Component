import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'
import ElIcon from '../Icon/Icon.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
describe('Button.vue',() => {
  test('basic button', () => {
    // 挂载 Button 组件，并传入 `type="primary"`，slot 内容为 'button'
    const wrapper = mount(Button, {
      props: {
        type: 'primary'
      },
      slots: {
        default: 'button'
      }
    })
    console.log(wrapper.html())
    // slot get|find
    // 断言按钮的 class 包含 'el-button--primary'，说明 `type` 属性生效
    expect(wrapper.classes()).toContain('el-button--primary')

    // 断言按钮的文本内容为 'button'，确保 slot 传递的文本正确显示
    expect(wrapper.get('button').text()).toBe('button')
     // 触发点击事件
    wrapper.get('button').trigger('click')
    console.log(wrapper.emitted())  // 输出组件的事件记录

    // 断言组件成功触发了 `click` 事件
    expect(wrapper.emitted()).toHaveProperty('click')
  })
  test('disable button', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'disabled'
      }
    })

     // 断言 `disabled` 属性存在
    expect(wrapper.attributes('disabled')).toBeDefined()

    // 断言 `button` 元素的 `disabled` 属性存在，确保按钮被禁用
    expect(wrapper.find('button').element.disabled).toBeDefined()

    // 触发 `click` 事件
    wrapper.get('button').trigger('click')

    // 断言点击事件不会被触发
    expect(wrapper.emitted()).not.toHaveProperty('click')
  })
  test('icon', () => {
    // 挂载 Button 组件，并传入 `icon="arrow-up"`，slot 内容为 'icon'
    const wrapper = mount(Button, {
      props: {
        icon: 'arrow-up'
      },
      slots: {
        default: 'icon'
      },
      global: {
        stubs: ['FontAwesomeIcon'] // 由于使用了 FontAwesomeIcon 作为图标，需要 stub 这个组件
      }
    })
    console.log(wrapper.html()) // 打印组件 HTML 结构

    // 查找 FontAwesomeIcon 组件
    const iconElement = wrapper.findComponent(FontAwesomeIcon)

    // 断言 `FontAwesomeIcon` 组件存在
    expect(iconElement.exists).toBeTruthy()

    // 断言 `FontAwesomeIcon` 组件的 `icon` 属性值是否为 `arrow-up`
    expect(iconElement.attributes('icon')).toBe('arrow-up')
  })
  test('loading', () => {
    // 挂载 Button 组件，并传入 `loading=true`
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: 'loading'
      },
      global: {
        stubs: ['ElIcon']
      }
    })
    console.log(wrapper.html())

    // 查找 ElIcon 组件
    const iconElement = wrapper.findComponent(ElIcon)

    // 断言 `ElIcon` 组件存在
    expect(iconElement.exists()).toBeTruthy()

    // 断言 `ElIcon` 组件的 `icon` 属性值是否为 `spinner`（加载中状态）
    expect(iconElement.attributes('icon')).toBe('spinner')

    // 断言 `button` 组件在 `loading` 状态下被禁用
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})