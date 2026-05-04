# 18 - CSS-in-JS

## 🎯 本节目标
- 理解 CSS-in-JS 的概念
- 掌握常见的 CSS-in-JS 方案
- 学会在 React 中使用样式
- 理解各方案的优缺点

---

## 📖 什么是 CSS-in-JS？

### 一句话解释

CSS-in-JS 是一种在 JavaScript 中编写 CSS 的技术,将样式与组件绑定在一起。

### 常见方案

- **Styled Components**
- **Emotion**
- **CSS Modules**
- **Tailwind CSS**

---

## 🎨 Styled Components

### 基本用法

```jsx
import styled from 'styled-components';

// 创建组件
const Button = styled.button`
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: #2980b9;
  }
`;

// 使用
function App() {
  return <Button>点击我</Button>;
}
```

---

### Props

```jsx
const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? '#3498db' : '#95a5a6'};
  color: white;
  border: none;
  border-radius: 5px;
`;

// 使用
<Button primary>主要按钮</Button>
<Button>次要按钮</Button>
```

---

### 继承

```jsx
const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
`;

const PrimaryButton = styled(Button)`
  background: #3498db;
  color: white;
`;
```

---

## 🎭 Emotion

### CSS Prop

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

function App() {
  return (
    <button
      css={css`
        padding: 10px 20px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
      `}
    >
      点击我
    </button>
  );
}
```

---

### Styled

```jsx
import styled from '@emotion/styled';

const Button = styled.button`
  padding: 10px 20px;
  background: #3498db;
  color: white;
`;
```

---

## 📦 CSS Modules

### 基本用法

```css
/* Button.module.css */
.button {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
}

.primary {
  background: #3498db;
}

.secondary {
  background: #95a5a6;
}
```

```jsx
// Button.jsx
import styles from './Button.module.css';

function Button({ variant = 'primary', children }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

---

## 🌬️ Tailwind CSS

### 基本用法

```jsx
function Button({ primary, children }) {
  return (
    <button
      className={`
        px-5 py-2 rounded text-white
        ${primary ? 'bg-blue-500' : 'bg-gray-500'}
      `}
    >
      {children}
    </button>
  );
}
```

---

### 配置

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
      },
    },
  },
};
```

---

## 📊 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| Styled Components | 动态样式、组件化 | 运行时开销 |
| Emotion | 灵活、性能好 | 学习曲线 |
| CSS Modules | 零运行时、兼容性好 | 需要构建工具 |
| Tailwind CSS | 快速开发、一致性好 | 类名冗长 |

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 CSS-in-JS 的概念
- [ ] 会使用 Styled Components
- [ ] 会使用 CSS Modules
- [ ] 会使用 Tailwind CSS
- [ ] 能选择合适的方案

---

## 📝 练习任务

### 任务 1：Styled Components
使用 Styled Components 创建按钮组件。

### 任务 2：CSS Modules
使用 CSS Modules 重构组件样式。

### 任务 3：Tailwind CSS
使用 Tailwind CSS 构建页面。

---

## 🔗 相关资源

- [Styled Components](https://styled-components.com/)
- [Emotion](https://emotion.sh/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Tailwind CSS](https://tailwindcss.com/)
