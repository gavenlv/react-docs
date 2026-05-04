// setupTests.js - Vitest 全局测试设置文件
// 该文件在每个测试文件运行前自动执行，用于配置全局测试环境

// 引入 @testing-library/jest-dom，提供额外的 DOM 断言匹配器
// 例如：toBeInTheDocument()、toHaveTextContent()、toBeDisabled() 等
import '@testing-library/jest-dom'
