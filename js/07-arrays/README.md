# 07 - 数组与数组方法

## 🎯 本节目标
- 理解数组的概念和创建方式
- 掌握数组的常用方法
- 学会数组遍历和转换
- 了解高阶函数的使用

---

## 📖 什么是数组？

数组是有序的数据集合，用于存储多个值。

```javascript
const fruits = ['苹果', '香蕉', '橙子'];

console.log(fruits[0]);  // 苹果
console.log(fruits.length);  // 3
```

---

## 📝 创建数组

### 1. 数组字面量

```javascript
const arr1 = [1, 2, 3, 4, 5];
const arr2 = ['a', 'b', 'c'];
const arr3 = [1, 'hello', true, { name: '张三' }];
```

### 2. Array 构造函数

```javascript
const arr1 = new Array(3);       // [empty × 3]
const arr2 = new Array(1, 2, 3); // [1, 2, 3]
```

### 3. Array.from()

```javascript
const arr1 = Array.from('hello');  // ['h', 'e', 'l', 'l', 'o']
const arr2 = Array.from({ length: 5 }, (_, i) => i);  // [0, 1, 2, 3, 4]
```

### 4. Array.of()

```javascript
const arr = Array.of(1, 2, 3);  // [1, 2, 3]
```

---

## 🔍 访问和修改

```javascript
const fruits = ['苹果', '香蕉', '橙子'];

console.log(fruits[0]);      // 苹果
console.log(fruits.at(-1));  // 橙子（ES2022）

fruits[1] = '葡萄';          // 修改
fruits[3] = '西瓜';          // 添加
```

---

## 📊 数组方法分类

### 添加/删除元素

| 方法 | 作用 | 是否改变原数组 |
|------|------|---------------|
| `push()` | 末尾添加 | ✅ |
| `pop()` | 末尾删除 | ✅ |
| `unshift()` | 开头添加 | ✅ |
| `shift()` | 开头删除 | ✅ |
| `splice()` | 任意位置添加/删除 | ✅ |
| `slice()` | 截取数组 | ❌ |
| `concat()` | 合并数组 | ❌ |

```javascript
const arr = [1, 2, 3];

arr.push(4);        // [1, 2, 3, 4]
arr.pop();          // [1, 2, 3]
arr.unshift(0);     // [0, 1, 2, 3]
arr.shift();        // [1, 2, 3]

arr.splice(1, 1);   // [1, 3]（从索引1删除1个）
arr.splice(1, 0, 2); // [1, 2, 3]（在索引1插入2）

const newArr = arr.slice(0, 2);  // [1, 2]
const merged = [1, 2].concat([3, 4]);  // [1, 2, 3, 4]
```

### 查找元素

| 方法 | 作用 | 返回值 |
|------|------|--------|
| `indexOf()` | 查找索引 | 索引/-1 |
| `lastIndexOf()` | 从后查找索引 | 索引/-1 |
| `includes()` | 是否包含 | true/false |
| `find()` | 查找元素 | 元素/undefined |
| `findIndex()` | 查找索引 | 索引/-1 |
| `findLast()` | 从后查找元素 | 元素/undefined |
| `findLastIndex()` | 从后查找索引 | 索引/-1 |

```javascript
const arr = [1, 2, 3, 4, 5, 3];

arr.indexOf(3);       // 2
arr.lastIndexOf(3);   // 5
arr.includes(3);      // true

arr.find(x => x > 3);     // 4
arr.findIndex(x => x > 3); // 3
```

### 遍历方法

| 方法 | 作用 | 返回值 |
|------|------|--------|
| `forEach()` | 遍历 | undefined |
| `map()` | 映射 | 新数组 |
| `filter()` | 过滤 | 新数组 |
| `reduce()` | 归约 | 累计值 |
| `reduceRight()` | 从右归约 | 累计值 |
| `some()` | 是否有满足条件的 | true/false |
| `every()` | 是否全部满足 | true/false |

```javascript
const numbers = [1, 2, 3, 4, 5];

// forEach
numbers.forEach((n, i) => console.log(`${i}: ${n}`));

// map
const doubled = numbers.map(n => n * 2);  // [2, 4, 6, 8, 10]

// filter
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4]

// reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);  // 15

// some
const hasEven = numbers.some(n => n % 2 === 0);  // true

// every
const allPositive = numbers.every(n => n > 0);  // true
```

### 排序和反转

```javascript
const arr = [3, 1, 4, 1, 5, 9, 2, 6];

arr.sort();  // [1, 1, 2, 3, 4, 5, 6, 9]（字典序）
arr.sort((a, b) => a - b);  // 数字升序
arr.sort((a, b) => b - a);  // 数字降序

arr.reverse();  // 反转
```

### 转换方法

```javascript
const arr = [1, 2, 3];

arr.join('-');   // '1-2-3'
arr.toString();  // '1,2,3'

// flat（扁平化）
const nested = [1, [2, 3], [4, [5, 6]]];
nested.flat();     // [1, 2, 3, 4, [5, 6]]
nested.flat(2);    // [1, 2, 3, 4, 5, 6]
nested.flat(Infinity);  // 完全扁平化

// flatMap
const sentences = ['Hello World', 'Good Morning'];
sentences.flatMap(s => s.split(' '));  // ['Hello', 'World', 'Good', 'Morning']
```

---

## 🔄 数组解构

```javascript
const arr = [1, 2, 3, 4, 5];

const [first, second] = arr;
console.log(first, second);  // 1 2

const [a, b, ...rest] = arr;
console.log(a, b, rest);  // 1 2 [3, 4, 5]

const [x = 0, y = 0, z = 0] = [1, 2];
console.log(x, y, z);  // 1 2 0
```

---

## 📐 展开运算符

```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

const merged = [...arr1, ...arr2];  // [1, 2, 3, 4, 5, 6]

const copy = [...arr1];  // 浅拷贝

const arr = [2, 3, ...arr1, 4];  // [2, 3, 1, 2, 3, 4]
```

---

## 💻 实战示例：购物车

```javascript
const ShoppingCart = {
  items: [],
  
  add(product) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
  },
  
  remove(id) {
    this.items = this.items.filter(item => item.id !== id);
  },
  
  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) this.remove(id);
    }
  },
  
  getTotal() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
};
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解数组的概念
- [ ] 掌握数组的创建和访问
- [ ] 会使用常用数组方法
- [ ] 掌握 map、filter、reduce
- [ ] 会使用数组解构和展开

---

## 📝 练习任务

### 任务 1：数组去重
编写函数，去除数组中的重复元素。

### 任务 2：数组扁平化
编写函数，将多维数组扁平化为一维数组。

### 任务 3：统计单词频率
给定一个字符串，统计每个单词出现的次数。

---

## 🔗 相关资源

- [MDN - 数组](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN - 数组方法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95)
