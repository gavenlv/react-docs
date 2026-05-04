# 14 - CSS 变量（自定义属性）

## 🎯 本节目标
- 理解 CSS 变量的概念和优势
- 掌握变量的定义和使用
- 学会变量的作用域和继承
- 掌握变量的实际应用

---

## 📖 什么是 CSS 变量？

### 一句话解释

CSS 变量（Custom Properties）允许你定义可复用的值,并在整个样式表中引用它们。

### 优势

- ✅ 减少重复代码
- ✅ 易于维护和更新
- ✅ 支持作用域和继承
- ✅ 可通过 JavaScript 操作
- ✅ 支持媒体查询

---

## 📝 定义和使用变量

### 基本语法

```css
/* 定义变量（以 -- 开头） */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size-base: 16px;
  --spacing: 20px;
}

/* 使用变量（var() 函数） */
.element {
  color: var(--primary-color);
  font-size: var(--font-size-base);
  margin: var(--spacing);
}
```

---

### 默认值

```css
.element {
  /* 如果变量未定义,使用默认值 */
  color: var(--undefined-var, #333);
  
  /* 多个默认值 */
  margin: var(--spacing, var(--default-spacing, 10px));
}
```

---

## 🎯 变量作用域

### 全局变量

```css
/* 在 :root 中定义全局变量 */
:root {
  --global-color: #3498db;
}

/* 任何地方都可以使用 */
.anywhere {
  color: var(--global-color);
}
```

---

### 局部变量

```css
.card {
  /* 定义局部变量 */
  --card-padding: 20px;
  --card-bg: white;
  
  padding: var(--card-padding);
  background: var(--card-bg);
}

/* 其他元素无法访问 --card-padding */
.other-element {
  /* ❌ 无效 */
  padding: var(--card-padding);
}
```

---

### 变量继承

```css
.parent {
  --inherited-color: #e74c3c;
}

.child {
  /* 子元素继承父元素的变量 */
  color: var(--inherited-color);
}
```

---

## 💻 实战应用

### 示例 1：主题系统

```css
:root {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-danger: #e74c3c;
  --color-warning: #f39c12;
  
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
  
  --font-size-base: 16px;
  --font-size-lg: 20px;
  --font-size-sm: 14px;
  
  --spacing-xs: 5px;
  --spacing-sm: 10px;
  --spacing-md: 20px;
  --spacing-lg: 30px;
  
  --border-radius: 5px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 暗黑主题 */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --border-color: #3a3a3a;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body {
  background: var(--bg-color);
  color: var(--text-color);
  font-size: var(--font-size-base);
}

.card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--shadow);
}
```

---

### 示例 2：响应式字体

```css
:root {
  --font-size-base: 16px;
}

@media (min-width: 768px) {
  :root {
    --font-size-base: 18px;
  }
}

@media (min-width: 1200px) {
  :root {
    --font-size-base: 20px;
  }
}

body {
  font-size: var(--font-size-base);
}
```

---

### 示例 3：组件样式

```css
:root {
  --button-padding: 12px 24px;
  --button-bg: #3498db;
  --button-color: white;
  --button-radius: 5px;
}

.btn {
  padding: var(--button-padding);
  background: var(--button-bg);
  color: var(--button-color);
  border: none;
  border-radius: var(--button-radius);
  cursor: pointer;
}

.btn-primary {
  --button-bg: #3498db;
}

.btn-secondary {
  --button-bg: #95a5a6;
}

.btn-danger {
  --button-bg: #e74c3c;
}
```

---

## 🔧 JavaScript 操作变量

### 获取变量值

```javascript
// 获取计算后的样式
const styles = getComputedStyle(document.documentElement);
const primaryColor = styles.getPropertyValue('--primary-color');

console.log(primaryColor); // #3498db
```

---

### 设置变量值

```javascript
// 设置全局变量
document.documentElement.style.setProperty('--primary-color', '#e74c3c');

// 设置局部变量
const element = document.querySelector('.card');
element.style.setProperty('--card-padding', '30px');
```

---

### 切换主题

```javascript
// 切换暗黑模式
function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  
  if (currentTheme === 'dark') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 CSS 变量的概念
- [ ] 会定义和使用变量
- [ ] 理解变量的作用域
- [ ] 会创建主题系统
- [ ] 会使用 JavaScript 操作变量

---

## 📝 练习任务

### 任务 1：主题系统
创建一个支持亮色/暗色主题切换的页面。

### 任务 2：响应式变量
使用 CSS 变量实现响应式字体大小。

### 任务 3：组件样式
使用 CSS 变量创建可定制的按钮组件。

---

## 🔗 相关资源

- [CSS Custom Properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Variables Guide](https://css-tricks.com/a-complete-guide-to-custom-properties/)
