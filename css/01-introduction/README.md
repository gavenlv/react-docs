# 01 - CSS 简介与环境搭建

## 🎯 本节目标
- 理解 CSS 是什么以及为什么使用它
- 了解 CSS 的作用和发展历史
- 掌握 CSS 的三种引入方式
- 学会使用浏览器开发者工具调试 CSS

---

## 📖 什么是 CSS？

### 一句话解释

CSS（Cascading Style Sheets，层叠样式表）是一种用来描述 HTML 文档外观和格式的语言。如果说 HTML 是网页的"骨架",那么 CSS 就是网页的"皮肤"和"衣服"。

### 生活类比

想象你在装修房子：

| 装修房子 | 网页开发 |
|---------|---------|
| 房子结构（墙、门、窗） | HTML（网页结构） |
| 墙面颜色、地板材质 | CSS（网页样式） |
| 灯光开关、门锁 | JavaScript（网页交互） |

> 💡 **关键理解**：CSS 不会改变网页的内容（那是 HTML 的事），它只负责让内容"看起来更好看"。

### CSS 的作用

```html
<!-- 没有 CSS 的网页 -->
<h1>欢迎来到我的网站</h1>
<p>这是一个段落</p>
<button>点击我</button>
```

效果：纯文本，黑色字体，白色背景，非常朴素。

```html
<!-- 加上 CSS 的网页 -->
<style>
  h1 {
    color: #2c3e50;
    font-size: 48px;
    text-align: center;
    margin-top: 50px;
  }
  p {
    color: #7f8c8d;
    font-size: 18px;
    line-height: 1.6;
    max-width: 600px;
    margin: 20px auto;
  }
  button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 16px;
    border-radius: 25px;
    cursor: pointer;
    transition: transform 0.3s;
  }
  button:hover {
    transform: scale(1.05);
  }
</style>

<h1>欢迎来到我的网站</h1>
<p>这是一个段落</p>
<button>点击我</button>
```

效果：漂亮的渐变标题、舒适的段落排版、炫酷的按钮效果。

---

## 🤔 为什么需要 CSS？

### 没有 CSS 的世界

```html
<!-- 早期网页（1990年代） -->
<html>
  <body>
    <font color="red" size="5">标题</font>
    <br>
    <font face="Arial">内容</font>
    <table border="1" cellpadding="5">
      <tr><td>布局用表格</td></tr>
    </table>
  </body>
</html>
```

**问题：**
- 样式和内容混在一起，难以维护
- 每次修改样式都要改 HTML
- 无法复用样式
- 代码冗长且混乱

### 使用 CSS 的世界

```html
<!-- HTML 只负责内容 -->
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1 class="title">标题</h1>
    <p class="content">内容</p>
    <div class="container">布局用 div</div>
  </body>
</html>
```

```css
/* style.css - 只负责样式 */
.title {
  color: red;
  font-size: 24px;
}

.content {
  font-family: Arial;
}

.container {
  border: 1px solid #ddd;
  padding: 10px;
}
```

**优势：**
- ✅ 内容与样式分离，易于维护
- ✅ 样式可以复用
- ✅ 修改样式不需要改 HTML
- ✅ 代码清晰简洁

---

## 📝 CSS 的三种引入方式

### 1. 行内样式（Inline Style）

直接在 HTML 标签的 `style` 属性中写 CSS。

```html
<p style="color: red; font-size: 20px;">这是一段红色文字</p>
```

**优点：**
- 简单直接，适合快速测试

**缺点：**
- ❌ 样式和内容混在一起
- ❌ 无法复用
- ❌ 难以维护
- ❌ 优先级过高，容易覆盖其他样式

**适用场景：** 
- 临时测试
- 动态生成的样式（JavaScript 操作）
- 邮件模板（很多邮件客户端不支持 `<style>` 标签）

---

### 2. 内部样式表（Internal Style Sheet）

