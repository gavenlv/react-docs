// ==========================================
// 主题 Context —— 用于管理暗色/亮色主题
// ==========================================
import { createContext, useContext } from 'react'

// 创建主题 Context，默认值为亮色主题
const ThemeContext = createContext({
  // 当前主题：'light' 或 'dark'
  theme: 'light',
  // 切换主题的函数
  toggleTheme: () => {},
})

// 自定义 Hook：方便组件使用主题 Context
// 使用时只需调用 useTheme() 即可获取主题状态和切换函数
const useTheme = () => useContext(ThemeContext)

export { ThemeContext, useTheme }
