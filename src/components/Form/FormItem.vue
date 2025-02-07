<template>
  <!-- 表单项组件模板 -->
  <div 
    class="el-form-item" 
    ref="formItemRef"
    :class="{
      'is-error': validateStatus.state === 'error',
      'is-success': validateStatus.state === 'success',
      'is-loading': validateStatus.loading,
      'is-required': isRequired
    }"
  >
    <div class="el-form-item__label">
      <slot name="label" :label="label">
        {{label}}
      </slot>
    </div>
    <div class="el-form-item__content">
      <slot :validate="validate"/>
      <div class="el-form-item__error-msg" v-if="validateStatus.state === 'error' && props.showMessage">
        {{ validateStatus.errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入需要的模块
import { inject, reactive, ref, computed, onMounted, onUnmounted, provide } from 'vue'
// 引入了 AsyncValidator 用于进行表单项验证，isNil 用于检查是否为 null 或 undefined。
import  AsyncValidator from 'async-validator'
import type { RuleItem } from 'async-validator'
import { isNil } from 'lodash-es'
import { formItemProps, formContextKey, formItemContextKey } from './types'
import  type {  FormItemContext, FormValidateFailure } from './types'

// 定义 props
const props = defineProps(formItemProps)

// 设置组件选项
defineOptions({
  name: 'ElFormItem'
})

// 获取表单上下文
// 通过 inject 获取父组件（ElForm）提供的表单上下文（即 formContext）
const formContext = inject(formContextKey)

// 定义验证状态
// validateStatus 用于存储验证状态（init、success、error、loading），包括错误信息和加载状态。
const validateStatus = reactive({
  state: 'init',
  errorMsg: '',
  loading: false
})

// 表单项的引用
const formItemRef = ref<HTMLDivElement>()

// 计算属性，获取内部值
// innerValue 是一个计算属性，用于获取表单项的值，值来自父组件的 model（即表单的数据）
/*
  if (model && props.prop && !isNil(model[props.prop]))：这里首先检查：
    model 是否存在，即表单的数据对象是否有效。
    props.prop 是否存在，这个属性是当前表单项的标识符（通常是字段的名称）。
    !isNil(model[props.prop])：使用 isNil 函数来检查 model 中的该字段是否为 null 或 undefined。
    isNil 是 lodash 中的一个方法，用来判断值是否为 null 或 undefined。
  如果这三个条件都满足，说明 model 中的字段值有效，可以返回该字段的值：model[props.prop]。
  else { return null }：如果上面的条件不成立（即 model 中没有该字段或字段值无效），则返回 null，表示该表单项没有值。
 */

const innerValue = computed(() => {
  const model = formContext?.model
  if (model && props.prop && !isNil(model[props.prop])) {
    return model[props.prop]
  } else {
    return null
  }
})

// 初始值
// initialValue 用于存储表单项的初始值
let initialValue: any = undefined

// 获取表单项规则的计算属性
// getItemRules 是一个计算属性，用于获取表单项的验证规则（从父组件的 rules 中获取）
/*
  getItemRules 是前面定义的计算属性，用于获取当前表单项的验证规则。
  它的值是一个规则数组 rules，每个规则是一个对象，包含字段的验证信息。
  getItemRules.value 获取了该规则数组。

  .some(rule => rule.required)：
      .some() 是数组的一个方法，用来检查数组中是否有至少一个元素满足条件。
    它会遍历规则数组 rules，并对每个规则元素执行回调函数 rule => rule.required。
      rule.required：这里检查每个规则对象是否有 required 属性。
    如果该属性存在且为 true，表示该表单项是必填项。
*/
const getItemRules = computed(() => {
  /*
    if (rules && props.prop && rules[props.prop])：
      rules：首先检查 rules 是否存在（即表单是否有定义验证规则）。
      props.prop：确保当前表单项有指定的字段名（prop），即验证规则是针对某个特定字段的。
      rules[props.prop]：检查 rules 中是否有当前字段名（prop）对应的规则，如果存在就说明该字段有验证规则。
    如果上述条件都成立，表示该表单项有对应的规则，因此返回该字段的规则 rules[props.prop]。
    else { return [] }：如果条件不成立，说明没有找到该字段的验证规则，那么就返回一个空数组 []，表示没有任何验证规则。
  */
  const rules = formContext?.rules
  if (rules && props.prop && rules[props.prop]) {
    return rules[props.prop]
  } else {
    return []
  }
})

// 是否为必填项的计算属性
// isRequired 是一个计算属性，用于判断表单项是否为必填项
const isRequired = computed(() => {
  return getItemRules.value?.some(rule => rule.required)
})

// 根据触发时机获取规则
// getTriggeredRules 是一个函数，接收一个可选参数 trigger，它表示触发验证的时机。trigger 参数用于控制获取哪些触发时机相关的验证规则。
/*
  getTriggeredRules 函数用于根据触发时机（trigger）获取表单项的验证规则，主要的逻辑如下：
      首先从 getItemRules 获取当前表单项的所有规则。
      然后根据传入的 trigger 参数过滤出符合触发时机的规则。
          如果规则定义了 trigger，则需要与传入的 trigger 参数匹配。
          如果没有定义 trigger 或传入的 trigger 为空，则返回所有规则。
      最后，返回符合条件的规则数组，去掉 trigger 属性。
*/
const getTriggeredRules = (trigger?: string) => {
  // getItemRules 是之前定义的计算属性，它返回当前表单项的所有验证规则（规则数组）。
  // itemRules 就是从 getItemRules.value 获取到的规则数组
  const itemRules = getItemRules.value
  // 这里检查 itemRules 是否存在。如果存在，说明表单项有验证规则；如果没有，则返回空数组。
  if (itemRules) {
    
    /*
      .filter() 是数组的过滤方法，用于筛选出满足特定条件的规则。
      过滤的条件是根据 trigger 参数来选择规则。rule.trigger 是规则中定义的触发时机，通常是 "blur"（失去焦点）、"change"（值改变）等。
        if (!rule.trigger || !trigger) return true：如果规则没有定义 trigger 属性，或者传入的 trigger 为空，则返回 true，表示该规则不受触发时机的影响。
        return rule.trigger && rule.trigger === trigger：如果规则定义了 trigger 且 trigger 参数不为空，则比较规则的触发时机（rule.trigger）是否和传入的 trigger 匹配。如果匹配，表示该规则应当生效，返回 true。
      通过这个过滤条件，filter() 返回一个新数组，包含所有符合当前触发时机的规则。
    */
    return itemRules.filter(rule => {
      if (!rule.trigger || !trigger) return true
      return rule.trigger && rule.trigger === trigger
    }).map(({ trigger, ...rule }): RuleItem => rule)
    /*
      .map() 是数组的映射方法，它将规则数组转换成新的数组。每个元素经过函数处理后返回一个新的元素。
      ({ trigger, ...rule })：这里使用了解构赋值，去掉了每个规则中的 trigger 属性（因为我们已经用它来过滤了），并返回剩余的规则部分。
          rule 就是规则对象中的其他属性（如 required、type 等），这些属性需要保留下来。
          返回值是 rule（去除 trigger 属性后的规则）。
      这一步的目的是返回不包含 trigger 属性的规则对象。这样可以避免将 trigger 属性暴露给外部，确保返回的规则只包含需要的验证内容。
    */
  } else {
    return []
  }
}

// 验证字段的函数
// validate 函数用于执行字段验证，触发时会检查是否符合规则。
// 如果验证成功，则将 validateStatus.state 设置为 success，如果验证失败，则显示错误信息。
const validate = async (trigger?: string) => {
  // modelName 保存了当前表单项的字段名，props.prop 是从父组件传递下来的属性，标识了表单项对应的数据字段。
  const modelName = props.prop
  // getTriggeredRules(trigger) 是一个计算属性/函数，用于根据 trigger 参数（触发事件的类型）返回符合条件的验证规则。
  // trigger 可以是诸如 'blur'（失去焦点）或 'change'（内容变化）等，用于确定验证规则的触发时机。
  const triggeredRules = getTriggeredRules(trigger)
  
  // 如果 triggeredRules 数组为空，意味着没有与当前触发时机匹配的验证规则。此时，直接返回 true，表示验证通过，不需要进一步操作。
  if (triggeredRules.length === 0) {
    return true
  }
  
  /*
    如果存在 modelName（即表单项的字段名），就创建一个 AsyncValidator 实例。
    AsyncValidator 是一个用于异步验证的工具库，这里通过 modelName 作为对象的键名，将 triggeredRules 作为验证规则传入 AsyncValidator 实例。
    这个验证器会基于规则进行验证，验证字段对应的数据。
  */
  if (modelName) {
    const validator = new AsyncValidator({
      [modelName]: triggeredRules,
    })

    validateStatus.loading = true
    
    /*
      调用 validator.validate() 方法来执行验证，传入一个对象，其中字段名是 modelName，字段值是 innerValue.value。
          innerValue.value 是当前表单项的值，它是从表单模型（父组件）中获取的。
          这里的 validate 方法会返回一个 Promise，用于处理异步验证结果。
    */
    return validator.validate({ [modelName]: innerValue.value })
      .then(() => {
        validateStatus.state = 'success'
      })
      .catch((e: FormValidateFailure) => {
        /*
          e 是捕获的错误对象，类型为 FormValidateFailure，它包含了验证错误的详细信息。
          从 e 中解构出 errors，这是一个包含错误信息的数组。
          设置 validateStatus.state 为 'error'，表示验证失败。
          将第一个错误的 message 设置为 validateStatus.errorMsg，用于显示错误信息。
          使用 Promise.reject(e) 将错误返回，表示验证失败。
        */
        const { errors } = e
        validateStatus.state = 'error'
        validateStatus.errorMsg = (errors && errors.length > 0) ? errors[0].message || '' : ''
        return Promise.reject(e)
      })
      .finally(() => {
        validateStatus.loading = false
      })
  }
}

// 清除验证状态的函数
const clearValidate = () => {
  validateStatus.state = 'init'
  validateStatus.errorMsg = ''
  validateStatus.loading = false
}

// 重置字段的函数
// resetField 用于重置字段值和清除验证状态。
const resetField = () => {
  const model = formContext?.model
  clearValidate()
  if (model && props.prop && model[props.prop]) { 
    model[props.prop] = initialValue
  }
}

// 表单项上下文
// 用于存储当前表单项的相关信息
const context: FormItemContext = reactive({
  /*
    $el: formItemRef：$el 用来引用当前表单项的 DOM 元素，通过 formItemRef 这个 ref 来绑定。
    resetField：用于重置表单项的函数，它会在后续调用时执行对当前表单项的重置操作。
    clearValidate：用于清除表单项验证状态的函数，调用它可以清除字段的验证错误信息。
    prop: props.prop || ''：prop 用来标识表单项的字段名，如果 props.prop 存在就使用它，否则设置为默认值 ''。
    validate：用于验证表单项的函数，它会触发验证逻辑并返回验证结果。
  */
  $el: formItemRef,
  resetField,
  clearValidate,
  prop: props.prop || '',
  validate
})

// 提供表单项上下文
provide(formItemContextKey, context)

// 组件挂载时执行的钩子函数
// 在组件挂载时，若表单项有 prop，则将其添加到父组件的表单中，并保存初始值
/*
    在这个钩子函数中，执行了以下操作：
    if (props.prop)：检查表单项是否有 prop 属性。如果有 prop，意味着这是一个需要注册到表单中的字段。
    formContext?.addField(context)：调用父组件的 formContext.addField 方法，将当前表单项的上下文 context 注册到父组件的表单中。这相当于告诉父组件这个表单项需要参与验证和管理。
    initialValue = innerValue.value：保存当前表单项的初始值。innerValue 是一个计算属性，它获取了表单项的值，innerValue.value 保存了当前值作为初始值，供后续重置或比较使用。
*/

onMounted(() => {
  if (props.prop) {
    formContext?.addField(context)
    initialValue = innerValue.value
  }
})

// 组件卸载时执行的钩子函数
onUnmounted(() => {
  formContext?.removeField(context)
})

// 暴露供外部使用的函数和状态
defineExpose({
  /** @description 验证状态 */
  validateStatus,
  /** @description 验证表单项 */
  validate,
  /** @description 清除验证状态 */
  clearValidate,
  /** @description 重置字段值 */
  resetField,
})
</script>
