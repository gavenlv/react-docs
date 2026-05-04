# 16 - JavaScript 设计模式

## 🎯 本节目标
- 理解设计模式的概念
- 掌握常用的创建型模式
- 学会结构型和行为型模式
- 了解最佳实践

---

## 📖 什么是设计模式？

设计模式是软件开发中常见问题的通用解决方案。

### 分类

- **创建型模式**：对象创建机制
- **结构型模式**：对象组合方式
- **行为型模式**：对象通信方式

---

## 🏭 创建型模式

### 单例模式

```javascript
class Singleton {
  static instance = null;
  
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }
}

const a = new Singleton();
const b = new Singleton();
console.log(a === b);  // true
```

### 工厂模式

```javascript
class CarFactory {
  static create(type) {
    switch (type) {
      case 'sedan': return new Sedan();
      case 'suv': return new SUV();
      default: throw new Error('未知类型');
    }
  }
}
```

### 建造者模式

```javascript
class QueryBuilder {
  constructor() {
    this.query = {};
  }
  
  select(fields) {
    this.query.select = fields;
    return this;
  }
  
  where(condition) {
    this.query.where = condition;
    return this;
  }
  
  build() {
    return this.query;
  }
}
```

---

## 🧱 结构型模式

### 适配器模式

```javascript
class OldAPI {
  getData() { return { data: 'old format' }; }
}

class Adapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }
  
  getData() {
    const result = this.oldAPI.getData();
    return { items: [result.data] };
  }
}
```

### 装饰器模式

```javascript
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Person {
  @readonly
  name() { return '张三'; }
}
```

### 代理模式

```javascript
const handler = {
  get(target, prop) {
    console.log(`访问属性: ${prop}`);
    return target[prop];
  }
};

const proxy = new Proxy({}, handler);
```

---

## 🔄 行为型模式

### 观察者模式

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(...args));
    }
  }
}
```

### 策略模式

```javascript
const strategies = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

function calculate(strategy, a, b) {
  return strategies[strategy](a, b);
}
```

### 命令模式

```javascript
class Command {
  constructor(execute, undo) {
    this.execute = execute;
    this.undo = undo;
  }
}

class CommandManager {
  constructor() {
    this.history = [];
  }
  
  execute(command) {
    command.execute();
    this.history.push(command);
  }
  
  undo() {
    const command = this.history.pop();
    command?.undo();
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解设计模式的分类
- [ ] 掌握单例、工厂模式
- [ ] 了解适配器、装饰器模式
- [ ] 掌握观察者模式
- [ ] 能够在实际项目中应用

---

## 🔗 相关资源

- [JavaScript 设计模式](https://www.patterns.dev/)
- [Refactoring Guru](https://refactoring.guru/design-patterns)
