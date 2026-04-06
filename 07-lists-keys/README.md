# 07 - 列表与 Keys

## 🎯 本节目标
- 学会在 React 中渲染列表
- 深刻理解 Key 的作用和重要性
- 掌握列表渲染的最佳实践

---

## 🤔 什么是列表渲染？

想象一下，你在整理一份**班级花名册**。你有 30 个学生的名字，需要把它们一个个写到黑板上。在网页开发中，我们也经常需要把一组数据（比如用户列表、商品列表、评论列表）展示在页面上——这就是**列表渲染**。

> **类比**：列表渲染就像你在 Excel 表格里自动填充一列数据——你不需要手动写 30 行，只需要告诉程序"把这个数组里的每个元素都渲染出来"。

### 为什么需要列表渲染？

在真实的 Web 应用中，数据几乎都是以"列表"的形式存在的：
- 微信聊天记录——一个消息列表
- 淘宝商品页面——一个商品列表
- 朋友圈——一个动态列表

如果不用列表渲染，你需要手动写每一个元素，数据一变就要改代码。有了列表渲染，你只需要写一次"模板"，程序会自动帮你把所有数据都展示出来。

### 核心工具：JavaScript 的 `map()` 方法

React 使用 JavaScript 自带的 `map()` 方法来渲染列表。`map()` 就像一个"加工厂"——把数组的每个元素送进去，出来一个对应的 UI 元素。

```jsx
// map() 的基本概念
const fruits = ['苹果', '香蕉', '橘子'];

// map 会遍历数组，对每个元素执行箭头函数，返回一个新数组
const fruitList = fruits.map((fruit) => {
  return <li>{fruit}</li>;  // 每个水果变成一个 <li> 元素
});
// fruitList = [<li>苹果</li>, <li>香蕉</li>, <li>橘子</li>]
```

---

## 📖 列表渲染基础

### 使用 map() 渲染列表

```jsx
function NumberList() {
  // 定义一个数字数组
  const numbers = [1, 2, 3, 4, 5];
  
  return (
    <ul>
      {/* 使用 map() 把每个数字变成 <li> 元素 */}
      {numbers.map((number) => (
        <li key={number.toString()}>
          {/* 花{}号表示这是一个JS表达式，不是纯文本 */}
          {number}
        </li>
      ))}
    </ul>
  );
}

// 最终渲染结果：
// • 1
// • 2
// • 3
// • 4
// • 5
```

**逐步解析：**
1. `{numbers.map((number) => (...))}` —— 用花括号 `{}` 告诉 JSX "这里面要执行 JS 代码"
2. `.map()` —— 遍历 `numbers` 数组，每次处理一个元素
3. `(number) =>` —— 当前处理的是哪个数字
4. `<li key={...}>{number}</li>` —— 返回一个 JSX 元素，`number` 会被替换成实际值
5. `key={number.toString()}` —— 每个元素需要一个唯一的 key（后面会详细讲）

### 不用列表渲染 vs 用列表渲染

```jsx
// ❌ 不用列表渲染：手动写死每个元素（数据一变就要改代码！）
function BadList() {
  return (
    <ul>
      <li>苹果</li>
      <li>香蕉</li>
      <li>橘子</li>
      {/* 如果要加一个水果，必须手动改代码 */}
    </ul>
  );
}

// ✅ 用列表渲染：数据驱动，自动生成
function GoodList() {
  const fruits = ['苹果', '香蕉', '橘子'];
  
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
  // 只需要修改 fruits 数组，UI 就会自动更新！
}
```

---

## 🔑 Key 的深入理解

### 什么是 Key？

Key 是 React 列表渲染中最重要、也最容易出错的概念。

> **类比**：想象你在学校里，每个学生都有一个**学号**。老师点名的时候，不是看"第几个学生"，而是看"学号"。Key 就是 React 给每个列表项分配的"学号"，帮助 React 准确识别"哪个元素变了、哪个元素是新增的、哪个元素被删除了"。

**Key 是一个特殊的字符串属性**，React 用它来追踪列表中每个元素的身份。

