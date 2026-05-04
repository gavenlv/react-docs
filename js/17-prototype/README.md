# 17 - 原型与继承

## 🎯 本节目标
- 理解原型链的概念
- 掌握原型继承机制
- 学会使用 class 语法
- 了解继承的最佳实践

---

## 📖 原型链

每个 JavaScript 对象都有一个原型对象，对象从原型继承方法和属性。

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`你好，我是${this.name}`);
};

const person = new Person('张三');
person.greet();
```

---

## 🔗 原型继承

```javascript
function Student(name, grade) {
  Person.call(this, name);
  this.grade = grade;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
```

---

## 📦 ES6 Class

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    console.log(`你好，我是${this.name}`);
  }
}

class Student extends Person {
  constructor(name, grade) {
    super(name);
    this.grade = grade;
  }
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解原型链
- [ ] 掌握原型继承
- [ ] 会使用 class 语法
- [ ] 了解 super 关键字

---

## 🔗 相关资源

- [MDN - 继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
