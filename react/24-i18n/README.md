# 24 - 国际化(i18n)与本地化(l10n)

## 🎯 本节目标
- 理解国际化和本地化的概念与重要性
- 掌握React应用实现多语言的完整方案
- 处理日期、数字、货币等本地化格式

---

## 📖 基础概念

### i18n vs l10n
- **i18n (internationalization)**: 国际化 - 使软件能够支持多语言/地区
- **l10n (localization)**: 本地化 - 为特定语言/地区进行适配

### 需要考虑的方面
1. **文本翻译** - UI文案、提示信息
2. **日期时间格式** - 不同地区的习惯不同
3. **数字和货币** - 千分位、小数点、货币符号
4. **文字方向(RTL)** - 阿拉伯语、希伯来语从右到左
5. **图片与文化** - 避免文化敏感内容

---

## 🌍 React-i18next 实践(推荐)

### 安装配置

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### 基础设置

```javascript
// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 绑定react-i18next
  .use(initReactI18next)
  // 初始化
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
    },
    fallbackLng: 'zh-CN',  // 回退语言
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,  // React已经处理XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

```json
// locales/zh-CN.json
{
  "app": {
    "title": "React学习指南",
    "description": "从入门到精通"
  },
  "nav": {
    "home": "首页",
    "about": "关于我们",
    "contact": "联系我们",
    "settings": "设置"
  },
  "common": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "confirm": "确认",
    "loading": "加载中...",
    "error": "出错了",
    "retry": "重试"
  },
  "form": {
    "email": "邮箱地址",
    "password": "密码",
    "login": "登录",
    "register": "注册",
    "forgotPassword": "忘记密码?",
    "required": "此字段为必填项",
    "invalidEmail": "请输入有效的邮箱地址"
  },
  "message": {
    "welcome_back": "欢迎回来, {{name}}!",
    "items_count": "共{{count}}个项目",
    "last_login": "上次登录: {{time}}"
  }
}
```

```json
// locales/en-US.json
{
  "app": {
    "title": "React Learning Guide",
    "description": "From Beginner to Expert"
  },
  "nav": {
    "home": "Home",
    "about": "About Us",
    "contact": "Contact",
    "settings": "Settings"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm",
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry"
  },
  "form": {
    "email": "Email Address",
    "password": "Password",
    "login": "Sign In",
    "register": "Sign Up",
    "forgotPassword": "Forgot password?",
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email address"
  },
  "message": {
    "welcome_back": "Welcome back, {{name}}!",
    "items_count": "{{count}} items total",
    "last_login": "Last login: {{time}}"
  }
}
```

---

## 💻 在组件中使用

### 1. 基础用法

```jsx
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation();

  return (
    <header>
      <h1>{t('app.title')}</h1>
      <nav>
        <a href="/">{t('nav.home')}</a>
        <a href="/about">{t('nav.about')}</a>
        <a href="/contact">{t('nav.contact')}</a>
      </nav>

      {/* 语言切换器 */}
      <LanguageSwitcher 
        currentLang={i18n.language} 
        onSwitch={(lang) => i18n.changeLanguage(lang)} 
      />
    </header>
  );
}
```

### 2. 插值与变量

```jsx
function WelcomeMessage({ user }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('message.welcome_back', { name: user.name })}</h2>
      
      <p>{t('message.items_count', { count: user.items?.length || 0 })}</p>
      
      <p>
        {t('message.last_login', { 
          time: formatDate(user.lastLoginDate, i18n.language) 
        })}
      </p>
    </div>
  );
}

// 结果:
// 中文: "欢迎回来, 张三!" / "共5个项目" / "上次登录: 2024/1/15 下午3:30"
// English: "Welcome back, John!" / "5 items total" / "Last login: 1/15/2024, 3:30 PM"
```

### 3. 复数处理

```json
// locale文件中使用复数形式
{
  "message": {
    "items_count_one": "{{count}}个项目",
    "items_count_other": "{{count}}个项目"
  }
}

