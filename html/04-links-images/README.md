# 04 - 链接与图片

## 🎯 本节目标
- 掌握超链接的使用
- 理解相对路径和绝对路径
- 学会插入图片
- 了解图片优化

---

## 🔗 超链接

### 基本语法

```html
<a href="https://www.example.com">链接文本</a>
```

### 链接属性

```html
<!-- 在新窗口打开 -->
<a href="https://www.example.com" target="_blank">新窗口打开</a>

<!-- 链接标题 -->
<a href="https://www.example.com" title="点击访问">带提示的链接</a>

<!-- 页面内锚点 -->
<a href="#section1">跳转到章节1</a>
<h2 id="section1">章节1</h2>

<!-- 邮件链接 -->
<a href="mailto:example@email.com">发送邮件</a>

<!-- 电话链接 -->
<a href="tel:+8613800000000">拨打电话</a>

<!-- 下载链接 -->
<a href="file.pdf" download>下载文件</a>
```

### target 属性值

| 值 | 描述 |
|------|------|
| `_self` | 当前窗口（默认） |
| `_blank` | 新窗口 |
| `_parent` | 父框架 |
| `_top` | 顶层框架 |

---

## 📁 路径

### 绝对路径

```html
<a href="https://www.example.com/page.html">绝对路径</a>
<img src="https://www.example.com/images/logo.png">
```

### 相对路径

```html
<!-- 同级目录 -->
<a href="page.html">同级页面</a>
<img src="image.jpg">

<!-- 下级目录 -->
<a href="pages/about.html">下级目录</a>
<img src="images/logo.png">

<!-- 上级目录 -->
<a href="../index.html">上级目录</a>
<img src="../images/logo.png">

<!-- 根目录 -->
<a href="/pages/about.html">根目录开始</a>
```

---

## 🖼️ 图片

### 基本语法

```html
<img src="image.jpg" alt="图片描述">
```

### 图片属性

```html
<img 
  src="photo.jpg" 
  alt="风景照片"
  width="300"
  height="200"
  loading="lazy"
>
```

| 属性 | 描述 |
|------|------|
| `src` | 图片路径（必需） |
| `alt` | 替代文本（必需，无障碍访问） |
| `width` | 宽度 |
| `height` | 高度 |
| `loading` | 加载方式（`lazy` 懒加载） |

### 图片格式

| 格式 | 适用场景 |
|------|------|
| JPEG | 照片、复杂图像 |
| PNG | 透明图像、图标 |
| GIF | 动画 |
| WebP | 现代格式，更小体积 |
| SVG | 矢量图形、图标 |

### 响应式图片

```html
<!-- srcset 属性 -->
<img 
  src="small.jpg"
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  alt="响应式图片"
>

<!-- picture 元素 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="后备图片">
</picture>
```

---

## 🎨 图片优化

### 懒加载

```html
<img src="image.jpg" alt="图片" loading="lazy">
```

### 图片压缩

- 使用工具压缩图片（TinyPNG、ImageOptim）
- 选择合适的格式
- 使用 WebP 格式

---

## 💻 完整示例

```html
<article>
  <h1>旅行日记</h1>
  
  <img 
    src="travel.jpg" 
    alt="美丽的风景"
    loading="lazy"
  >
  
  <p>点击<a href="gallery.html" target="_blank">这里</a>查看更多照片。</p>
  
  <nav>
    <a href="#day1">第一天</a>
    <a href="#day2">第二天</a>
  </nav>
  
  <section id="day1">
    <h2>第一天</h2>
    <p>内容...</p>
  </section>
</article>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 创建各种类型的链接
- [ ] 理解相对路径和绝对路径
- [ ] 正确插入图片
- [ ] 为图片添加 alt 属性
- [ ] 了解图片优化方法

---

## 🔗 相关资源

- [MDN - 超链接](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks)
- [MDN - 图片](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML)
