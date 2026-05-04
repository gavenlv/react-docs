# 12 - Promise 与异步流程控制

## 🎯 本节目标
- 理解 Promise 的概念和状态
- 掌握 Promise 的创建和使用
- 学会使用 async/await
- 掌握 Promise 的静态方法

---

## 📖 什么是 Promise？

Promise 是一个代表异步操作最终完成或失败的对象。

### 三种状态

- **Pending（待定）**：初始状态
- **Fulfilled（已兑现）**：操作成功
- **Rejected（已拒绝）**：操作失败

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('成功');
    } else {
      reject('失败');
    }
  }, 1000);
});
```

---

## 📝 创建 Promise

### 基本创建

```javascript
const promise = new Promise((resolve, reject) => {
  resolve('成功');
});

const promise2 = new Promise((resolve, reject) => {
  reject('失败');
});
```

### 快捷方法

```javascript
const resolved = Promise.resolve('成功');
const rejected = Promise.reject('失败');
```

---

## 🔗 链式调用

```javascript
fetch('/api/user')
  .then(response => response.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(error => console.error(error))
  .finally(() => console.log('完成'));
```

### then()

```javascript
promise.then(
  (value) => { console.log('成功:', value); },
  (error) => { console.log('失败:', error); }
);

promise.then(value => value * 2)
       .then(value => console.log(value));
```

### catch()

```javascript
promise.catch(error => {
  console.error('错误:', error);
});
```

### finally()

```javascript
promise.finally(() => {
  console.log('无论成功失败都执行');
});
```

---

## ⚡ async/await

### async 函数

```javascript
async function fetchData() {
  return '数据';
}

fetchData().then(data => console.log(data));
```

### await 表达式

```javascript
async function getData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### 并行执行

```javascript
async function fetchAll() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);
  
  return { users, posts };
}
```

---

## 📊 Promise 静态方法

### Promise.all()

所有 Promise 都成功才成功。

```javascript
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(values => console.log(values));  // [1, 2, 3]
```

### Promise.allSettled()

等待所有 Promise 完成，无论成功失败。

```javascript
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => console.log(results));
// [{status: 'fulfilled', value: 1}, {status: 'rejected', reason: 'error'}, ...]
```

### Promise.race()

返回最先完成的 Promise。

```javascript
Promise.race([
  new Promise(resolve => setTimeout(() => resolve('慢'), 1000)),
  new Promise(resolve => setTimeout(() => resolve('快'), 500))
]).then(value => console.log(value));  // '快'
```

### Promise.any()

返回第一个成功的 Promise。

```javascript
Promise.any([
  Promise.reject('错误1'),
  Promise.resolve('成功'),
  Promise.reject('错误2')
]).then(value => console.log(value));  // '成功'
```

---

## 💻 实战示例：请求封装

```javascript
const http = {
  get(url) {
    return fetch(url).then(r => r.json());
  },
  
  post(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  }
};

async function loadUserData(userId) {
  try {
    const user = await http.get(`/api/users/${userId}`);
    const posts = await http.get(`/api/posts?userId=${userId}`);
    return { user, posts };
  } catch (error) {
    console.error('加载失败:', error);
    throw error;
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 Promise 的概念和状态
- [ ] 会创建和使用 Promise
- [ ] 掌握 async/await 语法
- [ ] 会使用 Promise.all 等静态方法
- [ ] 能够处理异步错误

---

## 🔗 相关资源

- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN - async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
