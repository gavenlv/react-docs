# 04 - 流程控制语句

## 🎯 本节目标
- 掌握条件语句（if、switch）
- 掌握循环语句（for、while、do-while）
- 学会使用 break 和 continue
- 理解循环的最佳实践

---

## 📖 什么是流程控制？

流程控制语句用于控制代码的执行顺序。默认情况下，代码从上到下依次执行，但我们可以通过流程控制语句改变这个顺序。

```javascript
console.log('第一行');
console.log('第二行');
console.log('第三行');
// 默认顺序执行
```

---

## 🔀 条件语句

### if 语句

```javascript
let age = 18;

if (age >= 18) {
  console.log('你已经成年了');
}
```

### if-else 语句

```javascript
let age = 16;

if (age >= 18) {
  console.log('你已经成年了');
} else {
  console.log('你还未成年');
}
```

### if-else if-else 语句

```javascript
let score = 85;

if (score >= 90) {
  console.log('优秀');
} else if (score >= 80) {
  console.log('良好');
} else if (score >= 60) {
  console.log('及格');
} else {
  console.log('不及格');
}
```

### 嵌套 if

```javascript
let age = 25;
let hasLicense = true;

if (age >= 18) {
  if (hasLicense) {
    console.log('可以开车');
  } else {
    console.log('需要先考驾照');
  }
} else {
  console.log('年龄不够');
}
```

---

## 🔀 switch 语句

当需要比较多个固定值时，switch 比 if-else 更清晰：

```javascript
let day = 3;
let dayName;

switch (day) {
  case 1:
    dayName = '星期一';
    break;
  case 2:
    dayName = '星期二';
    break;
  case 3:
    dayName = '星期三';
    break;
  case 4:
    dayName = '星期四';
    break;
  case 5:
    dayName = '星期五';
    break;
  case 6:
    dayName = '星期六';
    break;
  case 7:
    dayName = '星期日';
    break;
  default:
    dayName = '无效的日期';
}

console.log(dayName);  // '星期三'
```

### switch 穿透

```javascript
let month = 2;
let season;

switch (month) {
  case 12:
  case 1:
  case 2:
    season = '冬季';
    break;
  case 3:
  case 4:
  case 5:
    season = '春季';
    break;
  case 6:
  case 7:
  case 8:
    season = '夏季';
    break;
  case 9:
  case 10:
  case 11:
    season = '秋季';
    break;
  default:
    season = '无效的月份';
}

console.log(season);  // '冬季'
```

---

## 🔄 循环语句

### for 循环

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);  // 0, 1, 2, 3, 4
}

// 循环数组
const fruits = ['苹果', '香蕉', '橙子'];
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
```

### while 循环

```javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// 注意：一定要确保循环条件最终会变为 false，否则会无限循环
```

### do-while 循环

```javascript
let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);

// do-while 至少执行一次
let j = 10;
do {
  console.log(j);  // 10（即使条件不满足，也执行一次）
} while (j < 5);
```

---

## 🔄 for...of 和 for...in

### for...of（遍历值）

```javascript
const fruits = ['苹果', '香蕉', '橙子'];

for (const fruit of fruits) {
  console.log(fruit);
}
// 苹果
// 香蕉
// 橙子

// 遍历字符串
for (const char of 'Hello') {
  console.log(char);
}
// H e l l o
```

### for...in（遍历键/索引）

```javascript
const fruits = ['苹果', '香蕉', '橙子'];

for (const index in fruits) {
  console.log(`${index}: ${fruits[index]}`);
}
// 0: 苹果
// 1: 香蕉
// 2: 橙子

// 遍历对象
const user = { name: '张三', age: 25, city: '北京' };
for (const key in user) {
  console.log(`${key}: ${user[key]}`);
}
// name: 张三
// age: 25
// city: 北京
```

---

## ⏹️ break 和 continue

### break（终止循环）

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    break;  // 当 i 等于 5 时，终止循环
  }
  console.log(i);
}
// 0, 1, 2, 3, 4
```

### continue（跳过当前迭代）

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) {
    continue;  // 跳过 i 等于 2 的情况
  }
  console.log(i);
}
// 0, 1, 3, 4
```

### 标签语句

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break outer;  // 跳出外层循环
    }
    console.log(`i=${i}, j=${j}`);
  }
}
// i=0, j=0
// i=0, j=1
// i=0, j=2
// i=1, j=0
```

---

## 📊 循环对比

| 循环类型 | 适用场景 | 特点 |
|----------|----------|------|
| `for` | 已知循环次数 | 最常用，灵活 |
| `while` | 不确定循环次数 | 先判断后执行 |
| `do-while` | 至少执行一次 | 先执行后判断 |
| `for...of` | 遍历数组/字符串 | 简洁，获取值 |
| `for...in` | 遍历对象 | 获取键/索引 |
| `forEach` | 数组方法 | 无法 break |

---

## 💻 实战示例：猜数字游戏

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>猜数字游戏</title>
</head>
<body>
  <script>
    const target = Math.floor(Math.random() * 100) + 1;
    let guess;
    let attempts = 0;
    
    while (guess !== target) {
      guess = parseInt(prompt('猜一个 1-100 的数字：'));
      attempts++;
      
      if (guess < target) {
        alert('太小了，再试试！');
      } else if (guess > target) {
        alert('太大了，再试试！');
      } else {
        alert(`恭喜你猜对了！用了 ${attempts} 次`);
      }
    }
  </script>
</body>
</html>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 掌握 if-else 条件语句
- [ ] 会使用 switch 处理多分支
- [ ] 掌握 for、while、do-while 循环
- [ ] 会使用 for...of 和 for...in
- [ ] 理解 break 和 continue 的作用

---

## 📝 练习任务

### 任务 1：成绩等级
编写程序，根据分数输出等级：
- 90-100: A
- 80-89: B
- 70-79: C
- 60-69: D
- 0-59: F

### 任务 2：九九乘法表
使用嵌套循环打印九九乘法表。

### 任务 3：找素数
找出 1-100 之间的所有素数。

---

## 🔗 相关资源

- [MDN - 控制流程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN - 循环与迭代](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Loops_and_iteration)
