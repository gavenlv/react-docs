# 02 - 变量与数据类型

## 🎯 本节目标
- 理解变量的概念和作用
- 掌握 let、const、var 的区别
- 了解 JavaScript 的数据类型
- 学会类型检测和类型转换

---

## 📖 什么是变量？

### 一句话解释

变量是存储数据的容器。你可以把它想象成一个"盒子"，用来存放各种数据。

### 生活类比

| 生活场景 | 编程概念 |
|---------|---------|
| 盒子 | 变量 |
| 盒子上的标签 | 变量名 |
| 盒子里的东西 | 变量值 |
| 盒子的类型（纸盒、铁盒） | 数据类型 |

```javascript
let age = 25;        // 创建一个叫 age 的盒子，里面放数字 25
let name = '张三';   // 创建一个叫 name 的盒子，里面放字符串 '张三'
let isStudent = true; // 创建一个叫 isStudent 的盒子，里面放布尔值 true
```

---

## 📝 变量声明方式

### 1. let - 可变变量

`let` 声明的变量可以被重新赋值。

```javascript
let age = 25;
console.log(age);  // 25

age = 26;          // 重新赋值
console.log(age);  // 26

let score;         // 先声明
score = 100;       // 后赋值
```

### 2. const - 常量

`const` 声明的变量不能被重新赋值（必须初始化）。

```javascript
const PI = 3.14159;
console.log(PI);  // 3.14159

PI = 3.14;        // ❌ 错误！不能重新赋值

const MAX_SIZE = 100;  // 常量通常使用大写字母
```

> ⚠️ **注意**：`const` 声明的对象，其属性可以被修改：

```javascript
const user = { name: '张三', age: 25 };
user.age = 26;        // ✅ 可以修改属性
user.city = '北京';    // ✅ 可以添加属性

user = { name: '李四' }; // ❌ 错误！不能重新赋值整个对象
```

### 3. var - 旧版声明方式

`var` 是 ES6 之前的声明方式，现在不推荐使用。

```javascript
var name = '张三';
var name = '李四';  // 可以重复声明（不推荐）

console.log(age);   // undefined（变量提升）
var age = 25;
```

### let vs const vs var

| 特性 | let | const | var |
|------|-----|-------|-----|
| 作用域 | 块级 | 块级 | 函数级 |
| 变量提升 | ❌ | ❌ | ✅ |
| 重复声明 | ❌ | ❌ | ✅ |
| 重新赋值 | ✅ | ❌ | ✅ |
| 初始值 | 可选 | 必须 | 可选 |
| 推荐使用 | ✅ | ✅ | ❌ |

---

## 📊 数据类型

JavaScript 是一门**动态类型语言**，变量的类型在运行时确定。

### 原始类型（Primitive Types）

| 类型 | 描述 | 示例 |
|------|------|------|
| **Number** | 数字（整数和浮点数） | `42`, `3.14`, `-10` |
| **String** | 字符串 | `'hello'`, `"world"`, `` `template` `` |
| **Boolean** | 布尔值 | `true`, `false` |
| **undefined** | 未定义 | `undefined` |
| **null** | 空值 | `null` |
| **Symbol** | 符号（ES6） | `Symbol('id')` |
| **BigInt** | 大整数（ES2020） | `9007199254740991n` |

### 引用类型（Reference Types）

| 类型 | 描述 | 示例 |
|------|------|------|
| **Object** | 对象 | `{ name: '张三' }` |
| **Array** | 数组 | `[1, 2, 3]` |
| **Function** | 函数 | `function() {}` |
| **Date** | 日期 | `new Date()` |
| **RegExp** | 正则表达式 | `/pattern/` |

---

## 🔢 Number 类型

```javascript
// 整数
let integer = 42;

// 浮点数
let float = 3.14;

// 科学计数法
let scientific = 2.5e6;  // 2500000

// 二进制
let binary = 0b1010;  // 10

// 八进制
let octal = 0o755;  // 493

// 十六进制
let hex = 0xFF;  // 255

// 特殊值
let infinity = Infinity;    // 无穷大
let negInfinity = -Infinity; // 负无穷大
let notANumber = NaN;       // 非数字

// 检查是否为数字
console.log(Number.isFinite(42));     // true
console.log(Number.isInteger(42));    // true
console.log(Number.isNaN(NaN));       // true
console.log(isNaN('hello'));          // true（先转换再判断）
console.log(Number.isNaN('hello'));   // false（严格判断）
```

---

## 📝 String 类型

```javascript
// 单引号
let single = 'hello';

// 双引号
let double = "world";

// 模板字符串（推荐）
let name = '张三';
let greeting = `你好，${name}！`;
console.log(greeting);  // 你好，张三！

// 多行字符串
let multiline = `
  第一行
  第二行
  第三行
`;

// 常用方法
let str = 'Hello, World!';
console.log(str.length);           // 13
console.log(str.toUpperCase());    // HELLO, WORLD!
console.log(str.toLowerCase());    // hello, world!
console.log(str.indexOf('World')); // 7
console.log(str.slice(0, 5));      // Hello
console.log(str.split(', '));      // ['Hello', 'World!']
```

---

## ✅ Boolean 类型

