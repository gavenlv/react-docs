# 07 - 列表与 Keys

## 🎯 本节目标
- 学会在 React 中渲染列表
- 深刻理解 Key 的作用和重要性
- 掌握列表渲染的最佳实践

---

## 📖 列表渲染基础

### 使用 map() 渲染列表

```jsx
function NumberList() {
  const numbers = [1, 2, 3, 4, 5];
  
  return (
    <ul>
      {numbers.map((number) => (
        <li key={number.toString()}>{number}</li>
      ))}
    </ul>
  );
}
```

### 提取列表组件（最佳实践）

```jsx
// 列表项组件
function ListItem({ item }) {
  return <li>{item.name}: {item.value}</li>;
}

// 列表容器组件
function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <ListItem 
          key={item.id}  {/* Key 放在这里！ */}
          item={item} 
        />
      ))}
    </ul>
  );
}

// 使用
function App() {
  const items = [
    { id: 1, name: 'React', value: 100 },
    { id: 2, name: 'Vue', value: 90 },
    { id: 3, name: 'Angular', value: 85 },
  ];
  
  return <List items={items} />;
}
```

---

## 🔑 Key 的深入理解

### 什么是 Key？
Key 是一个特殊的字符串属性，帮助 React 识别哪些元素发生了变化。

### 为什么 Key 很重要？

**没有 Key 或 Key 不稳定的后果：**

```jsx
// ❌ 使用 index 作为 Key（有风险）
{items.map((item, index) => (
  <ListItem key={index} item={item} />  // 危险！
))}

// 问题演示：
const list = ['A', 'B', 'C'];

// 在开头插入新元素 D：
// 没有 key 或使用 index:
// React 认为所有元素的值都变了 → 全部重新渲染
// 
// 正确的 key:
// React 只插入新的 D，其他保持不变
```

**Key 的作用机制：**
```
Before: [A(key=1), B(key=2), C(key=3)]
After:  [D(key=4), A(key=1), B(key=2), C(key=3)]

React 对比结果:
- 新增 D(key=4)
- A, B, C 保持不变（因为 key 相同）
→ 高效更新！
```

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
```

#### ⚠️ 可以接受的情况

```jsx
// 当满足以下条件时，可以使用 index：
// 1. 列表是静态的（不会重新排序）
// 2. 列表不会过滤或增删
// 3. 列表项不需要维护状态

{['首页', '关于', '联系'].map((text, index) => (
  <a key={index} href="#">{text}</a>
))}
```

#### ❌ 绝对不要这样做

```jsx
// ❌ 使用随机数（每次渲染都变）
<li key={Math.random()}>{item.name}</li>

// ❌ 使用时间戳（可能重复）
<li key={Date.now()}>{item.name}</li>

// ❌ 使用可变的属性
<li key={item.name.toLowerCase()}>{item.name}</li>  // name 可能改变
```

---

## 🎯 列表渲染高级技巧

### 1. 多维数组渲染

```jsx
function MatrixTable() {
  const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ];
  
  return (
    <table>
      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => (
              <td key={`cell-${colIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 2. 分页列表

```jsx
function PaginatedList({ allItems, page = 1, itemsPerPage = 10 }) {
  // 计算当前页的数据
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = allItems.slice(startIndex, endIndex);
  
  return (
    <div>
      <ul>
        {currentItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      <Pagination 
        currentPage={page}
        totalPages={Math.ceil(allItems.length / itemsPerPage)}
      />
    </div>
  );
}
```

### 3. 虚拟滚动长列表（性能优化）

对于超长列表（成千上万条），考虑使用虚拟滚动：

```jsx
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 4. 动态添加/删除列表项

```jsx
function DynamicList() {
  const [items, setItems] = useState([
    { id: 1, text: '项目 1' },
    { id: 2, text: '项目 2' }
  ]);
  
  // 添加项目
  const addItem = () => {
    const newItem = {
      id: Date.now(),  // 使用时间戳作为临时 ID
      text: `项目 ${items.length + 1}`
    };
    setItems([...items, newItem]);
  };
  
  // 删除项目
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // 移动项目（上移/下移）
  const moveItem = (id, direction) => {
    const index = items.findIndex(item => item.id === id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };
  
  return (
    <div>
      <button onClick={addItem}>添加</button>
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            {item.text}
            <button onClick={() => removeItem(item.id)}>删除</button>
            <button onClick={() => moveItem(item.id, 'up')} disabled={index === 0}>↑</button>
            <button onClick={() => moveItem(item.id, 'down')} disabled={index === items.length - 1}>↓</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## ⚡ 性能注意事项

### 1. 避免 map 内定义函数

```jsx
// ❌ 每次 map 都创建新函数
{items.map(item => (
  <button key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </button>
))}

// ✅ 提取组件，在内部绑定事件
{items.map(item => (
  <ListItem key={item.id} item={item} onClick={handleClick} />
))}
```

### 2. 使用 useMemo 缓存列表

```jsx
function ExpensiveList({ filterText, allItems }) {
  // 只在依赖改变时重新计算
  const filteredItems = useMemo(() => {
    return allItems.filter(item =>
      item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [allItems, filterText]);
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

---

## ✅ 阶段检查清单

- [ ] 能够使用 map() 正确渲染列表
- [ ] 深刻理解 Key 的作用和重要性
- [ ] 知道如何选择合适的 Key 值
- [ ] 掌握动态列表的添加、删除操作
- [ ] 了解长列表的性能优化方案

---

## 📝 练习任务

1. **任务管理器**: 支持任务的增删改查、拖拽排序
2. **评论系统**: 支持嵌套回复、分页、排序功能

---

[→ 08 - 表单处理](../08-forms/)
