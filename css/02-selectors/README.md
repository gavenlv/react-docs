# 02 - CSS 选择器完全指南

## 🎯 本节目标
- 理解 CSS 选择器的作用
- 掌握基础选择器和组合选择器
- 学会使用属性选择器和伪类选择器
- 理解选择器优先级和层叠规则

---

## 📖 什么是选择器？

### 一句话解释

CSS 选择器是用来"选中" HTML 元素的模式。选中元素后，才能给它应用样式。

### 生活类比

想象你在学校点名：

| 学校点名 | CSS 选择器 |
|---------|-----------|
| "张三站起来" | `#zhangsan { ... }` (ID 选择器) |
| "所有男生站起来" | `.male { ... }` (类选择器) |
| "第一排的同学站起来" | `tr:first-child { ... }` (伪类选择器) |
| "穿红色衣服的同学站起来" | `[data-color="red"] { ... }` (属性选择器) |

> 💡 **关键理解**：选择器就是"选中谁"的规则，花括号里是"怎么变"的规则。

---

## 🎯 基础选择器

### 1. 元素选择器（Type Selector）

选中所有指定类型的 HTML 元素。

```css
/* 选中所有段落 */
p {
  color: #333;
  line-height: 1.6;
}

/* 选中所有标题 */
h1 {
  font-size: 32px;
  color: #2c3e50;
}

/* 选中所有链接 */
a {
  color: #3498db;
  text-decoration: none;
}

/* 选中所有按钮 */
button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
}
```

**特点：**
- 优先级最低（权重：0-0-1）
- 影响范围广，适合设置全局样式

---

### 2. 类选择器（Class Selector）⭐ 最常用

选中所有带有指定 class 属性的元素。

```css
/* 定义类名（用 . 开头） */
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.primary {
  background: #3498db;
  color: white;
}

.text-center {
  text-align: center;
}
```

```html
<!-- 使用类名（用 class 属性） -->
<div class="card">
  <h2 class="text-center">标题</h2>
  <p class="text-center">内容</p>
  <button class="primary">按钮</button>
</div>

<!-- 一个元素可以有多个类名（用空格分隔） -->
<div class="card text-center">
  这个元素同时应用 card 和 text-center 的样式
</div>
```

**特点：**
- 优先级中等（权重：0-1-0）
- 可复用，一个类可以应用到多个元素
- 一个元素可以有多个类名
- **最常用的选择器**

---

### 3. ID 选择器（ID Selector）

选中带有指定 id 属性的唯一元素。

```css
/* 定义 ID（用 # 开头） */
#header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  position: fixed;
  top: 0;
  width: 100%;
}

#main-content {
  margin-top: 80px;
  padding: 20px;
}

#footer {
  background: #34495e;
  color: white;
  text-align: center;
  padding: 20px;
}
```

```html
<!-- 使用 ID（用 id 属性） -->
<header id="header">
  <nav>导航栏</nav>
</header>

<main id="main-content">
  主要内容
</main>

<footer id="footer">
  版权信息
</footer>
```

**特点：**
- 优先级高（权重：1-0-0）
- **ID 在页面中必须唯一**
- 不推荐用于样式，主要用于 JavaScript 钩子或页面锚点

⚠️ **最佳实践：**
- 避免用 ID 选择器写样式（优先级太高，难以覆盖）
- ID 主要用于：
  - JavaScript 获取元素：`document.getElementById('header')`
  - 页面内锚点：`<a href="#section1">跳转到第一节</a>`
  - 表单关联：`<label for="username">` 关联 `<input id="username">`

---

### 4. 通配符选择器（Universal Selector）

选中所有元素。

```css
/* 选中所有元素 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 选中某元素的所有子元素 */
.card * {
  color: #333;
}
```

**特点：**
- 优先级最低（权重：0-0-0）
- 性能较差（会遍历所有元素）
- 常用于 CSS Reset

---

## 🔗 组合选择器

### 1. 后代选择器（Descendant Selector）

选中某元素内部的所有指定后代元素（用空格分隔）。

```css
/* 选中 article 内部的所有 p 元素（不管嵌套多深） */
article p {
  color: #555;
  line-height: 1.8;
}

/* 选中 nav 内部的所有 a 元素 */
nav a {
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  display: inline-block;
}

/* 选中 .card 内部的 .title */
.card .title {
  font-size: 24px;
  color: #2c3e50;
}
```

