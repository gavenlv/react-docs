# 05 - 颜色与背景

## 🎯 本节目标
- 掌握 CSS 颜色的各种表示方法
- 学会设置背景颜色、图片和渐变
- 理解背景定位、尺寸和重复
- 掌握多重背景和背景裁剪

---

## 🎨 颜色表示方法

### 1. 颜色关键字

```css
/* 颜色名称 */
.text {
  color: red;
  color: blue;
  color: green;
  color: transparent;  /* 透明 */
  color: currentColor; /* 当前颜色 */
}

/* CSS3 新增颜色关键字 */
.text {
  color: rebeccapurple;
  color: aliceblue;
}
```

---

### 2. 十六进制（Hex）

```css
.text {
  /* 3 位简写（每个数字重复） */
  color: #f00;  /* #ff0000 */
  color: #0f0;  /* #00ff00 */
  color: #00f;  /* #0000ff */
  
  /* 6 位完整写法 */
  color: #ff0000;  /* 红色 */
  color: #00ff00;  /* 绿色 */
  color: #0000ff;  /* 蓝色 */
  color: #3498db;  /* 自定义蓝色 */
  
  /* 8 位（带透明度） */
  color: #ff000080;  /* 红色，50% 透明度 */
}
```

---

### 3. RGB 和 RGBA

```css
.text {
  /* RGB（0-255） */
  color: rgb(255, 0, 0);      /* 红色 */
  color: rgb(0, 255, 0);      /* 绿色 */
  color: rgb(0, 0, 255);      /* 蓝色 */
  
  /* RGBA（带透明度，0-1） */
  color: rgba(255, 0, 0, 1);    /* 完全不透明 */
  color: rgba(255, 0, 0, 0.5);  /* 50% 透明 */
  color: rgba(255, 0, 0, 0);    /* 完全透明 */
  
  /* CSS4 新增语法 */
  color: rgb(255 0 0);          /* 用空格分隔 */
  color: rgb(255 0 0 / 0.5);    /* 带透明度 */
}
```

---

### 4. HSL 和 HSLA

**HSL**: 色相（Hue）、饱和度（Saturation）、亮度（Lightness）

```css
.text {
  /* HSL */
  /* 色相: 0-360（0=红, 120=绿, 240=蓝） */
  /* 饱和度: 0-100% */
  /* 亮度: 0-100% */
  color: hsl(0, 100%, 50%);    /* 红色 */
  color: hsl(120, 100%, 50%);  /* 绿色 */
  color: hsl(240, 100%, 50%);  /* 蓝色 */
  
  /* HSLA（带透明度） */
  color: hsla(0, 100%, 50%, 0.5);
  
  /* CSS4 新增语法 */
  color: hsl(0 100% 50%);
  color: hsl(0 100% 50% / 0.5);
}
```

**HSL 的优势：**
- 更直观：调整亮度和饱和度更简单
- 更容易创建配色方案

```css
/* 使用 HSL 创建配色 */
:root {
  --primary-h: 210;  /* 色相 */
  --primary: hsl(var(--primary-h), 70%, 60%);
  --primary-light: hsl(var(--primary-h), 70%, 80%);
  --primary-dark: hsl(var(--primary-h), 70%, 40%);
}
```

---

### 5. 颜色函数（CSS4）

```css
.text {
  /* hwba() - 色相、白度、黑度、透明度 */
  color: hwb(0 0% 0%);      /* 红色 */
  color: hwb(0 20% 20%);    /* 淡红色 */
  
  /* lab() - 设备无关的颜色空间 */
  color: lab(50% 0 0);
  
  /* lch() - 亮度、色度、色相 */
  color: lch(50% 100 0);
  
  /* color() - 访问特定颜色空间 */
  color: color(display-p3 1 0 0);
}
```

---

## 🖼️ 背景颜色

### background-color

```css
.box {
  background-color: #3498db;
  background-color: rgb(52, 152, 219);
  background-color: hsl(204, 70%, 53%);
  background-color: transparent;  /* 透明 */
}
```

---

## 🎨 背景图片

### background-image

```css
.box {
  /* 单张图片 */
  background-image: url('image.jpg');
  
  /* 渐变 */
  background-image: linear-gradient(to right, #3498db, #2ecc71);
  background-image: radial-gradient(circle, #3498db, #2ecc71);
  
  /* 多重背景 */
  background-image: 
    url('overlay.png'),
    url('background.jpg');
}
```

