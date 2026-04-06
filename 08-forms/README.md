# 08 - 表单处理

## 🎯 本节目标
- 掌握受控组件的概念和使用
- 了解非受控组件的使用场景
- 处理各种表单元素的交互
- 实现完整的表单验证

---

## 🤔 什么是表单处理？

想象一下你在填一张**纸质报名表**——你需要填写姓名、勾选性别、选择课程，然后交给工作人员。在网页中，**表单**就是用来收集用户输入信息的"电子报名表"。

> **类比**：表单就像你和网页之间的"对话窗口"——你在输入框里打字、在复选框里打勾、在下拉菜单里选择，网页"听到"你的输入后做出响应。

### 为什么表单处理在 React 中很特殊？

在普通的 HTML 中，表单元素（`<input>`、`<select>` 等）会**自己管理自己的值**。你输入什么，输入框里就显示什么。

但在 React 中，我们希望**由 React 来管理这些值**（这叫做"受控组件"），因为：
- React 需要知道用户输入了什么，才能做出正确的响应
- React 需要能够在代码中修改输入框的值（比如清空、格式化）
- React 需要在提交前进行验证

---

## 📖 受控 vs 非受控组件

### 受控组件（推荐）

> **类比**：受控组件就像一个"听话的孩子"——它的每一个行为都由 React（家长）控制。React 告诉它显示什么，它就显示什么。

React 通过 `state` 完全控制表单元素的值。表单元素的值始终和 React 的 state 保持同步。

**特点：**
- 值由 React state 管理（单一数据源）
- 每次变化触发 `onChange` 更新 state
- 可以在代码中随时修改值
- 方便进行实时验证

```jsx
import { useState } from 'react';

function ControlledInput() {
  // 1. 用 state 创建一个"数据源"
  const [value, setValue] = useState('');
  
  // 2. 渲染时，输入框的值始终等于 state
  // 3. 用户输入时，通过 onChange 把新值更新到 state
  return (
    <input
      type="text"
      value={value}                              {/* 受控：值来自 state */}
      onChange={(e) => setValue(e.target.value)}  {/* 变化时更新 state */}
    />
  );
}

// 数据流：
// 用户输入 "H" → onChange 触发 → e.target.value = "H"
// → setValue("H") → state 更新为 "H"
// → 组件重新渲染 → input 显示 "H"
```

**不用受控组件 vs 用受控组件：**

```jsx
// ❌ 不用受控组件：你无法控制输入框的值
function UncontrolledExample() {
  return (
    <div>
      <input type="text" />
      <button onClick={() => {
        // 怎么清空输入框？很难！
        // 怎么限制输入长度？做不到！
        // 怎么做实时验证？做不到！
      }}>清空</button>
    </div>
  );
}

// ✅ 用受控组件：完全掌控
function ControlledExample() {
  const [value, setValue] = useState('');
  
  return (
    <div>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => setValue(e.target.value.slice(0, 10))}  {/* 限制最多10个字符 */}
      />
      <p>已输入 {value.length}/10 个字符</p>  {/* 实时显示字符数 */}
      <button onClick={() => setValue('')}>清空</button>  {/* 一键清空 */}
    </div>
  );
}
```

### 非受控组件

> **类比**：非受控组件就像一个"自由的孩子"——它自己管理自己的状态，你不主动去管它。只有在你需要的时候（比如点击提交），你才通过 ref 去"查看"它的状态。

DOM 自身管理表单状态，通过 `ref` 获取值。

**特点：**
- DOM 自己管理值
- 使用 `ref` 直接操作 DOM
- 更接近传统 HTML 行为
- 代码更简单，但控制力弱

```jsx
import { useRef } from 'react';

function UncontrolledInput() {
  // 创建一个 ref，用来"指向" DOM 元素
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    // 通过 ref.current 访问真实的 DOM 元素，读取 .value
    console.log('用户输入了:', inputRef.current.value);
  };
  
  return (
    <div>
      {/* defaultValue 是非受控组件设置初始值的方式（不是 value） */}
      <input type="text" defaultValue="初始值" ref={inputRef} />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}
```

**选择建议：**

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 需要实时验证 | 受控组件 | 每次 onChange 都可以检查 |
| 需要格式化输入 | 受控组件 | 可以在 setState 时修改值 |
| 需要条件禁用/清空 | 受控组件 | 直接修改 state 即可 |
| 简单的一次性获取值 | 非受控组件 | 代码更简单 |
| 与非 React 库集成 | 非受控组件 | 避免 React 和 DOM 冲突 |

> **最佳实践提示**：大多数情况使用**受控组件**（更容易验证和控制）。只有当你明确知道不需要控制输入时，才使用非受控组件。

