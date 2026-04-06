# 08 - 表单处理

## 🎯 本节目标
- 掌握受控组件的概念和使用
- 了解非受控组件的使用场景
- 处理各种表单元素的交互
- 实现完整的表单验证

---

## 📖 受控 vs 非受控组件

### 受控组件（推荐）
React 通过 state 完全控制表单元素的值。

**特点：**
- 值由 React state 管理
- 每次变化触发 onChange 更新 state
- 单一数据源（Single Source of Truth）

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input
      type="text"
      value={value}           // 受控：值来自 state
      onChange={(e) => setValue(e.target.value)}  // 变化时更新 state
    />
  );
}
```

### 非受控组件
DOM 自身管理表单状态，通过 ref 获取值。

**特点：**
- DOM 自己管理值
- 使用 ref 直接操作 DOM
- 更接近传统 HTML 行为

```jsx
function UncontrolledInput() {
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    // 通过 ref 获取值
    console.log(inputRef.current.value);
  };
  
  return (
    <div>
      <input type="text" defaultValue="初始值" ref={inputRef} />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}
```

**选择建议：**
- 大多数情况使用 **受控组件**（更容易验证和控制）
- 需要与现有代码集成、一次性获取值时可用 **非受控组件**

---

## 📝 各种表单元素的处理

### 文本输入框（Input Text）

```jsx
function TextInput() {
  const [text, setText] = useState('');
  
  return (
    <div>
      <label>
        文本输入：
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入文本"
          maxLength={50}
        />
      </label>
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
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="请输入详细内容"
      rows={5}
    />
  );
}
```

### 单选框（Radio）

```jsx
function RadioGroup() {
  const [gender, setGender] = useState('');
  
  return (
    <fieldset>
      <legend>性别</legend>
      <label>
        <input
          type="radio"
          name="gender"
          value="male"
          checked={gender === 'male'}
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
    </fieldset>
  );
}
```

### 复选框（Checkbox）

```jsx
function CheckboxGroup() {
  const [hobbies, setHobbies] = useState([]);
  
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    
    if (checked) {
      setHobbies([...hobbies, value]);
    } else {
      setHobbies(hobbies.filter(hobby => hobby !== value));
    }
  };
  
  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          value="reading"
          checked={hobbies.includes('reading')}
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
    </div>
  );
}
```

### 下拉选择（Select）

```jsx
function SelectInput() {
  const [city, setCity] = useState('');
  const [multiSelect, setMultiSelect] = useState([]);
  
  return (
    <div>
      {/* 单选下拉框 */}
      <select value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="">请选择城市</option>
        <option value="beijing">北京</option>
        <option value="shanghai">上海</option>
        <option value="guangzhou">广州</option>
      </select>
      
      {/* 多选下拉框 */}
      <select 
        multiple 
        value={multiSelect}
        onChange={(e) => {
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
    </div>
  );
}
```

### 数字输入（Number Input）

```jsx
function NumberInput() {
  const [age, setAge] = useState(18);
  
  const increment = () => setAge(age + 1);
  const decrement = () => setAge(Math.max(0, age - 1));
  
  return (
    <div>
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
        min={0}
        max={150}
      />
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### 文件上传（File Input）

```jsx
function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];  // FileList 对象
    setSelectedFile(file);
    
    // 图片预览
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*,.pdf"
        onChange={handleFileChange}
      />
      {preview && <img src={preview} alt="预览" width={200} />}
    </div>
  );
}
```

---

## ✅ 表单验证

### 基础验证模式

```jsx
function ValidatedForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // 验证规则
  const validate = () => {
    const newErrors = {};
    
    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 2 || formData.username.length > 20) {
      newErrors.username = '用户名长度应在 2-20 个字符之间';
    }
    
    // 邮箱验证
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
    return Object.keys(newErrors).length === 0;  // 无错误则验证通过
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      console.log('验证通过，提交数据:', formData);
      // 发送到服务器...
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label>用户名：</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? 'error' : ''}
        />
        {errors.username && <span className="error-msg">{errors.username}</span>}
      </div>
      
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

---

## 🎨 实战：完整登录表单

```jsx
function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('登录成功:', form);
      // 跳转到首页...
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const isFormValid = form.email && form.password;
  
  return (
    <div className="login-container">
      <h2>登录</h2>
      
      {error && <div className="alert error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="your@email.com"
            required
          />
        </div>
        
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
        
        <button 
          type="submit" 
          disabled={!isFormValid || loading}
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

## ✅ 阶段检查清单

- [ ] 理解受控组件和非受控组件的区别
- [ ] 能够处理所有类型的表单元素
- [ ] 实现基本的表单验证
- [ ] 掌握文件上传的处理方式
- [ ] 能够构建完整的表单界面

---

## 📝 练习任务

1. **注册表单**: 包含用户名、邮箱、密码、确认密码等字段，带完整验证
2. **问卷调查**: 包含多种题型（单选、多选、文本、评分等）

---

[→ 09 - Hooks 基础](../09-hooks-basic/)
