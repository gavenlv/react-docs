// AsyncData.jsx - 异步数据组件（被测组件）
// 用于演示：
// 1. 异步操作测试 - 模拟 API 请求
// 2. Loading 状态测试
// 3. Error 状态测试
// 4. Mock 函数测试

import { useState, useEffect, useCallback } from 'react'

/**
 * AsyncData 异步数据获取组件
 * 模拟从 API 获取用户数据的过程
 * @param {Object} props - 组件属性
 * @param {Function} props.fetchFn - 自定义数据获取函数，用于测试时注入 mock
 * @param {number} props.userId - 用户 ID
 */
function AsyncData({ fetchFn, userId = 1 }) {
  // 数据状态
  const [data, setData] = useState(null)
  // 加载状态
  const [loading, setLoading] = useState(true)
  // 错误状态
  const [error, setError] = useState(null)

  /**
   * 默认的数据获取函数
   * 在没有传入 fetchFn 时使用，模拟真实 API 请求
   */
  const defaultFetch = useCallback(async () => {
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      // 模拟 API 响应数据
      const response = {
        id: userId,
        name: `用户 ${userId}`,
        email: `user${userId}@example.com`,
        posts: [
          { id: 1, title: `用户${userId}的第一篇文章` },
          { id: 2, title: `用户${userId}的第二篇文章` },
        ],
      }
      return response
    } catch (err) {
      throw new Error('获取数据失败')
    }
  }, [userId])

  /**
   * useEffect 负责在组件挂载时获取数据
   * 如果传入了 fetchFn，使用自定义函数（用于测试 mock）
   */
  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // 使用传入的 fetchFn 或默认的 defaultFetch
        const result = fetchFn ? await fetchFn(userId) : await defaultFetch()
        // 防止组件卸载后仍然更新状态
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    // 清理函数：取消未完成的请求
    return () => {
      cancelled = true
    }
  }, [userId, fetchFn, defaultFetch])

  // 加载中状态
  if (loading) {
    return (
      <div className="async-data" data-testid="async-data">
        <div data-testid="loading-indicator" className="loading">
          加载中...
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="async-data" data-testid="async-data">
        <div data-testid="error-message" className="error">
          错误: {error}
        </div>
        <button
          data-testid="retry-btn"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    )
  }

  // 成功状态 - 显示数据
  return (
    <div className="async-data" data-testid="async-data">
      <h2 data-testid="data-title">用户数据</h2>
      <div data-testid="data-content">
        <p data-testid="user-name">姓名: {data?.name}</p>
        <p data-testid="user-email">邮箱: {data?.email}</p>
        <div data-testid="user-posts">
          <h3>文章列表:</h3>
          <ul>
            {data?.posts?.map(post => (
              <li key={post.id} data-testid="post-item">
                {post.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AsyncData