---

## 📝 各种表单元素的处理

### 文本输入框（Input Text）

```jsx
import { useState } from 'react';

function TextInput() {
  const [text, setText] = useState('');
  
  return (
    <div>
      <label>
        文本输入：
        <input 
          type="text"
          value={text}                              {/* 值绑定到 state */}
          onChange={(e) => setText(e.target.value)}  {/* 输入变化时更新 state */}
          placeholder="请输入文本"                    {/* 占位提示文字 */}
          maxLength={50}                            {/* 限制最大字符数 */}
        />
      </label>
      {/* 实时显示已输入字符数 */}
      <p>已输入: {text.length}/50 字符</p>
    </div>
  );
}
```

### 文本域（Textarea）

```jsx
function TextareaInput() {
  const [content, setContent] = useState('');
  
  return (
    <textarea
      value={content}                              {/* 值绑定到 state */}
      onChange={(e) => setContent(e.target.value)}  {/* 输入变化时更新 state */}
      placeholder="请输入详细内容"
      rows={5}  {/* 默认显示5行 */}
    />
  );
}
```

### 单选框（Radio）

> **类比**：单选框就像考试中的**单选题**——只能选一个答案。一组同名的 radio 按钮共享同一个 state。

```jsx
function RadioGroup() {
  const [gender, setGender] = useState('');  // 空字符串表示未选择
  
  return (
    <fieldset>
      <legend>性别</legend>
      {/* 每个选项是一个 label 包裹的 input */}
      <label>
        <input
          type="radio"
          name="gender"                 {/* 相同的 name 表示它们是一组 */}
          value="male"                  {/* 选中时，state 会变成 "male" */}
          checked={gender === 'male'}   {/* 当 state 等于这个值时，显示为选中状态 */}
          onChange={(e) => setGender(e.target.value)}
        />
        男
      </label>
      <label>
        <input
          type="radio"
          name="gender"
          value="female"
          checked={gender === 'female'}
          onChange={(e) => setGender(e.target.value)}
        />
        女
      </label>
      <p>你选择了：{gender || '未选择'}</p>
    </fieldset>
  );
}
```

### 复选框（Checkbox）

> **类比**：复选框就像考试中的**多选题**——可以选多个答案。需要用数组来存储选中的值。

```jsx
function CheckboxGroup() {
  // 用数组存储选中的兴趣爱好
  const [hobbies, setHobbies] = useState([]);
  
  // 处理复选框变化
  const handleCheckboxChange = (e) => {
    const value = e.target.value;      // 当前操作的复选框的值
    const checked = e.target.checked;   // 是选中了还是取消了？
    
    if (checked) {
      // 选中 → 把值添加到数组中
      setHobbies([...hobbies, value]);
    } else {
      // 取消 → 从数组中移除这个值
      setHobbies(hobbies.filter(hobby => hobby !== value));
    }
  };
  
  return (
    <div>
      {/* 每个复选框：checked 控制是否打勾，hobbies.includes() 判断是否在选中列表中 */}
      <label>
        <input 
          type="checkbox" 
          value="reading"
          checked={hobbies.includes('reading')}  {/* 如果 "reading" 在数组中就是选中状态 */}
          onChange={handleCheckboxChange}
        />
        阅读
      </label>
      <label>
        <input 
          type="checkbox" 
          value="sports"
          checked={hobbies.includes('sports')}
          onChange={handleCheckboxChange}
        />
        运动
      </label>
      <label>
        <input 
          type="checkbox" 
          value="music"
          checked={hobbies.includes('music')}
          onChange={handleCheckboxChange}
        />
        音乐
      </label>
      <p>你的爱好：{hobbies.join('、') || '未选择'}</p>
    </div>
  );
}

// 单个复选框（开关）的简化处理：
function SingleCheckbox() {
  const [agree, setAgree] = useState(false);  // 只需要一个布尔值
  
  return (
    <label>
      <input
        type="checkbox"
        checked={agree}                    {/* 布尔值控制打勾状态 */}
        onChange={(e) => setAgree(e.target.checked)}  {/* e.target.checked 是布尔值 */}
      />
      我同意用户协议
    </label>
  );
}
```

### 下拉选择（Select）

