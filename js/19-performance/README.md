# 19 - 性能优化

## 🎯 本节目标
- 了解 JavaScript 性能瓶颈
- 掌握优化技巧
- 学会使用性能分析工具
- 了解内存管理

---

## ⚡ 优化技巧

### 减少 DOM 操作

```javascript
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  fragment.appendChild(li);
});
list.appendChild(fragment);
```

### 防抖和节流

```javascript
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### 懒加载

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
});
```

---

## 🗑️ 内存管理

### 避免内存泄漏

```javascript
// 及时清除引用
element.removeEventListener('click', handler);
clearInterval(intervalId);

// 避免闭包引用
function setup() {
  const largeData = getLargeData();
  return function() {
    console.log(largeData.length);
  };
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 了解性能瓶颈
- [ ] 掌握防抖节流
- [ ] 会使用懒加载
- [ ] 了解内存管理

---

## 🔗 相关资源

- [JavaScript 性能优化](https://developer.mozilla.org/zh-CN/docs/Web/Performance)
