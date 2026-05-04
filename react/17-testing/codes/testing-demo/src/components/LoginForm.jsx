// LoginForm.jsx - 登录表单组件（被测组件）
// 用于演示：
// 1. 表单交互测试 - 输入、提交
// 2. 表单验证测试
// 3. 用户事件测试（@testing-library/user-event）
// 4. 复杂用户流程测试

import { useState } from 'react'

/**
 * LoginForm 登录表单组件
 * 包含用户名和密码输入，带有表单验证功能
 * @param {Object} props - 组件属性
 * @param {Function} props.onSubmit - 表单提交回调
 * @param {Function} props.onValidate - 自定义验证函数
 * @param {boolean} props.loading - 是否正在提交
 */
function LoginForm({ onSubmit, onValidate, loading = false }) {
  // 表单数据状态
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  })

  // 表单错误信息
  const [errors, setErrors] = useState({})
  // 表单是否已提交过（用于控制提交后显示验证错误）
  const [touched, setTouched] = useState({})

  /**
   * 表单验证函数
   * 验证用户名和密码是否符合要求
   * @returns {Object} 错误对象，空对象表示验证通过
   */
  const validate = () => {
    const newErrors = {}

    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少 3 个字符'
    } else if (formData.username.length > 20) {
      newErrors.username = '用户名不能超过 20 个字符'
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少 6 个字符'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = '密码必须包含至少一个大写字母'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = '密码必须包含至少一个数字'
    }

    // 如果传入了自定义验证函数，也执行它
    if (onValidate) {
      const customErrors = onValidate(formData)
      Object.assign(newErrors, customErrors)
    }

    return newErrors
  }

  /**
   * 处理输入变化
   * @param {React.ChangeEvent} e - 输入事件
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // 如果字段已经被触碰过，清除该字段的错误
    if (touched[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  /**
   * 处理失焦事件 - 标记字段为已触碰
   */
  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    // 失焦时验证该字段
    const newErrors = validate()
    setErrors(prev => {
      const filtered = { ...prev }
      // 只保留该字段的错误
      Object.keys(filtered).forEach(key => {
        if (key !== name) delete filtered[key]
      })
      // 添加该字段的新错误（如果有）
      if (newErrors[name]) filtered[name] = newErrors[name]
      return filtered
    })
  }

  /**
   * 处理表单提交
   * @param {React.FormEvent} e - 表单事件
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    // 标记所有字段为已触碰
    setTouched({ username: true, password: true })
    // 执行验证
    const newErrors = validate()
    setErrors(newErrors)
    // 如果没有错误，调用提交回调
    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({
        username: formData.username,
        password: formData.password,
        remember: formData.remember,
      })
    }
  }

  return (
    <form className="login-form" data-testid="login-form" onSubmit={handleSubmit}>
      <h2 data-testid="form-title">用户登录</h2>

      {/* 用户名输入 */}
      <div className="form-group">
        <label htmlFor="username" data-testid="username-label">
          用户名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          data-testid="username-input"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="请输入用户名"
          autoComplete="username"
        />
        {/* 用户名错误提示 */}
        {touched.username && errors.username && (
          <span data-testid="username-error" className="error-text">
            {errors.username}
          </span>
        )}
      </div>

      {/* 密码输入 */}
      <div className="form-group">
        <label htmlFor="password" data-testid="password-label">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          data-testid="password-input"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="请输入密码"
          autoComplete="current-password"
        />
        {/* 密码错误提示 */}
        {touched.password && errors.password && (
          <span data-testid="password-error" className="error-text">
            {errors.password}
          </span>
        )}
      </div>

      {/* 记住我复选框 */}
      <div className="form-group checkbox-group">
        <input
          id="remember"
          name="remember"
          type="checkbox"
          data-testid="remember-checkbox"
          checked={formData.remember}
          onChange={handleChange}
        />
        <label htmlFor="remember" data-testid="remember-label">
          记住我
        </label>
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        data-testid="submit-btn"
        disabled={loading}
      >
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}

export default LoginForm
