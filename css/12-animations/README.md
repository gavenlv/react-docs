# 12 - CSS 动画

## 🎯 本节目标
- 掌握 CSS 动画的基本概念
- 学会使用 @keyframes 定义动画
- 掌握 animation 属性的使用
- 学会创建常见的动画效果

---

## 📖 CSS 动画基础

### 动画的优势

- ✅ 性能优秀（浏览器优化）
- ✅ 无需 JavaScript
- ✅ 硬件加速
- ✅ 易于维护

---

## 🎬 @keyframes 规则

### 定义动画

```css
/* 基本语法 */
@keyframes animation-name {
  from { /* 起始状态 */ }
  to { /* 结束状态 */ }
}

/* 使用百分比 */
@keyframes animation-name {
  0% { /* 起始状态 */ }
  50% { /* 中间状态 */ }
  100% { /* 结束状态 */ }
}
```

### 示例

```css
/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 滑入动画 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
```

---

## 🎨 animation 属性

### 1. animation-name

```css
.element {
  animation-name: fadeIn;
}
```

---

### 2. animation-duration

```css
.element {
  animation-duration: 1s;      /* 持续 1 秒 */
  animation-duration: 500ms;   /* 持续 500 毫秒 */
}
```

---

### 3. animation-timing-function

```css
.element {
  animation-timing-function: linear;      /* 线性 */
  animation-timing-function: ease;        /* 默认：慢-快-慢 */
  animation-timing-function: ease-in;     /* 慢开始 */
  animation-timing-function: ease-out;    /* 慢结束 */
  animation-timing-function: ease-in-out; /* 慢开始和结束 */
  
  /* 贝塞尔曲线 */
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* 步进 */
  animation-timing-function: steps(5, end);
}
```

---

### 4. animation-delay

```css
.element {
  animation-delay: 0s;     /* 无延迟 */
  animation-delay: 500ms;  /* 延迟 500ms */
  animation-delay: -500ms; /* 提前开始 */
}
```

---

### 5. animation-iteration-count

```css
.element {
  animation-iteration-count: 1;     /* 播放 1 次 */
  animation-iteration-count: 3;     /* 播放 3 次 */
  animation-iteration-count: infinite; /* 无限循环 */
}
```

---

### 6. animation-direction

```css
.element {
  animation-direction: normal;       /* 默认：正向播放 */
  animation-direction: reverse;      /* 反向播放 */
  animation-direction: alternate;    /* 正反交替 */
  animation-direction: alternate-reverse; /* 反正交替 */
}
```

---

### 7. animation-fill-mode

```css
.element {
  animation-fill-mode: none;       /* 默认：不应用样式 */
  animation-fill-mode: forwards;   /* 保持结束状态 ⭐ 常用 */
  animation-fill-mode: backwards;  /* 应用起始状态 */
  animation-fill-mode: both;       /* 同时应用起始和结束 */
}
```

---

### 8. animation-play-state

```css
.element {
  animation-play-state: running;  /* 默认：播放 */
  animation-play-state: paused;   /* 暂停 */
}
```

---

### 简写属性

```css
.element {
  animation: 
    name 
    duration 
    timing-function 
    delay 
    iteration-count 
    direction 
    fill-mode 
    play-state;
  
  /* 示例 */
  animation: fadeIn 1s ease-in-out 0.5s infinite alternate forwards;
  
  /* 多个动画 */
  animation: fadeIn 1s, slideIn 0.5s;
}
```

---

## 💻 实战示例

### 示例 1：加载动画

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

### 示例 2：按钮悬停效果

```css
.btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn:hover {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
```

---

### 示例 3：入场动画

```css
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 会使用 @keyframes 定义动画
- [ ] 掌握 animation 各个属性
- [ ] 会创建常见的动画效果
- [ ] 理解动画的性能优化

---

## 📝 练习任务

### 任务 1：加载动画
创建一个旋转的加载动画。

### 任务 2：按钮效果
创建一个带有悬停动画效果的按钮。

### 任务 3：入场动画
为页面元素创建入场动画效果。

---

## 🔗 相关资源

- [CSS Animation](https://developer.mozilla.org/zh-CN/docs/Web/CSS/animation)
- [Animate.css](https://animate.style/)
- [Cubic Bezier](https://cubic-bezier.com/)
