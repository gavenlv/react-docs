# 13 - 过渡与变换

## 🎯 本节目标
- 掌握 CSS 过渡效果
- 学会使用 2D 和 3D 变换
- 理解过渡和动画的区别
- 学会创建流畅的交互效果

---

## 🎭 过渡（Transitions）

### 基本语法

```css
.element {
  transition: property duration timing-function delay;
}
```

---

### transition-property

```css
.element {
  transition-property: all;      /* 所有属性 */
  transition-property: none;     /* 无 */
  transition-property: transform;
  transition-property: opacity, background;
}
```

---

### transition-duration

```css
.element {
  transition-duration: 0.3s;   /* 0.3 秒 */
  transition-duration: 300ms;  /* 300 毫秒 */
}
```

---

### transition-timing-function

```css
.element {
  transition-timing-function: ease;        /* 默认 */
  transition-timing-function: linear;
  transition-timing-function: ease-in;
  transition-timing-function: ease-out;
  transition-timing-function: ease-in-out;
  transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

### transition-delay

```css
.element {
  transition-delay: 0s;
  transition-delay: 200ms;
}
```

---

### 简写示例

```css
.element {
  transition: all 0.3s ease;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

---

## 🔄 2D 变换

### translate（位移）

```css
.element {
  transform: translate(50px, 100px);  /* x, y */
  transform: translateX(50px);
  transform: translateY(100px);
  transform: translate(50%, 50%);     /* 相对于自身 */
}
```

---

### rotate（旋转）

```css
.element {
  transform: rotate(45deg);   /* 顺时针旋转 45 度 */
  transform: rotate(-45deg);  /* 逆时针旋转 45 度 */
  transform: rotate(0.5turn); /* 旋转半圈 */
}
```

---

### scale（缩放）

```css
.element {
  transform: scale(2);        /* 放大 2 倍 */
  transform: scale(0.5);      /* 缩小一半 */
  transform: scale(2, 1.5);   /* x 放大 2 倍，y 放大 1.5 倍 */
  transform: scaleX(2);
  transform: scaleY(1.5);
}
```

---

### skew（倾斜）

```css
.element {
  transform: skew(10deg, 20deg);
  transform: skewX(10deg);
  transform: skewY(20deg);
}
```

---

### transform-origin（变换原点）

```css
.element {
  transform-origin: center;      /* 默认 */
  transform-origin: top left;
  transform-origin: 50% 50%;
  transform-origin: 0 0;
}
```

---

## 🎲 3D 变换

### perspective（透视）

```css
.container {
  perspective: 1000px;  /* 透视距离 */
}

.element {
  transform: rotateY(45deg);
}
```

---

### rotateX / rotateY / rotateZ

```css
.element {
  transform: rotateX(45deg);  /* 绕 X 轴旋转 */
  transform: rotateY(45deg);  /* 绕 Y 轴旋转 */
  transform: rotateZ(45deg);  /* 绕 Z 轴旋转 */
  transform: rotate3d(1, 1, 0, 45deg);  /* 3D 旋转 */
}
```

---

### translateZ / translate3d

```css
.element {
  transform: translateZ(100px);
  transform: translate3d(50px, 50px, 100px);
}
```

---

### scaleZ / scale3d

```css
.element {
  transform: scaleZ(2);
  transform: scale3d(2, 1.5, 1);
}
```

---

### transform-style

```css
.container {
  transform-style: flat;         /* 默认：2D */
  transform-style: preserve-3d;  /* 保持 3D 空间 */
}
```

---

### backface-visibility

```css
.element {
  backface-visibility: visible;  /* 默认：可见 */
  backface-visibility: hidden;   /* 隐藏背面 */
}
```

---

## 💻 实战示例

### 示例 1：悬停效果

```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

---

### 示例 2：翻转卡片

```css
.flip-card {
  width: 300px;
  height: 200px;
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

---

### 示例 3：3D 立方体

```css
.cube {
  width: 200px;
  height: 200px;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 10s infinite linear;
}

.cube-face {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid #333;
}

.front  { transform: translateZ(100px); }
.back   { transform: rotateY(180deg) translateZ(100px); }
.right  { transform: rotateY(90deg) translateZ(100px); }
.left   { transform: rotateY(-90deg) translateZ(100px); }
.top    { transform: rotateX(90deg) translateZ(100px); }
.bottom { transform: rotateX(-90deg) translateZ(100px); }

@keyframes rotate {
  from { transform: rotateX(0) rotateY(0); }
  to { transform: rotateX(360deg) rotateY(360deg); }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 会使用 transition 创建过渡效果
- [ ] 会使用 2D 变换
- [ ] 会使用 3D 变换
- [ ] 理解过渡和动画的区别
- [ ] 能创建流畅的交互效果

---

## 📝 练习任务

### 任务 1：悬停效果
创建一个带有多种过渡效果的卡片。

### 任务 2：翻转卡片
创建一个 3D 翻转卡片效果。

### 任务 3：3D 立方体
创建一个旋转的 3D 立方体。

---

## 🔗 相关资源

- [CSS Transitions](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transitions)
- [CSS Transforms](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transforms)
- [Cubic Bezier Generator](https://cubic-bezier.com/)
