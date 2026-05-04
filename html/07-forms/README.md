# 07 - 表单

## 🎯 本节目标
- 掌握表单的基本结构
- 学会使用各种输入类型
- 了解表单验证
- 掌握表单布局

---

## 📝 表单基本结构

```html
<form action="/submit" method="POST">
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username">
  
  <label for="password">密码：</label>
  <input type="password" id="password" name="password">
  
  <button type="submit">提交</button>
</form>
```

---

## 📥 输入类型

### 文本输入

```html
<input type="text">           <!-- 单行文本 -->
<input type="password">       <!-- 密码 -->
<input type="email">          <!-- 邮箱 -->
<input type="tel">            <!-- 电话 -->
<input type="url">            <!-- 网址 -->
<input type="search">         <!-- 搜索 -->
```

### 数字输入

```html
<input type="number">         <!-- 数字 -->
<input type="range">          <!-- 滑块 -->
<input type="number" min="0" max="100" step="10">
```

### 日期时间

```html
<input type="date">           <!-- 日期 -->
<input type="time">           <!-- 时间 -->
<input type="datetime-local"> <!-- 日期时间 -->
<input type="month">          <!-- 月份 -->
<input type="week">           <!-- 周 -->
```

### 其他类型

```html
<input type="color">          <!-- 颜色选择 -->
<input type="file">           <!-- 文件上传 -->
<input type="hidden">         <!-- 隐藏字段 -->
```

---

## ✅ 选择控件

### 单选框

```html
<fieldset>
  <legend>性别</legend>
  <label>
    <input type="radio" name="gender" value="male"> 男
  </label>
  <label>
    <input type="radio" name="gender" value="female"> 女
  </label>
</fieldset>
```

### 复选框

```html
<fieldset>
  <legend>爱好</legend>
  <label>
    <input type="checkbox" name="hobby" value="reading"> 阅读
  </label>
  <label>
    <input type="checkbox" name="hobby" value="music"> 音乐
  </label>
</fieldset>
```

### 下拉选择

```html
<select name="city">
  <option value="">请选择城市</option>
  <optgroup label="直辖市">
    <option value="beijing">北京</option>
    <option value="shanghai">上海</option>
  </optgroup>
  <optgroup label="省会城市">
    <option value="hangzhou">杭州</option>
    <option value="nanjing">南京</option>
  </optgroup>
</select>
```

### 多行文本

```html
<textarea name="message" rows="4" cols="50" placeholder="请输入内容"></textarea>
```

---

## 🔒 表单验证

### HTML5 验证属性

```html
<input type="text" required>                    <!-- 必填 -->
<input type="text" minlength="2" maxlength="10"> <!-- 长度限制 -->
<input type="number" min="0" max="100">         <!-- 数值范围 -->
<input type="email">                            <!-- 邮箱格式 -->
<input type="url">                              <!-- 网址格式 -->
<input type="text" pattern="[A-Za-z]{3}">       <!-- 正则验证 -->
```

### 自定义验证消息

```html
<input type="text" required 
       oninvalid="this.setCustomValidity('请填写此字段')"
       oninput="this.setCustomValidity('')">
```

---

## 📋 表单属性

| 属性 | 描述 |
|------|------|
| `action` | 提交地址 |
| `method` | 提交方式（GET/POST） |
| `enctype` | 编码类型 |
| `novalidate` | 禁用验证 |
| `autocomplete` | 自动完成 |

### input 属性

| 属性 | 描述 |
|------|------|
| `placeholder` | 占位提示 |
| `value` | 默认值 |
| `required` | 必填 |
| `disabled` | 禁用 |
| `readonly` | 只读 |
| `autofocus` | 自动聚焦 |
| `multiple` | 多选 |

---

## 💻 完整示例

```html
<form action="/register" method="POST">
  <fieldset>
    <legend>注册信息</legend>
    
    <div class="form-group">
      <label for="username">用户名 *</label>
      <input type="text" id="username" name="username" required>
    </div>
    
    <div class="form-group">
      <label for="email">邮箱 *</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div class="form-group">
      <label for="password">密码 *</label>
      <input type="password" id="password" name="password" 
             minlength="6" required>
    </div>
    
    <button type="submit">注册</button>
  </fieldset>
</form>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 创建基本表单
- [ ] 使用各种输入类型
- [ ] 创建单选框和复选框
- [ ] 使用下拉选择
- [ ] 实现表单验证

---

## 🔗 相关资源

- [MDN - HTML 表单](https://developer.mozilla.org/zh-CN/docs/Learn/Forms)
