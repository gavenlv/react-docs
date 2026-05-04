# 08 - 字符串处理

## 🎯 本节目标
- 掌握字符串的创建方式
- 学会使用字符串方法
- 了解模板字符串
- 掌握正则表达式基础

---

## 📖 字符串创建

```javascript
const str1 = 'Hello';           // 单引号
const str2 = "World";           // 双引号
const str3 = `Hello ${str2}`;   // 模板字符串

const str4 = String(123);       // 转换为字符串
const str5 = (123).toString();  // 转换为字符串
```

---

## 📏 字符串属性

```javascript
const str = 'Hello, World!';

console.log(str.length);  // 13
```

---

## 🔧 字符串方法

### 访问字符

```javascript
const str = 'Hello';

str[0];           // 'H'
str.charAt(0);    // 'H'
str.charCodeAt(0); // 72 (ASCII 码)
str.at(-1);       // 'o' (ES2022)
```

### 查找方法

```javascript
const str = 'Hello, World!';

str.indexOf('o');       // 4
str.lastIndexOf('o');   // 8
str.includes('World');  // true
str.startsWith('Hello'); // true
str.endsWith('!');      // true
str.search(/World/);    // 7
str.match(/o/g);        // ['o', 'o']
str.matchAll(/o/g);     // 迭代器
```

### 截取方法

```javascript
const str = 'Hello, World!';

str.slice(0, 5);    // 'Hello'
str.slice(-6);      // 'World!'
str.substring(0, 5); // 'Hello'
str.substr(0, 5);   // 'Hello' (已废弃)
```

### 修改方法

```javascript
const str = 'Hello, World!';

str.toLowerCase();      // 'hello, world!'
str.toUpperCase();      // 'HELLO, WORLD!'
str.trim();             // 去除两端空白
str.trimStart();        // 去除开头空白
str.trimEnd();          // 去除结尾空白
str.repeat(3);          // 重复3次
str.padStart(10, '.');  // '...Hello'
str.padEnd(10, '.');    // 'Hello...'
```

### 分割和替换

```javascript
const str = 'Hello, World!';

str.split(', ');        // ['Hello', 'World!']
str.replace('World', 'JS');  // 'Hello, JS!'
str.replaceAll('o', '0');    // 'Hell0, W0rld!'
```

### 连接方法

```javascript
const str1 = 'Hello';
const str2 = 'World';

str1.concat(', ', str2);  // 'Hello, World'
str1 + ', ' + str2;       // 'Hello, World'
`${str1}, ${str2}`;       // 'Hello, World'
```

---

## 📝 模板字符串

```javascript
const name = '张三';
const age = 25;

const greeting = `你好，我是${name}，今年${age}岁`;
console.log(greeting);  // 你好，我是张三，今年25岁

const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>年龄：${age}</p>
  </div>
`;

const price = 99.9;
const formatted = `价格：¥${price.toFixed(2)}`;
console.log(formatted);  // 价格：¥99.90
```

### 标签模板

```javascript
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? `<strong>${values[i]}</strong>` : '';
    return result + str + value;
  }, '');
}

const name = '张三';
const age = 25;

const result = highlight`你好，我是${name}，今年${age}岁`;
console.log(result);  // 你好，我是<strong>张三</strong>，今年<strong>25</strong>岁
```

---

## 🔍 正则表达式

### 创建正则表达式

```javascript
const re1 = /pattern/flags;
const re2 = new RegExp('pattern', 'flags');

const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phone = /^1[3-9]\d{9}$/;
```

### 常用标志

| 标志 | 含义 |
|------|------|
| `g` | 全局匹配 |
| `i` | 忽略大小写 |
| `m` | 多行模式 |
| `s` | `.` 匹配换行符 |
| `u` | Unicode 模式 |

### 常用方法

```javascript
const str = 'Hello, World!';

str.test(/Hello/);     // 报错，test 是正则方法

/hello/i.test(str);    // true
/Hello/.test(str);     // true

str.match(/o/g);       // ['o', 'o']
str.matchAll(/o/g);    // 迭代器

str.replace(/o/g, '0'); // 'Hell0, W0rld!'
str.search(/World/);   // 7
str.split(/,\s*/);     // ['Hello', 'World!']
```

### 常用模式

```javascript
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^1[3-9]\d{9}$/,
  url: /^https?:\/\/[^\s]+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}(:\d{2})?$/,
  ip: /^(\d{1,3}\.){3}\d{1,3}$/,
  chinese: /^[\u4e00-\u9fa5]+$/,
  idCard: /^\d{17}[\dXx]$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
};
```

---

## 💻 实战示例：字符串工具

```javascript
const StringUtils = {
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  camelCase(str) {
    return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  },
  
  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },
  
  truncate(str, length, suffix = '...') {
    return str.length > length ? str.slice(0, length) + suffix : str;
  },
  
  escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
  },
  
  unescapeHtml(str) {
    const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'" };
    return str.replace(/&(amp|lt|gt|quot|#039);/g, m => map[m]);
  },
  
  mask(str, start = 0, end = str.length, char = '*') {
    return str.slice(0, start) + char.repeat(end - start) + str.slice(end);
  },
  
  isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  },
  
  isPhone(str) {
    return /^1[3-9]\d{9}$/.test(str);
  }
};
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握字符串的创建方式
- [ ] 会使用常用字符串方法
- [ ] 掌握模板字符串
- [ ] 了解正则表达式基础
- [ ] 能够编写字符串处理函数

---

## 📝 练习任务

### 任务 1：字符串反转
编写函数，反转字符串。

### 任务 2：统计字符
编写函数，统计字符串中每个字符出现的次数。

### 任务 3：验证表单
使用正则表达式验证邮箱、手机号、身份证号。

---

## 🔗 相关资源

- [MDN - 字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN - 正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
