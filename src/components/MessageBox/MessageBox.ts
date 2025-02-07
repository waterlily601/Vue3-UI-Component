import MessageBoxComponent from "./MessageBox.vue";
import { createApp, watch } from "vue";
import { MessageBoxOptions } from "./types";

/**
 * MessageBox - 创建MessageBox
 * @param {MessageBoxOptions} options - 弹窗的配置选项
 * @returns {Promise<void>} - 返回一个 Promise 对象，表示弹窗的结果
 */
const MessageBox = (options: MessageBoxOptions): Promise<void> => {
  // 创建一个 Vue 应用实例，将弹窗组件和配置选项传入

  // function createApp(rootComponent: Component, rootProps?: object): App
  // 第一个参数是根组件。第二个参数可选，它是要传递给根组件的 props。

  const messageBoxApp = createApp(MessageBoxComponent, options);
  // 返回一个 Promise，用于异步处理弹窗结果
  return new Promise((resolve, reject) => {
    // 显示弹窗
    showMessageBox(messageBoxApp, { resolve, reject });
  });
};

/**
 * MessageBox 的 confirm 静态方法 - 创建带有确认按钮的弹窗
 * @param {MessageBoxOptions} options - 弹窗的配置选项
 * @returns {Promise<void>} - 返回一个 Promise 对象，表示弹窗的结果
 */
MessageBox["confirm"] = (options: MessageBoxOptions): Promise<void> => {
  // 设置额外字段，标识弹窗类型为确认对话框
  options.field = "confirm";
  // 调用 MessageBox 函数创建并返回 Promise
  return MessageBox(options);
};

/**
 * MessageBox 的 alert 静态方法 - 创建带有警告按钮的弹窗
 * @param {MessageBoxOptions} options - 弹窗的配置选项
 * @returns {Promise<void>} - 返回一个 Promise 对象，表示弹窗的结果
 */
MessageBox["alert"] = (options: MessageBoxOptions): Promise<void> => {
  // 设置额外字段，标识弹窗类型为警告框
  options.field = "alert";
  // 调用 MessageBox 函数创建并返回 Promise
  return MessageBox(options);
};

/**
 * 显示弹窗的函数
 * @param {object} app - Vue 应用实例
 * @param {object} callbacks - 包含 resolve 和 reject 回调的对象
 */
const showMessageBox = (
  app: any,
  { resolve, reject }: { resolve: () => void; reject: () => void }
): void => {
  // 创建文档碎片
  // 文档碎片是一个轻量级的临时容器，常用于 DOM 操作，避免频繁操作实际的 DOM，提升性能。
  // 它可以包含节点，但不会立即呈现到页面上。
  const oFragment = document.createDocumentFragment();
  // 将弹窗组件挂载到文档碎片中
  /* 
      app.mount(oFragment) 将 app（Vue 应用实例）挂载到文档碎片中。
      app 是一个 Vue 实例（传入的 MessageBoxComponent），并且它的 DOM 结构将被添加到 oFragment 中。
      vm 是挂载后的组件实例（MessageBoxComponent），它的状态和方法可以通过 vm 来访问。 
  */
  const vm = app.mount(oFragment);
  // 将文档碎片添加到 body 中，显示弹窗
  /* 
     将包含 Vue 组件的文档碎片 oFragment 添加到页面的 body 中，
     这样组件的内容才会显示在页面上。此时，弹窗已经被渲染并可见。 
  */
  document.body.appendChild(oFragment);
  // 设置弹窗可见
  vm.setVisible(true);


  /* 
     watch(vm.state, (state) => {...}) 监听 vm.state 的变化，state 是 Vue 组件的响应式状态，
     主要包含 visible（表示弹窗是否可见）和 type（表示用户的操作，如“cancel”或“confirm”）。
     一旦弹窗被关闭（state.visible 为 false），就会触发回调：
     如果 state.type 是 "cancel"，调用 reject()，表示用户取消操作。
     如果 state.type 是 "confirm"，调用 resolve()，表示用户确认操作。
     根据弹窗的操作类型执行相应的回调函数。
     使用 Vue 的 watch 监听弹窗状态变化
  */
  watch(vm.state, (state) => {
    if (!state.visible) {
      // 根据弹窗状态执行相应的回调
      switch (state.type) {
        case "cancel":
          reject(); // 用户取消操作
          break;
        case "confirm":
          resolve(); // 用户确认操作
          break;
        default:
          break;
      }
      // 隐藏并销毁弹窗
      /* 
      在执行完回调后，调用 hideMessageBox 函数来隐藏并销毁弹窗。
      hideMessageBox 函数会卸载 Vue 组件并清理相应的 DOM 元素，释放资源。
      */
      hideMessageBox(app);
    }
  });
};

/**
 * 隐藏并销毁弹窗的函数
 * @param {object} app - Vue 应用实例
 */
const hideMessageBox = (app: any): void => {
  // 使用 Vue 的 unmount 方法卸载组件
  app.unmount();
};

// 导出 MessageBox 函数
export default MessageBox;