---

### background-repeat

```css
.box {
  background-image: url('pattern.png');
  
  background-repeat: repeat;     /* 平铺（默认） */
  background-repeat: no-repeat;  /* 不重复 */
  background-repeat: repeat-x;   /* 水平重复 */
  background-repeat: repeat-y;   /* 垂直重复 */
  background-repeat: space;      /* 平均分布 */
  background-repeat: round;      /* 缩放后平铺 */
  
  /* 双值语法 */
  background-repeat: repeat no-repeat;  /* 水平重复，垂直不重复 */
}
```

---

### background-position

```css
.box {
  background-image: url('icon.png');
  background-repeat: no-repeat;
  
  /* 关键字 */
  background-position: center;
  background-position: top;
  background-position: bottom;
  background-position: left;
  background-position: right;
  background-position: center center;
  background-position: top right;
  
  /* 数值 */
  background-position: 20px 30px;  /* x y */
  background-position: 50% 50%;    /* 百分比 */
  background-position: right 20px bottom 30px;  /* 相对于右下角 */
}
```

---

### background-size

```css
.box {
  background-image: url('photo.jpg');
  
  background-size: auto;        /* 原始大小（默认） */
  background-size: 100px 200px; /* 固定宽高 */
  background-size: 50% 50%;     /* 相对于容器 */
  background-size: cover;       /* 覆盖容器，可能裁剪 ⭐ 常用 */
  background-size: contain;     /* 完整显示，可能留白 ⭐ 常用 */
}
```

**cover vs contain:**

```
cover（覆盖）：
┌──────────────┐
│   图片填满容器  │
│  可能会裁剪    │
└──────────────┘

contain（包含）：
┌──────────────┐
│              │
│   ┌────┐     │
│   │图片│     │  完整显示
│   └────┘     │  可能留白
│              │
└──────────────┘
```

---

### background-attachment

```css
.box {
  background-image: url('bg.jpg');
  
  background-attachment: scroll;  /* 随页面滚动（默认） */
  background-attachment: fixed;   /* 固定不动 ⭐ 视差效果 */
  background-attachment: local;   /* 随元素内容滚动 */
}
```

---

### background-clip

