# 02 - 文档结构

## 🎯 本节目标
- 理解 HTML 文档的基本结构
- 掌握 DOCTYPE 声明
- 了解 head 元素的作用
- 学会设置文档元数据

---

## 📄 文档结构概览

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述">
  <meta name="keywords" content="关键词">
  <meta name="author" content="作者">
  <title>页面标题</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js"></script>
</head>
<body>
  <!-- 页面内容 -->
</body>
</html>
```

---

## 📋 DOCTYPE 声明

```html
<!DOCTYPE html>
```

- 必须位于文档第一行
- 告诉浏览器使用 HTML5 标准解析
- 不区分大小写

---

## 🏠 html 元素

```html
<html lang="zh-CN">
  <!-- 文档内容 -->
</html>
```

### lang 属性

| 值 | 语言 |
|------|------|
| `zh-CN` | 简体中文 |
| `zh-TW` | 繁体中文 |
| `en` | 英语 |
| `ja` | 日语 |

---

## 🧠 head 元素

head 包含文档的元数据，不会显示在页面上。

### meta 标签

```html
<!-- 字符编码 -->
<meta charset="UTF-8">

<!-- 视口设置（响应式设计必需） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- SEO 相关 -->
<meta name="description" content="页面描述，用于搜索引擎">
<meta name="keywords" content="关键词1, 关键词2">
<meta name="author" content="作者名">

<!-- IE 兼容模式 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- 缓存控制 -->
<meta http-equiv="Cache-Control" content="no-cache">
```

### title 标签

```html
<title>页面标题 | 网站名</title>
```

- 显示在浏览器标签页
- 用于搜索引擎结果
- 收藏夹默认名称

### link 标签

```html
<!-- 样式表 -->
<link rel="stylesheet" href="style.css">

<!-- 网站图标 -->
<link rel="icon" href="favicon.ico">

<!-- RSS 订阅 -->
<link rel="alternate" type="application/rss+xml" href="rss.xml">
```

### script 标签

```html
<!-- 外部脚本 -->
<script src="script.js"></script>

<!-- 内联脚本 -->
<script>
  console.log('Hello');
</script>

<!-- 延迟执行 -->
<script src="script.js" defer></script>

<!-- 异步加载 -->
<script src="script.js" async></script>
```

---

## 📦 body 元素

body 包含页面的可见内容。

```html
<body>
  <header>页眉</header>
  <nav>导航</nav>
  <main>
    <article>文章</article>
  </main>
  <aside>侧边栏</aside>
  <footer>页脚</footer>
</body>
```

---

## 💻 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="一个完整的 HTML 文档示例">
  <meta name="keywords" content="HTML, 教程, 示例">
  <meta name="author" content="前端开发者">
  <title>完整文档示例</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="favicon.ico">
</head>
<body>
  <header>
    <h1>网站标题</h1>
  </header>
  
  <nav>
    <a href="/">首页</a>
    <a href="/about">关于</a>
  </nav>
  
  <main>
    <h2>主要内容</h2>
    <p>这是页面的主要内容区域。</p>
  </main>
  
  <footer>
    <p>&copy; 2024 版权所有</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 HTML 文档的基本结构
- [ ] 会使用 DOCTYPE 声明
- [ ] 掌握 meta 标签的使用
- [ ] 了解 link 和 script 标签
- [ ] 能够创建完整的 HTML 文档

---

## 🔗 相关资源

- [MDN - HTML 文档结构](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure)
