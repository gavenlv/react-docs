# 06 - 布局基础

## 🎯 本节目标
- 理解 CSS 布局的基本概念
- 掌握 display 属性的使用
- 学会使用浮动和定位
- 理解文档流和层叠上下文

---

## 📖 什么是布局？

### 一句话解释

CSS 布局是指控制 HTML 元素在页面上的位置和大小的技术。好的布局能让页面结构清晰、美观且响应式。

### 布局发展历史

```
1996 - 表格布局（Table Layout）
  ↓
2000 - 浮动布局（Float Layout）
  ↓
2009 - Flexbox 布局
  ↓
2017 - Grid 布局
  ↓
现在 - 现代 CSS 布局（Flexbox + Grid）
```

---

## 📄 文档流（Normal Flow）

### 什么是文档流？

文档流是元素按照 HTML 代码顺序自然排列的方式。

```html
<div>块级元素 1</div>
<div>块级元素 2</div>
<span>行内元素 1</span>
<span>行内元素 2</span>
```

**默认行为：**
- 块级元素：从上到下排列，独占一行
- 行内元素：从左到右排列，不换行

---

### 脱离文档流

某些 CSS 属性会让元素脱离文档流：

```css
/* 脱离文档流 */
.element {
  position: absolute;
  position: fixed;
  float: left;
  float: right;
}

/* 不脱离文档流 */
.element {
  position: relative;
  position: static;
  position: sticky;
}
```

---

## 🎭 display 属性

### 1. block（块级元素）

```css
.block {
  display: block;
  width: 100%;  /* 默认占满整行 */
  margin: 0 auto;  /* 可以设置 margin */
  padding: 20px;  /* 可以设置 padding */
}

/* 常见块级元素 */
div, p, h1-h6, ul, ol, li, table, form, header, footer, section, article
```

**特点：**
- 独占一行
- 可以设置宽高
- 可以设置 margin 和 padding

---

### 2. inline（行内元素）

```css
.inline {
  display: inline;
  /* width: 100px; */  /* ❌ 无效 */
  /* height: 50px; */  /* ❌ 无效 */
  margin: 0 10px;  /* ✅ 左右有效 */
  /* margin: 10px 0; */  /* ❌ 上下无效 */
  padding: 5px;  /* ✅ 但不影响布局 */
}

/* 常见行内元素 */
span, a, strong, em, img, input, button, label
```

**特点：**
- 不换行
- 不能设置宽高
- 上下 margin 无效
- 上下 padding 不影响布局

---

### 3. inline-block（行内块元素）

```css
.inline-block {
  display: inline-block;
  width: 100px;  /* ✅ 有效 */
  height: 50px;  /* ✅ 有效 */
  margin: 10px;  /* ✅ 全部有效 */
  padding: 10px;  /* ✅ 全部有效 */
}
```

**特点：**
- 不换行
- 可以设置宽高
- 可以设置 margin 和 padding

---

### 4. none（隐藏元素）

```css
.hidden {
  display: none;  /* 完全隐藏，不占空间 */
}

/* 对比 */
.invisible {
  visibility: hidden;  /* 隐藏但占空间 */
}

.transparent {
  opacity: 0;  /* 透明但占空间且可交互 */
}
```

---

### 5. display: flex 和 display: grid

```css
/* Flexbox 容器 */
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Grid 容器 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

> 💡 详见后续章节：07-flexbox 和 08-grid

---

## 🌊 浮动（Float）

### 基本用法

```css
.float-left {
  float: left;
}

.float-right {
  float: right;
}

.float-none {
  float: none;
}
```

---

### 文字环绕效果

```html
<div class="article">
  <img src="photo.jpg" alt="照片" class="float-image">
  <p>这是一段文字，会环绕在图片周围...</p>
</div>
```

```css
.float-image {
  float: left;
  margin: 0 20px 10px 0;
  width: 200px;
}
```

---

### 清除浮动

浮动会导致父元素高度塌陷，需要清除浮动。

```css
/* 方法 1：空元素清除 */
.clear {
  clear: both;
}

/* 方法 2：伪元素清除（推荐） */
.clearfix::after {
  content: '';
  display: table;
  clear: both;
}

/* 方法 3：overflow */
.parent {
  overflow: hidden;  /* 或 overflow: auto */
}

/* 方法 4：display: flow-root */
.parent {
  display: flow-root;
}
```

---

### 浮动布局示例

```html
<div class="container clearfix">
  <div class="sidebar">侧边栏</div>
  <div class="main-content">主内容</div>
</div>
```

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar {
  float: left;
  width: 25%;
  background: #f0f0f0;
  padding: 20px;
}

.main-content {
  float: right;
  width: 75%;
  padding: 20px;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
```

---

## 📍 定位（Position）

### 1. static（静态定位）

