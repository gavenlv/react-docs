# 08 - CSS Grid 网格布局

## 🎯 本节目标
- 理解 CSS Grid 的基本概念
- 掌握网格容器和网格项目属性
- 学会使用 Grid 实现复杂布局
- 理解网格区域和命名

---

## 📖 什么是 Grid？

### 一句话解释

CSS Grid 是一种二维布局系统,可以同时控制行和列,适合构建复杂的页面布局。

### Grid vs Flexbox

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用场景 | 组件内部布局 | 页面整体布局 |
| 对齐方式 | 主轴/交叉轴 | 行/列独立控制 |
| 内容驱动 | ✅ 适合 | ❌ 不适合 |
| 布局驱动 | ❌ 不适合 | ✅ 适合 |

> 💡 **最佳实践**：页面整体布局用 Grid,组件内部布局用 Flexbox。

---

## 🎯 Grid 基础

### 容器和项目

```html
<div class="container">  <!-- Grid 容器 -->
  <div class="item">1</div>  <!-- Grid 项目 -->
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.container {
  display: grid;  /* 或 inline-grid */
}
```

---

## 📦 容器属性

### 1. grid-template-columns 和 grid-template-rows

```css
.container {
  display: grid;
  
  /* 固定大小 */
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
  
  /* 百分比 */
  grid-template-columns: 25% 50% 25%;
  
  /* fr 单位（fraction，比例单位）⭐ 常用 */
  grid-template-columns: 1fr 2fr 1fr;  /* 1:2:1 比例 */
  
  /* repeat() 函数 */
  grid-template-columns: repeat(3, 1fr);  /* 三个等宽列 */
  grid-template-columns: repeat(3, 100px 50px);  /* 重复模式 */
  
  /* auto-fill 和 auto-fit */
  grid-template-columns: repeat(auto-fill, 250px);  /* 自动填充 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  /* 响应式 ⭐ */
  
  /* minmax() 函数 */
  grid-template-columns: minmax(200px, 1fr) 2fr;
  
  /* auto */
  grid-template-columns: auto 1fr auto;  /* 左右自适应，中间扩展 */
}
```

---

### 2. grid-gap（间距）

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  
  gap: 20px;           /* 行列间距 */
  gap: 20px 10px;      /* 行间距 列间距 */
  row-gap: 20px;       /* 行间距 */
  column-gap: 10px;    /* 列间距 */
}
```

---

### 3. grid-template-areas（网格区域命名）

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

---

### 4. grid-auto-flow（自动放置方向）

```css
.container {
  display: grid;
  
  grid-auto-flow: row;    /* 默认：逐行填充 */
  grid-auto-flow: column; /* 逐列填充 */
  grid-auto-flow: dense;  /* 紧凑填充 */
}
```

---

### 5. 对齐属性

```css
.container {
  display: grid;
  height: 500px;
  
  /* 整个网格在容器中的对齐 */
  justify-content: center;     /* 水平居中 */
  align-content: center;       /* 垂直居中 */
  
  /* 网格项目在单元格中的对齐 */
  justify-items: center;       /* 水平居中 */
  align-items: center;         /* 垂直居中 */
  
  /* place-* 简写 */
  place-items: center;         /* align-items justify-items */
  place-content: center;       /* align-content justify-content */
}
```

---

## 📌 项目属性

### 1. grid-column 和 grid-row

```css
.item {
  /* 跨列 */
  grid-column: 1 / 3;      /* 从第 1 条线到第 3 条线（跨 2 列） */
  grid-column: span 2;     /* 跨 2 列 */
  grid-column-start: 1;
  grid-column-end: 3;
  
  /* 跨行 */
  grid-row: 1 / 3;         /* 从第 1 条线到第 3 条线（跨 2 行） */
  grid-row: span 2;        /* 跨 2 行 */
}
```

---

### 2. grid-area

```css
.item {
  grid-area: header;  /* 使用命名区域 */
  
  /* 或指定位置 */
  grid-area: 1 / 1 / 3 / 4;  /* row-start / col-start / row-end / col-end */
}
```

---

### 3. 自身对齐

```css
.item {
  justify-self: start;   /* 水平对齐 */
  justify-self: end;
  justify-self: center;
  justify-self: stretch;
  
  align-self: center;    /* 垂直对齐 */
  
  place-self: center;    /* 简写 */
}
```

---

## 💻 实战示例

### 示例 1：经典布局

```html
<div class="layout">
  <header class="header">Header</header>
  <nav class="nav">Nav</nav>
  <main class="main">Main</main>
  <aside class="aside">Aside</aside>
  <footer class="footer">Footer</footer>
</div>
```

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  min-height: 100vh;
  gap: 20px;
}

.header { grid-area: header; background: #3498db; }
.nav { grid-area: nav; background: #f0f0f0; }
.main { grid-area: main; background: white; }
.aside { grid-area: aside; background: #f0f0f0; }
.footer { grid-area: footer; background: #2c3e50; color: white; }
```

---

### 示例 2：响应式图片网格

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.gallery img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
}
```

---

### 示例 3：卡片布局

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 Grid 的二维布局概念
- [ ] 会使用 grid-template-columns 和 grid-template-rows
- [ ] 会使用 fr、minmax()、repeat()
- [ ] 会使用 grid-template-areas 命名区域
- [ ] 会使用 grid-column 和 grid-row 跨行跨列
- [ ] 能实现常见的 Grid 布局

---

## 📝 练习任务

### 任务 1：圣杯布局
使用 Grid 实现圣杯布局（三栏布局）。

### 任务 2：图片画廊
创建一个响应式图片画廊,自动适应不同屏幕尺寸。

### 任务 3：复杂布局
实现一个包含以下区域的布局：
- 顶部横跨全屏的 header
- 左侧固定宽度导航
- 中间主内容区
- 右侧侧边栏
- 底部横跨全屏的 footer

---

## 🔗 相关资源

- [Grid Garden](https://cssgridgarden.com/) - 学习游戏
- [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Grid by Example](https://gridbyexample.com/)
