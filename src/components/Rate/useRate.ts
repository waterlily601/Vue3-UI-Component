import { ref, Ref } from 'vue';

// 自定义hook用于管理评分组件的状态

/* 
  这个 Hook 接受一个初始的评分数量和一个回调函数作为参数，返回一个包含当前评分数量和设置评分数量的方法。
  当用户点击星星图标时，调用 setRateNum 方法来更新评分数量，并执行传入的回调函数处理评分变化的逻辑。 
*/
export function useRate(initialNum: number, callback: () => void): [Ref<number>, (num: number) => void] {
  // 创建响应式变量rateNum，用于存储评分数量
  const rateNum: Ref<number> = ref(initialNum);

  // 设置评分数量的函数，接受一个新的评分数量作为参数
  const setRateNum = (num: number): void => {
    // 将rateNum的值更新为新的评分数量
    rateNum.value = num;
    // 执行回调函数，用于处理评分数量变化后的逻辑
    callback();
  };

  // 返回rateNum和setRateNum两个函数
  return [rateNum, setRateNum];
}