```jsx
function SelectInput() {
  const [city, setCity] = useState('');      // 单选下拉框的值
  const [multiSelect, setMultiSelect] = useState([]);  // 多选下拉框的值（数组）
  
  return (
    <div>
      {/* 单选下拉框 */}
      <h3>选择城市</h3>
      <select 
        value={city} 
        onChange={(e) => setCity(e.target.value)}
      >
        <option value="">请选择城市</option>  {/* 空值表示未选择 */}
        <option value="beijing">北京</option>
        <option value="shanghai">上海</option>
        <option value="guangzhou">广州</option>
      </select>
      <p>你选择了：{{ beijing: '北京', shanghai: '上海', guangzhou: '广州' }[city]}</p>
      
      {/* 多选下拉框（需要加 multiple 属性） */}
      <h3>选择技术栈</h3>
      <select 
        multiple                        {/* 多选模式 */}
        value={multiSelect}             {/* 值是数组 */}
        onChange={(e) => {
          // 获取所有被选中的 option 的值
          const options = Array.from(
            e.target.selectedOptions,
            option => option.value
          );
          setMultiSelect(options);
        }}
      >
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="angular">Angular</option>
      </select>
      <p>你选择了：{multiSelect.join('、')}</p>
    </div>
  );
}
```

### 数字输入（Number Input）

```jsx
function NumberInput() {
  const [age, setAge] = useState(18);
  
  const increment = () => setAge(age + 1);
  const decrement = () => setAge(Math.max(0, age - 1));  // 最小值为 0
  
  return (
    <div>
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}  {/* 转换为数字类型 */}
        min={0}       {/* HTML 属性限制最小值 */}
        max={150}     {/* HTML 属性限制最大值 */}
      />
      <button onClick={decrement}>-</button>
      <span>{age} 岁</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### 文件上传（File Input）

> **注意**：`<input type="file">` 始终是非受控组件，因为它的值只能由用户设置，不能通过代码修改。

```jsx
function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);  // 存储选中的文件对象
  const [preview, setPreview] = useState(null);             // 存储图片预览的 URL
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];  // files 是一个 FileList 对象，取第一个文件
    setSelectedFile(file);
    
    // 如果是图片，生成预览
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();  // 创建一个文件读取器
      reader.onloadend = () => {
        setPreview(reader.result);  // 读取完成后，设置预览 URL
      };
      reader.readAsDataURL(file);  // 以 Data URL 格式读取文件
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*,.pdf"  {/* 限制只能选择图片和 PDF */}
        onChange={handleFileChange}
      />
      {selectedFile && <p>选择了: {selectedFile.name} ({selectedFile.size} 字节)</p>}
      {preview && <img src={preview} alt="预览" width={200} />}
    </div>
  );
}
```

---

## ✅ 表单验证

### 什么是表单验证？

> **类比**：表单验证就像火车站的**安检**——在用户提交表单之前，检查所有信息是否符合要求（密码够不够长？邮箱格式对不对？），不符合就不让通过。

### 验证的时机

| 时机 | 说明 | 示例 |
|------|------|------|
| 实时验证（onChange） | 用户输入时立即检查 | 搜索框去抖、密码强度提示 |
| 失焦验证（onBlur） | 输入框失去焦点时检查 | 邮箱格式、手机号格式 |
| 提交验证（onSubmit） | 点击提交按钮时检查 | 所有必填项检查 |

### 基础验证模式

```jsx
import { useState } from 'react';

function ValidatedForm() {
  // 用一个对象管理所有表单字段
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // 用一个对象管理所有字段的错误信息
  const [errors, setErrors] = useState({});
  
  // 验证规则函数：检查所有字段，返回错误对象
  const validate = () => {
    const newErrors = {};
    
    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 2 || formData.username.length > 20) {
      newErrors.username = '用户名长度应在 2-20 个字符之间';
    }
    
    // 邮箱验证（使用正则表达式）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    // 密码验证
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少 6 位';
    }
    
    setErrors(newErrors);
    // 如果 newErrors 是空对象，说明没有错误，验证通过
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交处理
  const handleSubmit = (e) => {
    e.preventDefault();  // 阻止表单默认的提交行为（刷新页面）
    
    if (validate()) {
      console.log('验证通过，提交数据:', formData);
      // 发送到服务器...
    } else {
      console.log('验证失败:', errors);
    }
  };
  
  // 通用输入变化处理函数
  const handleChange = (e) => {
    const { name, value } = e.target;  // 解构出字段名和新值
    setFormData(prev => ({ ...prev, [name]: value }));  // 只更新对应的字段
    
    // 输入时清除该字段的错误提示
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* noValidate 禁用浏览器默认的 HTML5 验证，使用我们自己的验证 */}
      
      {/* 用户名字段 */}
      <div>
        <label>用户名：</label>
        <input
          type="text"
          name="username"           {/* name 属性用于识别是哪个字段 */}
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? 'error' : ''}  {/* 有错误时添加 error 样式 */}
        />
        {/* 有错误时显示错误信息 */}
        {errors.username && <span className="error-msg">{errors.username}</span>}
      </div>
      
      {/* 邮箱字段 */}
      <div>
        <label>邮箱：</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>
      
      {/* 密码字段 */}
      <div>
        <label>密码：</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-msg">{errors.password}</span>}
      </div>
      
      <button type="submit">注册</button>
    </form>
  );
}
```

### 自定义验证 Hook（进阶）

```jsx
// 把表单验证逻辑提取成自定义 Hook，方便复用
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 输入时实时验证（可选）
    if (errors[name]) {
      const newErrors = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: newErrors[name] || '' }));
    }
  };
  
  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      callback(values);  // 验证通过，执行回调
    }
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };
  
  return { values, errors, handleChange, handleSubmit, reset };
}

