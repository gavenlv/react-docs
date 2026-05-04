# 08 - 语义化标签

## 🎯 本节目标
- 理解语义化的重要性
- 掌握 HTML5 语义化标签
- 学会正确使用语义标签
- 了解 SEO 优化

---

## 📖 什么是语义化？

语义化是指使用恰当的 HTML 标签来描述内容的含义，而不仅仅是外观。

### 为什么要语义化？

- **SEO 优化**：搜索引擎更好地理解页面内容
- **无障碍访问**：屏幕阅读器能正确解读
- **代码可读性**：开发者更容易理解代码结构
- **维护性**：便于团队协作和后期维护

---

## 🏗️ 页面结构标签

### header

```html
<header>
  <h1>网站标题</h1>
  <nav>导航</nav>
</header>
```

### nav

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

### main

```html
<main>
  <h1>主要内容</h1>
  <p>页面的核心内容...</p>
</main>
```

### article

```html
<article>
  <h2>文章标题</h2>
  <p>文章内容...</p>
</article>
```

### section

```html
<section>
  <h2>章节标题</h2>
  <p>章节内容...</p>
</section>
```

### aside

```html
<aside>
  <h3>相关链接</h3>
  <ul>...</ul>
</aside>
```

### footer

```html
<footer>
  <p>&copy; 2024 版权所有</p>
</footer>
```

---

## 📋 语义化标签对比

| 标签 | 用途 | 使用场景 |
|------|------|------|
| `<header>` | 页眉/区块头部 | 网站顶部、文章头部 |
| `<nav>` | 导航 | 主导航、侧边导航 |
| `<main>` | 主要内容 | 页面核心内容（唯一） |
| `<article>` | 独立内容 | 文章、帖子、评论 |
| `<section>` | 主题分组 | 内容分区、章节 |
| `<aside>` | 附属内容 | 侧边栏、广告 |
| `<footer>` | 页脚/区块底部 | 网站底部、文章底部 |

---

## 📰 文章结构

```html
<article>
  <header>
    <h1>文章标题</h1>
    <time datetime="2024-01-15">2024年1月15日</time>
    <address>作者：<a href="#">张三</a></address>
  </header>
  
  <section>
    <h2>第一章</h2>
    <p>内容...</p>
  </section>
  
  <section>
    <h2>第二章</h2>
    <p>内容...</p>
  </section>
  
  <footer>
    <p>标签：HTML, CSS</p>
  </footer>
</article>
```

---

## 🎯 其他语义标签

### figure 和 figcaption

```html
<figure>
  <img src="image.jpg" alt="图片描述">
  <figcaption>图片说明文字</figcaption>
</figure>
```

### details 和 summary

```html
<details>
  <summary>点击展开</summary>
  <p>隐藏的内容...</p>
</details>
```

### mark

```html
<p>搜索结果中的<mark>关键词</mark>高亮显示</p>
```

### time

```html
<time datetime="2024-01-15">2024年1月15日</time>
<time datetime="2024-01-15T14:30">下午2:30</time>
```

---

## 💻 完整页面结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>语义化页面</title>
</head>
<body>
  <header>
    <h1>网站名称</h1>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <header>
        <h1>文章标题</h1>
      </header>
      
      <section>
        <h2>章节一</h2>
        <p>内容...</p>
      </section>
      
      <footer>
        <p>作者：张三</p>
      </footer>
    </article>
    
    <aside>
      <h2>相关文章</h2>
      <ul>...</ul>
    </aside>
  </main>
  
  <footer>
    <p>&copy; 2024 版权所有</p>
  </footer>
</body>
</html>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解语义化的概念和重要性
- [ ] 掌握页面结构标签
- [ ] 正确使用 article 和 section
- [ ] 了解其他语义标签
- [ ] 能够构建语义化的页面结构

---

## 🔗 相关资源

- [MDN - 语义化](https://developer.mozilla.org/zh-CN/docs/Glossary/Semantics)