```javascript
let isTrue = true;
let isFalse = false;

// 比较运算符返回布尔值
console.log(5 > 3);   // true
console.log(5 === 5); // true
console.log(5 !== 3); // true

// 假值（Falsy Values）
console.log(Boolean(false));     // false
console.log(Boolean(0));         // false
console.log(Boolean(-0));        // false
console.log(Boolean(0n));        // false
console.log(Boolean(''));        // false
console.log(Boolean(null));      // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN));       // false

// 真值（Truthy Values）- 除假值外的所有值
console.log(Boolean(1));         // true
console.log(Boolean('hello'));   // true
console.log(Boolean([]));        // true
console.log(Boolean({}));        // true
```

---

## 🔄 undefined 和 null

```javascript
// undefined - 变量已声明但未赋值
let a;
console.log(a);          // undefined
console.log(typeof a);   // 'undefined'

// null - 表示"空"或"无"
let b = null;
console.log(b);          // null
console.log(typeof b);   // 'object'（历史遗留问题）

// 区别
console.log(undefined == null);  // true（值相等）
console.log(undefined === null); // false（类型不同）

// 使用场景
let user = null;        // 表示"暂时没有用户"
let data = undefined;   // 表示"数据未初始化"（通常不显式使用）
```

---

## 🔍 类型检测

### typeof 操作符

```javascript
console.log(typeof 42);           // 'number'
console.log(typeof 'hello');      // 'string'
console.log(typeof true);         // 'boolean'
console.log(typeof undefined);    // 'undefined'
console.log(typeof null);         // 'object'（历史遗留问题）
console.log(typeof {});           // 'object'
console.log(typeof []);           // 'object'
console.log(typeof function(){}); // 'function'
console.log(typeof Symbol());     // 'symbol'
```

### instanceof 操作符

```javascript
console.log([] instanceof Array);    // true
console.log({} instanceof Object);   // true
console.log(new Date() instanceof Date);  // true
```

### Array.isArray()

```javascript
console.log(Array.isArray([1, 2, 3]));  // true
console.log(Array.isArray({}));         // false
```

---

## 🔄 类型转换

### 显式转换

```javascript
// 转换为数字
console.log(Number('42'));      // 42
console.log(Number('3.14'));    // 3.14
console.log(Number('hello'));   // NaN
console.log(parseInt('42px'));  // 42
console.log(parseFloat('3.14')); // 3.14

// 转换为字符串
console.log(String(42));        // '42'
console.log(String(true));      // 'true'
console.log((42).toString());   // '42'
console.log((3.14).toFixed(2)); // '3.14'

// 转换为布尔值
console.log(Boolean(1));        // true
console.log(Boolean(0));        // false
console.log(Boolean(''));       // false
console.log(Boolean('hello'));  // true
```

### 隐式转换

```javascript
// 字符串拼接
console.log('1' + 2);           // '12'
console.log('1' + 2 + 3);       // '123'
console.log(1 + 2 + '3');       // '33'

// 数学运算
console.log('10' - 5);          // 5
console.log('10' * 2);          // 20
console.log('10' / 2);          // 5

// 比较运算
console.log('10' == 10);        // true（会转换）
console.log('10' === 10);       // false（不转换，推荐）
```

---

## 💻 实战示例：用户信息处理

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>变量与数据类型示例</title>
</head>
<body>
  <script>
    // 用户信息
    const userName = '张三';
    let age = 25;
    const isStudent = false;
    let skills = ['HTML', 'CSS', 'JavaScript'];
    let profile = {
      email: 'zhangsan@example.com',
      city: '北京'
    };

    // 类型检测
    console.log('用户名类型:', typeof userName);
    console.log('年龄类型:', typeof age);
    console.log('是否学生类型:', typeof isStudent);
    console.log('技能类型:', typeof skills);
    console.log('是否数组:', Array.isArray(skills));

    // 类型转换
    let ageString = String(age);
    let ageNumber = Number(ageString);
    console.log('年龄字符串:', ageString, typeof ageString);
    console.log('年龄数字:', ageNumber, typeof ageNumber);

    // 模板字符串
    let introduction = `
      用户信息：
      姓名：${userName}
      年龄：${age}岁
      学生：${isStudent ? '是' : '否'}
      技能：${skills.join('、')}
      邮箱：${profile.email}
      城市：${profile.city}
    `;
    console.log(introduction);
  </script>
</body>
</html>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解变量的概念和作用
- [ ] 正确使用 let、const 声明变量
- [ ] 了解 var 的问题和不推荐使用的原因
- [ ] 掌握 JavaScript 的基本数据类型
- [ ] 能够进行类型检测和类型转换

---

## 📝 练习任务

### 任务 1：变量声明练习
创建以下变量并打印它们的类型：
- 你的名字（字符串）
- 你的年龄（数字）
- 你是否已婚（布尔值）
- 你的爱好列表（数组）
- 你的个人信息（对象）

### 任务 2：类型转换练习
```javascript
// 将以下值转换为数字，并打印结果
console.log(Number('123'));
console.log(Number('abc'));
console.log(parseInt('123.45'));
console.log(parseFloat('123.45'));

// 将以下值转换为字符串
console.log(String(123));
console.log((123).toString());

// 将以下值转换为布尔值
console.log(Boolean(1));
console.log(Boolean(0));
console.log(Boolean(''));
console.log(Boolean('hello'));
```

---

## 🔗 相关资源

- [MDN - JavaScript 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
- [MDN - let](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let)
- [MDN - const](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/const)
