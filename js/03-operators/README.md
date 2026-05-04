# 03 - 运算符与表达式

## 🎯 本节目标
- 掌握各种运算符的使用
- 理解运算符优先级
- 学会使用表达式计算值
- 了解短路求值

---

## 📖 什么是运算符？

运算符是用于执行操作的符号。表达式是由变量、常量和运算符组成的代码片段，可以计算出一个值。

```javascript
let a = 10;        // = 是赋值运算符
let b = a + 5;     // + 是算术运算符
let c = a > 5;     // > 是比较运算符
let d = a && b;    // && 是逻辑运算符
```

---

## ➕ 算术运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `+` | 加法 | `5 + 3` | `8` |
| `-` | 减法 | `5 - 3` | `2` |
| `*` | 乘法 | `5 * 3` | `15` |
| `/` | 除法 | `6 / 3` | `2` |
| `%` | 取余 | `5 % 3` | `2` |
| `**` | 幂运算 | `2 ** 3` | `8` |
| `++` | 自增 | `let a = 1; a++` | `2` |
| `--` | 自减 | `let a = 1; a--` | `0` |

```javascript
let a = 10;
let b = 3;

console.log(a + b);   // 13
console.log(a - b);   // 7
console.log(a * b);   // 30
console.log(a / b);   // 3.333...
console.log(a % b);   // 1
console.log(a ** b);  // 1000

// 自增/自减
let x = 5;
console.log(x++);     // 5（先返回，后自增）
console.log(x);       // 6

let y = 5;
console.log(++y);     // 6（先自增，后返回）
console.log(y);       // 6
```

---

## 📝 赋值运算符

| 运算符 | 描述 | 示例 | 等价于 |
|--------|------|------|--------|
| `=` | 赋值 | `x = 5` | `x = 5` |
| `+=` | 加后赋值 | `x += 3` | `x = x + 3` |
| `-=` | 减后赋值 | `x -= 3` | `x = x - 3` |
| `*=` | 乘后赋值 | `x *= 3` | `x = x * 3` |
| `/=` | 除后赋值 | `x /= 3` | `x = x / 3` |
| `%=` | 取余后赋值 | `x %= 3` | `x = x % 3` |
| `**=` | 幂运算后赋值 | `x **= 3` | `x = x ** 3` |

```javascript
let x = 10;

x += 5;    // x = 15
x -= 3;    // x = 12
x *= 2;    // x = 24
x /= 4;    // x = 6
x %= 4;    // x = 2
x **= 3;   // x = 8
```

---

## 🔍 比较运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `==` | 相等（会转换类型） | `5 == '5'` | `true` |
| `===` | 严格相等 | `5 === '5'` | `false` |
| `!=` | 不相等（会转换类型） | `5 != '5'` | `false` |
| `!==` | 严格不相等 | `5 !== '5'` | `true` |
| `>` | 大于 | `5 > 3` | `true` |
| `<` | 小于 | `5 < 3` | `false` |
| `>=` | 大于等于 | `5 >= 5` | `true` |
| `<=` | 小于等于 | `5 <= 3` | `false` |

```javascript
console.log(5 == '5');    // true（类型转换后比较）
console.log(5 === '5');   // false（严格比较，推荐）
console.log(5 != '5');    // false
console.log(5 !== '5');   // true（推荐）

console.log(null == undefined);  // true
console.log(null === undefined); // false

console.log(NaN === NaN);  // false（NaN 不等于任何值）
console.log(Number.isNaN(NaN));  // true
```

---

## 🔗 逻辑运算符

| 运算符 | 描述 | 示例 | 结果 |
|--------|------|------|------|
| `&&` | 逻辑与 | `true && false` | `false` |
| `\|\|` | 逻辑或 | `true \|\| false` | `true` |
| `!` | 逻辑非 | `!true` | `false` |

```javascript
console.log(true && true);    // true
console.log(true && false);   // false
console.log(false && true);   // false

console.log(true || false);   // true
console.log(false || true);   // true
console.log(false || false);  // false

console.log(!true);           // false
console.log(!false);          // true
console.log(!!1);             // true（双重否定转布尔值）
```

### 短路求值

```javascript
// && 短路：第一个为假，不计算第二个
let a = false && console.log('不会执行');
console.log(a);  // false

// || 短路：第一个为真，不计算第二个
let b = true || console.log('不会执行');
console.log(b);  // true

// 实际应用
let name = user.name || '默认名称';  // 如果 user.name 为假，使用默认值
let value = obj && obj.prop;         // 安全访问属性
```

### 空值合并运算符 ??

