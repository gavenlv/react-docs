// Vitest 配置文件 - 用于 React 组件测试
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 使用 React 插件，支持 JSX 转换
  plugins: [react()],
  // 测试环境配置
  test: {
    // 使用 jsdom 模拟浏览器环境，使得可以在 Node.js 中运行 DOM 相关测试
    environment: 'jsdom',
    // 全局设置文件，用于引入 @testing-library/jest-dom 等全局匹配器
    setupFiles: './src/setupTests.js',
    // 开启全局 API，使得 describe、it、expect 等无需显式导入
    globals: true,
    // CSS 模块处理
    css: true,
  },
})
