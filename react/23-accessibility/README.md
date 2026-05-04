# 23 - 无障碍访问(Accessibility/A11y)

## 🎯 本节目标
- 理解无障碍访问的重要性和基本概念
- 掌握React中实现A11y的最佳实践
- 构建对所有用户友好的包容性应用

---

## 📖 为什么无障碍很重要?

### 影响的人群
- **视觉障碍**: 盲人、低视力、色盲用户
- **听觉障碍**: 听障用户
- **运动障碍**: 无法使用鼠标,只能用键盘的用户
- **认知障碍**: 注意力缺陷、阅读困难用户
- **临时性损伤**: 手臂骨折的用户

### 法律合规要求
- **WCAG 2.1**: Web内容无障碍指南
- **Section 508**(美国): 联邦机构网站必须符合标准
- **欧洲无障碍法案(EAA)**: 欧盟成员国强制实施
- **中国《信息技术互联网内容无障碍可访问性技术要求》**

---

## ♿ 语义化HTML与ARIA

### 1. 使用语义化标签

```jsx
// ❌ 错误:滥用div和span
<div onclick={handleClick} role="button">
  提交
</div>

// ✅ 正确:使用原生语义化标签
<button onClick={handleClick}>
  提交
</button>

// ✅ 语义化结构示例
function ArticlePage({ article }) {
  return (
    <article>
      <header>
        <h1>{article.title}</h1>
        <time dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
        <address>作者: {article.author.name}</address>
      </header>

      <main>
        {article.sections.map(section => (
          <section key={section.id}>
            <h2>{section.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
          </section>
        ))}
      </main>

      <aside>
        <h3>相关文章</h3>
        <RelatedArticles articles={article.related} />
      </aside>

      <footer>
        <nav aria-label="文章导航">
          <a href={`/articles/${article.prevId}`}>上一篇</a>
          <a href={`/articles/${article.nextId}`}>下一篇</a>
        </nav>
      </footer>
    </article>
  );
}
```

### 2. ARIA属性正确使用

```jsx
// ✅ ARIA角色(Roles)
<nav role="navigation" aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于我们</a></li>
  </ul>
</nav>

<main role="main">
  {/* 主要内容 */}
</main>

<form role="search" aria-label="搜索">
  <input type="search" placeholder="搜索..." />
  <button>搜索</button>
</form>

// ✅ ARIA状态和属性
function AccessibleCheckbox({ checked, onChange, label }) {
  return (
    <label>
      <span role="checkbox" aria-checked={checked}>
        {checked ? '☑' : '☐'}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"  // 视觉上隐藏但屏幕阅读器可读
      />
      {' '}{label}
    </label>
  );
}

// ✅ 动态内容的ARIA更新
function LiveRegionExample() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
      setMessage('提交成功!');
    } catch (error) {
      setMessage(`错误: ${error.message}`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* 表单字段 */}
      </form>

      {/* 屏幕阅读器会自动朗读更新的消息 */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
      
      {/* 重要错误立即打断用户 */}
      <div role="alert" aria-live="assertive">
        {criticalError && criticalError.message}
      </div>
    </>
  );
}
```

### 3. 图像和多媒体无障碍

```jsx
// ✅ 图片必须有替代文本
<img src="/logo.png" alt="公司Logo" />

// 装饰性图片使用空alt文本(屏幕阅读器会跳过)
<div className="decorative-bg">
  <img src="/pattern.svg" alt="" role="presentation" />
</div>

// 信息丰富的图片需要详细描述
<img 
  src="/chart.png" 
  alt="2023年销售趋势图,显示Q1增长15%,Q2增长22%,Q3下降5%,Q4回升18%" 
/>

// 复杂图片提供长描述
<figure>
  <img src="/complex-diagram.png" alt="系统架构图" />
  <figcaption id="diagram-desc">
    该图展示了系统的三层架构:表示层负责用户交互,...
  </figcaption>
</figure>
<img src="/complex-diagram.png" alt="" aria-describedby="diagram-desc" />

// 视频需要字幕和音频描述
<video controls poster="/video-thumb.jpg">
  <source src="/intro.mp4" type="video/mp4" />
  <source src="/intro.webm" type="video/webm" />
  <track kind="captions" src="/captions.vtt" srclang="zh" label="中文字幕" default />
  您的浏览器不支持视频播放。
</video>
```

