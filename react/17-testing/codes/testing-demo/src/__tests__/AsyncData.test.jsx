// AsyncData.test.jsx - AsyncData 组件的测试文件
// 演示：异步测试、Mock 函数、Loading 状态测试、Error 状态测试

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import AsyncData from '../components/AsyncData'

describe('AsyncData 组件', () => {
  // ========== Loading 状态测试 ==========
  describe('Loading 状态测试', () => {
    it('应该初始显示加载中状态', () => {
      // 创建一个永远不会 resolve 的 Promise，使组件保持在 loading 状态
      const mockFetch = vi.fn(() => new Promise(() => {}))
      render(<AsyncData fetchFn={mockFetch} />)
      expect(screen.getByTestId('loading-indicator')).toHaveTextContent('加载中...')
    })

    it('数据加载完成后应该隐藏加载指示器', async () => {
      const mockData = {
        id: 1,
        name: '测试用户',
        email: 'test@example.com',
        posts: [{ id: 1, title: '测试文章' }],
      }
      const mockFetch = vi.fn(() => Promise.resolve(mockData))
      render(<AsyncData fetchFn={mockFetch} />)

      // waitFor 等待直到断言通过或超时
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
      })
    })
  })

  // ========== 数据渲染测试 ==========
  describe('数据渲染测试', () => {
    it('应该正确渲染获取到的数据', async () => {
      const mockData = {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        posts: [
          { id: 1, title: '第一篇文章' },
          { id: 2, title: '第二篇文章' },
        ],
      }
      const mockFetch = vi.fn(() => Promise.resolve(mockData))
      render(<AsyncData fetchFn={mockFetch} />)

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('张三')
        expect(screen.getByTestId('user-email')).toHaveTextContent('zhangsan@example.com')
      })

      // 检查文章列表
      const postItems = screen.getAllByTestId('post-item')
      expect(postItems).toHaveLength(2)
      expect(postItems[0]).toHaveTextContent('第一篇文章')
      expect(postItems[1]).toHaveTextContent('第二篇文章')
    })
  })

  // ========== Error 状态测试 ==========
  describe('Error 状态测试', () => {
    it('获取数据失败时应该显示错误信息', async () => {
      const mockFetch = vi.fn(() => Promise.reject(new Error('网络错误')))
      render(<AsyncData fetchFn={mockFetch} />)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('网络错误')
      })
    })

    it('显示错误时应该有重试按钮', async () => {
      const mockFetch = vi.fn(() => Promise.reject(new Error('服务器异常')))
      render(<AsyncData fetchFn={mockFetch} />)

      await waitFor(() => {
        expect(screen.getByTestId('retry-btn')).toBeInTheDocument()
      })
    })
  })

  // ========== Mock 函数测试 ==========
  describe('Mock 函数测试', () => {
    beforeEach(() => {
      // 每个测试前清除所有 mock 的调用记录
      vi.clearAllMocks()
    })

    it('应该使用传入的 userId 调用 fetchFn', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({ id: 42, name: '用户42', email: 'u42@test.com', posts: [] })
      )
      render(<AsyncData fetchFn={mockFetch} userId={42} />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(42)
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })
    })

    it('组件卸载后不应该更新状态', async () => {
      const mockFetch = vi.fn(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ id: 1, name: '测试', email: 't@t.com', posts: [] }), 100)
        )
      )
      const { unmount } = render(<AsyncData fetchFn={mockFetch} />)

      // 在数据返回前卸载组件
      unmount()

      // 等待足够的时间，确保 Promise 已 resolve
      await new Promise(resolve => setTimeout(resolve, 200))

      // 如果组件正确处理了卸载，fetchFn 仍然被调用了（无法取消）
      expect(mockFetch).toHaveBeenCalled()
      // 但不会因为更新已卸载组件的状态而报错
    })
  })

  // ========== 组件清理测试 ==========
  describe('组件清理测试', () => {
    it('userId 变化时应该重新获取数据', async () => {
      const mockFetch = vi.fn((id) =>
        Promise.resolve({ id, name: `用户${id}`, email: `u${id}@test.com`, posts: [] })
      )

      const { rerender } = render(<AsyncData fetchFn={mockFetch} userId={1} />)

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('用户1')
      })

      // 使用不同的 userId 重新渲染
      rerender(<AsyncData fetchFn={mockFetch} userId={2} />)

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('用户2')
      })

      // 验证 fetchFn 被调用了两次（初始 + 重新渲染）
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenNthCalledWith(1, 1)
      expect(mockFetch).toHaveBeenNthCalledWith(2, 2)
    })
  })
})
