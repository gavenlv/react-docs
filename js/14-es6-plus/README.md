# 14 - ES6+ 新特性

## 🎯 本节目标
- 掌握 ES6+ 的主要新特性
- 了解解构赋值和展开运算符
- 学会使用新的数组和方法
- 了解最新的 JavaScript 特性

---

## 📝 解构赋值

### 数组解构

```javascript
const [a, b, c] = [1, 2, 3];
const [first, ...rest] = [1, 2, 3, 4, 5];
const [x = 0] = [];
```

### 对象解构

```javascript
const { name, age } = { name: '张三', age: 25 };
const { name: userName } = { name: '张三' };
const { city = '北京' } = {};
```

---

## 🔗 展开运算符

```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };
```

---

## 📊 新数组方法

```javascript
const arr = [1, 2, 3, 4, 5];

arr.includes(3);       // true
arr.find(x => x > 3);  // 4
arr.findIndex(x => x > 3); // 3
arr.flat();            // 扁平化
arr.flatMap(x => [x, x * 2]); // 映射后扁平化
```

---

## 📝 新对象方法

```javascript
const obj = { a: 1, b: 2 };

Object.keys(obj);      // ['a', 'b']
Object.values(obj);    // [1, 2]
Object.entries(obj);   // [['a', 1], ['b', 2]]
Object.fromEntries([['a', 1]]); // { a: 1 }
```

---

## 🆕 ES2020+ 新特性

### 可选链 (?.)

```javascript
const city = user?.address?.city;
```

### 空值合并 (??)

```javascript
const value = null ?? 'default';
```

### BigInt

```javascript
const big = 9007199254740991n;
```

### globalThis

```javascript
globalThis.setTimeout(() => {}, 1000);
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握解构赋值
- [ ] 会使用展开运算符
- [ ] 了解新的数组方法
- [ ] 了解新的对象方法
- [ ] 掌握可选链和空值合并

---

## 🔗 相关资源

- [ES6 特性](https://es6-features.org/)
- [MDN - JavaScript 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference)
