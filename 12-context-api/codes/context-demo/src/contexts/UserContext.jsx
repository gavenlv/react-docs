// ==========================================
// 用户 Context + useReducer
// 演示如何在 Context 中结合 useReducer 管理复杂状态
// ==========================================
import { createContext, useContext, useReducer } from 'react'

// ---------- 定义初始状态 ----------
const initialState = {
  // 用户名
  username: '张三',
  // 用户角色
  role: 'user',
  // 登录状态
  isLoggedIn: true,
  // 操作日志
  logs: ['用户登录系统'],
}

// ---------- 定义 Reducer ----------
// Reducer 函数接收当前状态和 action，返回新状态
// 类似 Redux 的 reducer 模式
function userReducer(state, action) {
  switch (action.type) {
    // 切换用户角色
    case 'TOGGLE_ROLE':
      return {
        ...state,
        role: state.role === 'user' ? 'admin' : 'user',
        logs: [...state.logs, `角色切换为: ${state.role === 'user' ? 'admin' : 'user'}`],
      }
    // 修改用户名
    case 'SET_USERNAME':
      return {
        ...state,
        username: action.payload,
        logs: [...state.logs, `用户名修改为: ${action.payload}`],
      }
    // 登录/登出
    case 'TOGGLE_LOGIN':
      return {
        ...state,
        isLoggedIn: !state.isLoggedIn,
        logs: [
          ...state.logs,
          state.isLoggedIn ? '用户登出系统' : '用户登录系统',
        ],
      }
    // 清空日志
    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
      }
    // 默认情况：返回原状态
    default:
      return state
  }
}

// ---------- 创建 Context ----------
const UserContext = createContext(null)

// ---------- 自定义 Hook ----------
const useUser = () => {
  const context = useContext(UserContext)
  // 如果不在 Provider 内使用，给出明确提示
  if (!context) {
    throw new Error('useUser 必须在 UserProvider 内部使用')
  }
  return context
}

export { UserContext, useUser, userReducer, initialState }
