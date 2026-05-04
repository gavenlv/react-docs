# 10 - HTML5 新特性

## 🎯 本节目标
- 了解 HTML5 的新特性
- 掌握 Canvas 基础
- 了解本地存储
- 认识其他 HTML5 API

---

## 🎨 Canvas

Canvas 用于在网页上绘制图形。

```html
<canvas id="myCanvas" width="400" height="300"></canvas>

<script>
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 100, 50);
  
  ctx.beginPath();
  ctx.arc(200, 100, 50, 0, Math.PI * 2);
  ctx.fillStyle = 'blue';
  ctx.fill();
</script>
```

---

## 💾 本地存储

### localStorage

```javascript
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();
```

### sessionStorage

```javascript
sessionStorage.setItem('key', 'value');
const value = sessionStorage.getItem('key');
```

---

## 📍 地理定位

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  },
  (error) => {
    console.error(error);
  }
);
```

---

## 📋 其他 HTML5 特性

### 拖放 API

```html
<div draggable="true" ondragstart="drag(event)">拖动我</div>
<div ondrop="drop(event)" ondragover="allowDrop(event)">放置区域</div>
```

### Web Workers

```javascript
const worker = new Worker('worker.js');
worker.postMessage('Hello');
worker.onmessage = (e) => console.log(e.data);
```

### Web Socket

```javascript
const socket = new WebSocket('ws://example.com');
socket.onmessage = (e) => console.log(e.data);
socket.send('Hello');
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 了解 HTML5 新特性
- [ ] 使用 Canvas 绑制图形
- [ ] 使用本地存储
- [ ] 了解地理定位 API

---

## 🔗 相关资源

- [MDN - HTML5](https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5)
