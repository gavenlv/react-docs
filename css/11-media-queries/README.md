# 11 - 媒体查询与适配

## 🎯 本节目标
- 深入掌握媒体查询的使用
- 学会针对不同设备优化样式
- 掌握容器查询的使用
- 理解响应式图片技术

---

## 📺 媒体查询深入

### 媒体类型

```css
/* all - 所有设备（默认） */
@media all { }

/* screen - 屏幕 */
@media screen { }

/* print - 打印 */
@media print { }

/* speech - 屏幕阅读器 */
@media speech { }
```

---

### 媒体特性

```css
/* 宽度和高度 */
@media (width: 600px) { }
@media (min-width: 768px) { }
@media (max-width: 767px) { }
@media (height: 800px) { }
@media (min-height: 600px) { }

/* 设备宽高 */
@media (device-width: 1920px) { }
@media (device-height: 1080px) { }

/* 方向 */
@media (orientation: portrait) { }   /* 竖屏 */
@media (orientation: landscape) { }  /* 横屏 */

/* 宽高比 */
@media (aspect-ratio: 16/9) { }
@media (min-aspect-ratio: 16/9) { }

/* 颜色 */
@media (color) { }
@media (min-color: 8) { }

/* 分辨率 */
@media (resolution: 300dpi) { }
@media (-webkit-min-device-pixel-ratio: 2) { }
@media (min-resolution: 2dppx) { }

/* 悬停能力 */
@media (hover: hover) { }     /* 支持悬停 */
@media (hover: none) { }      /* 不支持悬停 */

/* 指针精度 */
@media (pointer: fine) { }    /* 鼠标 */
@media (pointer: coarse) { }  /* 触摸屏 */

/* 颜色方案 */
@media (prefers-color-scheme: dark) { }
@media (prefers-color-scheme: light) { }

/* 减少动画 */
@media (prefers-reduced-motion: reduce) { }
```

---

### 逻辑操作符

```css
/* and - 与 */
@media (min-width: 768px) and (max-width: 991px) { }

/* or - 或（逗号） */
@media (max-width: 575px), print { }

/* not - 非 */
@media not print { }

/* only - 仅（兼容旧浏览器） */
@media only screen and (min-width: 768px) { }
```

---

## 📱 设备适配

### 常见断点

```css
/* 超小屏幕（手机，< 576px） */
@media (max-width: 575.98px) { }

/* 小屏幕（手机横屏，≥ 576px） */
@media (min-width: 576px) and (max-width: 767.98px) { }

/* 中等屏幕（平板，≥ 768px） */
@media (min-width: 768px) and (max-width: 991.98px) { }

/* 大屏幕（桌面，≥ 992px） */
@media (min-width: 992px) and (max-width: 1199.98px) { }

/* 超大屏幕（大桌面，≥ 1200px） */
@media (min-width: 1200px) and (max-width: 1399.98px) { }

/* 超超大屏幕（≥ 1400px） */
@media (min-width: 1400px) { }
```

---

### 打印样式

```css
@media print {
  /* 隐藏不需要打印的元素 */
  nav, footer, .ads, .sidebar {
    display: none;
  }
  
  /* 设置打印字体 */
  body {
    font-size: 12pt;
    color: black;
    background: white;
  }
  
  /* 避免分页 */
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  /* 强制分页 */
  .chapter {
    page-break-before: always;
  }
  
  /* 链接显示 URL */
  a[href]::after {
    content: " (" attr(href) ")";
  }
}
```

---

### 暗黑模式

```css
/* 自动适配系统主题 */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .card {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }
}

/* 手动切换 */
body.dark-theme {
  background: #1a1a1a;
  color: #e0e0e0;
}
```

---

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

## 🎯 容器查询（Container Queries）

### 基本用法

```css
/* 定义容器 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 基于容器宽度设置样式 */
@container card (min-width: 400px) {
  .card {
    display: flex;
    gap: 20px;
  }
  
  .card-image {
    width: 200px;
  }
}

@container card (max-width: 399px) {
  .card {
    flex-direction: column;
  }
}
```

---

### 容器查询单位

```css
.card {
  /* cqw: 容器宽度的 1% */
  /* cqh: 容器高度的 1% */
  /* cqi: 容器内联尺寸的 1% */
  /* cqb: 容器块尺寸的 1% */
  /* cqmin: min(cqi, cqb) */
  /* cqmax: max(cqi, cqb) */
  
  font-size: clamp(1rem, 5cqw, 2rem);
  padding: 2cqw;
}
```

---

## 🖼️ 响应式图片

### srcset 和 sizes

```html
<img 
  src="image-800.jpg"
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 900px) 50vw,
    33vw
  "
  alt="响应式图片"
>
```

---

### picture 元素

```html
<picture>
  <!-- WebP 格式（现代浏览器） -->
  <source 
    type="image/webp"
    srcset="image.webp"
  >
  
  <!-- 不同尺寸 -->
  <source 
    media="(min-width: 900px)"
    srcset="image-large.jpg"
  >
  <source 
    media="(min-width: 600px)"
    srcset="image-medium.jpg"
  >
  
  <!-- 默认图片 -->
  <img src="image-small.jpg" alt="响应式图片">
</picture>
```

---

### 艺术指导

```html
<picture>
  <!-- 桌面：横向裁剪 -->
  <source 
    media="(min-width: 900px)"
    srcset="hero-desktop.jpg"
  >
  
  <!-- 移动端：纵向裁剪 -->
  <source 
    media="(max-width: 899px)"
    srcset="hero-mobile.jpg"
  >
  
  <img src="hero-desktop.jpg" alt="英雄图片">
</picture>
```

---

## 💻 实战示例

### 示例 1：响应式卡片组件

```css
.card-container {
  container-type: inline-size;
}

.card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
  
  .card-image {
    width: 40%;
  }
  
  .card-content {
    width: 60%;
    padding: 20px;
  }
}
```

---

### 示例 2：暗黑模式切换

```css
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --card-bg: #f5f5f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --card-bg: #2a2a2a;
  }
}

/* 手动切换 */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --card-bg: #2a2a2a;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
  transition: background 0.3s, color 0.3s;
}

.card {
  background: var(--card-bg);
}
```

---

### 示例 3：打印优化

```css
@media print {
  @page {
    size: A4;
    margin: 2cm;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: black;
    background: white;
  }
  
  nav, footer, .no-print {
    display: none;
  }
  
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }
  
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  img, table {
    max-width: 100%;
    page-break-inside: avoid;
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握媒体查询的各种特性
- [ ] 会针对不同设备优化样式
- [ ] 会使用容器查询
- [ ] 会实现暗黑模式
- [ ] 会优化打印样式
- [ ] 会使用响应式图片技术

---

## 📝 练习任务

### 任务 1：响应式布局
创建一个在不同设备上表现良好的响应式页面。

### 任务 2：暗黑模式
实现一个支持系统主题和手动切换的暗黑模式。

### 任务 3：打印样式
为一个博客文章页面添加打印样式优化。

---

## 🔗 相关资源

- [MDN 媒体查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries)
- [CSS Container Queries](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Container_Queries)
- [Responsive Images](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