### 为什么 Key 很重要？

Key 直接决定了 React 更新列表时的**性能**和**正确性**。

**没有 Key 或 Key 不稳定的后果：**

```jsx
// ❌ 使用 index 作为 Key（有风险）
{items.map((item, index) => (
  <ListItem key={index} item={item} />  // 危险！
))}

// 问题演示：
// 假设列表原来是 ['A', 'B', 'C']，你在开头插入 'D'：
//
// 使用 index 作为 key 时：
// 旧: [A(key=0), B(key=1), C(key=2)]
// 新: [D(key=0), A(key=1), B(key=2), C(key=3)]
// React 对比：key=0 的内容从 A 变成了 D → 重新渲染
//             key=1 的内容从 B 变成了 A → 重新渲染
//             key=2 的内容从 C 变成了 B → 重新渲染
//             key=3 是新增的 C → 新增渲染
// 结果：4个元素全部重新渲染！🤦
//
// 使用唯一 ID 作为 key 时：
// 旧: [A(key=a), B(key=b), C(key=c)]
// 新: [D(key=d), A(key=a), B(key=b), C(key=c)]
// React 对比：key=d 是新增的 → 新增渲染
//             key=a, b, c 都没变 → 保持不变
// 结果：只渲染了1个新元素！🎉 高效！
```

### Key 的工作原理（深入理解）

React 使用一种叫做"协调算法"（Reconciliation）的机制来对比新旧虚拟 DOM。当列表发生变化时，React 会：

1. 对比新旧列表中**相同 key 的元素**
2. 如果 key 相同但内容不同 → **更新**该元素
3. 如果新列表中有旧列表没有的 key → **新增**该元素
4. 如果旧列表中有新列表没有的 key → **删除**该元素

```
渲染前: [A(key=1), B(key=2), C(key=3)]
渲染后: [D(key=4), A(key=1), B(key=2), C(key=3)]

React 对比结果:
- key=1 (A): 新旧都存在，内容相同 → 保持不变
- key=2 (B): 新旧都存在，内容相同 → 保持不变
- key=3 (C): 新旧都存在，内容相同 → 保持不变
- key=4 (D): 只在新列表中存在 → 新增插入
→ 只需要做一次插入操作，非常高效！
```

> **最佳实践提示**：Key 选择得当，React 就能精准地只更新变化的部分，避免不必要的 DOM 操作，极大提升性能。

### 如何选择正确的 Key？

#### ✅ 最佳选择：唯一且稳定的 ID

```jsx
// 数据库 ID（最佳）
<li key={item.id}>{item.name}</li>

// 数据库唯一标识
<li key={item.uuid}>{item.name}</li>

// 其他唯一标识
<li key={item.email}>{item.name}</li>
<li key={item.sku}>{product.name}</li>

// 原则：这个值必须是 —— 唯一的、不变的、可预测的
```

#### ⚠️ 可以接受的情况

```jsx
// 当满足以下**所有**条件时，可以使用 index：
// 1. 列表是静态的（不会重新排序）
// 2. 列表不会过滤或增删
// 3. 列表项不需要维护内部状态（如输入框的输入内容）

// 例子：固定的导航菜单
{['首页', '关于', '联系'].map((text, index) => (
  <a key={index} href="#">{text}</a>
))}

// 这个导航菜单永远不变，所以用 index 是安全的
```

#### ❌ 绝对不要这样做

```jsx
// ❌ 使用随机数（每次渲染 key 都变 → React 认为是全新元素 → 全部重新渲染）
<li key={Math.random()}>{item.name}</li>

// ❌ 使用时间戳（同一毫秒内可能重复）
<li key={Date.now()}>{item.name}</li>

// ❌ 使用可变的属性（name 改了，key 就变了，React 会认为旧元素被删除、新元素被新增）
<li key={item.name.toLowerCase()}>{item.name}</li>

// ❌ 使用 index 但列表会增删排序（如待办事项列表）
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}
// 删除第一个任务后，所有任务的 index 都会变，可能导致 UI 状态错乱
```

