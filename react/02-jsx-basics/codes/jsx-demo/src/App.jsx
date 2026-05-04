import { useState } from 'react'

/**
 * JSX 基础语法演示项目
 * 
 * 本项目通过标签页组织，全面展示 JSX 的核心概念：
 * 1. 表达式嵌入 - 在 JSX 中使用花括号嵌入 JavaScript 表达式
 * 2. 属性绑定 - className、htmlFor、style 对象、布尔属性
 * 3. 条件渲染 - 三元运算符、逻辑与 &&
 * 4. 列表渲染 - map 方法、key 属性
 * 5. createElement 对比 - JSX 语法糖的本质
 * 6. Fragment 用法 - 不产生额外 DOM 节点
 * 7. 样式绑定 - 内联样式、动态 className
 */
function App() {
  // 当前激活的标签页索引
  const [activeTab, setActiveTab] = useState(0)

  // 标签页配置
  const tabs = [
    { label: '表达式嵌入', icon: '📝' },
    { label: '属性绑定', icon: '🎨' },
    { label: '条件渲染', icon: '🔀' },
    { label: '列表渲染', icon: '📋' },
    { label: 'createElement', icon: '⚡' },
    { label: 'Fragment', icon: '📦' },
    { label: '样式绑定', icon: '🎭' },
  ]

  return (
    <div>
      {/* ====== 页面标题 ====== */}
      <h1 className="page-title">JSX 基础语法演示</h1>
      <p className="page-desc">
        全面展示 JSX 的核心语法，包括表达式嵌入、属性绑定、条件/列表渲染、Fragment 等
      </p>

      {/* ====== 标签页导航 ====== */}
      <div className="tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-btn ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ====== 标签页内容区域 ====== */}
      <div className="tab-content">
        {activeTab === 0 && <ExpressionDemo />}
        {activeTab === 1 && <AttributeDemo />}
        {activeTab === 2 && <ConditionalDemo />}
        {activeTab === 3 && <ListDemo />}
        {activeTab === 4 && <CreateElementDemo />}
        {activeTab === 5 && <FragmentDemo />}
        {activeTab === 6 && <StyleDemo />}
      </div>
    </div>
  )
}

/* ========================================================
 * 1. 表达式嵌入演示
 * 展示在 JSX 的花括号 {} 中使用各种 JavaScript 表达式
 * ======================================================== */
function ExpressionDemo() {
  // 定义一些变量用于在 JSX 中展示
  const name = 'React 开发者'
  const age = 25
  const isAdmin = true
  const hobbies = ['阅读', '编程', '音乐', '旅行']
  const now = new Date().toLocaleString('zh-CN')

  // 计算表达式
  const nextYear = age + 1
  const greeting = `你好, ${name}!`

  return (
    <div className="flex flex-col gap-16">
      {/* --- 卡片1：变量和字面量 --- */}
      <div className="card">
        <h3>变量与字面量</h3>
        <div className="desc-list">
          <dt>字符串变量:</dt>
          <dd>{greeting}</dd>

          <dt>数字变量:</dt>
          <dd>年龄: {age} 岁</dd>

          <dt>布尔值 (三元):</dt>
          <dd>管理员: {isAdmin ? <span className="badge badge-success">是</span> : <span className="badge badge-danger">否</span>}</dd>

          <dt>数学运算:</dt>
          <dd>明年你 {nextYear} 岁，五年后 {age + 5} 岁</dd>

          <dt>对象属性:</dt>
          <dd>名字长度: {name.length} 个字符</dd>

          <dt>函数调用结果:</dt>
          <dd>当前时间: {now}</dd>

          <dt>数组方法:</dt>
          <dd>名字反转: {name.split('').reverse().join('')}</dd>
        </div>
      </div>

      {/* --- 卡片2：模板字面量 --- */}
      <div className="card">
        <h3>模板字面量 (Template Literals)</h3>
        <p>在花括号中使用模板字面量拼接字符串：</p>
        <div className="code-block">{`const greeting = \`你好, \${name}!\``}</div>
        <p className="mt-8">结果: {greeting}</p>
        <p className="mt-8">组合多个变量: {`${name}，${age}岁，${isAdmin ? '管理员' : '普通用户'}`}</p>
      </div>

      {/* --- 卡片3：三元表达式和逻辑运算 --- */}
      <div className="card">
        <h3>表达式中的逻辑判断</h3>
        <div className="desc-list">
          <dt>三元运算符:</dt>
          <dd>{age >= 18 ? '成年人' : '未成年人'}</dd>

          <dt>逻辑与:</dt>
          <dd>{isAdmin && <span className="badge badge-info">欢迎管理员回来</span>}</dd>

          <dt>逻辑或:</dt>
          <dd>名称: {name || '匿名用户'}</dd>

          <dt>空值合并 (??):</dt>
          <dd>评分: {null ?? '暂无评分'}</dd>

          <dt>可选链 (?.):</dt>
          <dd>城市: {undefined?.city ?? '未填写'}</dd>
        </div>
      </div>

      {/* --- 提示：花括号中不能放语句 --- */}
      <div className="tip tip-warning">
        注意：花括号 {} 中只能放<strong>表达式</strong>（有返回值的代码），不能放<strong>语句</strong>（if/for/while）。
        可以用三元运算符替代 if-else，用 map 替代 for 循环。
      </div>
    </div>
  )
}

