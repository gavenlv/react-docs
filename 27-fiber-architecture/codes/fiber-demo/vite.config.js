import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 配置文件
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5171, // 端口号
    open: true  // 启动时自动打开浏览器
  }
})
