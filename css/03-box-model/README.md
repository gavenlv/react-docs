# 03 - 盒模型深度解析

## 🎯 本节目标
- 理解 CSS 盒模型的概念
- 掌握 content、padding、border、margin 的使用
- 理解标准盒模型和 IE 盒模型的区别
- 学会使用 box-sizing 属性

---

## 📖 什么是盒模型？

### 一句话解释

CSS 盒模型是网页布局的基础概念，每个 HTML 元素都被看作一个"盒子"，由内容（content）、内边距（padding）、边框（border）和外边距（margin）组成。

### 生活类比

想象一个快递包裹：

| 快递包裹 | CSS 盒模型 |
|---------|-----------|
| 商品本身 | content（内容） |
| 泡沫填充物 | padding（内边距） |
| 纸箱厚度 | border（边框） |
| 与其他包裹的间距 | margin（外边距） |

> 💡 **关键理解**：理解盒模型是掌握 CSS 布局的第一步，所有元素都遵循盒模型规则。

---

## 📦 盒模型的组成

### 盒模型结构图

```
┌─────────────────────────────────────────┐
│                 margin                   │
│   ┌─────────────────────────────────┐   │
│   │             border               │   │
│   │   ┌─────────────────────────┐   │   │
│   │   │        padding           │   │   │
│   │   │   ┌─────────────────┐   │   │   │
│   │   │   │                 │   │   │   │
│   │   │   │    content      │   │   │   │
│   │   │   │                 │   │   │   │
│   │   │   └─────────────────┘   │   │   │
│   │   │        padding           │   │   │
│   │   └─────────────────────────┘   │   │
│   │             border               │   │
│   └─────────────────────────────────┘   │
│                 margin                   │
└─────────────────────────────────────────┘
```

### 1. Content（内容区域）

内容区域是元素实际内容的区域，大小由 width 和 height 决定。

```css
.box {
  width: 300px;      /* 内容宽度 */
  height: 200px;     /* 内容高度 */
  background: #3498db;
}
```

---

### 2. Padding（内边距）

内边距是内容区域和边框之间的空间。

```css
.box {
  width: 300px;
  height: 200px;
  background: #3498db;
  
  /* padding 简写 */
  padding: 20px;              /* 四周都是 20px */
  padding: 10px 20px;         /* 上下 10px，左右 20px */
  padding: 10px 20px 15px;    /* 上 10px，左右 20px，下 15px */
  padding: 10px 20px 15px 25px; /* 上、右、下、左（顺时针） */
  
  /* 单独设置 */
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 15px;
  padding-left: 25px;
}
```

**视觉效果：**
- padding 会扩大元素的背景区域
- padding 会影响元素的总大小（标准盒模型下）

---

### 3. Border（边框）

边框是包围在内边距和内容外的线。

```css
.box {
  width: 300px;
  height: 200px;
  padding: 20px;
  
  /* border 简写 */
  border: 1px solid #333;     /* 宽度 样式 颜色 */
  
  /* 单独设置 */
  border-width: 2px;
  border-style: solid;        /* solid | dashed | dotted | double */
  border-color: #3498db;
  
  /* 单边设置 */
  border-top: 1px solid #333;
  border-right: 2px dashed #e74c3c;
  border-bottom: 3px dotted #27ae60;
  border-left: 4px double #f39c12;
  
  /* 圆角 */
  border-radius: 10px;        /* 四个角 */
  border-radius: 10px 20px;   /* 左上右下 左下右上 */
  border-radius: 50%;         /* 圆形 */
}
```

**边框样式：**
- `solid`: 实线
- `dashed`: 虚线
- `dotted`: 点线
- `double`: 双线
- `none`: 无边框
- `hidden`: 隐藏边框

---

### 4. Margin（外边距）

外边距是元素与其他元素之间的空间。

```css
.box {
  width: 300px;
  height: 200px;
  padding: 20px;
  border: 1px solid #333;
  
  /* margin 简写 */
  margin: 20px;               /* 四周都是 20px */
  margin: 10px 20px;          /* 上下 10px，左右 20px */
  margin: 10px 20px 15px;     /* 上 10px，左右 20px，下 15px */
  margin: 10px 20px 15px 25px; /* 上、右、下、左 */
  
  /* 单独设置 */
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 15px;
  margin-left: 25px;
  
  /* 水平居中 */
  margin: 0 auto;             /* 上下 0，左右自动 */
  
  /* 负 margin */
  margin-top: -10px;          /* 向上移动 10px */
}
```

**注意事项：**
- margin 不会影响元素本身的大小
- margin 不会显示背景色
- margin 可以为负值（padding 和 border 不能为负）

---

## ⚖️ 标准盒模型 vs IE 盒模型

### 标准盒模型（content-box）

**width/height 只包含 content**

```css
.box {
  box-sizing: content-box;  /* 默认值 */
  width: 300px;
  padding: 20px;
  border: 5px solid #333;
  
  /* 实际宽度 = 300 + 20*2 + 5*2 = 350px */
}
```

### IE 盒模型（border-box）⭐ 推荐

**width/height 包含 content + padding + border**

```css
.box {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 5px solid #333;
  
  /* 实际宽度 = 300px（包含了 padding 和 border） */
  /* content 宽度 = 300 - 20*2 - 5*2 = 250px */
}
```

### 对比图

