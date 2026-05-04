# 04 - 文字排版与字体

## 🎯 本节目标
- 掌握 CSS 字体属性的使用
- 学会设置文字样式和排版
- 理解字体加载和性能优化
- 掌握响应式字体设置

---

## 📖 字体基础

### 字体族（font-family）

```css
body {
  /* 推荐写法：指定多个备选字体 */
  font-family: 
    -apple-system,           /* macOS 和 iOS 系统字体 */
    BlinkMacSystemFont,      /* Chrome 系统字体 */
    "Segoe UI",              /* Windows 系统字体 */
    "Roboto",                /* Android 系统字体 */
    "Helvetica Neue",        /* macOS 备选字体 */
    Arial,                   /* 通用字体 */
    sans-serif;              /* 最后的备选：无衬线字体 */
}

/* 衬线字体（适合长文本阅读） */
.article {
  font-family: "Georgia", "Times New Roman", serif;
}

/* 等宽字体（适合代码） */
code {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
}
```

**字体分类：**
- `serif`: 衬线字体（如 Times New Roman、Georgia）
- `sans-serif`: 无衬线字体（如 Arial、Helvetica）
- `monospace`: 等宽字体（如 Courier、Consolas）
- `cursive`: 手写字体
- `fantasy`: 装饰字体

---

### 字体大小（font-size）

```css
/* 绝对单位 */
.text {
  font-size: 16px;      /* 像素（最常用） */
  font-size: 12pt;      /* 点（打印用） */
}

/* 相对单位 */
.text {
  font-size: 1em;       /* 相对于父元素的字体大小 */
  font-size: 1rem;      /* 相对于根元素（html）的字体大小 ⭐ 推荐 */
  font-size: 100%;      /* 相对于父元素的字体大小 */
  font-size: 1vw;       /* 视口宽度的 1% */
}

/* 关键字 */
.text {
  font-size: medium;    /* 默认值（通常 16px） */
  font-size: small;
  font-size: large;
  font-size: x-large;
  font-size: xx-large;
}
```

**推荐使用 rem：**

```css
html {
  font-size: 16px;  /* 基准大小 */
}

h1 {
  font-size: 2rem;    /* 32px */
}

h2 {
  font-size: 1.5rem;  /* 24px */
}

p {
  font-size: 1rem;    /* 16px */
}

.small {
  font-size: 0.875rem; /* 14px */
}
```

---

### 字体粗细（font-weight）

```css
.text {
  font-weight: normal;   /* 400 - 正常 */
  font-weight: bold;     /* 700 - 粗体 */
  font-weight: lighter;  /* 比父元素更细 */
  font-weight: bolder;   /* 比父元素更粗 */
  
  /* 数值（100-900，以 100 为单位） */
  font-weight: 100;  /* Thin */
  font-weight: 200;  /* Extra Light */
  font-weight: 300;  /* Light */
  font-weight: 400;  /* Normal */
  font-weight: 500;  /* Medium */
  font-weight: 600;  /* Semi Bold */
  font-weight: 700;  /* Bold */
  font-weight: 800;  /* Extra Bold */
  font-weight: 900;  /* Black */
}
```

---

### 字体样式（font-style）

```css
.text {
  font-style: normal;   /* 正常 */
  font-style: italic;   /* 斜体（使用字体的斜体设计） */
  font-style: oblique;  /* 倾斜（强制倾斜文本） */
}
```

---

## 🎨 文字样式

### 颜色（color）

```css
.text {
  /* 关键字 */
  color: red;
  color: blue;
  
  /* 十六进制 */
  color: #333;
  color: #3498db;
  
  /* RGB */
  color: rgb(52, 152, 219);
  
  /* RGBA（带透明度） */
  color: rgba(52, 152, 219, 0.8);
  
  /* HSL */
  color: hsl(204, 70%, 53%);
  
  /* 当前颜色 */
  color: currentColor;
}
```

---

### 行高（line-height）

```css
.text {
  /* 无单位值（推荐）- 相对于字体大小 */
  line-height: 1.6;    /* 字体大小的 1.6 倍 */
  
  /* 数值 */
  line-height: 24px;   /* 固定值 */
  line-height: 1.5em;  /* 相对于字体大小 */
  line-height: 150%;   /* 相对于字体大小 */
}

/* 垂直居中技巧 */
.single-line {
  height: 50px;
  line-height: 50px;  /* 行高等于高度 */
}
```

---

### 文本对齐（text-align）

```css
.text {
  text-align: left;      /* 左对齐（默认） */
  text-align: center;    /* 居中对齐 */
  text-align: right;     /* 右对齐 */
  text-align: justify;   /* 两端对齐 */
  text-align: start;     /* 开始边对齐（支持 RTL） */
  text-align: end;       /* 结束边对齐 */
}
```

---

### 文本装饰（text-decoration）

```css
.text {
  text-decoration: none;          /* 无装饰 */
  text-decoration: underline;     /* 下划线 */
  text-decoration: overline;      /* 上划线 */
  text-decoration: line-through;  /* 删除线 */
  
  /* 简写形式 */
  text-decoration: underline wavy red;  /* 样式 颜色 */
}

/* 链接样式 */
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

---

### 文本缩进（text-indent）

```css
p {
  text-indent: 2em;   /* 首行缩进两个字符 */
  text-indent: 30px;  /* 固定像素 */
}

