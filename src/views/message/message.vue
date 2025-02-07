<template>
  <div>
    <el-button @click="open('success')" type="success"> Success </el-button>
  <el-button @click="open('info')" type="info"> Info </el-button>
  <el-button @click="open('warning')" type="warning"> warning </el-button>
  <el-button @click="open('error')" type="danger"> Danger </el-button>
    <!-- <el-button type="info" @click="ElMessage({
      type: 'info',
      message: 'this is a message text'
    })">message</el-button>
    <el-button type="danger" @click="ElMessage({
      type: 'error',
      message: 'this is a error text'
    })">error</el-button> -->
  </div>
</template>
<script setup lang="ts">
import ElButton from '../../components/Button/Button.vue'
import ElMessage from '@/components/Message/index'


import { createMessage } from '@/components/Message/method'
defineOptions({
  name: 'MessageView'
})

const open = (type:any) => {
  createMessage({ message: 'message消息提示', type })
}
</script>
<style lang="">
  
</style>