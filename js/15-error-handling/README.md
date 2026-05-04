# 15 - 错误处理与调试

## 🎯 本节目标
- 理解错误类型
- 掌握 try-catch 语句
- 学会抛出和自定义错误
- 掌握调试技巧

---

## 🚫 错误类型

| 类型 | 描述 |
|------|------|
| `Error` | 通用错误 |
| `SyntaxError` | 语法错误 |
| `ReferenceError` | 引用错误 |
| `TypeError` | 类型错误 |
| `RangeError` | 范围错误 |
| `URIError` | URI 错误 |

---

## 🔧 try-catch

```javascript
try {
  throw new Error('出错了');
} catch (error) {
  console.error(error.message);
} finally {
  console.log('总是执行');
}
```

---

## 💻 自定义错误

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('验证失败');
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 了解常见错误类型
- [ ] 会使用 try-catch
- [ ] 能够自定义错误
- [ ] 掌握调试技巧

---

## 🔗 相关资源

- [MDN - 错误处理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