```javascript
// ?? 只在 null 或 undefined 时使用默认值
let a = null ?? 'default';     // 'default'
let b = undefined ?? 'default'; // 'default'
let c = 0 ?? 'default';        // 0（不是 null/undefined）
let d = '' ?? 'default';       // ''（不是 null/undefined）

// 对比 ||
let e = 0 || 'default';        // 'default'（0 是假值）
let f = '' || 'default';       // 'default'（'' 是假值）
```

### 可选链运算符 ?.

```javascript
const user = {
  name: '张三',
  address: {
    city: '北京'
  }
};

console.log(user?.name);              // '张三'
console.log(user?.address?.city);     // '北京'
console.log(user?.phone?.number);     // undefined（不会报错）
console.log(user.phone?.number);      // undefined
```

---

## ❓ 条件（三元）运算符

```javascript
// 语法：condition ? valueIfTrue : valueIfFalse
let age = 18;
let status = age >= 18 ? '成年' : '未成年';
console.log(status);  // '成年'

// 嵌套使用
let score = 85;
let grade = score >= 90 ? 'A' :
            score >= 80 ? 'B' :
            score >= 70 ? 'C' :
            score >= 60 ? 'D' : 'F';
console.log(grade);  // 'B'
```

---

## 🔤 字符串运算符

```javascript
// 拼接
let greeting = 'Hello' + ' ' + 'World';
console.log(greeting);  // 'Hello World'

// 模板字符串（推荐）
let name = '张三';
let message = `你好，${name}！`;
console.log(message);  // '你好，张三！'

// 隐式转换
console.log('1' + 2);    // '12'
console.log(1 + 2 + '3'); // '33'
console.log('1' + 2 + 3); // '123'
```

---

## 📊 运算符优先级

从高到低：

| 优先级 | 运算符 |
|--------|--------|
| 1 | `()` 分组 |
| 2 | `.` `[]` `?.` 成员访问 |
| 3 | `()` 函数调用 |
| 4 | `new` |
| 5 | `++` `--` 后缀 |
| 6 | `!` `~` `+` `-` `++` `--` `typeof` `void` `delete` |
| 7 | `**` |
| 8 | `*` `/` `%` |
| 9 | `+` `-` |
| 10 | `<<` `>>` `>>>` |
| 11 | `<` `<=` `>` `>=` `in` `instanceof` |
| 12 | `==` `!=` `===` `!==` |
| 13 | `&&` |
| 14 | `\|\|` `??` |
| 15 | `?:` |
| 16 | `=` `+=` `-=` `*=` 等 |
| 17 | `,` |

```javascript
let result = 2 + 3 * 4;     // 14（先乘后加）
let result2 = (2 + 3) * 4;  // 20（括号优先）

let x = 5;
let y = x > 3 && x < 10;    // true
let z = x < 3 || x > 10;    // false
```

---

## 💻 实战示例：计算器

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>运算符示例</title>
</head>
<body>
  <script>
    let a = 10;
    let b = 3;
    
    console.log('算术运算：');
    console.log(`${a} + ${b} = ${a + b}`);
    console.log(`${a} - ${b} = ${a - b}`);
    console.log(`${a} * ${b} = ${a * b}`);
    console.log(`${a} / ${b} = ${(a / b).toFixed(2)}`);
    console.log(`${a} % ${b} = ${a % b}`);
    console.log(`${a} ** ${b} = ${a ** b}`);
    
    console.log('\n比较运算：');
    console.log(`${a} > ${b}: ${a > b}`);
    console.log(`${a} === ${b}: ${a === b}`);
    
    console.log('\n逻辑运算：');
    console.log(`true && false: ${true && false}`);
    console.log(`true || false: ${true || false}`);
    console.log(`!true: ${!true}`);
    
    console.log('\n三元运算：');
    let max = a > b ? a : b;
    console.log(`max(${a}, ${b}) = ${max}`);
  </script>
</body>
</html>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握算术运算符的使用
- [ ] 理解 `==` 和 `===` 的区别
- [ ] 会使用逻辑运算符和短路求值
- [ ] 掌握三元运算符的使用
- [ ] 了解运算符优先级

---

## 📝 练习任务

### 任务 1：计算练习
```javascript
console.log(10 + 20 * 3);      // ?
console.log((10 + 20) * 3);    // ?
console.log(10 % 3);           // ?
console.log(2 ** 10);          // ?
```

### 任务 2：比较练习
```javascript
console.log(5 == '5');         // ?
console.log(5 === '5');        // ?
console.log(null == undefined);// ?
console.log(null === undefined);// ?
```

### 任务 3：逻辑练习
```javascript
console.log(true && false && true);  // ?
console.log(true || false || false); // ?
console.log(!true && !false);        // ?
```

---

## 🔗 相关资源

- [MDN - 运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Expressions_and_Operators)
- [MDN - 运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
