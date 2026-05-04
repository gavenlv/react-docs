# 18 - 闭包与作用域

## 🎯 本节目标
- 理解作用域的概念
- 掌握闭包的原理
- 学会使用闭包
- 了解闭包的应用场景

---

## 📖 作用域

### 全局作用域

```javascript
const globalVar = '全局变量';
```

### 函数作用域

```javascript
function foo() {
  const localVar = '局部变量';
}
```

### 块级作用域

```javascript
if (true) {
  const blockVar = '块级变量';
}
```

---

## 🔒 闭包

闭包是指有权访问另一个函数作用域中变量的函数。

```javascript
function outer() {
  const count = 0;
  
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter());  // 1
console.log(counter());  // 2
```

---

## 💻 应用场景

### 私有变量

```javascript
function createCounter() {
  let count = 0;
  
  return {
    increment() { count++; },
    getCount() { return count; }
  };
}
```

### 函数工厂

```javascript
function multiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplier(2);
console.log(double(5));  // 10
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解作用域类型
- [ ] 掌握闭包原理
- [ ] 会使用闭包实现私有变量
- [ ] 了解闭包的应用场景

---

## 🔗 相关资源

- [MDN - 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
