# 14 - HTML 模板

## 🎯 本节目标
- 掌握 template 标签
- 学会使用 slot 插槽
- 了解模板复用

---

## 📦 template 标签

```html
<template id="card-template">
  <div class="card">
    <h2></h2>
    <p></p>
  </div>
</template>

<script>
  const template = document.getElementById('card-template');
  const clone = template.content.cloneNode(true);
  document.body.appendChild(clone);
</script>
```

---

## 🔌 slot 插槽

```html
<template id="my-component">
  <slot name="header">默认标题</slot>
  <slot>默认内容</slot>
  <slot name="footer">默认页脚</slot>
</template>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 使用 template 标签
- [ ] 理解 slot 插槽
- [ ] 实现模板复用

---

## 🔗 相关资源

- [MDN - template](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/template)