// 使用
function RegisterForm() {
  const { values, errors, handleChange, handleSubmit } = useForm(
    { username: '', email: '', password: '' },
    (values) => {
      const errors = {};
      if (!values.username.trim()) errors.username = '用户名不能为空';
      if (!values.email) errors.email = '邮箱不能为空';
      if (values.password.length < 6) errors.password = '密码至少6位';
      return errors;
    }
  );
  
  return (
    <form onSubmit={handleSubmit((data) => console.log('提交:', data))}>
      <input name="username" value={values.username} onChange={handleChange} />
      {errors.username && <span>{errors.username}</span>}
      {/* 其他字段... */}
      <button type="submit">注册</button>
    </form>
  );
}
```

---

## 🎨 实战：完整登录表单

```jsx
import { useState } from 'react';

function LoginForm() {
  // 管理表单数据
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // 管理加载状态和错误信息
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();  // 阻止默认提交行为
    setError('');        // 清除旧错误
    setLoading(true);    // 开始加载
    
    try {
      // 模拟 API 调用（真实项目中换成 fetch 或 axios）
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('登录成功:', form);
      // 跳转到首页...
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);  // 无论成功失败，结束加载
    }
  };
  
  // 判断表单是否可提交（邮箱和密码都不为空）
  const isFormValid = form.email && form.password;
  
  return (
    <div className="login-container">
      <h2>登录</h2>
      
      {/* 错误提示 */}
      {error && <div className="alert error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* 邮箱 */}
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            id="email"                    {/* htmlFor 和 id 关联，点击标签可以聚焦输入框 */}
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="your@email.com"
            required                     {/* HTML5 原生验证（作为兜底） */}
          />
        </div>
        
        {/* 密码 */}
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            placeholder="••••••••"
            required
          />
        </div>
        
        {/* 记住我（复选框） */}
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => setForm({...form, rememberMe: e.target.checked})}
            />
            记住我
          </label>
        </div>
        
        {/* 提交按钮 */}
        <button 
          type="submit" 
          disabled={!isFormValid || loading}  {/* 不可提交时或加载中禁用按钮 */}
        >
          {loading ? '登录中...' : '登录'}
        </button>
        
        <a href="/forgot-password" className="forgot-link">
          忘记密码？
        </a>
      </form>
    </div>
  );
}
```

---

## 🚨 常见错误

### 错误 1：忘记 `e.preventDefault()`

```jsx
// ❌ 没有 preventDefault → 点击提交按钮会刷新页面！
const handleSubmit = (e) => {
  console.log('提交');
};

// ✅ 阻止默认行为
const handleSubmit = (e) => {
  e.preventDefault();  // 阻止页面刷新
  console.log('提交');
};
```

### 错误 2：直接修改 state 对象

```jsx
// ❌ 直接修改 state（React 不会检测到变化）
const handleChange = (e) => {
  form.email = e.target.value;  // 直接修改！
  setForm(form);                 // 引用没变，React 认为没变化
};

// ✅ 创建新对象
const handleChange = (e) => {
  setForm({ ...form, email: e.target.value });  // 展开旧对象，覆盖 email
};
```

### 错误 3：textarea 不用 value 而用 children

```jsx
// ❌ 错误：textarea 的初始值应该用 value，不是写在标签之间
<textarea>初始内容</textarea>

// ✅ 正确
<textarea value={content} onChange={(e) => setContent(e.target.value)} />
```

### 错误 4：select 不用 value

```jsx
// ❌ 错误：用 selected 属性（这是传统 HTML 写法）
<select>
  <option value="a" selected>A</option>
  <option value="b">B</option>
</select>

// ✅ 正确：在 select 上使用 value
<select value={selectedValue} onChange={handleChange}>
  <option value="a">A</option>
  <option value="b">B</option>