```html
<article>
  <p>这个段落会被选中</p>
  <div>
    <p>这个段落也会被选中（嵌套的后代）</p>
  </div>
</article>

<p>这个段落不会被选中（不在 article 内部）</p>
```

---

### 2. 子选择器（Child Selector）

选中某元素的直接子元素（用 `>` 连接）。

```css
/* 只选中 ul 的直接子元素 li */
ul > li {
  list-style: none;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

/* 只选中 .menu 的直接子元素 a */
.menu > a {
  padding: 15px 20px;
  display: block;
}
```

```html
<ul>
  <li>列表项 1（会被选中）</li>
  <li>
    列表项 2（会被选中）
    <ul>
      <li>嵌套列表项（不会被选中，不是直接子元素）</li>
    </ul>
  </li>
</ul>
```

**后代选择器 vs 子选择器：**

```css
/* 后代选择器：选中所有后代（包括孙子、重孙子...） */
article p {
  color: red;
}

/* 子选择器：只选中直接子元素 */
article > p {
  color: blue;
}
```

---

### 3. 相邻兄弟选择器（Adjacent Sibling Selector）

选中紧接在某元素之后的兄弟元素（用 `+` 连接）。

```css
/* 选中紧跟在 h1 后面的 p 元素 */
h1 + p {
  font-size: 18px;
  color: #7f8c8d;
  font-style: italic;
}

/* 选中紧跟在 input 后面的 label */
input + label {
  margin-left: 10px;
}
```

```html
<h1>标题</h1>
<p>这个段落会被选中（紧跟在 h1 后面）</p>
<p>这个段落不会被选中（前面有其他元素）</p>
```

---

### 4. 通用兄弟选择器（General Sibling Selector）

选中某元素之后的所有兄弟元素（用 `~` 连接）。

```css
/* 选中 h2 后面的所有 p 兄弟元素 */
h2 ~ p {
  color: #555;
}

/* 选中 .active 后面的所有 .item */
.active ~ .item {
  opacity: 0.5;
}
```

```html
<h2>标题</h2>
<p>段落 1（会被选中）</p>
<div>其他元素</div>
<p>段落 2（会被选中）</p>
<p>段落 3（会被选中）</p>
```

---

## 🎨 属性选择器

根据元素的属性及属性值来选择元素。

### 1. 存在属性选择器

```css
/* 选中所有有 disabled 属性的元素 */
[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 选中所有有 target 属性的 a 元素 */
a[target] {
  color: #e74c3c;
}

/* 选中所有有 type 属性的 input */
input[type] {
  padding: 10px;
  border: 1px solid #ddd;
}
```

### 2. 属性值选择器

```css
/* 精确匹配属性值 */
input[type="text"] {
  border: 1px solid #3498db;
}

input[type="password"] {
  border: 1px solid #e74c3c;
}

a[target="_blank"] {
  padding-right: 20px;
  background: url('external-link.svg') no-repeat right center;
}

/* 匹配以某值开头 */
[class^="btn-"] {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

/* 匹配以某值结尾 */
a[href$=".pdf"] {
  padding-left: 20px;
  background: url('pdf-icon.svg') no-repeat left center;
}

/* 匹配包含某值 */
[class*="card"] {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 匹配空格分隔的词列表中的词 */
[class~="button"] {
  display: inline-block;
}
```

```html
<button disabled>禁用按钮</button>

<input type="text" placeholder="文本输入框">
<input type="password" placeholder="密码输入框">

<a href="doc.pdf" target="_blank">下载 PDF</a>

<button class="btn-primary">主要按钮</button>
<button class="btn-secondary">次要按钮</button>
<div class="user-card">用户卡片</div>
```

---

## 🎭 伪类选择器

伪类用于定义元素的特殊状态。

### 1. 用户交互伪类

```css
/* 鼠标悬停 */
a:hover {
  color: #e74c3c;
  text-decoration: underline;
}

button:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 鼠标按下 */
button:active {
  transform: translateY(0);
  box-shadow: none;
}

/* 获得焦点（键盘 Tab 键导航） */
input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

/* 链接访问过 */
a:visited {
  color: #9b59b6;
}

/* 链接未访问 */
a:link {
  color: #3498db;
}
```

### 2. 表单伪类