/* ========================================================
 * 2. 属性绑定演示
 * 展示 JSX 中的各种属性写法：className、htmlFor、style 等
 * ======================================================== */
function AttributeDemo() {
  // 用于演示动态属性的变量
  const [isActive, setIsActive] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const imageUrl = 'https://picsum.photos/200/120'
  const btnDisabled = inputValue.length < 3

  // 用户数据对象，用于展示展开运算符
  const userData = {
    name: '张三',
    age: 28,
    role: '前端工程师'
  }

  // 动态 className 的数组拼接方式
  const classList = ['btn', isActive ? 'btn-primary' : '', 'flex', 'gap-8']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex flex-col gap-16">
      {/* --- 卡片1：className vs class --- */}
      <div className="card">
        <h3>className 属性</h3>
        <p>在 JSX 中必须使用 className 代替 class（因为 class 是 JavaScript 保留字）：</p>
        <div className="code-block">{`<div className="card">内容</div>  // ✅ 正确\n<div class="card">内容</div>     // ❌ 错误`}</div>
        <div className="flex gap-8 items-center mt-16">
          <span className={isActive ? 'badge badge-success' : 'badge badge-danger'}>
            状态: {isActive ? '激活' : '未激活'}
          </span>
          <button className="btn" onClick={() => setIsActive(!isActive)}>
            切换状态
          </button>
        </div>
      </div>

      {/* --- 卡片2：htmlFor vs for --- */}
      <div className="card">
        <h3>htmlFor 属性</h3>
        <p>与 className 类似，label 的 for 属性在 JSX 中改为 htmlFor：</p>
        <div className="code-block">{`<label htmlFor="email">邮箱</label>\n<input id="email" />`}</div>
        <div className="mt-16">
          <label htmlFor="email-input" style={{ marginRight: 8 }}>邮箱:</label>
          <input
            id="email-input"
            className="input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="请输入邮箱地址"
          />
        </div>
        <div className="mt-8">
          <span className="badge badge-info">输入长度: {inputValue.length}</span>
          <button className="btn btn-primary" disabled={btnDisabled} style={{ marginLeft: 8 }}>
            提交 {btnDisabled ? '(至少输入3个字符)' : ''}
          </button>
        </div>
      </div>

      {/* --- 卡片3：布尔属性 --- */}
      <div className="card">
        <h3>布尔属性 (Boolean Attributes)</h3>
        <p>布尔值为 true 时可以省略值，false 时属性不会渲染到 DOM 中：</p>
        <div className="code-block">{`<input disabled={true} />  ≡  <input disabled />\n<input disabled={false} /> → 渲染为 <input /> (无 disabled 属性)`}</div>
        <div className="flex gap-8 mt-16">
          <button className="btn" disabled>禁用按钮 (disabled)</button>
          <input type="text" readOnly value="只读输入框 (readOnly)" className="input" />
          <input type="checkbox" defaultChecked /> <span>默认选中 (defaultChecked)</span>
        </div>
      </div>

      {/* --- 卡片4：展开运算符 --- */}
      <div className="card">
        <h3>展开运算符 (Spread Attributes)</h3>
        <p>使用 ... 将对象的属性批量传递给组件：</p>
        <div className="code-block">{`const userData = { name: '张三', age: 28, role: '前端工程师' }\n<UserCard {...userData} />`}</div>
        <div className="desc-list mt-8">
          <dt>对象内容:</dt>
          <dd>{JSON.stringify(userData)}</dd>
          <dt>展开后等价于:</dt>
          <dd>{`<UserCard name="${userData.name}" age={${userData.age}} role="${userData.role}" />`}</dd>
        </div>
      </div>

      {/* --- 卡片5：动态 className 拼接 --- */}
      <div className="card">
        <h3>动态 className 拼接技巧</h3>
        <div className="code-block">{`// 数组 + filter + join 方式（推荐）\nconst cls = ['btn', isActive ? 'active' : null]\n  .filter(Boolean)\n  .join(' ')`}</div>
        <div className="mt-8">
          <span className="badge badge-info">计算结果: "{classList}"</span>
        </div>
        <button className={classList} onClick={() => setIsActive(!isActive)}>
          {isActive ? '已激活' : '未激活'} 按钮
        </button>
      </div>
    </div>
  )
}

