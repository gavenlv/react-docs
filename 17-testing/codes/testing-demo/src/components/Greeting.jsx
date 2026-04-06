// Greeting.jsx - 问候语组件（被测组件）
// 用于演示：
// 1. Props 渲染测试 - 检查不同 props 是否正确渲染
// 2. 条件渲染测试 - 检查不同条件下的 UI 输出
// 3. 快照测试

/**
 * Greeting 问候语组件
 * 根据传入的 name 和 isMorning props 显示不同的问候语
 * @param {Object} props - 组件属性
 * @param {string} props.name - 用户名称
 * @param {boolean} props.isMorning - 是否为早晨
 * @param {string} props.role - 用户角色，可选
 */
function Greeting({ name, isMorning = false, role }) {
  // 如果没有提供 name，显示默认问候语
  if (!name) {
    return (
      <div className="greeting" data-testid="greeting">
        <p data-testid="greeting-text">你好，访客！</p>
        <p data-testid="greeting-subtitle">请登录以获取个性化体验</p>
      </div>
    )
  }

  return (
    <div className="greeting" data-testid="greeting">
      {/* 根据时间显示不同的问候语 */}
      <h2 data-testid="greeting-text">
        {isMorning ? `早上好` : `你好`}，{name}！
      </h2>

      {/* 如果有角色信息，显示角色标签 */}
      {role && (
        <span data-testid="greeting-role" className="role-badge">
          {role}
        </span>
      )}

      {/* 根据时间显示不同的副标题 */}
      <p data-testid="greeting-subtitle">
        {isMorning
          ? '新的一天开始了，祝你有美好的一天！'
          : '欢迎回来，今天继续加油！'}
      </p>
    </div>
  )
}

export default Greeting
