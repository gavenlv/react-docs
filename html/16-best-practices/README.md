# 16 - 最佳实践

## 🎯 本节目标
- 掌握 HTML 代码规范
- 了解性能优化
- 学会代码组织

---

## 📝 代码规范

### 文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

### 语义化

```html
<!-- 推荐 -->
<article>
  <h2>标题</h2>
  <p>内容</p>
</article>

<!-- 不推荐 -->
<div class="article">
  <div class="title">标题</div>
  <div class="content">内容</div>
</div>
```

---

## ⚡ 性能优化

- 压缩 HTML
- 懒加载图片
- 减少 DOM 嵌套
- 使用语义化标签

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 遵循代码规范
- [ ] 优化页面性能
- [ ] 组织代码结构

---

## 🔗 相关资源

- [HTML 最佳实践](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
