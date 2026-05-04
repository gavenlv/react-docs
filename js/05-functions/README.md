# 05 - 函数基础

## 🎯 本节目标
- 理解函数的概念和作用
- 掌握函数的定义和调用
- 了解参数和返回值
- 学会使用箭头函数

---

## 📖 什么是函数？

函数是一段可重复使用的代码块，用于执行特定任务。

### 生活类比

| 生活场景 | 编程概念 |
|---------|---------|
| 菜谱 | 函数定义 |
| 按菜谱做菜 | 函数调用 |
| 食材 | 参数 |
| 成品菜 | 返回值 |

```javascript
function greet(name) {
  return `你好，${name}！`;
}

console.log(greet('张三'));  // 你好，张三！
console.log(greet('李四'));  // 你好，李四！
```

---

## 📝 函数定义方式

### 1. 函数声明

```javascript
function sayHello() {
  console.log('Hello!');
}

sayHello();  // 调用函数
```

### 2. 函数表达式

```javascript
const sayHello = function() {
  console.log('Hello!');
};

sayHello();
```

### 3. 箭头函数（ES6）

```javascript
const sayHello = () => {
  console.log('Hello!');
};

// 简写形式
const add = (a, b) => a + b;

// 单参数可省略括号
const double = n => n * 2;
```

### 函数声明 vs 函数表达式

```javascript
// 函数声明会被提升
console.log(foo());  // 'foo'

function foo() {
  return 'foo';
}

// 函数表达式不会被提升
console.log(bar);  // undefined
bar();              // TypeError: bar is not a function

var bar = function() {
  return 'bar';
};
```

---

## 📥 参数

### 基本参数

```javascript
function greet(name, age) {
  console.log(`你好，我是${name}，今年${age}岁`);
}

greet('张三', 25);  // 你好，我是张三，今年25岁
greet('李四');     // 你好，我是李四，今年undefined岁
```

### 默认参数（ES6）

```javascript
function greet(name = '匿名', age = 18) {
  console.log(`你好，我是${name}，今年${age}岁`);
}

greet();           // 你好，我是匿名，今年18岁
greet('张三');     // 你好，我是张三，今年18岁
greet('李四', 30); // 你好，我是李四，今年30岁
```

### 剩余参数（Rest Parameters）

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3, 4, 5));  // 15
```

### 解构参数

```javascript
function printUser({ name, age, city = '未知' }) {
  console.log(`${name}, ${age}岁, 来自${city}`);
}

printUser({ name: '张三', age: 25 });
// 张三, 25岁, 来自未知
```

---

## 📤 返回值

### return 语句

```javascript
function add(a, b) {
  return a + b;
}

const result = add(3, 5);
console.log(result);  // 8

// 没有返回值的函数返回 undefined
function noReturn() {
  console.log('没有 return');
}

console.log(noReturn());  // undefined
```

### 提前返回

```javascript
function divide(a, b) {
  if (b === 0) {
    return '除数不能为 0';
  }
  return a / b;
}

console.log(divide(10, 2));  // 5
console.log(divide(10, 0));  // '除数不能为 0'
```

### 返回多个值

```javascript
function getMinMax(numbers) {
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers)
  };
}

const { min, max } = getMinMax([1, 5, 3, 9, 2]);
console.log(min, max);  // 1 9
```

---

## 🏹 箭头函数详解

### 语法

```javascript
// 无参数
const sayHi = () => console.log('Hi!');

// 单参数
const double = x => x * 2;

// 多参数
const add = (a, b) => a + b;

// 多行代码
const calculate = (a, b, c) => {
  const sum = a + b;
  return sum * c;
};

// 返回对象
const createUser = (name, age) => ({ name, age });
```

### 箭头函数 vs 普通函数

| 特性 | 箭头函数 | 普通函数 |
|------|----------|----------|
| this 绑定 | 继承外层 | 动态绑定 |
| arguments | ❌ 没有 | ✅ 有 |
| 构造函数 | ❌ 不能 | ✅ 可以 |
| 提升 | ❌ 不会 | ✅ 会 |

```javascript
const obj = {
  name: '张三',
  
  // 普通函数
  greetRegular: function() {
    console.log(`你好，${this.name}`);
  },
  
  // 箭头函数
  greetArrow: () => {
    console.log(`你好，${this.name}`);  // this 指向外层
  }
};

obj.greetRegular();  // 你好，张三
obj.greetArrow();    // 你好，undefined
```

---

## 📞 回调函数

回调函数是作为参数传递给另一个函数的函数。

```javascript
function processArray(arr, callback) {
  const result = [];
  for (const item of arr) {
    result.push(callback(item));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];

const doubled = processArray(numbers, x => x * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

const squared = processArray(numbers, x => x * x);
console.log(squared);  // [1, 4, 9, 16, 25]
```

---

## 🔒 作用域

### 全局作用域

```javascript
const globalVar = '全局变量';

function foo() {
  console.log(globalVar);  // 可以访问
}

foo();
console.log(globalVar);    // 可以访问
```

### 函数作用域

```javascript
function foo() {
  const localVar = '局部变量';
  console.log(localVar);  // 可以访问
}

foo();
console.log(localVar);    // ReferenceError: localVar is not defined
```

### 块级作用域

```javascript
if (true) {
  const blockVar = '块级变量';
  let blockLet = '块级 let';
  var blockVar2 = '块级 var';
}

console.log(blockVar);    // ReferenceError
console.log(blockLet);    // ReferenceError
console.log(blockVar2);   // '块级 var'（var 没有块级作用域）
```

---

## 💻 实战示例：工具函数库

```javascript
const Utils = {
  formatPrice(price) {
    return `¥${price.toFixed(2)}`;
  },
  
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  
  generateId: (() => {
    let id = 0;
    return () => ++id;
  })(),
  
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
  
  throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

console.log(Utils.formatPrice(99.9));      // ¥99.90
console.log(Utils.formatDate(new Date())); // 2024-01-15
console.log(Utils.generateId());           // 1
console.log(Utils.generateId());           // 2
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解函数的概念和作用
- [ ] 掌握函数声明和函数表达式
- [ ] 会使用参数和返回值
- [ ] 掌握箭头函数的语法
- [ ] 理解回调函数的概念

---

## 📝 练习任务

### 任务 1：温度转换
编写函数，将摄氏度转换为华氏度：
- 公式：F = C × 9/5 + 32

### 任务 2：计算器
编写一个计算器函数，接收两个数字和一个运算符，返回计算结果。

### 任务 3：数组处理
编写函数，实现以下功能：
- 过滤偶数
- 求数组元素之和
- 找出最大值

---

## 🔗 相关资源

- [MDN - 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Functions)
- [MDN - 箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