</select>
```

---

## ✅ 最佳实践

1. **优先使用受控组件** —— 更容易验证、格式化和控制
2. **每个 `<label>` 的 `htmlFor` 要对应 `<input>` 的 `id`** —— 提升可访问性
3. **使用 `e.preventDefault()` 阻止表单默认提交** —— 防止页面刷新
4. **及时验证、及时反馈** —— 不要等用户填完所有字段才提示错误
5. **提交时禁用按钮、显示加载状态** —— 防止重复提交，提升用户体验
6. **提取通用表单逻辑为自定义 Hook** —— 避免代码重复

---

## 🔬 受控/非受控组件的深层原理

### 1. 受控组件的原理：React 如何"劫持"表单

#### value + onChange 的绑定机制

> **大白话**：浏览器原生 HTML 中，`<input>` 自己管理自己的值——你打字，它就显示。但在 React 的受控组件中，React 充当了一个"中间人"——你打字 → 浏览器通知 React → React 更新 state → React 告诉浏览器该显示什么。浏览器彻底失去了对输入框的控制权。

```
浏览器原生表单的数据流：
  用户打字 → 输入框直接显示 → 结束
  （输入框自己管理自己）

React 受控组件的数据流：
  用户打字 → 触发 onChange 事件
           → 你的事件处理函数执行：setState(e.target.value)
           → React state 更新
           → 组件重新渲染
           → React 用新的 state 值设置 input 的 value 属性
           → 浏览器显示新值
  （React 完全控制输入框）

┌──────────┐  onChange   ┌─────────┐  setState   ┌──────────┐
│  浏览器   │ ────────→  │  你的    │  ────────→  │ React    │
│  输入框   │            │  代码    │            │  state   │
│          │  ←──────── │         │  ←──────── │          │
│  显示值   │  value=   │         │  重新渲染   │          │
└──────────┘           └─────────┘            └──────────┘
```

这个过程在 React 内部的简化版实现：

```jsx
// React 内部处理受控组件的简化逻辑（非源码，仅供理解）
function updateDOM(inputElement, newValue) {
  // React 在 commit 阶段会做类似这样的操作
  const currentValue = inputElement.value;

  if (currentValue !== newValue) {
    // 设置 DOM 的 value 属性（这就是"劫持"的关键）
    inputElement.value = newValue;
  }
}

// 所以当你在受控输入框里打字时：
// 1. 浏览器先显示你打的字（原生行为）
// 2. React 的 onChange 触发，你调用 setState(newValue)
// 3. React 重新渲染，发现 value 没变（就是 newValue）→ 跳过
// 4. 如果你在 setState 中修改了值（如截断、格式化）：
//    3. React 重新渲染，发现新 value ≠ DOM 当前值 → 强制覆盖 DOM
//    4. 你看到的字符"消失"了，被替换成了你处理后的值
```

#### 为什么受控组件的输入框里输入的字符"会消失"？

你可能在某些场景中遇到过：在受控输入框里打字，但字符"打不进去"或"消失了"。

```jsx
// 最常见的原因：setState 的值不对
function BrokenInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value.toUpperCase()}  // ← 总是大写
      onChange={e => setValue(e.target.value)}  // ← 存储原始值
    />
  );
}
// 打字过程：
// 1. 用户输入 "a"
// 2. setState("a") → state = "a"
// 3. 重新渲染 → value = "a".toUpperCase() = "A"
// 4. DOM 更新为 "A"
// 5. 用户看到 "A"（而不是 "a"）→ 看起来正常

// 但如果改为：
function WeirdInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={e => {
        // 总是把最后一个字符删掉
        setValue(e.target.value.slice(0, -1));
      }}
    />
  );
}
// 打字过程：
// 1. 用户输入 "h" → setState("h".slice(0,-1)) = setState("")
// 2. DOM 更新为 "" → "h" 消失了！
// 用户永远打不出任何字！
```

> **大白话**：受控组件中，你输入的每个字符都要经过 React 的"审批"才能保留在输入框里。如果 React 说"这个字符不符合我的规则"，它就会在下次渲染时把这个字符"抹掉"。

#### 受控组件中的光标位置问题

```jsx
// 一个经典 Bug：自动格式化输入导致光标跳到末尾
function PhoneInput() {
  const [phone, setPhone] = useState('');

  const formatPhone = (value) => {
    // 自动添加空格：138 0000 0000
    const cleaned = value.replace(/\s/g, '');
    return cleaned.replace(/(\d{3})(\d{0,4})(\d{0,4})/, '$1 $2 $3').trim();
  };

  return (
    <input
      value={phone}
      onChange={e => setPhone(formatPhone(e.target.value))}
      placeholder="请输入手机号"
    />
  );
}

