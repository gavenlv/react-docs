# 15 - 现代布局技术

## 🎯 本节目标
- 掌握现代 CSS 布局技术
- 学会使用 aspect-ratio、gap 等
- 理解容器查询的使用
- 掌握逻辑属性

---

## 🎨 aspect-ratio（宽高比）

### 基本用法

```css
/* 固定宽高比 */
.video {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.square {
  aspect-ratio: 1;  /* 1:1 正方形 */
}

.photo {
  aspect-ratio: 4 / 3;
}
```

---

## 📏 gap（间距）

### Flexbox 和 Grid 中的 gap

```css
/* Flexbox */
.flex-container {
  display: flex;
  gap: 20px;           /* 所有间距 */
  gap: 20px 10px;      /* 行间距 列间距 */
}

/* Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

---

## 🎯 容器查询（Container Queries）

### 基本用法

```css
/* 定义容器 */
.card-container {
  container-type: inline-size;
}

/* 基于容器宽度设置样式 */
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

---

## 📐 逻辑属性（Logical Properties）

### 内联和块方向

```css
/* 传统属性 vs 逻辑属性 */
.element {
  /* 传统 */
  margin-left: 10px;
  margin-right: 10px;
  padding-top: 20px;
  padding-bottom: 20px;
  width: 100px;
  height: 50px;
  
  /* 逻辑属性（支持 RTL） */
  margin-inline-start: 10px;   /* 左（LTR）或右（RTL） */
  margin-inline-end: 10px;
  padding-block-start: 20px;   /* 上 */
  padding-block-end: 20px;
  inline-size: 100px;          /* 宽度 */
  block-size: 50px;            /* 高度 */
}
```

---

## 🎭 其他现代特性

### 1. fit-content

```css
.element {
  width: fit-content;  /* 根据内容自适应 */
}
```

---

### 2. min() / max() / clamp()

```css
.element {
  width: min(50%, 500px);           /* 取较小值 */
  width: max(50%, 300px);           /* 取较大值 */
  font-size: clamp(1rem, 2.5vw, 2rem);  /* 最小 首选 最大 */
}
```

---

### 3. :is() 和 :where()

```css
/* :is() - 优先级取最高 */
:is(h1, h2, h3) {
  color: #333;
}

/* :where() - 优先级为 0 */
:where(h1, h2, h3) {
  margin-bottom: 1em;
}
```

---

### 4. :has()

```css
/* 选择包含 img 的 a 标签 */
a:has(img) {
  display: block;
}

/* 选择包含激活子元素的父元素 */
.card:has(.active) {
  border-color: #3498db;
}
```

---

## 💻 实战示例

### 示例 1：响应式卡片

```css
.card-container {
  container-type: inline-size;
}

.card {
  display: grid;
  gap: 20px;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

---

### 示例 2：自适应布局

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 会使用 aspect-ratio
- [ ] 会使用 gap 属性
- [ ] 会使用容器查询
- [ ] 理解逻辑属性
- [ ] 会使用现代 CSS 函数

---

## 📝 练习任务

### 任务 1：响应式组件
使用容器查询创建响应式组件。

### 任务 2：自适应网格
创建一个自适应的网格布局。

### 任务 3：宽高比图片
创建固定宽高比的图片容器。

---

## 🔗 相关资源

- [CSS Container Queries](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Container_Queries)
- [CSS Logical Properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Logical_Properties)