---

## ⌨️ 键盘导航与焦点管理

### 1. 焦点可见性

```css
/* ✅ 确保所有可交互元素都有明显的焦点指示器 */
:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* 或者自定义焦点样式 */
.custom-button:focus-visible {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

/* 如果确实要隐藏默认outline */
button:focus:not(:focus-visible) {
  outline: none;
}
```

### 2. Tab顺序管理

```jsx
// ✅ 合理的Tab顺序(遵循DOM顺序)
function LoginModal({ isOpen, onClose }) {
  // 使用ref管理焦点
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // 记住之前获得焦点的元素
      previousActiveElement.current = document.activeElement;

      // 打开模态框时聚焦到第一个可聚焦元素
      firstFocusableRef.current?.focus();

      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // 关闭时恢复焦点
      previousActiveElement.current?.focus();
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Tab陷阱(Tab Trap):将焦点限制在模态框内
  function handleKeyDown(event) {
    if (event.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab:反向
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();  // 跳到最后一个
      }
    } else {
      // Tab:正向
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();  // 跳回第一个
      }
    }

    // Escape键关闭
    if (event.key === 'Escape') {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title">登录</h2>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">邮箱地址</label>
            <input
              ref={firstFocusableRef}
              id="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          
          <div>
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button type="submit">登录</button>
          <button 
            ref={lastFocusableRef}
            type="button" 
            onClick={onClose}
          >
            取消
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 3. 自定义组件键盘支持

```jsx
// ✅ 自定义下拉菜单的完整键盘支持
function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  function handleKeyDown(e) {
    switch(e.key) {
      case 'Enter':
      case ' ':  // Space
        e.preventDefault();
        setIsOpen(!isOpen);
        break;

      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        break;

      case 'Home':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(options.length - 1);
        break;

      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  }

  // 当focusedIndex变化时滚动到对应选项
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedItem = listRef.current.children[focusedIndex];
      focusedItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-select">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption?.label || '请选择'}
        <span aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="选项列表"
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`option-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              tabIndex={index === focusedIndex ? 0 : -1}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              className={index === focusedIndex ? 'focused' : ''}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔊 屏幕阅读器优化

### 1. 隐藏视觉元素但保持可访问

```css
/* ✅ 屏幕阅读器专用样式(Sr-only = Screen Reader only) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```jsx
// ✅ 为图标按钮添加文字标签
function IconButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      aria-label={label}
    >
      <Icon name={icon} />
      {/* 屏幕阅读器会读取这个文本,但不显示 */}
      <span className="sr-only">{label}</span>
    </button>
  );
}

// 使用
<IconButton icon="trash" label="删除此条目" onClick={handleDelete} />
<IconButton icon="edit" label="编辑用户信息" onClick={handleEdit} />
```

### 2. 提供上下文信息

```jsx
// ❌ 不够清晰
<button aria-label="more">...</button>

// ✅ 明确说明功能
<button aria-label="更多关于张三用户的操作选项">...</button>

// ✅ 为链接添加额外上下文
<UserCard>
  ...
  <footer>
    <a href="/users/123/profile" aria-label="查看张三的个人资料">
      个人资料
    </a>
    <a href="/users/123/contact" aria-label="联系张三">
      联系TA
    </a>
  </footer>
</UserCard>

// ✅ 状态变化的通知
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button onClick={handleCopy}>
        {copied ? '已复制!' : '复制'}
      </button>
      {/* 屏幕阅读器会自动播报状态变化 */}
      <span role="status" className="sr-only">
        {copied ? '已复制到剪贴板' : ''}
      </span>
    </>
  );
}
```

---

## 🎨 颜色与对比度

### 1. WCAG对比度要求

| 对比度级别 | 普通文本 | 大号文本(18pt+/14pt bold+) |
|-----------|---------|--------------------------|
| AA级(最低要求) | 4.5:1 | 3:1 |
| AAA级(增强型) | 7:1 | 4.5:1 |

### 2. 工具与实践

```jsx
// ✅ 不只依赖颜色传达信息
// ❌ 仅靠颜色区分
<span style={{ color: 'red' }}>错误</span>
<span style={{ color: 'green' }}>成功</span>