/* ========================================================
 * 3. 条件渲染演示
 * 展示三元运算符和逻辑与 && 进行条件渲染
 * ======================================================== */
function ConditionalDemo() {
  // 用于控制条件的状态
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [messageCount, setMessageCount] = useState(3)
  const [score, setScore] = useState(85)

  // 模拟用户数据
  const user = isLoggedIn
    ? { name: '张三', role: 'admin', vip: true }
    : null

  return (
    <div className="flex flex-col gap-16">
      {/* --- 卡片1：登录状态切换（三元运算符） --- */}
      <div className="card">
        <h3>三元运算符 - 二选一</h3>
        <p>根据 isLoggedIn 的值，显示不同的内容：</p>
        <div className="mt-8">
          {isLoggedIn ? (
            <div className="tip tip-info">
              欢迎回来，{user.name}！
              {user.role === 'admin' && <span className="badge badge-danger" style={{ marginLeft: 8 }}>管理员</span>}
              {user.vip && <span className="badge badge-warning" style={{ marginLeft: 8 }}>VIP</span>}
            </div>
          ) : (
            <div className="tip tip-warning">
              您尚未登录，请先登录以查看完整内容
            </div>
          )}
        </div>
        <button className="btn mt-16" onClick={() => setIsLoggedIn(!isLoggedIn)}>
          {isLoggedIn ? '退出登录' : '模拟登录'}
        </button>
      </div>

      {/* --- 卡片2：逻辑与 &&（有则显示，无则不显示） --- */}
      <div className="card">
        <h3>逻辑与 &amp;&amp; - 有则显示</h3>
        <p>消息数量: {messageCount}</p>
        <div className="flex gap-8 mt-8 mb-16">
          <button className="btn" onClick={() => setMessageCount(c => c - 1)}>减少</button>
          <button className="btn" onClick={() => setMessageCount(c => c + 1)}>增加</button>
          <button className="btn" onClick={() => setMessageCount(0)}>清零</button>
        </div>

        {/* 演示 && 运算符 */}
        {messageCount > 0 && (
          <div className="tip tip-info">
            你有 {messageCount} 条未读消息
          </div>
        )}
        {/* 安全写法：避免 count=0 时渲染出 "0" */}
        {messageCount === 0 && (
          <div className="tip tip-warning">
            没有未读消息
          </div>
        )}
      </div>

      {/* --- 卡片3：嵌套三元运算符（不推荐过度使用） --- */}
      <div className="card">
        <h3>成绩评价（嵌套三元运算符）</h3>
        <p>当前分数: {score}</p>
        <input
          type="range"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div className="mt-8">
          <span className={
            score >= 90 ? 'badge badge-success' :
            score >= 60 ? 'badge badge-info' : 'badge badge-danger'
          }>
            {score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 60 ? '及格' : '不及格'}
          </span>
        </div>
      </div>

      {/* --- 提示 --- */}
      <div className="tip tip-danger">
        注意：嵌套三元运算符超过一层时，可读性会变差。推荐使用 if-else 提前返回或提取为变量/子组件。
      </div>
    </div>
  )
}

/* ========================================================
 * 4. 列表渲染演示
 * 展示使用 map 方法渲染列表，以及 key 属性的重要性
 * ======================================================== */
