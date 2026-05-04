# 13 - 表单进阶

## 🎯 本节目标
- 掌握高级表单验证
- 学会自定义表单控件
- 了解表单数据提交
- 掌握表单最佳实践

---

## 📝 自定义验证

```html
<input type="text" 
       pattern="[A-Za-z]{3,}" 
       title="至少3个字母"
       required>
```

---

## 🎨 datalist

```html
<input list="browsers" name="browser">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
</datalist>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 自定义表单验证
- [ ] 使用 datalist
- [ ] 处理表单数据

---

## 🔗 相关资源

- [MDN - 表单](https://developer.mozilla.org/zh-CN/docs/Learn/Forms)