```css
/* 禁用状态 */
input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

/* 选中状态（复选框、单选框） */
input:checked {
  accent-color: #3498db;
}

/* 必填字段 */
input:required {
  border-left: 3px solid #e74c3c;
}

/* 可选字段 */
input:optional {
  border-left: 3px solid #95a5a6;
}

/* 有效输入 */
input:valid {
  border-color: #27ae60;
}

/* 无效输入 */
input:invalid {
  border-color: #e74c3c;
}

/* 只读字段 */
input:read-only {
  background: #f9f9f9;
}
```

### 3. 结构伪类

```css
/* 第一个子元素 */
li:first-child {
  font-weight: bold;
}

/* 最后一个子元素 */
li:last-child {
  border-bottom: none;
}

/* 第 n 个子元素 */
tr:nth-child(odd) {
  background: #f9f9f9;  /* 奇数行 */
}

tr:nth-child(even) {
  background: white;  /* 偶数行 */
}

tr:nth-child(3) {
  background: #e8f4f8;  /* 第 3 行 */
}

tr:nth-child(3n) {
  background: #f0f0f0;  /* 每 3 个（第 3、6、9...） */
}

tr:nth-child(3n+1) {
  background: #fff;  /* 第 1、4、7... 行 */
}

/* 倒数第 n 个子元素 */
li:nth-last-child(2) {
  color: #e74c3c;
}

/* 唯一子元素 */
div:only-child {
  border: 2px solid #3498db;
}

/* 第一个该类型的子元素 */
p:first-of-type {
  font-size: 20px;
}

/* 最后一个该类型的子元素 */
p:last-of-type {
  margin-bottom: 0;
}

/* 第 n 个该类型的子元素 */
article p:nth-of-type(2) {
  color: #7f8c8d;
}

/* 空元素 */
div:empty {
  display: none;
}

/* 非空元素 */
div:not(:empty) {
  padding: 20px;
}
```

### 4. 否定伪类

```css
/* 选中不是 .special 的所有段落 */
p:not(.special) {
  color: #555;
}

/* 选中不是第一个子元素的 li */
li:not(:first-child) {
  border-top: 1px solid #eee;
}

/* 选中未被禁用的按钮 */
button:not(:disabled) {
  cursor: pointer;
}

/* 选中不包含 .active 类的元素 */
.item:not(.active) {
  opacity: 0.5;
}
```

---

## 🎪 伪元素选择器

伪元素用于创建或样式化元素的特定部分。

### 1. ::before 和 ::after

在元素内容的前面或后面插入内容。

```css
/* 必须配合 content 属性使用 */
.quote::before {
  content: '"';
  font-size: 40px;
  color: #3498db;
}

.quote::after {
  content: '"';
  font-size: 40px;
  color: #3498db;
}

/* 添加图标 */
.external-link::after {
  content: ' ↗';
  color: #e74c3c;
}

/* 清除浮动 */
.clearfix::after {
  content: '';
  display: table;
  clear: both;
}

/* 添加序号 */
.step::before {
  content: counter(step) '. ';
  counter-increment: step;
  font-weight: bold;
  color: #3498db;
}
```

### 2. ::first-letter 和 ::first-line

样式化首字母或首行。

```css
/* 首字母下沉效果 */
article p::first-letter {
  font-size: 48px;
  float: left;
  line-height: 1;
  margin-right: 10px;
  color: #3498db;
  font-weight: bold;
}

/* 首行样式 */
article p::first-line {
  font-weight: bold;
  color: #2c3e50;
}
```

### 3. ::selection

样式化用户选中的文本。

```css
::selection {
  background: #3498db;
  color: white;
}

::-moz-selection {
  background: #3498db;
  color: white;
}
```

---

## ⚖️ 选择器优先级（Specificity）

当多个选择器选中同一个元素时，优先级高的生效。

### 优先级计算规则

优先级用一个三元组表示：(a, b, c)

- **a**: ID 选择器的数量
- **b**: 类选择器、属性选择器、伪类的数量
- **c**: 元素选择器、伪元素的数量

比较规则：从左到右比较，a 大的优先级高；a 相同比较 b，以此类推。

```css
/* 优先级：(1, 0, 0) */
#header {
  color: red;
}

/* 优先级：(0, 1, 0) */
.header {
  color: blue;
}

/* 优先级：(0, 0, 1) */
header {
  color: green;
}

/* 优先级：(1, 1, 0) */
#header .nav {
  color: purple;  /* 这个会生效 */
}

/* 优先级：(0, 2, 1) */
.header .nav ul {
  color: orange;
}

/* 优先级：(1, 0, 1) */
#header nav {
  color: pink;
}
```