// 问题：用户在中间位置修改数字时，光标会跳到末尾
// 原因：
// 1. 用户在 "138 0000" 中间插入一个 "5" → "1385 0000"
// 2. formatPhone 重新格式化 → "138 5000 0"
// 3. React 重新渲染，DOM 的 value 变了
// 4. 浏览器收到新的 value 后，光标默认移到末尾
// 5. 用户体验差：光标乱跳

// ✅ 解决方案：手动保存和恢复光标位置
function PhoneInputFixed() {
  const inputRef = useRef(null);
  const [phone, setPhone] = useState('');

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value);

    // 在格式化前记录光标位置
    const cursorPos = e.target.selectionStart;
    setPhone(formatted);

    // 在 DOM 更新后恢复光标位置
    requestAnimationFrame(() => {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return <input ref={inputRef} value={phone} onChange={handleChange} />;
}
```

### 2. 非受控组件的原理：ref 如何获取 DOM

#### useRef 的工作原理

> **大白话**：`useRef` 就像你手里拿了一个"遥控器"。这个遥控器可以指向页面上的某个 DOM 元素，你随时可以通过遥控器上的按钮（`.current`）来操控它。

```
useRef 的内部结构（简化理解）：

┌────────────────────────────────────┐
│  useRef(initialValue)              │
│                                    │
│  返回一个对象：                     │
│  {                                 │
│    current: initialValue           │
│  }                                 │
│                                    │
│  特点：                             │
│  1. current 是一个可变的引用         │
│  2. 修改 current 不会触发重新渲染   │
│  3. 组件的整个生命周期内保持不变     │
│  4. 可以用来存储任何可变值          │
└────────────────────────────────────┘

ref 指向 DOM 元素的机制：

  React 元素                          真实 DOM
  ┌──────────────────┐              ┌──────────────────┐
  │ <input           │              │ <input           │
  │   ref={inputRef} │ ── ref ──→  │   type="text"    │
  │ />               │    绑定     │   value="用户输入" │
  └──────────────────┘              └──────────────────┘
                                          ↑
                                    inputRef.current 指向这里
                                    通过 inputRef.current.value 就能读取值
```

```jsx
// useRef 的几种典型用途
function RefExamples() {
  // 用途 1：指向 DOM 元素
  const inputRef = useRef(null);
  // inputRef.current → <input> DOM 元素

  // 用途 2：存储不触发渲染的可变值（如定时器 ID）
  const timerRef = useRef(null);

  // 用途 3：存储上一次的值（用于对比）
  const prevValueRef = useRef('');

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      console.log('tick');
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  return <input ref={inputRef} />;
}
```

#### createRef vs useRef 的区别

```jsx
import { useRef, createRef } from 'react';

// useRef（推荐，在函数组件中使用）
function MyComponent() {
  const myRef = useRef('initial');

  // useRef 在每次渲染时返回同一个对象
  // 就像你的身份证号——不管你换多少套衣服（重新渲染多少次），身份证号不变

  return <div ref={myRef}>内容</div>;
}

// createRef（主要在类组件中使用）
class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);
    // 每次创建一个新实例时，createRef 都会返回一个新的 ref 对象
    this.myRef = createRef();
  }

  render() {
    return <div ref={this.myRef}>内容</div>;
  }
}

// ⚠️ 为什么不能在函数组件中用 createRef？
function BadExample() {
  // ❌ 每次渲染都会创建一个新的 ref 对象！
  // 旧的 ref 会被丢弃，新的 ref 不会指向之前的 DOM
  const myRef = createRef();
  // 每次渲染后，React 会把新的 ref 绑定到 DOM
  // 但你之前的 ref 已经失效了

  // ✅ useRef 不会重新创建
  const myRef2 = useRef(null);
  // 每次渲染返回的是同一个对象，React 只是更新 .current 的值
}
```

```
对比图示：

useRef（每次渲染返回同一个对象）：
  渲染 1: ref = { current: null }  ──┐
  渲染 2: ref = { current: <div> }  ─┤ 同一个对象！
  渲染 3: ref = { current: <div> }  ─┘

createRef 在函数组件中（每次渲染创建新对象）：
  渲染 1: ref1 = { current: null }   ← 对象 1
  渲染 2: ref2 = { current: <div> }  ← 对象 2（新的！ref1 丢失）
  渲染 3: ref3 = { current: <div> }  ← 对象 3（又新的！ref2 丢失）
```

#### ref 的 forwarding 机制（forwardRef）

```jsx
// 问题：当你想给一个"被别人封装过的"组件内部的 DOM 设置 ref 时
// 直接写 ref 不生效

