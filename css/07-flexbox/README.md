# 07 - Flexbox 弹性布局

## 🎯 本节目标
- 理解 Flexbox 的基本概念
- 掌握容器属性和项目属性
- 学会使用 Flexbox 实现常见布局
- 理解 Flexbox 的对齐和分布

---

## 📖 什么是 Flexbox？

### 一句话解释

Flexbox（Flexible Box）是一种一维布局模型，用于在容器中对齐和分布子元素，即使子元素的大小未知或动态变化。

### 生活类比

想象你在整理书架：

| 传统布局 | Flexbox 布局 |
|---------|-------------|
| 每本书固定位置 | 书可以自动调整位置 |
| 书多了放不下 | 书自动缩小适应空间 |
| 书少了有空隙 | 书自动扩展填满空间 |
| 需要手动对齐 | 自动对齐和分布 |

> 💡 **关键理解**：Flexbox 让容器中的子元素"灵活"地适应可用空间，自动调整大小和位置。

---

## 🎯 Flexbox 基础

### 容器和项目

```html
<div class="container">  <!-- Flex 容器 -->
  <div class="item">1</div>  <!-- Flex 项目 -->
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.container {
  display: flex;  /* 或 inline-flex */
}
```

### 主轴和交叉轴

```
主轴（Main Axis）：默认水平方向（→）
交叉轴（Cross Axis）：默认垂直方向（↓）

┌─────────────────────────────────┐
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │      │ ← 主轴
│  └───┘ └───┘ └───┘ └───┘      │
│                                 │
│  ↑                              │
│  交叉轴                          │
└─────────────────────────────────┘
```

---

## 📦 容器属性

### 1. flex-direction（主轴方向）

```css
.container {
  display: flex;
  
  flex-direction: row;            /* 默认：水平方向，从左到右 → */
  flex-direction: row-reverse;    /* 水平方向，从右到左 ← */
  flex-direction: column;         /* 垂直方向，从上到下 ↓ */
  flex-direction: column-reverse; /* 垂直方向，从下到上 ↑ */
}
```

---

### 2. flex-wrap（换行）

```css
.container {
  display: flex;
  
  flex-wrap: nowrap;       /* 默认：不换行，项目会缩小 */
  flex-wrap: wrap;         /* 换行，第一行在上 */
  flex-wrap: wrap-reverse; /* 换行，第一行在下 */
}
```

---

### 3. flex-flow（简写）

```css
.container {
  flex-flow: row wrap;  /* flex-direction + flex-wrap */
}
```

---

### 4. justify-content（主轴对齐）

```css
.container {
  display: flex;
  
  justify-content: flex-start;    /* 默认：起点对齐 */
  justify-content: flex-end;      /* 终点对齐 */
  justify-content: center;        /* 居中对齐 ⭐ 常用 */
  justify-content: space-between; /* 两端对齐，项目间隔相等 ⭐ 常用 */
  justify-content: space-around;  /* 项目两侧间隔相等 */
  justify-content: space-evenly;  /* 所有间隔完全相等 */
}
```

**可视化：**

```
flex-start:    [■■■■      ]
flex-end:      [      ■■■■]
center:        [   ■■■■   ]
space-between: [■■    ■■  ]
space-around:  [ ■■  ■■  ]
space-evenly:  [  ■■  ■■  ]
```

---

### 5. align-items（交叉轴对齐）

```css
.container {
  display: flex;
  height: 200px;
  
  align-items: stretch;     /* 默认：拉伸填满容器 */
  align-items: flex-start;  /* 起点对齐 */
  align-items: flex-end;    /* 终点对齐 */
  align-items: center;      /* 居中对齐 ⭐ 常用 */
  align-items: baseline;    /* 基线对齐 */
}
```

---

### 6. align-content（多根轴线对齐）

```css
.container {
  display: flex;
  flex-wrap: wrap;
  height: 400px;
  
  align-content: stretch;       /* 默认：拉伸填满 */
  align-content: flex-start;    /* 起点对齐 */
  align-content: flex-end;      /* 终点对齐 */
  align-content: center;        /* 居中对齐 */
  align-content: space-between; /* 两端对齐 */
  align-content: space-around;  /* 间隔相等 */
}
```

---

### 7. gap（项目间距）

```css
.container {
  display: flex;
  
  gap: 20px;           /* 所有方向间距 */
  gap: 20px 10px;      /* 行间距 列间距 */
  row-gap: 20px;       /* 行间距 */
  column-gap: 10px;    /* 列间距 */
}
```