### 优先级示例

```css
/* 优先级从低到高 */

/* (0, 0, 1) */
p { color: black; }

/* (0, 0, 2) */
div p { color: gray; }

/* (0, 1, 0) */
.text { color: blue; }

/* (0, 1, 1) */
p.text { color: green; }

/* (0, 2, 0) */
.text.highlight { color: yellow; }

/* (1, 0, 0) */
#intro { color: orange; }

/* (1, 0, 1) */
#intro p { color: red; }

/* (1, 1, 0) */
#intro.text { color: purple; }

/* 最高优先级：!important（不推荐使用） */
p { color: pink !important; }
```

### 优先级最佳实践

```css
/* ❌ 不推荐：使用 ID 和 !important */
#main-content .article-title {
  color: #333 !important;
}

/* ✅ 推荐：使用类选择器，保持低优先级 */
.article-title {
  color: #333;
}

/* ✅ 推荐：使用 BEM 命名规范 */
.card {}
.card__title {}
.card__title--large {}
```

---

## 💻 实战示例：导航栏

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>导航栏示例</title>
  <style>
    /* 全局样式 */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* 导航栏 */
    nav {
      background: #2c3e50;
      padding: 0 20px;
    }

    nav ul {
      list-style: none;
      display: flex;
    }

    /* 导航项 */
    nav > ul > li {
      position: relative;
    }

    nav > ul > li > a {
      display: block;
      padding: 20px 25px;
      color: white;
      text-decoration: none;
      transition: background 0.3s;
    }

    /* 悬停效果 */
    nav > ul > li > a:hover {
      background: #34495e;
    }

    /* 激活状态 */
    nav > ul > li > a.active {
      background: #3498db;
    }

    /* 下拉菜单 */
    nav ul ul {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: #34495e;
      min-width: 200px;
      flex-direction: column;
    }

    nav ul li:hover > ul {
      display: flex;
    }

    nav ul ul li a {
      padding: 15px 20px;
      border-bottom: 1px solid #3d566e;
    }

    nav ul ul li:last-child a {
      border-bottom: none;
    }

    nav ul ul li a:hover {
      background: #3d566e;
    }
  </style>
</head>
<body>
  <nav>
    <ul>
      <li><a href="#" class="active">首页</a></li>
      <li>
        <a href="#">产品</a>
        <ul>
          <li><a href="#">产品 A</a></li>
          <li><a href="#">产品 B</a></li>
          <li><a href="#">产品 C</a></li>
        </ul>
      </li>
      <li><a href="#">关于我们</a></li>
      <li><a href="#">联系方式</a></li>
    </ul>
  </nav>
</body>
</html>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握基础选择器（元素、类、ID、通配符）
- [ ] 会使用组合选择器（后代、子、兄弟）
- [ ] 会使用属性选择器
- [ ] 会使用常用伪类（:hover, :focus, :nth-child 等）
- [ ] 会使用伪元素（::before, ::after）
- [ ] 理解选择器优先级并会计算

---

## 📝 练习任务

### 任务 1：选择器练习
给定以下 HTML，编写 CSS 选择器：
```html
<div id="app">
  <header class="header">
    <nav>
      <ul>
        <li class="nav-item active"><a href="#">首页</a></li>
        <li class="nav-item"><a href="#">产品</a></li>
      </ul>
    </nav>
  </header>
  <main class="content">
    <article class="post">
      <h2>标题</h2>
      <p>段落 1</p>
      <p class="highlight">段落 2</p>
    </article>
  </main>
</div>
```

要求：
1. 选中 header 中的所有链接
2. 选中激活状态的导航项
3. 选中 article 中的第一个段落
4. 选中带有 highlight 类的段落
5. 选中第 2 个导航项

### 任务 2：表格样式
创建一个表格，使用伪类实现：
- 奇偶行不同背景色
- 鼠标悬停行高亮
- 第一行（表头）加粗

---

## 🔗 相关资源

- [CSS 选择器参考手册](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors)
- [CSS Diner - 选择器游戏](https://flukeout.github.io/)
- [Specificity Calculator](https://specificity.keegan.st/)