### 常见错误：index 作为 key 导致的 Bug

```jsx
// 这个例子演示了 index 作为 key 的典型 Bug
function TodoListWithBug() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React' },
    { id: 2, text: '写作业' },
    { id: 3, text: '休息' }
  ]);

  // 每个任务有一个输入框，记录笔记
  // 注意：我们用 index 作为 key
  return (
    <ul>
      {todos.map((todo, index) => (
        <TodoWithNote key={index} todo={todo} />
      ))}
    </ul>
  );
}

// 当你删除"学习 React"后：
// 原来的 index 映射关系被打破
// index=0（原来对应"学习 React"）现在对应"写作业"
// → "写作业"的笔记输入框里显示了"学习 React"的笔记内容！
// → Bug 产生了！

// ✅ 正确做法：用 todo.id 作为 key
{todos.map((todo) => (
  <TodoWithNote key={todo.id} todo={todo} />
))}
```

---

## 📖 提取列表组件（最佳实践）

将列表项提取为独立的组件，使代码更加清晰和可维护。

```jsx
// 列表项组件 —— 只负责渲染单个项目
function ListItem({ item }) {
  return (
    <li>
      <span>{item.name}</span>
      <span>: {item.value}</span>
    </li>
  );
}

// 列表容器组件 —— 负责遍历数据、传递 props
function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        {/* 注意：key 要放在被 map 直接返回的元素上 */}
        <ListItem 
          key={item.id}  {/* Key 放在这里！不是放在 ListItem 组件内部 */}
          item={item}    {/* 把数据通过 props 传给子组件 */}
        />
      ))}
    </ul>
  );
}

// 使用
function App() {
  // 准备数据（通常从 API 获取）
  const items = [
    { id: 1, name: 'React', value: 100 },
    { id: 2, name: 'Vue', value: 90 },
    { id: 3, name: 'Angular', value: 85 },
  ];
  
  return <List items={items} />;
}
```

> **提示**：`key` 是 React 的特殊属性，不会传递给子组件。也就是说，在 `ListItem` 内部通过 `props` 拿不到 `key`。

---

## 🎯 列表渲染高级技巧

### 1. 多维数组渲染（嵌套列表）

有时候数据是二维的，比如表格、矩阵。

