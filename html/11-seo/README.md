# 11 - SEO 优化

## 🎯 本节目标
- 理解 SEO 的概念
- 掌握 SEO 相关的 HTML 标签
- 了解结构化数据
- 学会优化页面 SEO

---

## 📖 什么是 SEO？

SEO（Search Engine Optimization）即搜索引擎优化，是提高网站在搜索引擎中排名的技术。

---

## 🏷️ SEO 相关标签

### title 标签

```html
<title>关键词 - 网站名称</title>
```

### meta 描述

```html
<meta name="description" content="页面描述，150字以内，包含关键词">
```

### meta 关键词

```html
<meta name="keywords" content="关键词1, 关键词2, 关键词3">
```

### 语义化标签

```html
<h1>主标题（每页一个）</h1>
<h2>副标题</h2>
<article>文章内容</article>
```

---

## 📊 结构化数据

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "datePublished": "2024-01-15"
}
</script>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 SEO 概念
- [ ] 设置 title 和 meta 标签
- [ ] 使用语义化标签
- [ ] 了解结构化数据

---

## 🔗 相关资源

- [Google SEO 指南](https://developers.google.com/search/docs)
