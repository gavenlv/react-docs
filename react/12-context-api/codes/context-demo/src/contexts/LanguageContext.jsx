// ==========================================
// 语言 Context —— 用于管理中英文多语言切换
// ==========================================
import { createContext, useContext } from 'react'

// 创建语言 Context，默认值为中文
const LanguageContext = createContext({
  // 当前语言：'zh' 或 'en'
  language: 'zh',
  // 切换语言的函数
  toggleLanguage: () => {},
  // 翻译函数：根据 key 获取对应语言的文本
  t: (key) => key,
})

// 自定义 Hook：方便组件使用语言 Context
// 使用时只需调用 useLanguage() 即可获取语言状态和翻译函数
const useLanguage = () => useContext(LanguageContext)

export { LanguageContext, useLanguage }
