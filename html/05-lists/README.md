# 05 - 列表

## 🎯 本节目标
- 掌握无序列表的使用
- 学会有序列表
- 了解定义列表
- 掌握列表嵌套

---

## 📋 无序列表

无序列表用于没有特定顺序的项目。

```html
<ul>
  <li>苹果</li>
  <li>香蕉</li>
  <li>橙子</li>
</ul>
```

### 列表样式

```html
<ul style="list-style-type: disc;">
  <li>实心圆点（默认）</li>
</ul>

<ul style="list-style-type: circle;">
  <li>空心圆点</li>
</ul>

<ul style="list-style-type: square;">
  <li>实心方块</li>
</ul>

<ul style="list-style-type: none;">
  <li>无标记</li>
</ul>
```

---

## 🔢 有序列表

有序列表用于有特定顺序的项目。

```html
<ol>
  <li>第一步</li>
  <li>第二步</li>
  <li>第三步</li>
</ol>
```

### 列表属性

```html
<!-- 数字类型 -->
<ol type="1">    <!-- 1, 2, 3（默认） -->
<ol type="A">    <!-- A, B, C -->
<ol type="a">    <!-- a, b, c -->
<ol type="I">    <!-- I, II, III -->
<ol type="i">    <!-- i, ii, iii -->

<!-- 起始数字 -->
<ol start="5">
  <li>从5开始</li>
  <li>6</li>
</ol>

<!-- 反向排序 -->
<ol reversed>
  <li>第三</li>
  <li>第二</li>
  <li>第一</li>
</ol>
```

---

## 📖 定义列表

定义列表用于术语和描述的配对。

```html
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言，用于构建网页结构。</dd>
  
  <dt>CSS</dt>
  <dd>层叠样式表，用于设置网页样式。</dd>
  
  <dt>JavaScript</dt>
  <dd>脚本语言，用于实现网页交互。</dd>
</dl>
```

---

## 🔄 列表嵌套

```html
<ul>
  <li>水果
    <ul>
      <li>苹果</li>
      <li>香蕉</li>
    </ul>
  </li>
  <li>蔬菜
    <ol>
      <li>西红柿</li>
      <li>黄瓜</li>
    </ol>
  </li>
</ul>
```

---

## 💻 实战示例

### 导航菜单

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/about">关于</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>
```

### 面包屑导航

```html
<nav>
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/products/laptop">笔记本电脑</a></li>
  </ol>
</nav>
```

### 步骤指南

```html
<ol>
  <li>
    <h3>准备环境</h3>
    <p>安装 Node.js 和 npm</p>
  </li>
  <li>
    <h3>创建项目</h3>
    <p>运行 npm init 命令</p>
  </li>
  <li>
    <h3>安装依赖</h3>
    <p>运行 npm install 命令</p>
  </li>
</ol>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 创建无序列表
- [ ] 创建有序列表
- [ ] 使用定义列表
- [ ] 实现列表嵌套
- [ ] 用列表构建导航

---

## 🔗 相关资源

- [MDN - HTML 列表](https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals#lists)
