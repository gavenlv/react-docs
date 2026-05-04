# 09 - 定位与层叠上下文

## 🎯 本节目标
- 深入理解 CSS 定位
- 掌握层叠上下文的概念
- 学会使用 z-index 控制层叠顺序
- 理解定位的实际应用场景

---

## 📍 定位回顾

### position 属性值

```css
.element {
  position: static;    /* 默认：正常文档流 */
  position: relative;  /* 相对定位：相对于自身 */
  position: absolute;  /* 绝对定位：相对于定位祖先 */
  position: fixed;     /* 固定定位：相对于视口 */
  position: sticky;    /* 粘性定位：滚动时固定 */
}
```

---

## 🔍 深入理解定位

### 1. relative 定位详解

```css
.relative {
  position: relative;
  top: 20px;     /* 向下移动 20px */
  left: 30px;    /* 向右移动 30px */
  
  /* 特点：
     1. 不脱离文档流
     2. 原始位置保留
     3. 常用作绝对定位的参考容器
  */
}
```

**常见用途：**
- 微调元素位置
- 为绝对定位子元素提供参考
- 创建层叠上下文

---

### 2. absolute 定位详解

```css
.parent {
  position: relative;  /* 创建定位参考 */
}

.absolute {
  position: absolute;
  top: 0;
  right: 0;
  
  /* 特点：
     1. 脱离文档流
     2. 相对于最近的定位祖先
     3. 如果没有定位祖先，相对于初始包含块
  */
}
```

**常见用途：**
- 徽章、标签
- 模态框
- 工具提示
- 下拉菜单

---

### 3. fixed 定位详解

```css
.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  
  /* 特点：
     1. 脱离文档流
     2. 相对于视口定位
     3. 不随页面滚动
  */
}
```

**常见用途：**
- 固定导航栏
- 返回顶部按钮
- 模态框遮罩
- 浮动广告

---

### 4. sticky 定位详解

```css
.sticky {
  position: sticky;
  top: 0;
  
  /* 特点：
     1. 相对定位和固定定位的混合
     2. 滚动到指定位置时变为固定
     3. 需要指定 top/bottom/left/right
  */
}
```

**常见用途：**
- 粘性表头
- 粘性导航
- 侧边栏

---

## 📊 层叠上下文

### 什么是层叠上下文？

层叠上下文是 HTML 元素的三维概念,想象成一系列层叠的平面。

### 创建层叠上下文的条件

```css
/* 1. position + z-index */
.element {
  position: relative;  /* 或 absolute/fixed/sticky */
  z-index: auto;       /* auto 不创建层叠上下文 */
  z-index: 0;          /* 数值创建层叠上下文 */
}

/* 2. opacity */
.element {
  opacity: 1;   /* 不创建 */
  opacity: 0.9; /* 创建 */
}

/* 3. transform */
.element {
  transform: none;        /* 不创建 */
  transform: translateZ(0); /* 创建 */
}

/* 4. filter */
.element {
  filter: blur(0);  /* 创建 */
}

/* 5. will-change */
.element {
  will-change: transform;  /* 创建 */
}

/* 6. isolation */
.element {
  isolation: isolate;  /* 创建 */
}

/* 7. Flex/Grid 子项 */
.flex-child {
  z-index: 0;  /* Flex/Grid 子项的 z-index 会创建层叠上下文 */
}
```

---

### 层叠顺序

从下到上：

```
1. 背景和边框（形成层叠上下文的元素）
2. 负 z-index 子元素
3. 块级元素
4. 浮动元素
5. 行内元素
6. z-index: 0 / auto
7. 正 z-index 子元素
```

---

### z-index 使用技巧

```css
/* 推荐的 z-index 层级管理 */
:root {
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

.dropdown { z-index: var(--z-dropdown); }
.modal { z-index: var(--z-modal); }
.tooltip { z-index: var(--z-tooltip); }
```

---

## 💻 实战示例

### 示例 1：下拉菜单

```html
<div class="dropdown">
  <button class="dropdown-toggle">菜单</button>
  <ul class="dropdown-menu">
    <li><a href="#">选项 1</a></li>
    <li><a href="#">选项 2</a></li>
  </ul>
</div>
```

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 10px 0;
  min-width: 150px;
  display: none;
  z-index: 1000;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  display: block;
  padding: 8px 20px;
  color: #333;
  text-decoration: none;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
}
```

---

### 示例 2：工具提示

```html
<button class="btn-tooltip" data-tooltip="这是一个提示">
  悬停查看提示
</button>
```

```css
.btn-tooltip {
  position: relative;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
}

.btn-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 1000;
}

.btn-tooltip:hover::after {
  opacity: 1;
  visibility: visible;
  bottom: calc(100% + 10px);
}
```

---

### 示例 3：粘性表头

```css
.table-container {
  height: 400px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  position: sticky;
  top: 0;
  background: #f0f0f0;
  z-index: 10;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 深入理解各种定位方式
- [ ] 理解层叠上下文的概念
- [ ] 会使用 z-index 控制层叠顺序
- [ ] 能实现常见的定位效果
- [ ] 理解粘性定位的使用场景

---

## 📝 练习任务

### 任务 1：模态框
创建一个居中的模态框,包含遮罩层和关闭按钮。

### 任务 2：粘性导航
实现一个滚动时固定在顶部的导航栏。

### 任务 3：复杂层叠
创建一个包含多个层叠元素的页面,正确使用 z-index。

---

## 🔗 相关资源

- [MDN 定位](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position)
- [层叠上下文](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [What No One Told You About Z-Index](https://philipwalton.com/articles/what-no-one-told-you-about-z-index/)
