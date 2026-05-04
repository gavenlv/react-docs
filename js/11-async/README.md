# 11 - 异步编程基础

## 🎯 本节目标
- 理解同步和异步的概念
- 掌握回调函数的使用
- 了解事件循环机制
- 学会使用定时器

---

## 📖 同步 vs 异步

### 同步执行

代码按顺序执行，每行代码执行完毕后才执行下一行。

```javascript
console.log('第一');
console.log('第二');
console.log('第三');
// 输出：第一、第二、第三
```

### 异步执行

某些操作不会立即完成，代码继续执行，等操作完成后再处理结果。

```javascript
console.log('第一');
setTimeout(() => {
  console.log('第二');
}, 1000);
console.log('第三');
// 输出：第一、第三、第二（1秒后）
```

---

## ⏰ 定时器

### setTimeout

```javascript
const timeoutId = setTimeout(() => {
  console.log('1秒后执行');
}, 1000);

clearTimeout(timeoutId);  // 取消定时器
```

### setInterval

```javascript
const intervalId = setInterval(() => {
  console.log('每1秒执行一次');
}, 1000);

clearInterval(intervalId);  // 取消定时器
```

### requestAnimationFrame

```javascript
function animate() {
  // 更新动画
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// 取消
const id = requestAnimationFrame(animate);
cancelAnimationFrame(id);
```

---

## 🔄 事件循环

JavaScript 是单线程的，通过事件循环处理异步操作。

```text
调用栈 → 执行同步代码
    ↓
异步操作 → Web APIs（定时器、HTTP请求等）
    ↓
回调队列 → 等待执行
    ↓
事件循环 → 检查调用栈是否为空
    ↓
如果为空 → 将回调移到调用栈执行
```

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出：1, 4, 3, 2
// 微任务（Promise）优先于宏任务（setTimeout）
```

---

## 📞 回调函数

### 基本用法

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback('数据');
  }, 1000);
}

fetchData((data) => {
  console.log(data);
});
```

### 回调地狱

```javascript
getUser(userId, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      console.log(comments);
    });
  });
});
```

### 解决方案

使用 Promise 或 async/await 解决回调地狱。

---

## 💻 实战示例：倒计时

```javascript
function countdown(seconds) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      console.log(seconds);
      seconds--;
      
      if (seconds < 0) {
        clearInterval(interval);
        resolve('倒计时结束');
      }
    }, 1000);
  });
}

countdown(5).then((message) => {
  console.log(message);
});
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解同步和异步的区别
- [ ] 会使用 setTimeout 和 setInterval
- [ ] 了解事件循环机制
- [ ] 理解回调函数的概念
- [ ] 了解回调地狱的问题

---

## 🔗 相关资源

- [MDN - 异步 JavaScript](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous)
- [JavaScript 事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)