function ListDemo() {
  // 模拟数据列表
  const fruits = [
    { id: 1, name: '苹果', color: '红色', price: 5.5, stock: 20 },
    { id: 2, name: '香蕉', color: '黄色', price: 3.0, stock: 0 },
    { id: 3, name: '橙子', color: '橙色', price: 4.5, stock: 15 },
    { id: 4, name: '葡萄', color: '紫色', price: 12.0, stock: 8 },
    { id: 5, name: '西瓜', color: '绿色', price: 8.0, stock: 5 },
  ]

  const colors = ['红色', '绿色', '蓝色', '黄色', '紫色']

  return (
    <div className="flex flex-col gap-16">
      {/* --- 卡片1：基础 map 列表 --- */}
      <div className="card">
        <h3>基础列表渲染 (map + key)</h3>
        <div className="code-block">{`{items.map(item => (\n  <li key={item.id}>{item.name}</li>\n))}`}</div>
        <ul className="list mt-8" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          {fruits.map(fruit => (
            <li key={fruit.id} className="list-item">
              <span className={`badge ${fruit.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {fruit.stock > 0 ? '有货' : '缺货'}
              </span>
              <span style={{ fontWeight: 600 }}>{fruit.name}</span>
              <span style={{ color: fruit.color }}>{fruit.color}</span>
              <span style={{ marginLeft: 'auto' }}>¥{fruit.price.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- 卡片2：使用 index 作为 key（静态列表可用） --- */}
      <div className="card">
        <h3>使用 index 作为 key（仅限静态列表）</h3>
        <p>当列表不会增删排序时，可以用 index 做 key：</p>
        <div className="flex gap-8 mt-8 flex-wrap">
          {colors.map((color, index) => (
            <span key={index} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              background: color,
              color: color === '黄色' ? '#333' : '#fff',
              fontSize: '14px',
            }}>
              {color}
            </span>
          ))}
        </div>
      </div>

      {/* --- 卡片3：表格列表渲染 --- */}
      <div className="card">
        <h3>表格列表渲染</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>颜色</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {fruits.map(fruit => (
                <tr key={fruit.id}>
                  <td>{fruit.id}</td>
                  <td style={{ fontWeight: 600 }}>{fruit.name}</td>
                  <td>{fruit.color}</td>
                  <td>¥{fruit.price.toFixed(1)}</td>
                  <td>{fruit.stock}</td>
                  <td>
                    {fruit.stock > 10 ? (
                      <span className="badge badge-success">充足</span>
                    ) : fruit.stock > 0 ? (
                      <span className="badge badge-warning">紧张</span>
                    ) : (
                      <span className="badge badge-danger">缺货</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 提示 --- */}
      <div className="tip tip-warning">
        <strong>key 的选择原则：</strong>优先使用数据唯一 ID，避免使用 index（仅在静态列表时可用）。
        使用 Math.random() 作为 key 是<strong>错误</strong>的，每次渲染都会变。
      </div>
    </div>
  )
}

/* ========================================================
 * 5. React.createElement 对比演示
 * 展示 JSX 和 React.createElement 的等价写法
 * ======================================================== */
function CreateElementDemo() {
  // 使用 JSX 创建的元素（你平时写的方式）
  const jsxElement = (
    <div className="card">
      <h3>这是 JSX 写法</h3>
      <p>JSX 会被编译为 React.createElement 调用</p>
      <span className="badge badge-success">JSX</span>
    </div>
  )

  // 使用 React.createElement 创建等价元素（编译后的样子）
  const createElementElement = (
    React.createElement('div', { className: 'card' },
      React.createElement('h3', null, '这是 createElement 写法'),
      React.createElement('p', null, '这是编译后等价的代码'),
      React.createElement('span', { className: 'badge badge-info' }, 'createElement')
    )
  )

  return (
    <div className="flex flex-col gap-16">
      {/* --- 对比展示 --- */}
      <div className="card">
        <h3>JSX vs React.createElement</h3>
        <p>JSX 本质上就是 React.createElement() 的语法糖，两者完全等价：</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mt-16">
          {/* JSX 写法 */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>JSX 写法（你平时写的）:</p>
            <div className="code-block">{`<div className="card">\n  <h3>标题</h3>\n  <p>内容</p>\n</div>`}</div>
            {jsxElement}
          </div>

          {/* createElement 写法 */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>编译后 (createElement):</p>
            <div className="code-block">{`React.createElement(\n  'div',\n  { className: 'card' },\n  React.createElement('h3', null, '标题'),\n  React.createElement('p', null, '内容')\n)`}</div>
            {createElementElement}
          </div>
        </div>
      </div>

      {/* --- 编译规则说明 --- */}
      <div className="card">
        <h3>编译规则对照表</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>JSX 写法</th>
                <th>编译为 createElement</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>{'<div>'}</code></td>
                <td><code>createElement('div', ...)</code></td>
                <td>标签名 → 字符串</td>
              </tr>
              <tr>
                <td><code>{'<Component />'}</code></td>
                <td><code>createElement(Component, ...)</code></td>
                <td>组件 → 变量引用</td>
              </tr>
              <tr>
                <td><code>{'className="box"'}</code></td>
                <td><code>{'{ className: "box" }'}</code></td>
                <td>属性 → props 对象</td>
              </tr>
              <tr>
                <td><code>{'{expression}'}</code></td>
                <td>原样保留在参数中</td>
                <td>表达式原样传递</td>
              </tr>
              <tr>
                <td><code>{'<>'}</code></td>
                <td><code>createElement(Fragment, ...)</code></td>
                <td>Fragment 简写</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 提示 --- */}
      <div className="tip tip-info">
        <strong>React 17+ 的变化：</strong>从 React 17 开始，JSX 不再需要 import React。
        编译后会自动从 react/jsx-runtime 导入 jsx 函数，不再使用 React.createElement。
      </div>
    </div>
  )
}

/* ========================================================
 * 6. Fragment 用法演示
 * 展示 Fragment 和 <></> 的使用场景
 * ======================================================== */
function FragmentDemo() {
  // 模拟表格数据
  const rows = [
    { id: 1, name: 'React', type: '框架', year: 2013 },
    { id: 2, name: 'Vue', type: '框架', year: 2014 },
    { id: 3, name: 'Angular', type: '框架', year: 2016 },
  ]

  return (
    <div className="flex flex-col gap-16">
      {/* --- 卡片1：不使用 Fragment 的问题 --- */}
      <div className="card">
        <h3>为什么需要 Fragment？</h3>
        <p>JSX 必须有一个根元素，如果不需要额外的 div，就可以用 Fragment：</p>
        <div className="code-block">{`// ❌ 错误：多个并列元素，没有根元素\nreturn (\n  <h1>标题</h1>\n  <p>段落</p>\n)\n\n// ✅ 方案一：用 div 包裹（但会产生多余的 DOM 节点）\nreturn <div><h1>标题</h1><p>段落</p></div>\n\n// ✅ 方案二：用 Fragment（不产生多余 DOM 节点）\nreturn <><h1>标题</h1><p>段落</p></>`}</div>
      </div>

      {/* --- 卡片2：Fragment 实际场景 - 表格行 --- */}
      <div className="card">
        <h3>Fragment 实际场景：表格渲染</h3>
        <p>在表格中返回多行时，Fragment 尤其有用（因为不能在 &lt;tbody&gt; 中插入 &lt;div&gt;）：</p>
        <div className="table-wrapper mt-8">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>类型</th>
                <th>年份</th>
              </tr>
            </thead>
            <tbody>
              {/* 使用 Fragment 包裹多个 tr，不会产生额外 DOM */}
              {rows.map(row => (
                <React.Fragment key={row.id}>
                  <tr style={{ background: '#f6f8fa' }}>
                    <td>{row.id}</td>
                    <td style={{ fontWeight: 600 }}>{row.name}</td>
                    <td><span className="badge badge-info">{row.type}</span></td>
                    <td>{row.year}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 卡片3：Fragment vs div 对比 --- */}
      <div className="card">
        <h3>Fragment vs div 包裹对比</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>使用 &lt;div&gt; 包裹：</p>
            <div className="code-block">{`<div>\n  <span>A</span>\n  <span>B</span>\n</div>\n// DOM 中有一个额外的 <div>`}</div>
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>使用 Fragment 包裹：</p>
            <div className="code-block">{`<>\n  <span>A</span>\n  <span>B</span>\n</>\n// DOM 中没有额外节点`}</div>
          </div>
        </div>
        <div className="tip tip-info mt-16">
          <code>{'<>'}</code> 是 <code>{'<React.Fragment>'}</code> 的简写。
          如果需要 key 属性，只能使用完整写法 <code>{'<React.Fragment key={...}>'}</code>。
        </div>
      </div>
    </div>
  )
}

/* ========================================================
 * 7. 样式绑定演示
 * 展示内联样式（style 对象）和动态 className 的使用
 * ======================================================== */
function StyleDemo() {
  // 用于控制样式的状态
  const [boxColor, setBoxColor] = useState('#646cff')
  const [fontSize, setFontSize] = useState(16)
  const [isBold, setIsBold] = useState(false)
  const [theme, setTheme] = useState('light')

  // 内联样式对象（注意 CSS 属性名用 camelCase）
  const boxStyle = {
    width: '100%',
    padding: '20px',
    borderRadius: 'var(--radius)',
    backgroundColor: boxColor,
    color: '#fff',
    fontSize: `${fontSize}px`,
    fontWeight: isBold ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  }

  // 主题样式对象
  const themeStyle = theme === 'dark'
    ? { background: '#1a1a2e', color: '#e0e0e0', padding: 16, borderRadius: 8 }
    : { background: '#f6f8fa', color: '#333', padding: 16, borderRadius: 8 }

  return (
    <div className="flex flex-col gap-16">
      {/* --- 卡片1：内联 style 对象 --- */}
      <div className="card">
        <h3>内联样式 (style 对象)</h3>
        <p>JSX 中 style 属性接收一个 JavaScript 对象，CSS 属性名用 camelCase：</p>
        <div className="code-block">{`<div style={{ color: 'red', fontSize: '16px' }}>\n  内容\n</div>`}</div>

        {/* 可交互的样式盒子 */}
        <div style={boxStyle} className="mt-16">
          我是一个样式盒子，颜色和大小都可以调节
        </div>

        <div className="flex gap-8 mt-16 flex-wrap">
          <label>颜色:
            <input
              type="color"
              value={boxColor}
              onChange={(e) => setBoxColor(e.target.value)}
              style={{ marginLeft: 4, verticalAlign: 'middle' }}
            />
          </label>
          <label>字号: {fontSize}px
            <input
              type="range"
              min="12"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              style={{ marginLeft: 4, width: 100 }}
            />
          </label>
          <button className="btn" onClick={() => setIsBold(!isBold)}>
            {isBold ? '取消粗体' : '加粗'}
          </button>
        </div>
      </div>

      {/* --- 卡片2：动态主题切换 --- */}
      <div className="card">
        <h3>动态 className 切换（主题）</h3>
        <div style={themeStyle}>
          <p style={{ fontWeight: 600 }}>
            当前主题: {theme === 'dark' ? '深色模式' : '浅色模式'}
          </p>
          <p>这是一段文字，背景和文字颜色会随主题变化</p>
          <button className="btn mt-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            切换为{theme === 'dark' ? '浅色' : '深色'}模式
          </button>
        </div>
      </div>

      {/* --- 卡片3：CSS 属性名对照表 --- */}
      <div className="card">
        <h3>CSS 属性名转换规则</h3>
        <p>所有带 <code>-</code> 的 CSS 属性名在 JSX 中都要转为 camelCase：</p>
        <div className="table-wrapper mt-8">
          <table>
            <thead>
              <tr>
                <th>CSS 写法</th>
                <th>JSX 写法</th>
                <th>示例</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>background-color</td><td>backgroundColor</td><td>{'{ backgroundColor: "#fff" }'}</td></tr>
              <tr><td>font-size</td><td>fontSize</td><td>{'{ fontSize: "16px" }'}</td></tr>
              <tr><td>margin-top</td><td>marginTop</td><td>{'{ marginTop: 10 }'}</td></tr>
              <tr><td>border-radius</td><td>borderRadius</td><td>{'{ borderRadius: "8px" }'}</td></tr>
              <tr><td>z-index</td><td>zIndex</td><td>{'{ zIndex: 100 }'}</td></tr>
              <tr><td>line-height</td><td>lineHeight</td><td>{'{ lineHeight: 1.6 }'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 导出根组件
export default App