function MyInput(props) {
  // props 里没有 ref！React 不会自动传递 ref
  return <input {...props} />;
}

function App() {
  const inputRef = useRef(null);
  // ❌ inputRef.current 会是 null，因为 MyInput 没有"转发"ref
  return <MyInput ref={inputRef} />;
}

// ✅ 解决方案：forwardRef
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  // ref 作为第二个参数传入
  // 直接把它绑定到内部的 <input> 上
  return <input ref={ref} {...props} />;
});

function App() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();  // ✅ 现在可以正常使用了！
  };

  return (
    <div>
      <MyInput ref={inputRef} placeholder="点击按钮聚焦" />
      <button onClick={focusInput}>聚焦输入框</button>
    </div>
  );
}
```

```
ref 转发的数据流：

  App 组件                   MyInput 组件（forwardRef）       真实 DOM
  ┌──────────┐              ┌──────────────────┐          ┌──────────┐
  │ inputRef │─── ref ───→ │   ref (参数)     │── ref ─→│ <input>  │
  │          │              │                  │          │          │
  │ .current├───────────────── .current ─────────────────→│ DOM节点  │
  └──────────┘              └──────────────────┘          └──────────┘

  就像快递转运：
  App 发出 ref → forwardRef 转运站 → 最终送到目标 DOM 元素
```

#### 什么时候用受控 vs 非受控？（决策树）

```
开始
  │
  ├─ 需要在输入时实时验证？ ──── 是 ──→ ✅ 受控组件
  │                               │
  ├─ 需要格式化输入值？ ─────── 是 ──→ ✅ 受控组件
  │                               │
  ├─ 需要动态限制/禁用输入？ ── 是 ──→ ✅ 受控组件
  │                               │
  ├─ 需要根据其他字段的值    ── 是 ──→ ✅ 受控组件
  │  联动修改此字段的值？         │
  │                               │
  ├─ 只需要在提交时获取值？ ── 是 ──→ ✅ 非受控组件
  │                               │
  ├─ 需要和第三方非 React 库集成？ 是 ──→ ✅ 非受控组件
  │                               │
  └─ 表单非常简单，不想写     ── 是 ──→ ✅ 非受控组件
     大量 onChange/setState？        │
                                     │
  💡 记住：优先选受控组件，               │
     除非有明确的理由用非受控             │
```

### 3. 表单状态管理架构模式

#### 从 useState → useReducer → Form 库的演进

```
表单状态管理的三个阶段：

阶段一：useState（简单表单，2-5 个字段）
┌─────────────────────────────────────────┐
│                                         │
│  const [name, setName] = useState('');  │
│  const [email, setEmail] = useState('');│
│  const [pwd, setPwd] = useState('');    │
│                                         │
│  优点：简单直观，代码好理解              │
│  缺点：字段多了会很啰嗦，验证逻辑分散    │
│  适合：登录表单、简单的搜索框           │
└─────────────────────────────────────────┘
        ↓ 字段变多、逻辑变复杂
阶段二：useReducer（中等复杂表单，5+ 字段）
┌─────────────────────────────────────────┐
│                                         │
│  const [state, dispatch] = useReducer(  │
│    formReducer,                         │
│    { name: '', email: '', pwd: '' }     │
│  );                                     │
│                                         │
│  优点：所有状态集中管理，逻辑清晰        │
│  缺点：需要写 reducer 函数，代码量较多   │
│  适合：注册表单、多步骤表单             │
└─────────────────────────────────────────┘
        ↓ 需要更强大的验证、性能优化
阶段三：Form 库（大型表单，10+ 字段）
┌─────────────────────────────────────────┐
│                                         │
│  const { register, handleSubmit } =     │
│    useForm();  // React Hook Form       │
│                                         │
│  优点：开箱即用的验证、性能极好          │
│  缺点：引入外部依赖，需要学习 API        │
│  适合：企业级应用、复杂表单             │
└─────────────────────────────────────────┘
```

```jsx
// 阶段一：useState 方式
function SimpleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) setErrors({ name: '必填' });
    // ... 每个字段都要手动处理
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      {/* 每个字段都要写 value + onChange */}
    </form>
  );
}

// 阶段二：useReducer 方式
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return action.initialState;
    default:
      return state;
  }
}

