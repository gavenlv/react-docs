# 20 - CSS 与无障碍访问

## 🎯 本节目标
- 理解无障碍访问的重要性
- 掌握 CSS 在无障碍中的作用
- 学会创建可访问的样式
- 掌握 WCAG 标准

---

## 📖 什么是无障碍访问？

### 一句话解释

无障碍访问（Accessibility，简称 A11y）是确保网站对所有用户可用，包括残障人士。

### WCAG 标准

- **可感知**（Perceivable）：信息必须可被感知
- **可操作**（Operable）：界面必须可操作
- **可理解**（Understandable）：信息和操作必须可理解
- **健壮性**（Robust）：内容必须健壮

---

## 🎨 颜色和对比度

### 对比度要求

- **普通文本**：至少 4.5:1
- **大文本**：至少 3:1
- **UI 组件**：至少 3:1

```css
/* ✅ 良好对比度 */
.text {
  color: #333333;
  background: #ffffff;
  /* 对比度: 12.6:1 */
}

/* ❌ 对比度不足 */
.text {
  color: #999999;
  background: #ffffff;
  /* 对比度: 2.8:1 */
}
```

---

### 不要仅依赖颜色

```css
/* ❌ 仅用颜色区分 */
.error {
  color: red;
}

.success {
  color: green;
}

/* ✅ 使用多种方式区分 */
.error {
  color: #e74c3c;
  border-left: 3px solid #e74c3c;
}

.error::before {
  content: '⚠ ';
}

.success {
  color: #27ae60;
  border-left: 3px solid #27ae60;
}

.success::before {
  content: '✓ ';
}
```

---

## 📝 文本和字体

### 字体大小

```css
/* ✅ 使用相对单位 */
body {
  font-size: 16px;  /* 基准大小 */
}

h1 {
  font-size: 2rem;  /* 32px */
}

p {
  font-size: 1rem;  /* 16px */
}

/* ✅ 允许用户缩放 */
html {
  font-size: 100%;  /* 不使用 px 固定 */
}
```

---

### 行高和间距

```css
/* ✅ 良好的行高 */
p {
  line-height: 1.5;  /* 至少 1.5 */
  margin-bottom: 1.5em;
}

/* ✅ 段落间距 */
p + p {
  margin-top: 1.5em;
}
```

---

### 文本对齐

```css
/* ✅ 左对齐更易阅读 */
p {
  text-align: left;
}

/* ❌ 避免两端对齐（可能导致词间距不均） */
p {
  text-align: justify;
}
```

---

## 🖱️ 焦点样式

### 可见的焦点指示器

```css
/* ✅ 明显的焦点样式 */
a:focus,
button:focus,
input:focus {
  outline: 3px solid #3498db;
  outline-offset: 2px;
}

/* ❌ 不要移除焦点样式 */
*:focus {
  outline: none;  /* 避免这样做 */
}

/* ✅ 自定义焦点样式 */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
}
```

---

### :focus-visible

```css
/* 仅在键盘导航时显示焦点样式 */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 3px solid #3498db;
  outline-offset: 2px;
}
```

---

## 📱 交互和动画

### 减少动画

```css
/* 尊重用户偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 避免闪烁

```css
/* ❌ 避免快速闪烁 */
@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.element {
  animation: flash 0.1s infinite;  /* 危险！ */
}

/* ✅ 使用缓慢过渡 */
.element {
  animation: fadeIn 0.3s ease;
}
```

---

## 🎯 隐藏内容

### 视觉隐藏但屏幕阅读器可读

```css
/* ✅ 仅视觉隐藏 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ✅ 获得焦点时显示 */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

### 完全隐藏

```css
/* ✅ 完全隐藏（屏幕阅读器也不读） */
.hidden {
  display: none;
  visibility: hidden;
}
```

---

## 📊 表格和布局

### 表格

```css
/* ✅ 清晰的表格样式 */
table {
  border-collapse: collapse;
}

th {
  background: #f5f5f5;
  text-align: left;
  font-weight: bold;
}

td, th {
  padding: 10px;
  border: 1px solid #ddd;
}
```

---

### 布局

```css
/* ✅ 语义化布局 */
<header role="banner"></header>
<nav role="navigation"></nav>
<main role="main"></main>
<aside role="complementary"></aside>
<footer role="contentinfo"></footer>
```

---

## 💻 实战示例

### 示例 1：可访问按钮

```css
.button {
  display: inline-block;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.button:hover {
  background: #2980b9;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
}

.button:active {
  transform: translateY(1px);
}
```

---

### 示例 2：跳过链接

```html
<a href="#main" class="skip-link">跳到主内容</a>
<main id="main">主内容</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #3498db;
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解无障碍访问的重要性
- [ ] 会设置合适的颜色对比度
- [ ] 会创建焦点样式
- [ ] 会处理动画和闪烁
- [ ] 会创建可访问的组件

---

## 📝 练习任务

### 任务 1：对比度检查
检查页面的颜色对比度是否符合标准。

### 任务 2：焦点样式
为所有交互元素添加焦点样式。

### 任务 3：减少动画
为页面添加减少动画的支持。

---

## 🔗 相关资源

- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
