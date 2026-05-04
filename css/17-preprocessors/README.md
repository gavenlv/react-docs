# 17 - CSS 预处理器

## 🎯 本节目标
- 理解 CSS 预处理器的概念
- 掌握 Sass/SCSS 的基本语法
- 学会使用变量、嵌套、混合宏
- 理解预处理器的工作流程

---

## 📖 什么是 CSS 预处理器？

### 一句话解释

CSS 预处理器是一种脚本语言,扩展了 CSS 的功能,编译后生成标准 CSS。

### 常见预处理器

- **Sass/SCSS**（最流行）
- **Less**
- **Stylus**
- **PostCSS**

---

## 🎨 Sass/SCSS 基础

### 变量

```scss
// 定义变量
$primary-color: #3498db;
$font-size-base: 16px;
$spacing: 20px;

// 使用变量
.button {
  background: $primary-color;
  font-size: $font-size-base;
  padding: $spacing;
}
```

---

### 嵌套

```scss
// SCSS 嵌套
.card {
  background: white;
  
  .card-header {
    padding: 20px;
    
    .card-title {
      font-size: 20px;
    }
  }
  
  .card-content {
    padding: 20px;
  }
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

/* 编译后的 CSS */
.card {
  background: white;
}

.card .card-header {
  padding: 20px;
}

.card .card-header .card-title {
  font-size: 20px;
}

.card .card-content {
  padding: 20px;
}

.card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
```

---

### 混合宏（Mixins）

```scss
// 定义混合宏
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin button-style($bg-color, $text-color: white) {
  background: $bg-color;
  color: $text-color;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

// 使用混合宏
.container {
  @include flex-center;
  height: 100vh;
}

.btn-primary {
  @include button-style(#3498db);
}

.btn-secondary {
  @include button-style(#95a5a6);
}
```

---

### 继承（@extend）

```scss
// 基础样式
%button-base {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

// 继承
.btn-primary {
  @extend %button-base;
  background: #3498db;
  color: white;
}

.btn-secondary {
  @extend %button-base;
  background: #95a5a6;
  color: white;
}
```

---

### 函数

```scss
// 定义函数
@function calculate-rem($px) {
  @return $px / 16px * 1rem;
}

// 使用函数
.text {
  font-size: calculate-rem(20px);
}
```

---

### 条件语句

```scss
@mixin theme($theme) {
  @if $theme == dark {
    background: #1a1a1a;
    color: #e0e0e0;
  } @else {
    background: white;
    color: #333;
  }
}

.dark-theme {
  @include theme(dark);
}
```

---

### 循环

```scss
// for 循环
@for $i from 1 through 5 {
  .mt-#{$i} {
    margin-top: $i * 10px;
  }
}

// each 循环
$colors: (primary: #3498db, secondary: #95a5a6, danger: #e74c3c);

@each $name, $color in $colors {
  .btn-#{$name} {
    background: $color;
  }
}
```

---

### 模块化

```scss
// _variables.scss
$primary-color: #3498db;

// _mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// main.scss
@import 'variables';
@import 'mixins';

.container {
  @include flex-center;
  background: $primary-color;
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 CSS 预处理器的概念
- [ ] 会使用 Sass 变量和嵌套
- [ ] 会使用混合宏和继承
- [ ] 会使用条件和循环
- [ ] 会组织模块化 SCSS 文件

---

## 📝 练习任务

### 任务 1：变量和嵌套
使用 Sass 变量和嵌套重构现有 CSS。

### 任务 2：混合宏
创建常用的混合宏库。

### 任务 3：模块化
组织一个模块化的 Sass 项目。

---

## 🔗 相关资源

- [Sass Official](https://sass-lang.com/)
- [Sass Guidelines](https://sass-guidelin.es/)
- [Sassmeister](https://www.sassmeister.com/)