```jsx
function MatrixTable() {
  // 一个 3x3 的二维数组（数学矩阵）
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  
  return (
    <table border="1" cellPadding="8">
      <tbody>
        {/* 外层 map 遍历每一行 */}
        {matrix.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {/* 内层 map 遍历每一列 */}
            {row.map((cell, colIndex) => (
              <td key={`cell-${colIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 渲染结果：
// ┌───┬───┬───┐
// │ 1 │ 2 │ 3 │
// ├───┼───┼───┤
// │ 4 │ 5 │ 6 │
// ├───┼───┼───┤
// │ 7 │ 8 │ 9 │
// └───┴───┴───┘
```

### 2. 分页列表

当数据很多时，不能一次性全部显示，需要分页。

```jsx
function PaginatedList({ allItems, page = 1, itemsPerPage = 10 }) {
  // 计算当前页应该显示哪些数据
  const startIndex = (page - 1) * itemsPerPage;  // 起始索引
  const endIndex = startIndex + itemsPerPage;     // 结束索引
  const currentItems = allItems.slice(startIndex, endIndex); // 截取子数组
  
  // 计算总页数
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  
  return (
    <div>
      {/* 当前页的数据列表 */}
      <ul>
        {currentItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      {/* 分页按钮 */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          上一页
        </button>
        <span>第 {page} 页 / 共 {totalPages} 页</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          下一页
        </button>
      </div>
    </div>
  );
}
```

### 3. 虚拟滚动长列表（性能优化）

对于超长列表（成千上万条），如果全部渲染成 DOM 元素，页面会非常卡顿。虚拟滚动只渲染可见区域的那几十个元素。

> **类比**：虚拟滚动就像你透过一个"窗口"看一份很长的名单——你一次只能看到窗口大小的那几行，但可以通过滚动看到其他行。React 不需要渲染窗口外面的内容。

```jsx
import { FixedSizeList as List } from 'react-window';  // 需要安装：npm install react-window

function VirtualizedList({ items }) {
  // 每一行的渲染函数
  const Row = ({ index, style }) => (
    <div style={style}>
      第 {index + 1} 项：{items[index].name}
    </div>
  );
  
  return (
    <List
      height={600}          // 列表可视区域高度
      itemCount={items.length}  // 总共有多少项
      itemSize={50}         // 每项的高度
      width="100%"          // 列表宽度
    >
      {Row}
    </List>
  );
  // 假设有 10000 条数据，但 DOM 中实际只有 600/50 = 12 个 DOM 节点！
}
```

### 4. 动态添加/删除列表项

这是列表渲染中最常见的交互场景。

```jsx
import { useState } from 'react';

function DynamicList() {
  // 使用 useState 管理列表数据
  const [items, setItems] = useState([
    { id: 1, text: '学习 React' },
    { id: 2, text: '学习 JavaScript' }
  ]);
  
  // 添加项目
  const addItem = () => {
    const newItem = {
      id: Date.now(),  // 使用时间戳作为临时唯一 ID
      text: `新项目 ${items.length + 1}`
    };
    // 用展开运算符 ... 创建新数组，把新项目追加到末尾
    setItems([...items, newItem]);
  };
  
  // 删除项目
  const removeItem = (id) => {
    // filter 返回一个不包含指定 id 的新数组
    setItems(items.filter(item => item.id !== id));
  };
  
  // 移动项目（上移/下移）——交换数组中两个元素的位置
  const moveItem = (id, direction) => {
    const index = items.findIndex(item => item.id === id);  // 找到当前位置
    const newIndex = direction === 'up' ? index - 1 : index + 1;  // 计算目标位置
    
    // 边界检查：不能超出数组范围
    if (newIndex < 0 || newIndex >= items.length) return;
    
    // 创建新数组并交换位置
    const newItems = [...items];  // 复制一份
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];  // 交换
    setItems(newItems);
  };
  
  return (
    <div>
      <button onClick={addItem}>➕ 添加项目</button>
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <span>{item.text}</span>
            <button onClick={() => removeItem(item.id)}>🗑️ 删除</button>
            <button 
              onClick={() => moveItem(item.id, 'up')} 
              disabled={index === 0}  // 第一个不能上移
            >
              ↑ 上移
            </button>
            <button 
              onClick={() => moveItem(item.id, 'down')} 
              disabled={index === items.length - 1}  // 最后一个不能下移
            >
              ↓ 下移
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. 搜索过滤列表

在列表中搜索和筛选数据。

```jsx
function SearchableList() {
  const allItems = [
    { id: 1, name: 'iPhone 15', category: '手机' },
    { id: 2, name: 'MacBook Pro', category: '电脑' },
    { id: 3, name: 'iPad Air', category: '平板' },
    { id: 4, name: 'AirPods Pro', category: '配件' },
    { id: 5, name: 'iMac', category: '电脑' },
  ];
  
  const [searchText, setSearchText] = useState('');
  
  // 根据搜索关键字过滤列表
  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  return (
    <div>
      <input
        type="text"
        placeholder="搜索产品..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>
            {item.name} - {item.category}
          </li>
        ))}
        {filteredItems.length === 0 && <li>没有找到匹配的产品</li>}
      </ul>
    </div>
  );
}
```

---

## ⚡ 性能注意事项

### 1. 避免 map 内定义函数

```jsx
// ❌ 每次 map 都创建新的匿名函数 → 子组件每次都会重新渲染
{items.map(item => (
  <button key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </button>
))}

// ✅ 提取为子组件，在内部绑定事件
{items.map(item => (
  <ListItem 
    key={item.id} 
    item={item} 
    onClick={handleClick}  // 传递一个稳定的函数引用
  />
))}

// ListItem 内部：
function ListItem({ item, onClick }) {
  const handleClick = () => onClick(item.id);  // 绑定自己的 id
  return <button onClick={handleClick}>{item.name}</button>;
}
```

### 2. 使用 useMemo 缓存列表计算

当列表需要经过复杂的过滤或排序时，用 `useMemo` 避免每次渲染都重新计算。

```jsx
import { useMemo } from 'react';

function ExpensiveList({ filterText, allItems }) {
  // 只在 filterText 或 allItems 变化时才重新计算过滤结果
  // 如果这两个值没变，直接用上次缓存的结果
  const filteredItems = useMemo(() => {
    console.log('重新计算过滤结果...');  // 你会发现这个只在输入变化时打印
    return allItems.filter(item =>
      item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [allItems, filterText]);  // 依赖项
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 3. 使用 React.memo 优化列表项

如果列表项组件很复杂，可以用 `React.memo` 避免不必要的重新渲染。

```jsx
import { memo } from 'react';

// 用 memo 包裹组件 —— 只有 props 变化时才重新渲染
const ListItem = memo(function ListItem({ item }) {
  console.log('ListItem 渲染:', item.name);  // 只有 item 变化时才打印
  return (
    <li>
      <span>{item.name}</span>
      <span>{item.price} 元</span>
    </li>
  );
});

// 使用
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <ListItem key={product.id} item={product} />
      ))}
    </ul>
  );
}
```

---

## 🚨 常见错误

### 错误 1：忘记写 key

```jsx
// ❌ 没有 key → 控制台会报警告
{items.map(item => (
  <li>{item.name}</li>
))}

