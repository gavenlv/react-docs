// Greeting.test.jsx - Greeting 组件的测试文件
// 演示：Props 渲染测试、条件渲染测试、快照测试

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Greeting from '../components/Greeting'

describe('Greeting 组件', () => {
  // ========== Props 渲染测试 ==========
  describe('Props 渲染测试', () => {
    it('应该渲染传入的用户名', () => {
      render(<Greeting name="张三" />)
      expect(screen.getByTestId('greeting-text')).toHaveTextContent('张三')
    })

    it('应该渲染早晨问候语', () => {
      render(<Greeting name="李四" isMorning={true} />)
      expect(screen.getByTestId('greeting-text')).toHaveTextContent('早上好')
    })

    it('应该渲染下午问候语', () => {
      render(<Greeting name="王五" isMorning={false} />)
      expect(screen.getByTestId('greeting-text')).toHaveTextContent('你好')
    })

    it('应该渲染角色标签', () => {
      render(<Greeting name="管理员" role="admin" />)
      expect(screen.getByTestId('greeting-role')).toHaveTextContent('admin')
    })
  })

  // ========== 条件渲染测试 ==========
  describe('条件渲染测试', () => {
    it('没有 name 时应该显示访客问候', () => {
      render(<Greeting />)
      expect(screen.getByTestId('greeting-text')).toHaveTextContent('你好，访客！')
    })

    it('有 name 时不应该显示访客问候', () => {
      render(<Greeting name="赵六" />)
      expect(screen.getByTestId('greeting-text')).not.toHaveTextContent('访客')
    })

    it('没有 role 时不应该渲染角色标签', () => {
      render(<Greeting name="赵六" />)
      // queryByTestId 返回 null 如果元素不存在，而 getByTestId 会抛出错误
      expect(screen.queryByTestId('greeting-role')).not.toBeInTheDocument()
    })

    it('有 role 时应该渲染角色标签', () => {
      render(<Greeting name="赵六" role="editor" />)
      expect(screen.getByTestId('greeting-role')).toBeInTheDocument()
    })

    it('早晨时应该显示早晨副标题', () => {
      render(<Greeting name="赵六" isMorning={true} />)
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent('新的一天')
    })

    it('非早晨时应该显示普通副标题', () => {
      render(<Greeting name="赵六" isMorning={false} />)
      expect(screen.getByTestId('greeting-subtitle')).toHaveTextContent('欢迎回来')
    })
  })

  // ========== 快照测试 ==========
  describe('快照测试', () => {
    it('早晨问候应该匹配快照', () => {
      const { container } = render(<Greeting name="张三" isMorning={true} role="admin" />)
      expect(container).toMatchSnapshot('morning-greeting')
    })

    it('访客问候应该匹配快照', () => {
      const { container } = render(<Greeting />)
      expect(container).toMatchSnapshot('guest-greeting')
    })
  })
})
