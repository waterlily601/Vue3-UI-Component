<template lang="">
  <div class="el-rate" :style="{ color: voidColor }">
    <span
      v-for="num in max"
      class="iconfont icon-star"
      :key="num"
      :class="{ active: num <= rateNum, [`el-rate--${size}`]: true}"
      :style="{
        'color': num <= rateNum ? color : voidColor
      }"
      @click=" setRateNum(num)"
    ></span>
  </div>
  <!-- num <= rateNum：如果 num 小于等于当前评分 rateNum，则该星星添加 active 类，表示该星星已被选中（变为高亮）。
      [el-rate--${size}]: true：动态地根据 size 属性，添加对应大小的样式类（例如 el-rate--small 或 el-rate--large）。
      :style="{ 'color': num <= rateNum ? color : voidColor }"：
      根据 num <= rateNum 的条件，设置星星的颜色。如果该星星的序号小于等于当前评分 rateNum，则设置为选中颜色 color，否则设置为未选中颜色 voidColor。 
  -->
</template>

<script setup lang="ts">
import { RateProps, RateEmits } from './types';
import { useRate } from './useRate';
import { computed } from 'vue';
const props = withDefaults(defineProps<RateProps>(), {
  nums: 3,       // 默认星星数量为3
  size: 'default',  // 默认大小为'default'
  max: 5,        // 最大分数为5
});
const emits = defineEmits<RateEmits>();

defineOptions({
  name: 'ElRate',
});

const [rateNum, setRateNum] = useRate(props.nums, () => {
  // 触发改变评分数量事件
  emits('changeRateNums', rateNum.value);
});

</script>
