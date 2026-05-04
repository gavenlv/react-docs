# 15 - Web Components

## 🎯 本节目标
- 理解 Web Components 概念
- 掌握自定义元素
- 了解 Shadow DOM
- 学会创建组件

---

## 🧩 自定义元素

```javascript
class MyButton extends HTMLElement {
  constructor() {
    super();
    this.textContent = '自定义按钮';
  }
}

customElements.define('my-button', MyButton);
```

```html
<my-button></my-button>
```

---

## 🌑 Shadow DOM

```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        p { color: red; }
      </style>
      <p>Shadow DOM 内容</p>
    `;
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 创建自定义元素
- [ ] 使用 Shadow DOM
- [ ] 理解组件封装

---

## 🔗 相关资源

- [MDN - Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