在 HTML 文件的 `<head>` 中使用 `<style>` 标签。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>内部样式表示例</title>
  <style>
    body {
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
    }
    
    h1 {
      color: #333;
      text-align: center;
    }
    
    p {
      color: #666;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <h1>欢迎</h1>
  <p>这是一个段落</p>
</body>
</html>
```

**优点：**
- ✅ 样式集中在 `<head>` 中，比行内样式更清晰
- ✅ 不需要额外的 CSS 文件
- ✅ 适合单页面应用

**缺点：**
- ❌ 无法在多个页面间复用
- ❌ HTML 文件会变大

**适用场景：**
- 单页面网站
- 邮件模板
- 组件库的示例页面

---

### 3. 外部样式表（External Style Sheet）⭐ 推荐

将 CSS 写在单独的 `.css` 文件中，然后在 HTML 中引入。

**文件结构：**
```
my-website/
├── index.html
├── styles/
│   ├── main.css
│   └── components/
│       ├── button.css
│       └── card.css
└── scripts/
    └── main.js
```

**index.html：**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>外部样式表示例</title>
  <!-- 引入 CSS 文件 -->
  <link rel="stylesheet" href="styles/main.css">
  <link rel="stylesheet" href="styles/components/button.css">
</head>
<body>
  <h1>欢迎</h1>
  <p>这是一个段落</p>
  <button class="btn btn-primary">点击我</button>
</body>
</html>
```

**styles/main.css：**
```css
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f5f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-top: 50px;
}

p {
  color: #7f8c8d;
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}
```

**优点：**
- ✅ 内容与样式完全分离
- ✅ 可以在多个页面间复用
- ✅ 浏览器会缓存 CSS 文件，加快加载速度
- ✅ 易于维护和团队协作
- ✅ 可以使用 CSS 预处理器（Sass、Less）

**缺点：**
- 需要额外的 HTTP 请求（但可以合并和压缩）

**适用场景：**
- ✅ **几乎所有项目**（推荐）

---

## 🔍 浏览器开发者工具

### 打开开发者工具

| 浏览器 | 快捷键 |
|--------|--------|
| Chrome / Edge | `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) |
| Firefox | `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) |
| Safari | `Cmd+Option+I`（需先在设置中启用） |

### Elements 面板功能

1. **查看元素样式**
   - 点击左上角的选择工具（或按 `Ctrl+Shift+C`）
   - 点击页面上的任意元素
   - 右侧 Styles 面板显示该元素的所有 CSS 规则

2. **实时修改样式**
   - 在 Styles 面板中直接修改属性值
   - 点击属性值前的复选框可以禁用/启用该属性
   - 双击属性名或属性值可以编辑

3. **查看计算后的样式**
   - 切换到 "Computed" 标签
   - 查看元素最终应用的样式值

4. **查看盒模型**
   - 在 Styles 面板下方有盒模型示意图
   - 可以直观看到 margin、border、padding、content

### 实用技巧

```css
/* 1. 查看样式的来源 */
/* 点击样式右侧的文件名，可以跳转到源文件 */

/* 2. 查看被覆盖的样式 */
/* 被划掉的样式表示被其他规则覆盖了 */

/* 3. 添加临时样式 */
/* 点击 Styles 面板中的 "+" 按钮，可以添加新的样式规则 */

/* 4. 查看伪类状态 */
/* 点击 ":hov" 按钮，可以强制激活 :hover、:active 等状态 */
```

---

## 💻 第一个 CSS 项目

让我们创建一个简单的个人名片页面：

**HTML (index.html)：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>个人名片</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <div class="avatar">
      <img src="https://via.placeholder.com/150" alt="头像">
    </div>
    <h1 class="name">张三</h1>
    <p class="title">前端开发工程师</p>
    <p class="bio">热爱编程，专注于 Web 开发技术</p>
    <div class="skills">
      <span class="skill">HTML</span>
      <span class="skill">CSS</span>
      <span class="skill">JavaScript</span>
    </div>
    <div class="contact">
      <a href="mailto:zhangsan@example.com">联系我</a>
    </div>
  </div>
</body>
</html>
```

**CSS (style.css)：**
```css
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* 卡片容器 */
.card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

/* 头像 */
.avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 5px solid #667eea;
  margin-bottom: 20px;
}

/* 姓名 */
.name {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 10px;
}

/* 职位 */
.title {
  color: #667eea;
  font-size: 18px;
  margin-bottom: 15px;
}

/* 简介 */
.bio {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* 技能标签 */
.skills {
  margin-bottom: 25px;
}

.skill {
  display: inline-block;
  background: #f0f0f0;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  margin: 5px;
  font-size: 14px;
  transition: all 0.3s;
}

.skill:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* 联系按钮 */
.contact a {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: bold;
  transition: transform 0.3s, box-shadow 0.3s;
}

.contact a:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 CSS 的作用和重要性
- [ ] 掌握三种 CSS 引入方式及其适用场景
- [ ] 会使用外部样式表组织项目
- [ ] 会使用浏览器开发者工具调试 CSS
- [ ] 能够创建简单的 CSS 项目

---

## 📝 练习任务

### 任务 1：创建个人介绍页面
使用外部样式表创建一个个人介绍页面，包含：
- 头部导航栏
- 个人信息区域
- 技能展示区域
- 联系方式

### 任务 2：调试练习
打开任意网站，使用开发者工具：
- 修改某个元素的颜色
- 调整字体大小
- 查看盒模型
- 禁用某个样式规则

---

## 🔗 相关资源

- [MDN CSS 教程](https://developer.mozilla.org/zh-CN/docs/Learn/CSS)
- [CSS 工作组](https://www.w3.org/Style/CSS/)
- [Can I Use](https://caniuse.com/) - CSS 兼容性查询