// ✅ 结合图标+颜色+文字
<span style={{ color: 'red' }}>
  <Icon icon="error" aria-hidden="true" />
  错误: 请检查输入内容
</span>
<span style={{ color: 'green' }}>
  <Icon icon="success" aria-hidden="true" />
  成功: 操作已完成
</span>

// 表单验证示例
function FormField({ error, success, children }) {
  const status = error ? 'error' : success ? 'success' : null;

  return (
    <div 
      className={`field ${status || ''}`}
      role={status === 'error' ? 'alert' : undefined}
      aria-live={status === 'error' ? 'assertive' : undefined}
      aria-invalid={status === 'error' ? true : undefined}
    >
      {children}
      
      {status === 'error' && (
        <span className="error-message">
          <Icon icon="warning" aria-hidden="true" />
          {error}
        </span>
      )}
      
      {status === 'success' && (
        <span className="success-message">
          <Icon icon="check-circle" aria-hidden="true" />
          {success}
        </span>
      )}
    </div>
  );
}
```

### 3. 支持高对比度和暗黑模式

```jsx
// ✅ 使用CSS变量轻松适配不同主题
:root {
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-background: #ffffff;
  --color-border: #e0e0e0;
}

[data-theme="dark"] {
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #aaaaaa;
  --color-background: #121212;
  --color-border: #333333;
}

[data-theme="high-contrast"] {
  --color-text-primary: #000000;
  --color-text-secondary: #333333;
  --color-background: #ffffff;
  --color-border: #000000;
}

