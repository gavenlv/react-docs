// useCounter.js - 自定义计数器 Hook（被测 Hook）
// 用于演示自定义 Hook 的测试方法
// 使用 @testing-library/react 的 renderHook 来测试

import { useState, useCallback } from 'react'

/**
 * useCounter 自定义 Hook
 * 提供计数相关的状态和操作方法
 * @param {number} initialValue - 初始值，默认为 0
 * @returns {Object} 包含 count、increment、decrement、reset、setCount 的对象
 */
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  // 增加计数，支持自定义步长
  const increment = useCallback((step = 1) => {
    setCount(prev => prev + step)
  }, [])

  // 减少计数，支持自定义步长
  const decrement = useCallback((step = 1) => {
    setCount(prev => prev - step)
  }, [])

  // 重置到初始值
  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  // 直接设置计数值
  const setValue = useCallback((value) => {
    setCount(value)
  }, [])

  return {
    count,
    increment,
    decrement,
    reset,
    setValue,
    setCount,
  }
}

export default useCounter
