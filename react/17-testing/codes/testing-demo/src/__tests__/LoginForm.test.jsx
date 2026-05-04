// LoginForm.test.jsx - LoginForm 组件的测试文件
// 演示：表单交互测试、表单验证测试、用户事件测试（user-event）

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../components/LoginForm'

describe('LoginForm 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== 基本渲染测试 ==========
  describe('基本渲染测试', () => {
    it('应该渲染表单标题', () => {
      render(<LoginForm />)
      expect(screen.getByTestId('form-title')).toHaveTextContent('用户登录')
    })

    it('应该渲染所有表单字段', () => {
      render(<LoginForm />)
      expect(screen.getByTestId('username-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('remember-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    })

    it('提交按钮初始文本应该是"登录"', () => {
      render(<LoginForm />)
      expect(screen.getByTestId('submit-btn')).toHaveTextContent('登录')
    })

    it('loading 时提交按钮应该显示"登录中..."并禁用', () => {
      render(<LoginForm loading={true} />)
      const submitBtn = screen.getByTestId('submit-btn')
      expect(submitBtn).toHaveTextContent('登录中...')
      expect(submitBtn).toBeDisabled()
    })
  })

  // ========== 用户输入测试 ==========
  describe('用户输入测试', () => {
    it('应该允许用户输入用户名', async () => {
      // userEvent 模拟更真实的用户行为（键盘输入）
      const user = userEvent.setup()
      render(<LoginForm />)

      const usernameInput = screen.getByTestId('username-input')
      await user.type(usernameInput, 'testuser')

      expect(usernameInput).toHaveValue('testuser')
    })

    it('应该允许用户输入密码', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const passwordInput = screen.getByTestId('password-input')
      await user.type(passwordInput, 'Password123')

      expect(passwordInput).toHaveValue('Password123')
    })

    it('应该允许用户勾选"记住我"', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const checkbox = screen.getByTestId('remember-checkbox')
      expect(checkbox).not.toBeChecked()
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('应该允许用户取消"记住我"', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const checkbox = screen.getByTestId('remember-checkbox')
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  // ========== 表单验证测试 ==========
  describe('表单验证测试', () => {
    it('提交空表单应该显示所有必填错误', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByTestId('submit-btn'))

      // 等待验证错误显示
      await waitFor(() => {
        expect(screen.getByTestId('username-error')).toHaveTextContent('用户名不能为空')
      })
      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('密码不能为空')
      })
    })

    it('用户名太短时应该显示错误', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByTestId('username-input'), 'ab')
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('username-error')).toHaveTextContent('用户名至少 3 个字符')
      })
    })

    it('密码太短时应该显示错误', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('password-input'), '12345')
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('密码至少 6 个字符')
      })
    })

    it('密码缺少大写字母时应该显示错误', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('password-input'), 'password1')
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('大写字母')
      })
    })

    it('密码缺少数字时应该显示错误', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('password-input'), 'Password')
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('数字')
      })
    })
  })

  // ========== 表单提交测试 ==========
  describe('表单提交测试', () => {
    it('有效数据提交时应该调用 onSubmit 回调', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      // 填写有效表单
      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('password-input'), 'Password1')
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
        expect(onSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'Password1',
          remember: false,
        })
      })
    })

    it('提交时应该包含"记住我"的状态', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('password-input'), 'Password1')
      await user.click(screen.getByTestId('remember-checkbox'))
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ remember: true })
        )
      })
    })

    it('无效数据不应触发 onSubmit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<LoginForm onSubmit={onSubmit} />)

      // 只填写用户名，不填密码
      await user.type(screen.getByTestId('username-input'), 'test')
      await user.click(screen.getByTestId('submit-btn'))

      // onSubmit 不应该被调用
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  // ========== 自定义验证测试 ==========
  describe('自定义验证测试', () => {
    it('应该执行自定义验证函数', async () => {
      const user = userEvent.setup()
      const onValidate = vi.fn(() => ({ custom: '自定义错误信息' }))
      render(<LoginForm onValidate={onValidate} />)

      await user.type(screen.getByTestId('username-input'), 'testuser')
      await user.type(screen.getByTestId('password-input'), 'Password1')
      await user.click(screen.getByTestId('submit-btn'))

      await waitFor(() => {
        expect(onValidate).toHaveBeenCalled()
      })
    })
  })
})