function ReducerForm() {
  const [state, dispatch] = useReducer(formReducer, {
    name: '', email: '', password: '', errors: {}
  });

  const handleChange = (e) => {
    dispatch({ type: 'UPDATE_FIELD', field: e.target.name, value: e.target.value });
  };

  // 统一的验证逻辑
  const validate = () => {
    const errors = {};
    if (!state.name.trim()) errors.name = '必填';
    if (!state.email.includes('@')) errors.email = '邮箱格式错误';
    dispatch({ type: 'SET_ERRORS', errors });
    return Object.keys(errors).length === 0;
  };

  return (
    <form>
      <input name="name" value={state.name} onChange={handleChange} />
      {/* 统一的 handleChange，不再为每个字段写单独的 onChange */}
    </form>
  );
}

// 阶段三：React Hook Form 方式
import { useForm } from 'react-hook-form';

function HookFormForm() {
  // 一个 hook 管理一切
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);  // { name: '...', email: '...' }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register 返回 value + onChange + ref，一行搞定 */}
      <input {...register('name', { required: '必填' })} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email', {
        pattern: { value: /^\S+@\S+$/, message: '邮箱格式错误' }
      })} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

#### 为什么 React Hook Form 比 Formik 性能好？（非受控原理）

这是理解受控 vs 非受控的绝佳案例：

```
Formik（基于受控组件）的渲染过程：

  用户在输入框 A 输入 → setState 更新整个表单的 state
  → 整个表单组件重新渲染
  → 输入框 A 重新渲染
  → 输入框 B 重新渲染 ← ❌ B 没变也要重新渲染！
  → 输入框 C 重新渲染 ← ❌ C 没变也要重新渲染！
  → 输入框 D 重新渲染 ← ❌ D 没变也要重新渲染！
  → ...

  假设有 20 个字段：
  用户输入 1 个字符 → 20 个输入框全部重新渲染
  输入 100 个字符 → 20 × 100 = 2000 次不必要的渲染

React Hook Form（基于非受控组件）的渲染过程：

  用户在输入框 A 输入 → 浏览器直接更新 DOM
  → 没有任何 setState → 没有任何组件重新渲染！
  → 只有在提交时才通过 ref 读取所有输入框的值

  假设有 20 个字段：
  用户输入 1 个字符 → 0 次重新渲染
  输入 100 个字符 → 0 次不必要的渲染

  性能差距：2000 vs 0 ！
```

```
┌────────────────────────────────────────────────────────┐
│           表单性能对比（20 个字段的表单）                │
│                                                        │
│   指标          useState   Formik    React Hook Form   │
│   ─────────────────────────────────────────────────── │
│   每次输入      20次渲染    20次渲染    0次渲染         │
│   输入100字符   2000次     2000次      0次             │
│   初始渲染      快         中等        快              │
│   代码量        多         中等        少              │
│   学习成本      低         中等        低              │
│                                                        │
│   结论：React Hook Form 的核心优势                      │
│   就是利用非受控原理，避免了大量不必要的渲染            │
└────────────────────────────────────────────────────────┘
```

> **大白话**：Formik 就像一个"爱操心的家长"——孩子（每个输入框）每次眨一下眼，家长都要检查一遍所有孩子的状态。React Hook Form 就像一个"放养式家长"——平时不管孩子，只在需要的时候（提交时）才去查看所有孩子的状态。后者当然轻松得多。

> ⚠️ **注意**：React Hook Form 并不是完全非受控的。它提供了一个 `Controller` 组件，在需要受控行为时（如动态联动）可以局部使用受控模式，做到"该受控的地方受控，该非受控的地方非受控"。

---

## ✅ 阶段检查清单

- [ ] 理解受控组件和非受控组件的区别
- [ ] 能够处理所有类型的表单元素（文本框、单选、多选、下拉框等）
- [ ] 实现基本的表单验证
- [ ] 掌握文件上传的处理方式
- [ ] 能够构建完整的表单界面
- [ ] 理解 `e.preventDefault()` 的作用

---

## 📝 练习任务

### 练习 1：注册表单
创建一个注册表单，包含以下字段：
- 用户名（2-20 字符）
- 邮箱（格式验证）
- 密码（至少 6 位，包含字母和数字）
- 确认密码（必须和密码一致）
- 同意用户协议（复选框）

要求：
- 实时显示密码强度（弱/中/强）
- 提交前验证所有字段
- 提交时显示加载动画

### 练习 2：问卷调查
创建一个问卷调查页面，包含多种题型：
- 单选题（如"你的性别？"）
- 多选题（如"你的爱好？"）
- 文本题（如"你的建议？"）
- 评分题（如"满意度 1-5 分"）
- 下拉选择题

### 练习 3：思考题
为什么 React 要用 `value` + `onChange` 来控制表单，而不是像 Vue 那样用 `v-model` 双向绑定？这种设计有什么好处？

---

[→ 09 - Hooks 基础](../09-hooks-basic/)