```
标准盒模型（content-box）：
┌─────────────────────────────────────┐
│              350px                   │
│  ┌───────────────────────────────┐  │
│  │          340px                 │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │       300px             │  │  │
│  │  │   ┌─────────────────┐   │  │  │
│  │  │   │                 │   │  │  │
│  │  │   │    content      │   │  │  │
│  │  │   │                 │   │  │  │
│  │  │   └─────────────────┘   │  │  │
│  │  │       padding            │  │  │
│  │  └─────────────────────────┘  │  │
│  │          border               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

IE 盒模型（border-box）：
┌─────────────────────────────────────┐
│              300px                   │
│  ┌───────────────────────────────┐  │
│  │          290px                 │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │       250px             │  │  │
│  │  │   ┌─────────────────┐   │  │  │
│  │  │   │                 │   │  │  │
│  │  │   │    content      │   │  │  │
│  │  │   │                 │   │  │  │
│  │  │   └─────────────────┘   │  │  │
│  │  │       padding            │  │  │
│  │  └─────────────────────────┘  │  │
│  │          border               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 最佳实践

**全局使用 border-box：**

```css
/* 推荐的 CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
```

**为什么推荐 border-box？**
- ✅ 更直观：设置的宽度就是实际宽度
- ✅ 更容易计算：不需要手动减去 padding 和 border
- ✅ 布局更稳定：改变 padding 和 border 不会破坏布局

---

## 📏 盒模型相关属性

### 1. width 和 height

```css
.box {
  /* 固定宽高 */
  width: 300px;
  height: 200px;
  
  /* 百分比 */
  width: 100%;
  height: 50vh;  /* 视口高度的 50% */
  
  /* 最小/最大宽高 */
  min-width: 200px;
  max-width: 1200px;
  min-height: 100px;
  max-height: 500px;
  
  /* 自动 */
  width: auto;   /* 默认值 */
  height: auto;
}
```

### 2. overflow

当内容超出盒子时如何处理。

```css
.box {
  width: 300px;
  height: 200px;
  
  overflow: visible;  /* 默认：显示溢出内容 */
  overflow: hidden;   /* 隐藏溢出内容 */
  overflow: scroll;   /* 始终显示滚动条 */
  overflow: auto;     /* 内容溢出时显示滚动条 */
  
  /* 单独设置 */
  overflow-x: hidden;  /* 水平方向隐藏溢出 */
  overflow-y: auto;    /* 垂直方向自动滚动 */
}
```

### 3. display

控制元素的显示类型。

```css
/* 块级元素 */
div {
  display: block;  /* 独占一行，可设置宽高 */
}

/* 行内元素 */
span {
  display: inline;  /* 不换行，不能设置宽高 */
}

/* 行内块元素 */
button {
  display: inline-block;  /* 不换行，可以设置宽高 */
}

/* 隐藏元素 */
.hidden {
  display: none;  /* 完全隐藏，不占空间 */
  visibility: hidden;  /* 隐藏但占空间 */
  opacity: 0;  /* 透明但占空间且可交互 */
}
```

---

## 🎯 盒模型实战

### 示例 1：卡片组件

```html
<div class="card">
  <img src="photo.jpg" alt="照片" class="card-image">
  <div class="card-content">
    <h3 class="card-title">卡片标题</h3>
    <p class="card-text">这是一段描述文字</p>
  </div>
</div>
```

```css
.card {
  width: 300px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 20px;
}

.card-title {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #2c3e50;
}

.card-text {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.6;
}
```

### 示例 2：按钮组件

```css
.btn {
  display: inline-block;
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border-color: #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}
```

---

## ⚠️ 常见问题

### 1. Margin 合并（Margin Collapsing）

垂直方向上相邻的 margin 会合并，取较大的值。

```css
.box1 {
  margin-bottom: 30px;
}

.box2 {
  margin-top: 20px;
}

/* 两个盒子之间的间距是 30px，不是 50px */
```

**解决方法：**
- 使用 padding 代替 margin
- 使用 BFC（块级格式化上下文）
- 使用 Flexbox 或 Grid 布局

### 2. 行内元素的盒模型

行内元素（`span`、`a` 等）不能设置 width 和 height。

```css
/* ❌ 无效 */
span {
  width: 200px;
  height: 100px;
}

/* ✅ 改为 inline-block 或 block */
span {
  display: inline-block;
  width: 200px;
  height: 100px;
}
```

### 3. 百分比宽度的计算

```css
.parent {
  width: 500px;
  padding: 20px;
}

.child {
  width: 50%;  /* 250px（基于父元素的 content 宽度） */
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解盒模型的四个组成部分
- [ ] 会使用 padding、border、margin
- [ ] 理解标准盒模型和 IE 盒模型的区别
- [ ] 会使用 box-sizing: border-box
- [ ] 理解 margin 合并现象

---

## 📝 练习任务

### 任务 1：计算元素大小
给定以下 CSS，计算元素的实际宽度和高度：

```css
.box {
  box-sizing: content-box;
  width: 200px;
  height: 150px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
}
```

### 任务 2：创建布局
使用盒模型知识创建以下布局：
- 一个固定宽度（800px）居中的容器
- 内部包含三个并排的卡片（每个宽度 250px，间距 25px）
- 每个卡片有内边距、边框和阴影

---

## 🔗 相关资源

- [MDN 盒模型](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/The_box_model)
- [CSS Box Model](https://www.w3schools.com/css/css_boxmodel.asp)
