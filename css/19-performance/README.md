# 19 - CSS 性能优化

## 🎯 本节目标
- 理解 CSS 性能优化的重要性
- 掌握 CSS 加载和渲染优化
- 学会减少 CSS 文件大小
- 掌握关键渲染路径优化

---

## 📊 CSS 性能指标

### 关键指标

- **FCP**（First Contentful Paint）：首次内容绘制
- **LCP**（Largest Contentful Paint）：最大内容绘制
- **TTI**（Time to Interactive）：可交互时间

---

## 🚀 加载优化

### 1. 压缩 CSS

```bash
# 使用工具压缩
cssnano
clean-css
```

---

### 2. 合并文件

```html
<!-- ❌ 避免：多个 CSS 文件 -->
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="header.css">
<link rel="stylesheet" href="footer.css">

<!-- ✅ 推荐：合并为一个文件 -->
<link rel="stylesheet" href="main.css">
```

---

### 3. 异步加载

```html
<!-- 非关键 CSS 异步加载 -->
<link 
  rel="stylesheet" 
  href="non-critical.css" 
  media="print" 
  onload="this.media='all'"
>

<!-- 或使用 preload -->
<link 
  rel="preload" 
  href="styles.css" 
  as="style"
  onload="this.rel='stylesheet'"
>
```

---

### 4. 内联关键 CSS

```html
<head>
  <!-- 内联关键 CSS -->
  <style>
    .header { /* 关键样式 */ }
    .hero { /* 关键样式 */ }
  </style>
  
  <!-- 异步加载其余 CSS -->
  <link rel="preload" href="main.css" as="style" onload="this.rel='stylesheet'">
</head>
```

---

## ⚡ 渲染优化

### 1. 避免阻塞渲染

```html
<!-- 放在 head 中 -->
<link rel="stylesheet" href="styles.css">

<!-- 或使用 media 属性 -->
<link rel="stylesheet" href="print.css" media="print">
```

---

### 2. 减少重排和重绘

```css
/* ❌ 触发重排 */
.element {
  width: 100px;
  height: 100px;
  margin: 10px;
}

/* ✅ 使用 transform（只触发合成） */
.element {
  transform: translate(10px, 10px) scale(1.1);
}
```

---

### 3. 使用 will-change

```css
/* 提示浏览器优化 */
.element {
  will-change: transform, opacity;
}
```

---

### 4. 避免强制同步布局

```javascript
// ❌ 避免：强制同步布局
element.style.width = '100px';
const height = element.offsetHeight; // 强制布局

// ✅ 推荐：批量读取和写入
const height = element.offsetHeight; // 先读取
element.style.width = '100px';       // 后写入
```

---

## 📦 文件大小优化

### 1. 删除未使用的 CSS

```bash
# 使用工具
PurgeCSS
UnCSS
```

---

### 2. 简化选择器

```css
/* ❌ 复杂选择器 */
.header .nav .menu .item .link { }

/* ✅ 简化选择器 */
.nav-link { }
```

---

### 3. 使用简写属性

```css
/* ❌ 冗长 */
.element {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}

/* ✅ 简写 */
.element {
  margin: 10px 20px;
}
```

---

### 4. 使用 CSS 变量

```css
/* ❌ 重复值 */
.btn-primary { background: #3498db; }
.btn-secondary { background: #95a5a6; }
.card { background: #3498db; }

/* ✅ 使用变量 */
:root {
  --primary: #3498db;
  --secondary: #95a5a6;
}

.btn-primary { background: var(--primary); }
.card { background: var(--primary); }
```

---

## 🎯 选择器性能

### 选择器效率（从高到低）

```
1. ID 选择器        #id
2. 类选择器         .class
3. 属性选择器       [type="text"]
4. 伪类             :hover
5. 元素选择器       div
6. 通配符           *
7. 后代选择器       div p
```

---

### 最佳实践

```css
/* ❌ 避免：从右到左匹配效率低 */
.header .nav .menu .item .link { }

/* ✅ 推荐：使用类选择器 */
.nav-link { }

/* ❌ 避免：通配符 */
* { }

/* ✅ 推荐：具体选择器 */
.header { }
```

---

## 💻 实战技巧

### 1. 使用 CSS Containment

```css
.card {
  contain: layout;  /* 限制布局影响范围 */
}

.modal {
  contain: strict;  /* 严格隔离 */
}
```

---

### 2. 使用 Content-visibility

```css
.off-screen {
  content-visibility: auto;  /* 跳过屏幕外内容渲染 */
}
```

---

### 3. 优化字体加载

```css
@font-face {
  font-family: 'MyFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;  /* 立即显示后备字体 */
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 CSS 性能指标
- [ ] 会优化 CSS 加载
- [ ] 会减少重排和重绘
- [ ] 会优化文件大小
- [ ] 会使用性能工具

---

## 📝 练习任务

### 任务 1：性能分析
使用 Lighthouse 分析页面性能。

### 任务 2：优化加载
优化 CSS 加载策略。

### 任务 3：减少重排
重构代码减少重排。

---

## 🔗 相关资源

- [CSS Performance](https://developer.mozilla.org/zh-CN/docs/Web/Performance/CSS_performance)
- [Critical Rendering Path](https://web.dev/critical-rendering-path/)
- [CSS Containment](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Containment)