/* 隐藏文本（用于 logo） */
.logo {
  text-indent: -9999px;
  overflow: hidden;
}
```

---

### 字母和单词间距

```css
.text {
  letter-spacing: 2px;    /* 字母间距 */
  letter-spacing: 0.1em;
  
  word-spacing: 5px;      /* 单词间距 */
  word-spacing: 0.3em;
}
```

---

### 文本转换（text-transform）

```css
.text {
  text-transform: none;        /* 默认 */
  text-transform: uppercase;   /* 全大写 */
  text-transform: lowercase;   /* 全小写 */
  text-transform: capitalize;  /* 首字母大写 */
}
```

---

### 文本阴影（text-shadow）

```css
.text {
  /* x偏移 y偏移 模糊半径 颜色 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  
  /* 多层阴影 */
  text-shadow: 
    1px 1px 0 #fff,
    2px 2px 0 #333;
}
```

---

## 📐 高级排版

### 文本溢出处理

```css
/* 单行文本溢出显示省略号 */
.ellipsis {
  white-space: nowrap;      /* 不换行 */
  overflow: hidden;         /* 隐藏溢出 */
  text-overflow: ellipsis;  /* 显示省略号 */
  width: 200px;             /* 必须设置宽度 */
}

/* 多行文本溢出显示省略号 */
.ellipsis-multiline {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;    /* 显示 3 行 */
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

### 文字换行

```css
.text {
  word-wrap: break-word;      /* 允许长单词换行 */
  word-break: break-all;      /* 允许在任意位置换行 */
  word-break: break-word;     /* 同 break-word */
  white-space: nowrap;        /* 不换行 */
  white-space: pre;           /* 保留空格和换行 */
  white-space: pre-wrap;      /* 保留空格，自动换行 */
}
```

---

### 垂直对齐（vertical-align）

```css
/* 用于行内元素和表格单元格 */
.element {
  vertical-align: baseline;   /* 基线对齐（默认） */
  vertical-align: top;        /* 顶部对齐 */
  vertical-align: middle;     /* 中部对齐 */
  vertical-align: bottom;     /* 底部对齐 */
  vertical-align: text-top;   /* 文本顶部对齐 */
  vertical-align: text-bottom; /* 文本底部对齐 */
  vertical-align: 5px;        /* 相对于基线偏移 */
}
```

---

## 🌐 Web 字体

### 使用 Google Fonts

```html
<!-- 在 HTML 中引入 -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
```

```css
/* 在 CSS 中使用 */
body {
  font-family: 'Roboto', sans-serif;
}
```

---

### 使用本地字体

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('fonts/myfont.woff2') format('woff2'),
       url('fonts/myfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;  /* 字体加载策略 */
}

body {
  font-family: 'MyCustomFont', sans-serif;
}
```

**字体格式：**
- `.woff2`: Web Open Font Format 2（推荐，压缩率最高）
- `.woff`: Web Open Font Format
- `.ttf`: TrueType Font
- `.otf`: OpenType Font
- `.eot`: Embedded OpenType（仅 IE）

---

### 字体加载策略（font-display）

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  font-display: auto;      /* 浏览器默认 */
  font-display: block;     /* 先隐藏文本，加载后显示 */
  font-display: swap;      /* 先显示后备字体，加载后替换 ⭐ 推荐 */
  font-display: fallback;  /* 短时间隐藏，超时用后备字体 */
  font-display: optional;  /* 可能不加载字体 */
}
```

---

## 📱 响应式字体

### 使用 clamp() 函数

```css
.text {
  /* 最小值 首选值 最大值 */
  font-size: clamp(1rem, 2.5vw, 2rem);
  
  /* 等价于 */
  font-size: max(1rem, min(2.5vw, 2rem));
}

h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

p {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
}
```

---

### 使用媒体查询

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
```

---

### 使用容器查询

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card-title {
    font-size: 1.5rem;
  }
}
```

---

## 💻 实战示例：文章排版

```html
<article class="article">
  <h1 class="article-title">文章标题</h1>
  <div class="article-meta">
    <span class="author">作者：张三</span>
    <time datetime="2024-01-15">2024年1月15日</time>
  </div>
  <p class="article-intro">
    这是一段介绍文字，通常会稍微突出显示。
  </p>
  <p>正文内容...</p>
  <blockquote class="quote">
    "这是一段引用文字"
  </blockquote>
  <p>更多正文内容...</p>
</article>
```

```css
.article {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: "Georgia", "Times New Roman", serif;
  color: #333;
  line-height: 1.8;
}

.article-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.3;
  margin-bottom: 20px;
}

.article-meta {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.article-meta span,
.article-meta time {
  margin-right: 20px;
}

.article-intro {
  font-size: 1.25rem;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 30px;
}

.article p {
  margin-bottom: 1.5em;
  text-align: justify;
  text-indent: 2em;
}

.quote {
  font-size: 1.25rem;
  font-style: italic;
  color: #555;
  padding: 20px 30px;
  border-left: 4px solid #3498db;
  background: #f9f9f9;
  margin: 30px 0;
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 会使用 font-family 设置字体
- [ ] 会使用 font-size、font-weight、font-style
- [ ] 会设置文字颜色、行高、对齐
- [ ] 会处理文本溢出和换行
- [ ] 会使用 Web 字体
- [ ] 会设置响应式字体

---

## 📝 练习任务

### 任务 1：排版练习
创建一个博客文章页面，包含：
- 标题（h1-h6）
- 段落
- 引用
- 列表
- 代码块

### 任务 2：响应式字体
使用 clamp() 创建一个响应式标题系统：
- h1: 2rem - 4rem
- h2: 1.5rem - 3rem
- h3: 1.25rem - 2rem

---

## 🔗 相关资源

- [Google Fonts](https://fonts.google.com/)
- [MDN 字体](https://developer.mozilla.org/zh-CN/docs/Web/CSS/font)
- [Type Scale](https://type-scale.com/)