```css
.element {
  position: static;  /* 默认值 */
  /* top, right, bottom, left, z-index 无效 */
}
```

---

### 2. relative（相对定位）

相对于元素自身原始位置定位。

```css
.relative {
  position: relative;
  top: 20px;      /* 向下移动 20px */
  left: 30px;     /* 向右移动 30px */
  /* 原始位置保留 */
}
```

**特点：**
- 不脱离文档流
- 原始位置保留
- 常用作绝对定位的参考容器

---

### 3. absolute（绝对定位）

相对于最近的非 static 定位的祖先元素定位。

```css
.parent {
  position: relative;  /* 参考容器 */
  width: 300px;
  height: 200px;
  background: #f0f0f0;
}

.absolute {
  position: absolute;
  top: 20px;
  right: 20px;
  /* 脱离文档流 */
}
```

**特点：**
- 脱离文档流
- 不保留原始位置
- 相对于最近的定位祖先

**常见用法：**

```css
/* 居中 */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 全屏覆盖 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

/* 固定在角落 */
.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e74c3c;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
}
```

---

### 4. fixed（固定定位）

相对于浏览器视口定位。

```css
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* 固定在右下角 */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  cursor: pointer;
}
```

**特点：**
- 脱离文档流
- 相对于视口定位
- 不随页面滚动

---

### 5. sticky（粘性定位）

在滚动到指定位置时变为固定定位。

```css
.sticky {
  position: sticky;
  top: 0;  /* 滚动到顶部时固定 */
  background: white;
  z-index: 100;
}

/* 表头粘性 */
thead {
  position: sticky;
  top: 0;
  background: #f0f0f0;
}

/* 侧边栏粘性 */
.sidebar {
  position: sticky;
  top: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
}
```

**特点：**
- 不脱离文档流
- 需要指定 top/bottom/left/right
- 父容器不能有 overflow: hidden

---

## 📊 z-index（层叠顺序）

### 层叠上下文

```css
.element {
  position: relative;  /* 或 absolute/fixed/sticky */
  z-index: 1;  /* 数值越大越在上层 */
}

.modal {
  position: fixed;
  z-index: 9999;  /* 模态框在最上层 */
}

.overlay {
  position: fixed;
  z-index: 9998;
}
```

**层叠顺序（从下到上）：**

```
1. background/border（元素的背景和边框）
2. 负 z-index
3. 块级元素
4. 浮动元素
5. 行内元素
6. z-index: 0 / auto
7. 正 z-index
```

---

## 💻 实战示例

### 示例 1：固定导航栏

```html
<header class="header">
  <nav class="nav">
    <a href="#" class="logo">Logo</a>
    <ul class="menu">
      <li><a href="#">首页</a></li>
      <li><a href="#">产品</a></li>
      <li><a href="#">关于</a></li>
    </ul>
  </nav>
</header>

<main class="main">
  <p>页面内容...</p>
</main>
```

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
  color: #2c3e50;
}

.menu {
  display: flex;
  list-style: none;
  gap: 30px;
}

.menu a {
  text-decoration: none;
  color: #555;
}

.main {
  margin-top: 70px;  /* 为固定导航留出空间 */
  padding: 20px;
}
```

---

### 示例 2：卡片徽章

```html
<div class="card">
  <img src="product.jpg" alt="产品">
  <span class="badge">热卖</span>
  <div class="card-content">
    <h3>产品名称</h3>
    <p>¥99.00</p>
  </div>
</div>
```

```css
.card {
  position: relative;
  width: 250px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 100%;
  display: block;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 12px;
}

.card-content {
  padding: 15px;
}
```

---

### 示例 3：模态框

```html
<div class="modal-overlay">
  <div class="modal">
    <h2>模态框标题</h2>
    <p>模态框内容</p>
    <button class="close-btn">&times;</button>
  </div>
</div>
```

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal {
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解文档流和脱离文档流
- [ ] 会使用 display 属性
- [ ] 会使用浮动和清除浮动
- [ ] 会使用 position 定位
- [ ] 会使用 z-index 控制层叠顺序
- [ ] 能实现常见的布局效果

---

## 📝 练习任务

### 任务 1：两栏布局
使用浮动创建一个两栏布局：
- 左侧固定宽度（250px）侧边栏
- 右侧自适应主内容区

### 任务 2：固定头部
创建一个固定在顶部的导航栏：
- 滚动时保持在顶部
- 包含 logo 和导航链接
- 主内容区不被遮挡

### 任务 3：卡片组件
创建一个产品卡片：
- 图片右上角有折扣标签
- 鼠标悬停显示遮罩层和按钮

---

## 🔗 相关资源

- [MDN 定位](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Positioning)
- [Learn CSS Layout](http://learnlayout.com/)
- [CSS Float](https://css-tricks.com/all-about-floats/)