---

## 📌 项目属性

### 1. order（排序）

```css
.item:first-child {
  order: 1;  /* 默认为 0，数值小的在前 */
}

.item:last-child {
  order: -1;  /* 这个项目会排在最前面 */
}
```

---

### 2. flex-grow（放大比例）

```css
.item {
  flex-grow: 0;  /* 默认：不放大 */
}

.item.grow {
  flex-grow: 1;  /* 放大，占据剩余空间 */
}

.item.grow-2 {
  flex-grow: 2;  /* 放大比例是其他项目的 2 倍 */
}
```

---

### 3. flex-shrink（缩小比例）

```css
.item {
  flex-shrink: 1;  /* 默认：空间不足时等比缩小 */
}

.item.no-shrink {
  flex-shrink: 0;  /* 不缩小 */
}
```

---

### 4. flex-basis（初始大小）

```css
.item {
  flex-basis: auto;   /* 默认：使用项目本身大小 */
  flex-basis: 200px;  /* 固定初始大小 */
  flex-basis: 25%;    /* 百分比 */
}
```

---

### 5. flex（简写）

```css
.item {
  flex: none;  /* 0 0 auto */
  flex: auto;  /* 1 1 auto */
  flex: 1;     /* 1 1 0% ⭐ 常用 */
  flex: 0 0 200px;  /* 不放大 不缩小 固定200px */
}
```

---

### 6. align-self（单独对齐）

```css
.item {
  align-self: auto;       /* 继承父元素 */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: baseline;
  align-self: stretch;
}
```

---

## 💻 实战示例

### 示例 1：水平垂直居中

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.item {
  /* 自动居中 */
}
```

---

### 示例 2：导航栏

```html
<nav class="navbar">
  <a href="#" class="logo">Logo</a>
  <ul class="menu">
    <li><a href="#">首页</a></li>
    <li><a href="#">产品</a></li>
    <li><a href="#">关于</a></li>
  </ul>
  <button class="btn">登录</button>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu {
  display: flex;
  gap: 30px;
  list-style: none;
}
```

---

### 示例 3：卡片网格

```html
<div class="card-grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px;  /* 最小300px，自动扩展 */
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

---

### 示例 4：圣杯布局

```html
<div class="holy-grail">
  <header>Header</header>
  <div class="content">
    <nav>Nav</nav>
    <main>Main</main>
    <aside>Sidebar</aside>
  </div>
  <footer>Footer</footer>
</div>
```

```css
.holy-grail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header, footer {
  padding: 20px;
  background: #3498db;
  color: white;
}

.content {
  display: flex;
  flex: 1;  /* 占据剩余空间 */
}

nav {
  width: 200px;
  background: #f0f0f0;
  padding: 20px;
}

main {
  flex: 1;  /* 占据剩余空间 */
  padding: 20px;
}

aside {
  width: 200px;
  background: #f0f0f0;
  padding: 20px;
}
```

---

### 示例 5：等高列

```html
<div class="columns">
  <div class="column">
    <h3>标题 1</h3>
    <p>短内容</p>
  </div>
  <div class="column">
    <h3>标题 2</h3>
    <p>中等长度的内容...</p>
  </div>
  <div class="column">
    <h3>标题 3</h3>
    <p>很长的内容...</p>
  </div>
</div>
```

```css
.columns {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 自动等高 */
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 Flexbox 的主轴和交叉轴
- [ ] 会使用 justify-content 和 align-items
- [ ] 会使用 flex-grow、flex-shrink、flex-basis
- [ ] 会使用 flex 简写属性
- [ ] 能实现常见的 Flexbox 布局
- [ ] 会使用 gap 设置间距

---

## 📝 练习任务

### 任务 1：居中布局
使用 Flexbox 实现一个登录表单的水平和垂直居中。

### 任务 2：响应式卡片
创建一个响应式卡片网格：
- 大屏幕：4 列
- 中等屏幕：3 列
- 小屏幕：1 列

### 任务 3：复杂布局
实现一个包含以下元素的页面：
- 固定高度的顶部导航栏
- 左侧固定宽度侧边栏
- 右侧自适应主内容区
- 固定高度的底部栏

---

## 🔗 相关资源

- [Flexbox Froggy](https://flexboxfroggy.com/) - 学习游戏
- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Flexbox Defense](http://www.flexboxdefense.com/)
