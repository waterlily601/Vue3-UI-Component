<template>
  <!-- 表单组件模板 -->
  <form class="el-form">
    <!-- 插槽用于表单内容 -->
    <!-- 
      定义了一个 <form> 标签，表单的内容由插槽（<slot />）动态传入。
      插槽允许子组件（如 ElFormItem）将内容插入父组件的 form 中。 
    -->
    <slot/>
  </form>
</template>

<script setup lang="ts">
// 导入必要的模块
import { provide } from 'vue'
import type { ValidateFieldsError } from 'async-validator'
import { formProps, formContextKey } from './types'
import type { FormItemContext, FormContext, FormValidateFailure } from './types'

// 根据 formProps 定义属性
const props = defineProps(formProps)

// 设置组件选项
defineOptions({
  name: 'ElForm'
})

// 用于存储表单字段的数组
// fields 数组用于存储表单项（ElFormItem）的上下文，它的类型是 FormItemContext[]
const fields: FormItemContext[] = []

// 添加字段到表单的函数
// addField 是一个函数，向表单中添加表单项。FormContext 接口定义了添加表单项的方法
const addField: FormContext['addField'] = (field) => {
  fields.push(field)
}

// 从表单中移除字段的函数
// removeField 用于从表单中移除表单项
const removeField: FormContext['removeField'] = (field) => {
  if (field.prop) {
    fields.splice(fields.indexOf(field), 1)
  }
}

// 重置表单中的字段的函数
// 如果传入了字段名（keys），则只重置这些字段，否则重置所有字段。
const resetFields: FormContext['resetFields'] = (keys = []) => {
  // 如果传入了 keys，使用 filter 方法从 fields 数组中过滤出 prop 属性（字段名）在 keys 数组中的表单项。
  // 如果没有传入 keys，则直接使用 fields 数组，即重置所有的字段。  
  const filterArr = keys.length > 0 ? fields.filter(field => keys.includes(field.prop)) : fields
  filterArr.forEach(field => field.resetField())
}

// 清除表单中字段的验证状态的函数
// clearValidate 用于清除字段的验证状态
const clearValidate: FormContext['clearValidate'] = (keys = []) => {
  const filterArr = keys.length > 0 ? fields.filter(field => keys.includes(field.prop)) : fields
  filterArr.forEach(field => field.clearValidate())
}

// 验证所有表单字段的函数
// validate 方法遍历所有表单项并进行验证。
// 如果验证失败，捕获错误并合并到 validationErrors 中，最终返回所有验证结果。
// 如果没有错误，则返回 true。
const validate: FormContext['validate'] = async () => {
  let validationErrors: ValidateFieldsError = {}
  for (const field of fields) {
    try {
      // await field.validate('')：调用每个字段的 validate 方法进行验证。这里传入的是空字符串 ''，通常表示不传递触发验证的事件类型，可能是通用的验证方法，或者某些字段的默认触发方式。
      // 如果验证通过，则继续执行下一个字段验证。
      // 如果验证失败，catch 语句块会捕获到异常。
      await field.validate('')
    } catch(e) {
      
      // const error = e as FormValidateFailure：将捕获的错误 e 强制转换为 FormValidateFailure 类型。FormValidateFailure 类型包含了 fields 属性，它是一个对象，记录了验证失败的字段和错误信息。
      // validationErrors = { ...validationErrors, ...error.fields }：
      // 将当前 error.fields（当前字段的错误信息）合并到 validationErrors 中，使用 ... 展开运算符将其内容逐个合并。如果字段重复，后面的字段错误会覆盖前面的错误。
      const error = e as FormValidateFailure
      validationErrors = {
        ...validationErrors,
        ...error.fields
      }
    }
  }
  /*
    Object.keys(validationErrors).length === 0：检查 validationErrors 是否为空对象。如果 validationErrors 中没有任何错误（即表单所有字段都验证通过），返回 true。
      如果没有错误，表示所有字段验证通过，函数返回 true，表示验证成功。
    return Promise.reject(validationErrors)：如果 validationErrors 不为空，说明有字段验证失败，那么返回一个被拒绝的 Promise，并把 validationErrors 作为拒绝的原因。
    这允许调用者通过 catch 捕获到这些验证错误，并根据需要进行处理。
  */
  if (Object.keys(validationErrors).length === 0) return true 
  return Promise.reject(validationErrors)
}

// 暴露供外部使用的函数
defineExpose({
  /** @description 验证表单 */
  validate,
  /** @description 重置字段 */
  resetFields,
  /** @description 清除验证状态 */
  clearValidate,
})

// 向子组件提供表单上下文
// 使用 provide 向子组件提供表单上下文，
// 包含了表单的 model、rules 和操作表单的方法（如 addField、validate 等）
provide(
  formContextKey,
  {
    ...props,
    addField,
    removeField,
    resetFields,
    clearValidate,
    validate
  }
)
</script>