// ✅ 必须加 key
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

### 错误 2：key 放错位置

```jsx
// ❌ key 放在了子组件内部（不会生效！）
function ListItem({ item }) {
  return <li key={item.id}>{item.name}</li>;  // 错误！
}

// ✅ key 必须放在 map 直接返回的元素上
{items.map(item => (
  <ListItem key={item.id} item={item} />  // 正确！
))}
```

### 错误 3：直接修改数组

```jsx
// ❌ 直接修改原数组（违反 React 不可变数据原则）
const addItem = () => {
  items.push(newItem);  // 直接修改了原数组！
  setItems(items);       // React 可能不会检测到变化
};

// ✅ 创建新数组
const addItem = () => {
  setItems([...items, newItem]);  // 创建新数组
  // 或者用 concat
  setItems(items.concat(newItem));
};
```

### 错误 4：用 item 属性做 key 但属性会变

```jsx
// ❌ 用 name 做 key，如果用户改了名字，key 就变了
{users.map(user => (
  <UserCard key={user.name} user={user} />
))}

// ✅ 用稳定的唯一 ID
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}
```

---

## ✅ 阶段检查清单

- [ ] 能够使用 map() 正确渲染列表
- [ ] 深刻理解 Key 的作用和重要性
- [ ] 知道如何选择合适的 Key 值
- [ ] 掌握动态列表的添加、删除操作
- [ ] 了解长列表的性能优化方案
- [ ] 能独立实现搜索过滤列表

---

## 📝 练习任务

### 练习 1：任务管理器（基础）
创建一个任务管理器，支持：
- 任务的添加、删除
- 任务完成状态切换
- 显示已完成/未完成的数量

```jsx
// 提示框架：
function TaskManager() {
  // 1. 用 useState 管理 tasks 数组
  // 2. 用 useState 管理输入框的值
  // 3. 实现添加任务函数
  // 4. 实现删除任务函数
  // 5. 实现切换完成状态函数
  // 6. 用 map() 渲染任务列表（记得用 key！）
}
```

### 练习 2：商品列表（进阶）
创建一个商品展示页面，支持：
- 商品列表渲染（带图片、价格、描述）
- 分类筛选（全部/电子产品/服装/食品）
- 价格排序（从低到高/从高到低）
- 搜索功能

### 练习 3：思考题
假设你有一个聊天应用的"消息列表"，每条消息有一个唯一的 `messageId`。如果你使用数组索引作为 key，当新消息到来时，可能会出现什么问题？

---

[→ 08 - 表单处理](../08-forms/)
