# 16 - CSS 架构与方法论

## 🎯 本节目标
- 理解 CSS 架构的重要性
- 掌握常见的 CSS 方法论
- 学会组织和维护大型 CSS 项目
- 掌握命名约定和最佳实践

---

## 📖 为什么需要 CSS 架构？

### 常见问题

- ❌ 样式冲突
- ❌ 选择器嵌套过深
- ❌ 难以复用
- ❌ 代码冗余
- ❌ 维护困难

---

## 🎨 BEM 方法论

### 命名约定

```css
/* Block（块） */
.card { }

/* Element（元素） */
.card__header { }
.card__title { }
.card__content { }
.card__footer { }

/* Modifier（修饰符） */
.card--featured { }
.card--dark { }
.card__title--large { }
```

---

### 示例

```html
<div class="card card--featured">
  <div class="card__header">
    <h2 class="card__title card__title--large">标题</h2>
  </div>
  <div class="card__content">
    内容
  </div>
  <div class="card__footer">
    <button class="card__button card__button--primary">按钮</button>
  </div>
</div>
```

```css
.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.card--featured {
  border: 2px solid #3498db;
}

.card__header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.card__title {
  font-size: 20px;
  color: #333;
}

.card__title--large {
  font-size: 24px;
}

.card__content {
  padding: 20px;
}

.card__footer {
  padding: 15px 20px;
  background: #f9f9f9;
}

.card__button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.card__button--primary {
  background: #3498db;
  color: white;
}
```

---

## 🏗️ OOCSS（面向对象的 CSS）

### 原则

1. **分离结构和皮肤**
2. **分离容器和内容**

```css
/* 结构 */
.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

/* 皮肤 */
.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

/* 容器和内容分离 */
.card {
  /* 不设置宽度，让容器决定 */
  background: white;
  border-radius: 8px;
}

.card-title {
  /* 不依赖父元素 */
  font-size: 20px;
  color: #333;
}
```

---

## 📦 SMACSS

### 分类

1. **Base（基础）**：重置和默认样式
2. **Layout（布局）**：页面结构
3. **Module（模块）**：可复用组件
4. **State（状态）**：状态样式
5. **Theme（主题）**：主题样式

```css
/* Base */
body {
  margin: 0;
  font-family: sans-serif;
}

/* Layout */
.l-header {
  position: fixed;
  top: 0;
  width: 100%;
}

.l-sidebar {
  width: 250px;
}

/* Module */
.card { }
.card-title { }

/* State */
.is-active { }
.is-hidden { }
.is-loading { }

/* Theme */
.theme-dark {
  background: #1a1a1a;
  color: #e0e0e0;
}
```

---

## 🎯 ITCSS

### 层级结构（从通用到具体）

1. **Settings**：变量、配置
2. **Tools**：函数、混合宏
3. **Generic**：重置、normalize
4. **Elements**：HTML 元素样式
5. **Objects**：无装饰的模式
6. **Components**：UI 组件
7. **Utilities**：工具类

---

## 📁 项目结构

### 推荐结构

```
styles/
├── base/
│   ├── _reset.css
│   ├── _typography.css
│   └── _base.css
├── components/
│   ├── _button.css
│   ├── _card.css
│   └── _form.css
├── layout/
│   ├── _header.css
│   ├── _footer.css
│   └── _sidebar.css
├── pages/
│   ├── _home.css
│   └── _about.css
├── themes/
│   ├── _dark.css
│   └── _light.css
├── utils/
│   ├── _variables.css
│   ├── _functions.css
│   └── _mixins.css
└── main.css
```

---

## 💻 最佳实践

### 1. 使用 CSS 变量

```css
:root {
  --color-primary: #3498db;
  --spacing-md: 20px;
  --border-radius: 5px;
}
```

---

### 2. 避免深层嵌套

```css
/* ❌ 避免 */
.header .nav .menu .item .link { }

/* ✅ 推荐 */
.nav-link { }
```

---

### 3. 使用语义化命名

```css
/* ❌ 避免 */
.red-box { }
.large-text { }

/* ✅ 推荐 */
.error-message { }
.heading-primary { }
```

---

### 4. 模块化

```css
/* 每个组件一个文件 */
/* components/card.css */
.card { }
.card__header { }
.card__title { }
.card__content { }
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 CSS 架构的重要性
- [ ] 会使用 BEM 命名约定
- [ ] 了解 OOCSS 和 SMACSS
- [ ] 会组织大型 CSS 项目
- [ ] 掌握 CSS 最佳实践

---

## 📝 练习任务

### 任务 1：BEM 重构
使用 BEM 方法重构现有组件。

### 任务 2：项目结构
为大型项目设计 CSS 文件结构。

### 任务 3：组件库
创建一个小型组件库。

---

## 🔗 相关资源

- [BEM Official](https://getbem.com/)
- [OOCSS Wiki](https://github.com/stubbornella/oocss/wiki)
- [SMACSS](https://smacss.com/)
- [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
