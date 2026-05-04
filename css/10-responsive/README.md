# 10 - 响应式设计

## 🎯 本节目标
- 理解响应式设计的概念和原则
- 掌握视口设置和媒体查询
- 学会使用相对单位和流式布局
- 掌握移动优先的设计方法

---

## 📖 什么是响应式设计？

### 一句话解释

响应式设计（Responsive Web Design）是一种让网页能够自动适应不同设备和屏幕尺寸的设计方法。

### 核心技术

1. **流式网格布局**（Fluid Grid）
2. **弹性图片**（Flexible Images）
3. **媒体查询**（Media Queries）

---

## 📱 视口设置

### viewport meta 标签

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**属性说明：**
- `width=device-width`: 视口宽度等于设备宽度
- `initial-scale=1.0`: 初始缩放比例为 1
- `maximum-scale=1.0`: 最大缩放比例（不推荐，影响可访问性）
- `user-scalable=no`: 禁止用户缩放（不推荐）

---

## 📏 相对单位

### 1. 百分比（%）

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.sidebar {
  width: 25%;
}

.main {
  width: 75%;
}
```

---

### 2. em 和 rem

```css
/* em: 相对于父元素的字体大小 */
.parent {
  font-size: 16px;
}

.child {
  font-size: 1.5em;  /* 24px */
  padding: 1em;      /* 24px */
}

/* rem: 相对于根元素的字体大小 ⭐ 推荐 */
html {
  font-size: 16px;
}

h1 {
  font-size: 2rem;  /* 32px */
}

p {
  font-size: 1rem;  /* 16px */
  padding: 1rem;    /* 16px */
}
```

---

### 3. vw 和 vh

```css
/* vw: 视口宽度的 1% */
/* vh: 视口高度的 1% */

.hero {
  width: 100vw;
  height: 100vh;
  background: url('hero.jpg') center/cover;
}

.title {
  font-size: 5vw;  /* 视口宽度的 5% */
}
```

---

### 4. vmin 和 vmax

```css
/* vmin: vw 和 vh 中较小的值 */
/* vmax: vw 和 vh 中较大的值 */

.square {
  width: 50vmin;
  height: 50vmin;
}
```

---

## 🎨 媒体查询

### 基本语法

```css
/* 基本结构 */
@media (条件) {
  /* CSS 规则 */
}

/* 常用断点 */
/* 手机 */
@media (max-width: 575.98px) { }

/* 平板 */
@media (min-width: 576px) and (max-width: 767.98px) { }

/* 桌面 */
@media (min-width: 768px) and (max-width: 991.98px) { }

/* 大桌面 */
@media (min-width: 992px) and (max-width: 1199.98px) { }

/* 超大桌面 */
@media (min-width: 1200px) { }
```

---

### 媒体特性

```css
/* 宽度 */
@media (min-width: 768px) { }
@media (max-width: 767px) { }

/* 高度 */
@media (min-height: 600px) { }

/* 方向 */
@media (orientation: portrait) { }   /* 竖屏 */
@media (orientation: landscape) { }  /* 横屏 */

/* 分辨率 */
@media (-webkit-min-device-pixel-ratio: 2) { }
@media (min-resolution: 192dpi) { }

/* 组合条件 */
@media (min-width: 768px) and (orientation: landscape) { }
@media (max-width: 575px), print { }
```

---

### 移动优先 vs 桌面优先

```css
/* 移动优先（推荐）⭐ */
.element {
  /* 默认样式（移动端） */
  font-size: 14px;
}

@media (min-width: 768px) {
  /* 平板及以上 */
  .element {
    font-size: 16px;
  }
}

@media (min-width: 992px) {
  /* 桌面及以上 */
  .element {
    font-size: 18px;
  }
}

/* 桌面优先 */
.element {
  /* 默认样式（桌面端） */
  font-size: 18px;
}

@media (max-width: 991px) {
  /* 平板及以下 */
  .element {
    font-size: 16px;
  }
}

@media (max-width: 767px) {
  /* 手机 */
  .element {
    font-size: 14px;
  }
}
```

---

## 🌊 流式布局

### 弹性容器

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
```

---

### 弹性网格

```css
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col {
  flex: 1;
  padding: 0 15px;
}

/* 响应式列 */
.col-12 { flex: 0 0 100%; }
.col-6 { flex: 0 0 50%; }
.col-4 { flex: 0 0 33.333%; }
.col-3 { flex: 0 0 25%; }

@media (max-width: 767px) {
  .col-6, .col-4, .col-3 {
    flex: 0 0 100%;
  }
}
```

---

### 弹性图片

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 背景图片 */
.hero {
  background-image: url('hero.jpg');
  background-size: cover;
  background-position: center;
}
```

---

## 💻 实战示例

### 示例 1：响应式导航

```html
<nav class="navbar">
  <a href="#" class="logo">Logo</a>
  <button class="menu-toggle">☰</button>
  <ul class="menu">
    <li><a href="#">首页</a></li>
    <li><a href="#">产品</a></li>
    <li><a href="#">关于</a></li>
  </ul>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.menu {
  display: flex;
  list-style: none;
  gap: 30px;
}

/* 移动端 */
@media (max-width: 767px) {
  .menu-toggle {
    display: block;
  }
  
  .menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .menu.active {
    display: flex;
  }
}
```

---

### 示例 2：响应式卡片网格

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

---

### 示例 3：响应式字体

```css
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 18px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 20px;
  }
}

/* 或使用 clamp() */
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解响应式设计的三要素
- [ ] 会设置 viewport meta 标签
- [ ] 会使用相对单位（rem、vw、vh）
- [ ] 会使用媒体查询
- [ ] 理解移动优先的设计方法
- [ ] 能实现响应式布局

---

## 📝 练习任务

### 任务 1：响应式页面
创建一个响应式个人作品集页面：
- 移动端：单列布局
- 平板：两列布局
- 桌面：三列布局

### 任务 2：响应式导航
实现一个移动端显示汉堡菜单的响应式导航栏。

### 任务 3：响应式图片画廊
创建一个自动适应屏幕宽度的图片画廊。

---

## 🔗 相关资源

- [MDN 响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Responsive Web Design](https://alistapart.com/article/responsive-web-design/)
- [Viewports](https://viewports.fyi/)