```css
.box {
  background-color: #3498db;
  border: 10px dashed #333;
  padding: 20px;
  
  background-clip: border-box;  /* 延伸到边框（默认） */
  background-clip: padding-box; /* 延伸到内边距 */
  background-clip: content-box; /* 仅内容区域 */
  background-clip: text;        /* 仅文字（配合 -webkit-background-clip） */
}

/* 文字背景效果 */
.text-bg {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

---

### background-origin

```css
.box {
  background-image: url('icon.png');
  background-repeat: no-repeat;
  
  background-origin: border-box;  /* 从边框开始 */
  background-origin: padding-box; /* 从内边距开始（默认） */
  background-origin: content-box; /* 从内容开始 */
}
```

---

### 简写属性 background

```css
.box {
  /* 完整简写 */
  background: 
    color 
    image 
    position/size 
    repeat 
    attachment 
    origin 
    clip;
  
  /* 示例 */
  background: #f0f0f0 url('bg.jpg') center/cover no-repeat fixed;
  
  /* 多重背景 */
  background: 
    url('overlay.png') center/contain no-repeat,
    linear-gradient(to right, #3498db, #2ecc71),
    #f0f0f0;
}
```

---

## 🌈 渐变

### 1. 线性渐变（linear-gradient）

```css
.box {
  /* 基本用法 */
  background: linear-gradient(#3498db, #2ecc71);
  
  /* 指定方向 */
  background: linear-gradient(to right, #3498db, #2ecc71);
  background: linear-gradient(to left, #3498db, #2ecc71);
  background: linear-gradient(to top, #3498db, #2ecc71);
  background: linear-gradient(to bottom right, #3498db, #2ecc71);
  
  /* 角度（0deg 从下到上） */
  background: linear-gradient(0deg, #3498db, #2ecc71);
  background: linear-gradient(90deg, #3498db, #2ecc71);
  background: linear-gradient(180deg, #3498db, #2ecc71);  /* 从上到下 */
  background: linear-gradient(45deg, #3498db, #2ecc71);
  
  /* 多个颜色 */
  background: linear-gradient(to right, #e74c3c, #f39c12, #2ecc71, #3498db);
  
  /* 指定颜色位置 */
  background: linear-gradient(to right, 
    #3498db 0%, 
    #2ecc71 50%, 
    #e74c3c 100%
  );
  
  /* 硬边缘（无过渡） */
  background: linear-gradient(to right, 
    #3498db 50%, 
    #2ecc71 50%
  );
}
```

---

### 2. 径向渐变（radial-gradient）

```css
.box {
  /* 基本用法 */
  background: radial-gradient(#3498db, #2ecc71);
  
  /* 形状 */
  background: radial-gradient(circle, #3498db, #2ecc71);
  background: radial-gradient(ellipse, #3498db, #2ecc71);
  
  /* 大小 */
  background: radial-gradient(circle closest-side, #3498db, #2ecc71);
  background: radial-gradient(circle closest-corner, #3498db, #2ecc71);
  background: radial-gradient(circle farthest-side, #3498db, #2ecc71);
  background: radial-gradient(circle farthest-corner, #3498db, #2ecc71);
  
  /* 位置 */
  background: radial-gradient(circle at center, #3498db, #2ecc71);
  background: radial-gradient(circle at top left, #3498db, #2ecc71);
  background: radial-gradient(circle at 30% 70%, #3498db, #2ecc71);
  
  /* 固定大小 */
  background: radial-gradient(circle 100px, #3498db, #2ecc71);
}
```

---

### 3. 圆锥渐变（conic-gradient）

```css
.box {
  /* 基本用法 */
  background: conic-gradient(#3498db, #2ecc71, #e74c3c, #3498db);
  
  /* 指定起始角度 */
  background: conic-gradient(from 0deg, #3498db, #2ecc71, #e74c3c);
  
  /* 指定中心位置 */
  background: conic-gradient(at 50% 50%, #3498db, #2ecc71);
  
  /* 饼图效果 */
  background: conic-gradient(
    #3498db 0% 25%,
    #2ecc71 25% 50%,
    #e74c3c 50% 75%,
    #f39c12 75% 100%
  );
}
```

---

### 4. 重复渐变

```css
.box {
  /* 重复线性渐变 */
  background: repeating-linear-gradient(
    45deg,
    #3498db,
    #3498db 10px,
    #2ecc71 10px,
    #2ecc71 20px
  );
  
  /* 重复径向渐变 */
  background: repeating-radial-gradient(
    circle,
    #3498db,
    #3498db 10px,
    #2ecc71 10px,
    #2ecc71 20px
  );
  
  /* 重复圆锥渐变 */
  background: repeating-conic-gradient(
    #3498db 0% 10%,
    #2ecc71 10% 20%
  );
}
```

---

## 💻 实战示例

### 示例 1：渐变按钮

```css
.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}
```

---

### 示例 2：卡片背景

```css
.card {
  position: relative;
  width: 300px;
  height: 400px;
  border-radius: 15px;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%),
    url('photo.jpg') center/cover;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
}
```

---

### 示例 3：视差背景

```css
.hero {
  height: 100vh;
  background-image: url('hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  color: white;
}
```

---

### 示例 4：条纹背景

```css
.stripes {
  background: repeating-linear-gradient(
    45deg,
    #3498db,
    #3498db 10px,
    #2ecc71 10px,
    #2ecc71 20px
  );
}

.stripes-horizontal {
  background: repeating-linear-gradient(
    0deg,
    #3498db,
    #3498db 10px,
    #2ecc71 10px,
    #2ecc71 20px
  );
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 会使用各种颜色表示方法
- [ ] 会设置背景颜色和图片
- [ ] 会使用 background-position、background-size
- [ ] 会创建线性、径向、圆锥渐变
- [ ] 会使用多重背景
- [ ] 会创建视差效果

---

## 📝 练习任务

### 任务 1：渐变背景
创建以下渐变效果：
- 从左到右的彩虹渐变
- 45度角的条纹背景
- 圆形径向渐变按钮
- 文字渐变效果

### 任务 2：英雄区域
创建一个网站英雄区域：
- 全屏背景图片
- 视差滚动效果
- 渐变遮罩层
- 居中的标题和按钮

---

## 🔗 相关资源

- [CSS Gradient Generator](https://cssgradient.io/)
- [Cool Backgrounds](https://coolbackgrounds.io/)
- [WebGradients](https://webgradients.com/)
