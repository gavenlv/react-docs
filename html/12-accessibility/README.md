# 12 - 无障碍访问

## 🎯 本节目标
- 理解无障碍访问的重要性
- 掌握 ARIA 属性
- 学会键盘导航
- 了解屏幕阅读器支持

---

## 📖 什么是无障碍访问？

无障碍访问（Accessibility，简称 a11y）是确保网站对所有用户可用，包括残障人士。

---

## 🏷️ ARIA 属性

### role 属性

```html
<div role="button">按钮</div>
<div role="navigation">导航</div>
<div role="dialog">对话框</div>
```

### aria-label

```html
<button aria-label="关闭">×</button>
```

### aria-labelledby

```html
<div id="title">标题</div>
<div aria-labelledby="title">内容</div>
```

### aria-hidden

```html
<span aria-hidden="true">装饰性元素</span>
```

---

## ⌨️ 键盘导航

```html
<button tabindex="0">可聚焦</button>
<div tabindex="-1">编程聚焦</div>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解无障碍访问
- [ ] 使用 ARIA 属性
- [ ] 实现键盘导航
- [ ] 添加 alt 属性

---

## 🔗 相关资源

- [MDN - 无障碍](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility)
