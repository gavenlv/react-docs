// Counter.test.jsx - Counter 组件的测试文件
// 演示：渲染测试、用户交互测试、快照测试

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from '../components/Counter'

describe('Counter 组件', () => {
  // ========== 渲染测试 ==========
  describe('渲染测试', () => {
    it('应该正确渲染初始值为 0 的计数器', () => {
      render(<Counter />)
      // 使用 data-testid 定位元素并检查文本内容
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 0')
    })

    it('应该正确渲染自定义初始值', () => {
      render(<Counter initialValue={10} />)
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 10')
    })

    it('应该渲染所有按钮', () => {
      render(<Counter />)
      // 检查所有按钮是否存在于文档中
      expect(screen.getByTestId('increment-btn')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-btn')).toBeInTheDocument()
      expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
    })

    it('当初始值为 0 时，减少按钮应该被禁用', () => {
      render(<Counter />)
      expect(screen.getByTestId('decrement-btn')).toBeDisabled()
    })

    it('当初始值大于 0 时，减少按钮应该可用', () => {
      render(<Counter initialValue={5} />)
      expect(screen.getByTestId('decrement-btn')).not.toBeDisabled()
    })
  })

  // ========== 用户交互测试 ==========
  describe('用户交互测试', () => {
    it('点击增加按钮应该增加计数', () => {
      render(<Counter />)
      const incrementBtn = screen.getByTestId('increment-btn')
      // 模拟点击增加按钮
      fireEvent.click(incrementBtn)
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 1')
      // 多次点击
      fireEvent.click(incrementBtn)
      fireEvent.click(incrementBtn)
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 3')
    })

    it('点击减少按钮应该减少计数', () => {
      render(<Counter initialValue={5} />)
      const decrementBtn = screen.getByTestId('decrement-btn')
      fireEvent.click(decrementBtn)
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 4')
    })

    it('点击重置按钮应该恢复到初始值', () => {
      render(<Counter initialValue={5} />)
      // 先增加几次
      fireEvent.click(screen.getByTestId('increment-btn'))
      fireEvent.click(screen.getByTestId('increment-btn'))
      // 然后重置
      fireEvent.click(screen.getByTestId('reset-btn'))
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 5')
    })

    it('计数到 0 时减少按钮应该变为禁用状态', () => {
      render(<Counter initialValue={2} />)
      const decrementBtn = screen.getByTestId('decrement-btn')
      // 减少到 0
      fireEvent.click(decrementBtn)
      fireEvent.click(decrementBtn)
      expect(decrementBtn).toBeDisabled()
      expect(screen.getByTestId('counter-value')).toHaveTextContent('当前值: 0')
    })
  })

  // ========== 回调函数测试 ==========
  describe('回调函数测试', () => {
    it('计数变化时应该调用 onChange 回调', () => {
      // 创建 mock 函数来跟踪调用
      const onChange = vi.fn()
      render(<Counter onChange={onChange} />)
      fireEvent.click(screen.getByTestId('increment-btn'))
      // 验证回调被调用，且参数为新的计数值
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('减少时也应该调用 onChange 回调', () => {
      const onChange = vi.fn()
      render(<Counter initialValue={5} onChange={onChange} />)
      fireEvent.click(screen.getByTestId('decrement-btn'))
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('没有传入 onChange 时不应该报错', () => {
      // 确保不传 onChange 回调时组件正常工作
      render(<Counter />)
      expect(() => {
        fireEvent.click(screen.getByTestId('increment-btn'))
      }).not.toThrow()
    })
  })

  // ========== 快照测试 ==========
  describe('快照测试', () => {
    it('应该与快照匹配', () => {
      const { container } = render(<Counter />)
      //toMatchSnapshot 会将渲染结果与之前保存的快照进行比较
      // 首次运行时会创建快照文件
      expect(container).toMatchSnapshot()
    })

    it('不同初始值应该与对应快照匹配', () => {
      const { container } = render(<Counter initialValue={42} />)
      expect(container).toMatchSnapshot('counter-with-initial-value-42')
    })
  })
})
