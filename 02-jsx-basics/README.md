# 02 - JSX 基础语法

## 🎯 本节目标
- 理解 JSX 的本质和作用
- 掌握 JSX 的基本语法规则
- 学会在 JSX 中使用表达式
- 了解 JSX 与普通 HTML 的区别

---

## 📖 什么是 JSX？

JSX (JavaScript XML) 是一种 JavaScript 的语法扩展，允许我们在 JavaScript 中编写类似 HTML 的代码。

```jsx
// JSX 语法
const element = <h1>Hello, world!</h1>;

// 编译后的 JavaScript
const element = React.createElement('h1', null, 'Hello, world!');
```

### 为什么使用 JSX？

1. **直观**: 更接近 UI 的实际表现
2. **安全**: 在编译时进行类型检查，防止 XSS 攻击
3. **强大**: 可以在标记中直接使用 JavaScript 的全部能力

---

## 📝 JSX 基础语法

### 1. 基本元素

```jsx
// HTML 元素
<div>内容</div>
<img src="image.jpg" />
<input type="text" />

// 自定义元素（组件）
<MyComponent />
<UserCard name="张三" />
```

### 2. 表达式嵌入

使用花括号 `{}` 嵌入 JavaScript 表达式：

```jsx
function Greeting({ name }) {
  const greeting = `你好, ${name}!`;
  
  return (
    <div>
      {/* 字符串 */}
      <h1>{greeting}</h1>
      
      {/* 数字 */}
      <p>年龄: {25}</p>
      
      {/* 布尔值 */}
      <span>状态: {true ? '在线' : '离线'}</span>
      
      {/* 对象属性 */}
      <p>{user.name}</p>
      
      {/* 函数调用 */}
      <button onClick={handleClick}>点击</button>
      
      {/* 三元表达式 */}
      {isLoggedIn ? <LogoutButton /> : <LoginButton />}
    </div>
  );
}
```

### 3. 属性（Props）

```jsx
// 字符串属性
<img src="https://example.com/image.jpg" alt="示例图片" />

// 表达式属性（使用花括号）
<img src={imageUrl} />
<div className={isActive ? 'active' : 'inactive'}>

// 布尔属性
<button disabled={isDisabled}>提交</button>

// 展开运算符
<UserProfile {...userData} />
```

### 4. 子元素

```jsx
// 文本子元素
<h1>标题文本</h1>

// 多个子元素
<div>
  <p>第一段</p>
  <p>第二段</p>
</div>

// 表达式作为子元素
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
```

---

## ⚠️ JSX 规则与注意事项

### 1. 必须有一个根元素

```jsx
// ❌ 错误：多个根元素
return (
  <h1>标题</h1>
  <p>段落</p>
);

// ✅ 正确：包裹在一个根元素中
return (
  <div>
    <h1>标题</h1>
    <p>段落</p>
  </div>
);

// ✅ 或者使用 React Fragment（推荐）
return (
  <>
    <h1>标题</h1>
    <p>段落</p>
  </>
);
```

### 2. 必须闭合所有标签

```jsx
// ❌ 错误：未闭合
<br>
<input type="text">

// ✅ 正确：自闭合或配对闭合
<br />
<input type="text" />
<div></div>
```

### 3. 使用 camelCase 命名

```jsx
// HTML
<div class="container" onclick="handler()">

// JSX
<div className="container" onClick={handler()}>
```

**常见属性名称映射：**

| HTML 属性 | JSX 属性 |
|-----------|----------|
| class | className |
| for | htmlFor |
| tabindex | tabIndex |
| onclick | onClick |
| onchange | onChange |

### 4. 内联样式

```jsx
// ❌ 错误：字符串形式
<div style="color: red; font-size: 16px;">

// ✅ 正确：对象形式
<div style={{ color: 'red', fontSize: '16px' }}>

// ✅ 推荐使用变量
const divStyle = {
  color: 'red',
  fontSize: '16px',
  backgroundColor: '#f0f0f0'  // 注意 camelCase
};

<div style={divStyle}>
```

---

## 🔥 JSX 高级用法

### 1. 条件渲染

```jsx
// 三元运算符
{isLoggedIn ? <Welcome /> : <Login />}

// 逻辑与（&&）
{showMessage && <div>消息内容</div>}

// 函数返回
function renderContent() {
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <Content data={data} />;
}
```

### 2. 列表渲染

```jsx
const items = ['苹果', '香蕉', '橙子'];

function FruitList() {
  return (
    <ul>
      {items.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}
```

### 3. 注释

```jsx
return (
  <div>
    {/* 这是一个注释 */}
    <h1>标题</h1>
    {
      // 多行注释
    }
  </div>
);
```

### 4. 模板字面量

```jsx
const className = `btn btn-${size} ${isActive ? 'active' : ''}`;

<button className={className.trim()}>
  {label}
</button>
```

---

## 💡 最佳实践

1. **保持简洁**: 每个 JSX 块不要太长，适当拆分
2. **合理换行**: 复杂的 JSX 要格式化以提高可读性
3. **使用常量**: 复杂的表达式提取为变量
4. **避免嵌套过深**: 超过 3 层嵌套时考虑提取组件

```jsx
// ❌ 过于复杂的 JSX
return (
  <div>
    {users.map(user => (
      <div key={user.id}>
        <h3>{user.name}</h3>
        {user.posts.map(post => (
          <article key={post.id}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            {post.comments.map(comment => (
              <div key={comment.id}>
                <strong>{comment.author}:</strong> {comment.text}
              </div>
            ))}
          </article>
        ))}
      </div>
    ))}
  </div>
);

// ✅ 拆分后更清晰
function UserCard({ user }) {
  // ...
}

function PostItem({ post }) {
  // ...
}

function Comment({ comment }) {
  // ...
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 JSX 的本质（语法糖）
- [ ] 在 JSX 中正确嵌入 JavaScript 表达式
- [ ] 区分 JSX 和 HTML 的差异（className, camelCase 等）
- [ ] 使用条件渲染和列表渲染
- [ ] 编写规范、可读性强的 JSX 代码

---

## 📝 练习任务

### 任务 1：个人信息卡片
创建一个展示用户信息的卡片组件：
```jsx
// 要求包含：
- 用户头像（img 元素）
- 姓名、职位、公司信息
- 技能列表（使用数组渲染）
- 联系按钮（条件显示）
```

### 任务 2：商品列表
创建一个商品列表组件：
```jsx
// 要求包含：
- 商品图片、名称、价格、描述
- 使用 map 渲染商品列表
- 根据库存状态显示不同样式
- 价格超过 1000 的商品显示"热销"标签
```

---

## 🔗 下一步

掌握 JSX 后，让我们进入 **组件基础** 学习！

[→ 03 - 组件基础](../03-components/)
