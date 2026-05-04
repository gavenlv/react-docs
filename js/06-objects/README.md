# 06 - 对象与属性

## 🎯 本节目标
- 理解对象的概念和创建方式
- 掌握属性的访问和操作
- 了解对象方法
- 学会使用对象解构和扩展

---

## 📖 什么是对象？

对象是键值对的集合，用于存储相关数据和功能。

```javascript
const person = {
  name: '张三',
  age: 25,
  city: '北京',
  sayHello() {
    console.log(`你好，我是${this.name}`);
  }
};

console.log(person.name);    // 张三
person.sayHello();           // 你好，我是张三
```

---

## 📝 创建对象

### 1. 对象字面量

```javascript
const user = {
  name: '张三',
  age: 25
};
```

### 2. new Object()

```javascript
const user = new Object();
user.name = '张三';
user.age = 25;
```

### 3. 构造函数

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const user = new Person('张三', 25);
```

### 4. Object.create()

```javascript
const proto = { greet() { console.log('Hello!'); } };
const user = Object.create(proto);
user.name = '张三';
```

### 5. 类（ES6）

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`你好，我是${this.name}`);
  }
}

const user = new Person('张三', 25);
```

---

## 🔑 属性访问

### 点表示法

```javascript
const user = { name: '张三', age: 25 };

console.log(user.name);  // 张三
user.age = 26;           // 修改属性
user.city = '北京';       // 添加属性
```

### 方括号表示法

```javascript
const user = { name: '张三', age: 25 };

console.log(user['name']);  // 张三

const key = 'age';
console.log(user[key]);     // 25

// 特殊属性名
const obj = {
  'full-name': '张三',
  '2letters': 'ab'
};

console.log(obj['full-name']);  // 张三
console.log(obj['2letters']);   // ab
```

---

## 🔧 属性操作

### 添加/修改属性

```javascript
const user = { name: '张三' };

user.age = 25;           // 添加
user.name = '李四';       // 修改

user['city'] = '北京';    // 方括号方式
```

### 删除属性

```javascript
const user = { name: '张三', age: 25 };

delete user.age;
console.log(user);  // { name: '张三' }
```

### 检查属性是否存在

```javascript
const user = { name: '张三', age: 25 };

console.log('name' in user);           // true
console.log(user.hasOwnProperty('name')); // true
console.log(user.hasOwnProperty('toString')); // false
```

### 遍历属性

```javascript
const user = { name: '张三', age: 25, city: '北京' };

// for...in
for (const key in user) {
  console.log(`${key}: ${user[key]}`);
}

// Object.keys()
console.log(Object.keys(user));   // ['name', 'age', 'city']

// Object.values()
console.log(Object.values(user)); // ['张三', 25, '北京']

// Object.entries()
console.log(Object.entries(user)); // [['name', '张三'], ['age', 25], ['city', '北京']]
```

---

## 📦 对象方法

### 简写方法

```javascript
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  }
};

console.log(calculator.add(5, 3));      // 8
console.log(calculator.subtract(5, 3)); // 2
```

### this 关键字

```javascript
const user = {
  name: '张三',
  greet() {
    console.log(`你好，我是${this.name}`);
  },
  greetArrow: () => {
    console.log(`你好，我是${this?.name || '未知'}`);
  }
};

user.greet();       // 你好，我是张三
user.greetArrow();  // 你好，我是未知
```

---

## 🧩 对象解构

```javascript
const user = { name: '张三', age: 25, city: '北京' };

// 基本解构
const { name, age } = user;
console.log(name, age);  // 张三 25

// 重命名
const { name: userName } = user;
console.log(userName);  // 张三

// 默认值
const { country = '中国' } = user;
console.log(country);  // 中国

// 嵌套解构
const person = {
  name: '张三',
  address: {
    city: '北京',
    district: '朝阳'
  }
};

const { address: { city } } = person;
console.log(city);  // 北京
```

---

## 🔀 对象扩展

### Object.assign()

```javascript
const target = { a: 1 };
const source = { b: 2, c: 3 };

const result = Object.assign(target, source);
console.log(result);  // { a: 1, b: 2, c: 3 }
```

### 展开运算符 (...)

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

const merged = { ...obj1, ...obj2 };
console.log(merged);  // { a: 1, b: 2, c: 3, d: 4 }

// 覆盖属性
const obj3 = { a: 1, b: 2 };
const obj4 = { b: 3, c: 4 };

const merged2 = { ...obj3, ...obj4 };
console.log(merged2);  // { a: 1, b: 3, c: 4 }
```

---

## 🔒 Object 方法

### Object.freeze()

```javascript
const user = { name: '张三' };
Object.freeze(user);

user.name = '李四';  // 静默失败（严格模式报错）
user.age = 25;       // 无法添加
delete user.name;    // 无法删除
```

### Object.seal()

```javascript
const user = { name: '张三' };
Object.seal(user);

user.name = '李四';  // 可以修改
user.age = 25;       // 无法添加
delete user.name;    // 无法删除
```

### Object.defineProperty()

```javascript
const user = {};

Object.defineProperty(user, 'name', {
  value: '张三',
  writable: false,      // 不可修改
  enumerable: true,     // 可枚举
  configurable: false   // 不可删除
});
```

---

## 💻 实战示例：用户管理

```javascript
const UserManager = {
  users: [],
  
  add(user) {
    this.users.push({ ...user, id: Date.now() });
    return this;
  },
  
  findById(id) {
    return this.users.find(u => u.id === id);
  },
  
  remove(id) {
    this.users = this.users.filter(u => u.id !== id);
    return this;
  },
  
  update(id, data) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data };
    }
    return this;
  },
  
  list() {
    return [...this.users];
  }
};

UserManager
  .add({ name: '张三', age: 25 })
  .add({ name: '李四', age: 30 });

console.log(UserManager.list());
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解对象的概念
- [ ] 掌握对象的创建方式
- [ ] 会访问和操作对象属性
- [ ] 掌握对象解构和扩展
- [ ] 了解 Object 的常用方法

---

## 📝 练习任务

### 任务 1：创建商品对象
创建一个商品对象，包含名称、价格、库存等属性，以及计算总价的方法。

### 任务 2：对象合并
编写函数，合并多个对象，后面的属性覆盖前面的。

### 任务 3：对象转换
将对象数组转换为以某属性为键的对象。

---

## 🔗 相关资源

- [MDN - 对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Working_with_Objects)
- [MDN - Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
