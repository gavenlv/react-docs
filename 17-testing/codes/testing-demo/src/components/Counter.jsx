// Counter.jsx - 计数器组件（被测组件）
// 这是一个简单的计数器，用于演示：
// 1. 渲染测试 - 检查组件是否正确渲染初始值
// 2. 用户交互测试 - 检查按钮点击是否能正确增减计数
// 3. 快照测试 - 检查组件的渲染输出是否稳定

import { useState } from 'react'

/**
 * Counter 计数器组件
 * @param {Object} props - 组件属性
 * @param {number} props.initialValue - 计数器初始值，默认为 0
 * @param {Function} props.onChange - 计数变化时的回调函数
 */
function Counter({ initialValue = 0, onChange }) {
  // 使用 useState 管理计数状态
  const [count, setCount] = useState(initialValue)

  /**
   * 增加计数
   * 每次点击增加 1，并触发 onChange 回调
   */
  const increment = () => {
    setCount(prev => prev + 1)
    // 如果父组件传入了 onChange 回调，则调用它
    onChange?.(count + 1)
  }

  /**
   * 减少计数
   * 每次点击减少 1，并触发 onChange 回调
   */
  const decrement = () => {
    setCount(prev => prev - 1)
    onChange?.(count - 1)
  }

  /**
   * 重置计数
   * 将计数恢复到初始值
   */
  const reset = () => {
    setCount(initialValue)
    onChange?.(initialValue)
  }

  return (
    <div className="counter" data-testid="counter">
      {/* 计数显示区域 - 使用 data-testid 便于测试定位 */}
      <h2 data-testid="counter-title">计数器</h2>
      <div className="counter-display" data-testid="counter-value">
        当前值: {count}
      </div>

      {/* 按钮区域 */}
      <div className="counter-buttons">
        {/* 减少按钮 - 当计数为 0 时禁用 */}
        <button
          data-testid="decrement-btn"
          onClick={decrement}
          disabled={count <= 0}
        >
          - 减少
        </button>

        {/* 重置按钮 */}
        <button data-testid="reset-btn" onClick={reset}>
          重置
        </button>

        {/* 增加按钮 */}
        <button data-testid="increment-btn" onClick={increment}>
          + 增加
        </button>
      </div>
    </div>
  )
}

export default Counter