// 或者更精细的控制
{
  "message": {
    "items_count_0": "没有项目",
    "items_count_1": "1个项目",
    "items_count_few": "{{count}}个项目",  // 2-4 (某些语言)
    "items_count_many": "{{count}}个项目",  // 特定规则的语言
    "items_count_other": "{{count}}个项目"   // 默认
  }
}
```

```jsx
function ItemList({ items }) {
  const { t } = useTranslation();
  
  return (
    <>
      <p>{t('message.items_count', { count: items.length })}</p>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### 4. Trans组件(带HTML标签的翻译)

```json
{
  "terms": {
    "privacy_policy": "我已阅读并同意<0>隐私政策</0>和<1>服务条款</1>",
    "highlight": "这是一个<1>重要</1>的消息"
  }
}
```

```jsx
import { Trans } from 'react-i18next';

function TermsCheckbox() {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  return (
    <label>
      <input 
        type="checkbox" 
        checked={accepted} 
        onChange={(e) => setAccepted(e.target.checked)} 
      />
      <Trans 
        i18nKey="terms.privacy_policy"
        components={[<Link to="/privacy" />, <Link to="/terms" />]}
      />
    </label>
  );
}
```

### 5. 命名空间(大型应用)

```javascript
// i18n.js - 配置命名空间
i18n.init({
  ns: ['common', 'dashboard', 'settings'],
  defaultNS: 'common',
});

// 或懒加载命名空间
i18n.init({
  ns: ['common'],  // 初始只加载通用翻译
  defaultNS: 'common',
});
```

```jsx
// 在组件中加载特定命名空间
function Dashboard() {
  // 加载dashboard命名空间
  const { t, ready } = useTranslation('dashboard');

  if (!ready) return <Loading />;  // 翻译加载完成前显示加载状态

  return (
    <div>
      <h1>{t('title')}  {/* dashboard.title */}
      <p>{t('stats.visitors')}
    </div>
  );
}

function SettingsPage() {
  // 同时使用多个命名空间
  const { t } = useTranslation(['settings', 'common']);

  return (
    <div>
      <h1>{t('settings:title')}</h1>  {/* 显式指定命名空间 */}
      <button>{t('common:save')}</button>
    </div>
  );
}
```

---

## 📅 日期、数字、货币本地化

### 1. 使用Intl API

```jsx
// ✅ 日期时间格式化
function FormattedDate({ date, language }) {
  // Intl.DateTimeFormat自动适配语言环境
  const formattedDate = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

  // 中文: "2024年1月15日 下午03:30"
  // English: "January 15, 2024 at 03:30 PM"

  return <span>{formattedDate}</span>;
}

// ✅ 数字格式化
function FormattedNumber({ value, language }) {
  const formattedNumber = new Intl.NumberFormat(language, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  // 中文: "123,456.78" (使用逗号作为千分位)
  // German: "123.456,78" (使用点作为千分位,逗号作小数点)

  return <span>{formattedNumber}</span>;
}

// ✅ 货币格式化
function FormattedCurrency({ amount, currency, language }) {
  const formattedAmount = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency,
  }).format(amount);

  // USD + zh-CN: "¥123,456.79" 或 "$123,456.79"(取决于区域设置)
  // EUR + de-DE: "123.456,79 €"
  // JPY + ja-JP: "￥123,457"(日元没有小数)

  return <span>{formattedAmount}</span>;
}
```

### 2. 封装为自定义Hooks

```jsx
// hooks/useLocale.js
export function useLocale() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const formatDate = useCallback((dateString, options = {}) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(date);
  }, [lang]);

  const formatNumber = useCallback((num, options = {}) => {
    return new Intl.NumberFormat(lang, {
      ...options,
    }).format(num);
  }, [lang]);

  const formatCurrency = useCallback((amount, currency = 'CNY') => {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
    }).format(amount);
  }, [lang]);

  const formatRelativeTime = useCallback((dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diffInSeconds = Math.floor((now - target) / 1000);

    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    
    // 超过一个月显示具体日期
    return formatDate(dateString);
  }, [lang, formatDate]);

  return { lang, formatDate, formatNumber, formatCurrency, formatRelativeTime };
}

// 使用
function ProductPrice({ price }) {
  const { formatCurrency } = useLocale();
  return <strong>{formatCurrency(price)}</strong>;
}

function LastActive({ timestamp }) {
  const { formatRelativeTime } = useLocale();
  return <span>{formatRelativeTime(timestamp)}</span>;
  // 输出示例: "刚刚", "5分钟前", "3天前", "2024年1月10日"
}
```

### 3. 相对时间库(dayjs)

```bash
npm install dayjs dayjs/plugin/relativeTime
```

```jsx
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';  // 导入中文语言包

dayjs.extend(relativeTime);

function TimeAgo({ datetime }) {
  const { i18n } = useTranslation();

  // 根据当前语言切换dayjs的语言
  useEffect(() => {
    const localeMap = {
      'zh-CN': 'zh-cn',
      'en-US': 'en',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
    };
    dayjs.locale(localeMap[i18n.language] || 'en');
  }, [i18n.language]);

  return <span>{dayjs(datetime).fromNow()}</span>;
}

// 输出:
// zh-CN: "3小时前", "2天后", "刚刚"
// en-US: "3 hours ago", "in 2 days", "just now"
```

---

## 🔤 RTL(从右到左)支持

### 1. 检测与启用RTL

```jsx
function App() {
  const { i18n } = useTranslation();
  const isRTL = useMemo(() => {
    return ['ar', 'he', 'fa', 'ur'].includes(i18n.language.split('-')[0]);
  }, [i18n.language]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  return (
    <ThemeProvider theme={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <MainLayout />
    </ThemeProvider>
  );
}
```

### 2. RTL样式适配

```css
/* 使用逻辑属性代替物理属性 */

/* ❌ 物理属性 */
.sidebar {
  margin-left: 20px;
  padding-right: 10px;
  border-left: 1px solid #eee;
  text-align: left;
  float: left;
}

/* ✅ 逻辑属性(自动适应LTR/RTL) */
.sidebar {
  margin-inline-start: 20px;       /* margin-left/right */
  padding-inline-end: 10px;         /* padding-right/left */
  border-inline-start: 1px solid #eee;  /* border-left/right */
  text-align: start;                /* text-align: left/right */
  float: inline-start;              /* float: left/right */
}

/* 如果必须用物理属性,提供RTL覆盖 */
.sidebar[dir="rtl"] {
  margin-left: 0;
  margin-right: 20px;
  border-left: none;
  border-right: 1px solid #eee;
}
```

```jsx
// React中的RTL感知布局
function SidebarLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: 250, borderInlineEnd: '1px solid #ddd' }}>
        {/* 侧边栏 */}
      </aside>
      
      <main style={{ flex: 1, paddingInlineStart: 20 }}>
        {/* 主内容区 */}
      </main>
    </div>
  );
}
```

---

## 📦 翻译管理策略

### 1. 翻译文件组织

```
src/
├── i18n/
│   ├── index.js                 # 配置入口
│   └── locales/
│       ├── zh-CN/
│       │   ├── common.json      # 通用文案
│       │   ├── dashboard.json   # 仪表盘相关
│       │   ├── settings.json    # 设置页面
│       │   └── errors.json      # 错误消息
│       ├── en-US/
│       │   ├── common.json
│       │   ├── dashboard.json
│       │   ├── settings.json
│       │   └── errors.json
│       └── ar-SA/               # 阿拉伯语
│           └── ...
├── components/
│   └── ...
```

### 2. 动态加载翻译(性能优化)

```javascript
// 支持按需加载语言包
i18n.use Backend {
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    allowMultiLoading: false,
  },
})
.init({
  ns: ['common'],
  defaultNS: 'common',
  
  // 其他命名空间懒加载
  react: {
    useSuspense: true,  // 启用Suspense模式
  },
});

// 在路由或组件中预加载需要的命名空间
<Route path="/dashboard" element={
  <Suspense fallback={<Spinner />}>
    <Dashboard />
  </Suspense>
} />

// Dashboard组件内部
function Dashboard() {
  const { t, ready } = useTranslation('dashboard');  // 触发lazy loading
  
  if (!ready) return null;  // Suspense会处理
  
  return <div>{t('title')}</div>;
}
```

### 3. 提取翻译文本工具

```bash
# 使用i18next-scanner自动扫描代码提取待翻译文本
npm install --save-dev i18next-scanner
```

```javascript
// scanner.config.js
const scanner = require('i18next-scanner');
const fs = require('fs');
const path = require('path');

const options = {
  src: ['./src/**/*.{js,jsx,ts,tsx}'],
  func: false,  // 不扫描函数调用
  trans: {
    component: 'Trans',
    i18nKey: 'i18nKey',
    defaultsKey: 'defaults',
    extensions: ['.js', '.jsx'],  // 处理JSX中的<Trans>组件
    fallbackKey: false,
  },
  resource: {
    loadPath: 'src/i18n/locales/{{lng}}/{{ns}}.json',
    savePath: 'src/i18n/locales/{{lng}}/{{ns}}.json',
    jsonIndent: 2,
    lineEnding: '\n',
  };
};

scanner(options, () => console.log('Translation scan complete!'));
```

---

## 🧪 测试多语言功能

### 单元测试

```jsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// 包装渲染函数以包含I18nProvider
function renderWithI18n(ui, options = {}) {
  return render(
    <I18nextProvider i18n={options.i18n || i18n}>
      {ui}
    </I18nextProvider>,
    options
  );
}

test('正确显示翻译后的文本', () => {
  renderWithI18n(<Header />);
  
  expect(screen.getByRole('heading')).toHaveTextContent(/react学习指南/i);
  expect(screen.getByRole('link', { name: /首页/i })).toBeInTheDocument();
});

test('支持语言切换', () => {
  renderWithI18n(<Header />);
  
  // 切换到英语
  act(() => {
    i18n.changeLanguage('en-US');
  });
  
  expect(screen.getByRole('heading')).toHaveTextContent(/react learning guide/i);
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
});

test('插值工作正常', () => {
  renderWithI18n(<WelcomeMessage user={{ name: '张三' }} />);
  
  expect(screen.getByText(/欢迎回来/i)).toHaveTextContent('张三');
});
```

---

## ⚠️ 常见陷阱与最佳实践

### 1. 不要拼接翻译字符串

```jsx
// ❌ 拼接会导致语序问题
<p>{t('hello')}, {user.name}!</p>  // 英文可能需要 "Hello, John!" 但阿拉伯语是 "!John, Hello"

// ✅ 使用插值
<p>{t('greeting', { name: user.name })}</p>
```

### 2. 注意字符串长度差异

```css
/* 中文通常较短,英文较长,德文更长! */
.button {
  min-width: 80px;  /* 给多留一些空间 */
  /* 或使用弹性布局 */
  white-space: nowrap;
}
```

### 3. 图片和文化符号

```jsx
// ❌ 使用有文化偏见的图标
<img src="/mailbox.png" alt="邮件" />  // 不是所有国家都用这种信箱

// ✅ 使用通用的Unicode符号或SVG图标
<span className="icon-mail" aria-hidden="true">✉</span>

// 颜色也要注意
// 红色在某些文化代表危险/停止,在另一些文化代表好运/喜庆
// 绿色在某些国家与伊斯兰教关联
```

### 4. 表单占位符 vs Label

```jsx
// ❌ 只用placeholder(消失后用户不知道该填什么)
<input placeholder="请输入邮箱" />

// ✅ 始终提供可见的Label
<label htmlFor="email">邮箱地址</label>
<input id="email" placeholder="example@domain.com" />
```

### 5. 处理缺失的翻译

```javascript
i18n.init({
  // 缺失时的回退策略
  saveMissing: true,  // 开发时记录缺失的key
  saveMissingTo: 'current',  // 保存到当前语言文件
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    // 上报到翻译管理系统
    reportMissingTranslation(key, lng);
  },
});

// 或者在UI中明确标记未翻译的内容
const { t } = useTranslation();

<div className={t('some.key').includes('some.key') ? 'missing-translation' : ''}>
  {t('some.key')}
</div>
```

---

## 📝 练习任务

### 任务1:为现有项目添加多语言支持
选取一个之前做的项目(如Todo App):
1. 集成react-i18next
2. 提取所有硬编码的中文字符串到翻译文件
3. 添加英文翻译
4. 实现语言切换器(持久化选择)
5. 确保日期、数字等也正确本地化

### 任务2:构建完整的国际化电商网站
实现以下特性:
- 中/英/日三语支持
- 多币种显示(CNY/USD/JPY)
- RTL布局准备(虽然暂时不需要阿拉伯语)
- 图片替换(不同语言可能需要不同的营销图)
- SEO友好的多语言URL (/zh-CN/products, /en/products)

### 任务3:翻译工作流自动化
搭建一套翻译管理流程:
- 自动提取新增的翻译key
- 与翻译平台API集成(如Crowdin、Phrase)
- 翻译完成后自动拉取更新
- CI/CD检查是否有未翻译的新增内容

---

## 🔗 相关资源

- [i18next官方文档](https://www.i18next.com/)
- [react-i18next文档](https://react.i18next.com/)
- [MDN: Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [W3C: 国际化最佳实践](https://www.w3.org/International/)
- [Google翻译风格指南](https://developers.google.com/style/)
- [CrowdIn](https://crowdin.com/) - 翻译管理平台

---

[← 23 - 无障碍访问](../23-accessibility/) | [→ 25 - 错误处理与日志](../25-error-handling/)