// React中使用
function ThemedApp() {
  const [theme, setTheme] = useState('light');

  // 尊重系统设置
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // 也允许用户手动切换并提供高对比度选项
  return <div data-theme={theme}>{/* 应用内容 */}</div>;
}
```

---

## 🧪 测试无障碍性

### 1. 自动化测试工具

```bash
# 安装axe-core进行自动化A11y检测
npm install @axe-core/react
```

```jsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('组件应该没有无障碍违规', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// 或者在开发环境使用
import { withAxe } from '@axe-core/react';

if (process.env.NODE_ENV === 'development') {
  const AppWithAxe = withAxe(App);
  ReactDOM.createRoot(document.getElementById('root')).render(
    <AppWithAxe />
  );
}
```

### 2. 手动测试清单

#### 键盘导航测试
- [ ] 所有交互元素都可以通过Tab键到达
- [ ] Tab顺序逻辑合理且直观
- [ ] Shift+Tab可以反向遍历
- [ ] Enter/Space激活按钮、链接
- [ ] 箭头键适用于菜单、列表等
- [ ] Escape关闭弹窗、模态框
- [ ] 焦点指示器始终可见

#### 屏幕阅读器测试
- [ ] 使用NVDA(Free, Windows)、JAWS(Windows)、VoiceOver(Mac/iOS)测试
- [ ] 所有图片都有有意义的alt文本
- [ ] 表单字段都有关联的label
- [ ] 动态内容变化时有适当的通知
- [ ] 可以通过标题快速跳转到主要内容

#### 视觉测试
- [ ] 文字大小可以放大到200%而不丢失内容
- [ ] 页面在256px宽度的窗口下仍然可用
- [ ] 颜色不是唯一的区分手段
- [ ] 对比度满足WCAG AA标准
- [ ] 没有仅依赖声音传递的信息

### 3. 常见A11y问题及修复

```jsx
// ❌ 问题1:缺少alt属性的图片
<img src="/photo.jpg" />
// ✅ 修复
<img src="/photo.jpg" alt="团队成员在工作" />

// ❌ 问题2:表单缺少label
<input type="text" name="username" placeholder="用户名" />
// ✅ 修复
<label htmlFor="username">用户名</label>
<input id="username" type="text" name="username" />

// ❌ 问题3:低对比度文本
<p style={{ color: '#aaa' }}>这是重要提示</p>
// ✅ 修复(确保对比度>=4.5:1)
<p style={{ color: '#333' }}>这是重要提示</p>

// ❌ 问题4:onclick的div
<div onClick={handleClick}>点击我</div>
// ✅ 修复(使用正确的语义化标签)
<button onClick={handleClick}>点击我</button>

// ❌ 问题5:自动播放的视频/音频
<video autoPlay muted loop src="/bg-video.mp4" />
// ✅ 修复(提供控制)
<VideoPlayer 
  src="/bg-video.mp4" 
  autoplay={false}  // 默认不自动播放
  showControls={true}
/>
```

---

## 🛠️ React A11y工具库推荐

### 1. jsx-a11y插件(ESLint规则)

```bash
npm install eslint-plugin-jsx-a11y
```

`.eslintrc.js`:
```javascript
module.exports = {
  plugins: ['jsx-a11y'],
  extends: ['plugin:jsx-a11y/recommended'],
  rules: {
    // 自定义规则
    'jsx-a11y/anchor-is-valid': ['error', {
      components: ['Link'],
      specialLink: ['to'],
    }],
  },
};
```

### 2. react-aria(Hook库)

```bash
npm install react-aria
```

```jsx
import { useButton, useTextField } from 'react-aria';

// ✅ 使用react-aria构建无障碍的自定义组件
function CustomButton(props) {
  let ref = useRef();
  let { buttonProps } = useButton(props, ref);

  return <button {...buttonProps} ref={ref}>{props.children}</button>;
}

function AccessibleInput(props) {
  let ref = useRef();
  let { labelProps, inputProps } = useTextField(props, ref);

  return (
    <div>
      <label {...labelProps}>{props.label}</label>
      <input {...inputProps} ref={ref} />
    </div>
  );
}
```

### 3. @testing-library/jest-dom匹配器

```jsx
// ✅ 用于编写无障碍相关的测试断言
import '@testing-library/jest-dom';

test('链接应该有正确的文本', () => {
  render(<MyComponent />);
  expect(screen.getByRole('link', { name: /了解更多/i })).toBeInTheDocument();
});

test('表单应该是有效的', () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { type: 'submit' })).toBeEnabled();
});
```

---

## 📋 无障碍检查清单

### 开发阶段
- [ ] 所有图片都有合适的alt属性
- [ ] 表单控件都有关联的`<label>`
- [ ] 所有可交互元素都可以通过键盘访问
- [ ] 焦点顺序符合逻辑
- [ ] 焦点指示器明显可见
- [ ] 颜色对比度达到WCAG AA标准
- [ ] 不仅依赖颜色来传达信息
- [ ] 动态内容有适当的ARIA live region
- [ ] 使用语义化的HTML标签
- [ ] ARIA属性使用正确且不过度使用

### 测试阶段
- [ ] 使用axe-core进行自动化扫描
- [ ] 使用键盘完整地操作一遍应用
- [ ] 至少使用一种屏幕阅读器测试关键流程
- [ ] 在不同缩放级别下测试(125%, 150%, 200%)
- [ ] 在移动设备上测试触摸操作

### 发布前
- [ ] 通过WCAG 2.1 AA级别的全部标准
- [ ] 编写无障碍声明(A11y Statement)
- [ ] 提供无障碍问题的反馈渠道
- [ ] 定期审计并持续改进

---

## 📝 练习任务

### 任务1:A11y重构项目
选取一个现有的React项目,完成以下工作:
1. 运行axe-core扫描所有页面
2. 修复发现的所有A11y问题
3. 添加完整的键盘导航支持
4. 使用屏幕阅读器测试核心功能

### 任务2:构建无障碍组件库
从零开始实现以下组件,确保完全符合WCAG 2.1 AA标准:
- AccessibleModal (包含Tab陷阱)
- AccessibleDropdown (完整的键盘支持)
- AccessibleTabs (带箭头键导航)
- AccessibleToast (带aria-live)
- AccessibleCarousel (带暂停控制和说明)

### 任务3:无障碍审计报告
对一个真实的网站进行无障碍审计,输出包含以下内容的报告:
- 发现的问题清单(按严重程度排序)
- 每个问题的修复建议代码
- 修复前后的截图对比
- 符合标准的证明材料

---

## 🔗 相关资源

- [WAI-ARIA规范](https://www.w3.org/WAI/standards-guidelines/aria/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM: 屏幕阅读器调查](https://webaim.org/projects/screenreadersurvey/)
- [React A11y文档](https://react.dev/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/) (浏览器扩展)
- [The A11y Project](https://www.a11yproject.com/) (社区资源)

---

[← 22 - 动画](../22-animation/) | [→ 24 - 国际化](../24-i18n/)
