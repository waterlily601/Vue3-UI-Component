import { defineConfig } from 'vitepress'
import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'
import { fileURLToPath, URL } from 'node:url'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ElElement",
  description: "A VitePress Site",
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url))
      }
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/' },
      { text: '组件', link: '/components/button' }
    ],
    sidebar: [
      {
        text: '基础',
        items: [
          { text: '按钮 Button', link: '/components/button'},
          { text: '布局容器 Container', link: '/components/container'},
          { text: '图标 Icon', link: 'components/icon'},
          { text: '链接 Link', link: '/components/link'},
          { text: '折叠面板 Collapse', link: '/components/collapse'},
        ]
      },
      {
        text: '反馈',
        items: [
          { text: '消息提示 Message', link: '/components/Message'},
          { text: '消息弹出框 MessageBox', link: '/components/MessageBox'},
          { text: '文字提示 Tooltip', link: '/components/Tooltip'},
        ]
      },
      {
        text: '数据输入',
        items: [
          { text: '开关 Switch', link: 'components/switch'},
          { text: '评分 Rate', link: 'components/rate'},
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/waterlily601/Vue3-UI-Component' }
    ]
  },
  markdown: {
    config(md) {
      md.use(containerPreview)
      md.use(componentPreview)
    }
  },
  base: '/element-ui/'
})

