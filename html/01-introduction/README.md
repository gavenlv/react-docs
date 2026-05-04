# 01 - HTML 简介

## 🎯 本节目标
- 理解 HTML 的概念和作用
- 了解 HTML 的发展历史
- 掌握开发环境配置
- 创建第一个 HTML 页面

---

## 📖 什么是 HTML？

HTML（HyperText Markup Language）即超文本标记语言，是构建网页的标准标记语言。

### 核心概念

- **超文本**：可以链接到其他页面的文本
- **标记语言**：使用标签描述内容结构
- **结构层**：HTML 负责网页结构，CSS 负责样式，JavaScript 负责行为

---

## 📜 HTML 发展历史

| 版本 | 年份 | 特点 |
|------|------|------|
| HTML 1.0 | 1991 | 最初版本，基础标签 |
| HTML 4.01 | 1999 | 广泛使用，成熟稳定 |
| XHTML 1.0 | 2000 | XML 语法，严格规范 |
| HTML5 | 2014 | 语义化标签、多媒体、Canvas |

---

## 🛠️ 开发环境

### 编辑器推荐

- **VS Code**（推荐）：免费、功能强大、插件丰富
- Sublime Text：轻量快速
- WebStorm：专业 IDE

### VS Code 推荐插件

- Live Server：实时预览
- HTML CSS Support：智能提示
- Auto Rename Tag：自动重命名标签
- Prettier：代码格式化

### 浏览器开发者工具

按 `F12` 打开开发者工具，查看元素、调试代码。

---

## 💻 第一个 HTML 页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的第一个网页</title>
</head>
<body>
  <h1>你好，世界！</h1>
  <p>这是我的第一个 HTML 页面。</p>
</body>
</html>
```

### 代码解析

| 部分 | 说明 |
|------|------|
| `<!DOCTYPE html>` | 文档类型声明，告诉浏览器这是 HTML5 |
| `<html>` | 根元素，包含整个页面内容 |
| `<head>` | 头部，包含元数据（不显示在页面上） |
| `<body>` | 主体，包含可见的页面内容 |
| `<meta charset>` | 字符编码，UTF-8 支持中文 |
| `<title>` | 页面标题，显示在浏览器标签页 |
| `<h1>` | 一级标题 |
| `<p>` | 段落 |

---

## 📝 HTML 语法规则

### 标签结构

```html
<标签名 属性="值">内容</标签名>
```

### 标签分类

```html
<!-- 双标签：有开始和结束标签 -->
<div>内容</div>
<p>段落</p>

<!-- 自闭合标签：没有结束标签 -->
<img src="image.jpg" alt="图片">
<br>
<hr>
<input type="text">
```

### 标签嵌套

```html
<!-- 正确：正确嵌套 -->
<div>
  <p>段落</p>
</div>

<!-- 错误：错误嵌套 -->
<div>
  <p>段落
</div>
</p>
```

---

## 📋 常用 HTML 标签速查

### 文本标签

| 标签 | 描述 |
|------|------|
| `<h1>` - `<h6>` | 标题 |
| `<p>` | 段落 |
| `<span>` | 行内容器 |
| `<strong>` | 重要文本（加粗） |
| `<em>` | 强调文本（斜体） |
| `<br>` | 换行 |
| `<hr>` | 水平线 |

### 结构标签

| 标签 | 描述 |
|------|------|
| `<div>` | 块级容器 |
| `<header>` | 页眉 |
| `<nav>` | 导航 |
| `<main>` | 主要内容 |
| `<footer>` | 页脚 |

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 HTML 的作用
- [ ] 了解 HTML 的发展历史
- [ ] 配置好开发环境
- [ ] 创建基本的 HTML 页面
- [ ] 理解标签的基本语法

---

## 📝 练习任务

### 任务 1：创建个人介绍页面
创建一个包含标题、段落、列表的简单页面。

### 任务 2：使用开发者工具
打开浏览器开发者工具，查看网页结构。

---

## 🔗 相关资源

- [MDN - HTML 入门](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML)
- [W3Schools - HTML 教程](https://www.w3schools.com/html/)
