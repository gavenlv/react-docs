# 19 - Next.js 全栈开发

## 🎯 本节目标
- 理解 Next.js 的核心概念和架构优势
- 掌握 App Router（Pages Router 过渡到新路由系统）
- 学会 SSR、SSG、ISR 等渲染策略
- 构建生产级的全栈应用（含 API Routes 和数据库集成）

---

## 📖 什么是服务端渲染（SSR）？

### 用最简单的话来说

想象你去餐厅吃饭：

- **传统 SPA（客户端渲染）**：就像你去了一家自助餐厅。服务员先给你一个**空盘子**（空白的 HTML 页面），然后你拿着盘子去各个窗口**自己取菜**（浏览器下载 JavaScript，然后执行 JS 去服务器获取数据并渲染页面）。第一次到的时候，你要等很久才能吃到东西（白屏时间长）。
- **SSR（服务端渲染）**：就像你去了一家**正规餐厅**。厨师已经在厨房里把菜做好了，服务员端上来的时候**菜已经摆好盘了**（服务器直接返回完整的 HTML 页面）。你坐下就能看到菜（用户立刻看到内容），但每点一道新菜都要等厨房做（每次请求都要服务器处理）。

### 渲染方式对比表

| 特性 | 传统 CRA SPA | Next.js |
|------|-------------|---------|
| **首屏加载** | ⚠️ 白屏时间较长（需下载 JS 后渲染） | ✅ 服务端直接返回 HTML |
| **SEO** | ❌ 需要额外配置（预渲染/SSR） | ✅ 天然支持服务端渲染 |
| **路由** | 需安装 react-router-dom | ✅ 内置基于文件系统的路由 |
| **API** | 需单独部署后端服务 | ✅ API Routes 内置在同一个项目 |
| **图片优化** | 手动处理或第三方库 | ✅ Image 组件自动优化 |
| **性能** | 取决于开发者优化程度 | ✅ 开箱即用的最佳实践（Code Splitting、Tree Shaking 等） |

### 为什么需要 SSR？

1. **搜索引擎优化（SEO）**：Google 等搜索引擎的爬虫需要能直接读取 HTML 内容。SPA 的初始 HTML 是空的，爬虫可能看不到内容。
2. **首屏性能**：用户不需要等 JavaScript 下载执行就能看到页面内容，体验更好。
3. **社交媒体分享**：在微信、Facebook 等平台分享链接时，平台需要读取页面的 `og:` 标签来生成预览卡片，SSR 天然支持。

### 不用 Next.js vs 用 Next.js 的对比

```tsx
// ❌ 不用 Next.js：你需要手动处理很多事
// 1. 手动配置路由
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

// 2. 手动处理数据获取（在 useEffect 里请求，用户先看到 loading）
function Home() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);
  return data ? <div>{data.title}</div> : <div>加载中...</div>;
}

// 3. 手动配置 SEO
useEffect(() => {
  document.title = '首页';
  document.querySelector('meta[name="description"]')
    .setAttribute('content', '这是描述');
}, []);

// ✅ 用 Next.js：一切开箱即用
// 1. 文件系统即路由（创建 src/app/about/page.tsx 就有了 /about 路由）
// 2. 在组件中直接 await 获取数据（无需 useEffect，无 loading 闪烁）
// 3. export metadata 即可设置 SEO（无需手动操作 DOM）
```

---

## 🏗️ 什么是 Next.js？

### 一句话解释

Next.js 是一个基于 React 的**全栈框架**，它帮你在 React 之上封装了路由、数据获取、API 接口、部署等功能，让你不需要自己拼装各种工具，就能直接开发完整的 Web 应用。

### 类比理解

如果说 React 是**乐高积木**（你用积木搭建任何东西，但需要自己设计结构），那 Next.js 就是一个**乐高城堡套装**（它帮你设计好了城墙、塔楼、桥梁怎么拼，你只需要往里填充细节即可）。

### Next.js 能帮你做什么？

- **路由**：不再需要 react-router-dom，通过文件/文件夹命名自动创建路由
- **数据获取**：在组件中直接写 `await fetch()`，数据在服务器端获取后一起返回
- **API 接口**：在前端项目里直接写后端接口，前后端一个项目搞定
- **图片优化**：自动压缩、转 WebP 格式、懒加载
- **部署**：推送到 GitHub 就能自动部署到 Vercel

---

## 🛣️ 项目创建与结构

### 初始化项目

```bash
# 方式一：create-next-app（推荐，交互式引导）
# 就像安装一个软件的"下一步、下一步"安装向导
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev

# 方式二：手动配置（更灵活，适合想自定义一切的人）
mkdir my-app && cd my-app
npm init -y
npm install next react react-dom
# 配置 package.json scripts:
# "dev": "next dev",       # 开发模式，支持热更新
# "build": "next build",   # 打包构建
# "start": "next start",   # 运行生产版本
# "lint": "next lint"      # 代码检查
```

> **💡 最佳实践**：初学者强烈推荐使用方式一（`create-next-app`），它会帮你自动配置 TypeScript、ESLint、Tailwind CSS 等。

### 推荐的项目结构

```
my-next-app/
├── public/                  # 静态资源（robots.txt, favicon.ico, 图片等）
│                            # 就像网站的"公共文件柜"，任何人都能直接访问
├── src/
│   ├── app/                 # ★ App Router 目录（Next.js 13+ 推荐）
│   │   ├── layout.tsx       # Root Layout（根布局）- 所有页面的"外壳"
│   │   ├── page.tsx         # Home Page (/) - 首页
│   │   ├── globals.css      # 全局样式
│   │   │
│   │   ├── dashboard/       # 路由组：/dashboard
│   │   │   ├── layout.tsx   # Dashboard Layout（共享侧边栏等）
│   │   │   ├── page.tsx     # Dashboard Home (/dashboard)
│   │   │   └── settings/
│   │   │       └── page.tsx # (/dashboard/settings)
│   │   │
│   │   ├── blog/            # 动态路由示例
│   │   │   ├── page.tsx     # 文章列表 (/blog)
│   │   │   └── [slug]/      # [slug] 是动态参数，类似 :slug
│   │   │       └── page.tsx # 文章详情 (/blog/:slug)
│   │   │
│   │   └── api/             # API Routes（后端接口）
│   │       ├── users/
│   │       │   ├── route.ts # GET/POST /api/users
│   │       │   └── [id]/
│   │       │       └── route.ts # GET/PUT/DELETE /api/users/:id
│   │       └── auth/
│   │           └── route.ts # POST /api/auth (login/register)
│   │
│   ├── components/          # 共享 UI 组件（可复用的零件）
│   │   ├── ui/              # 基础原子组件（Button, Input, Card）
│   │   ├── features/        # 业务特性组件（UserProfile, PostCard）
│   │   └── layout/          # 布局组件（Header, Footer, Sidebar, Navigation）
│   │
│   ├── lib/                 # 工具函数和配置（辅助工具箱）
│   │   ├── utils.ts         # 通用辅助函数（formatDate, cn 等）
│   │   ├── api.ts           # API 客户端封装（fetch wrapper, 错误处理）
│   │   ├── validations.ts   # Zod schemas（表单验证规则）
│   │   └── auth.ts          # 认证相关（session, token 管理, NextAuth.js 配置）
│   │
│   ├── hooks/               # 自定义 Hooks（可复用的逻辑）
│   │   ├── useDebounce.ts
│   │   ├── useInfiniteScroll.ts
│   │   └── useAuth.ts
│   │
│   ├── stores/              # 状态管理（Zustand/Jotai）
│   │   ├── useAppStore.ts
│   │   └── useUserStore.ts
│   │
│   └── types/               # TypeScript 类型定义
│       ├── index.ts
│       ├── api.ts           # API Request/Response types
│       └── domain.ts        # 业务实体类型
│
├── prisma/                  # Prisma ORM（如果使用数据库）
│   └── schema.prisma
│
├── tests/                   # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── next.config.js/tson      # Next.js 配置
├── tailwind.config.ts       # Tailwind CSS 配置
├── tsconfig.json
├── .env.local               # 环境变量（不提交 Git，存放密码、API Key 等）
├── .env.example             # 环境变量模板（提交 Git，供其他开发者参考）
└── package.json
```

---

## 🛣️ 路由系统（App Router）

### 什么是"基于文件系统的路由"？

在传统的 React 项目中，你需要用代码来定义"哪个 URL 显示哪个组件"。Next.js 用了一个非常聪明的方式：**你创建什么文件，就自动有什么路由**。

类比理解：就像书架上摆书，你把一本书放在"小说"文件夹下的"科幻"子文件夹里，读者就能按路径找到它。

### 文件约定路由

| 文件/目录 | 用途 | 对应路径 | 类比 |
|-----------|------|----------|------|
| `page.tsx` | 页面/UI | `/` 或对应目录 | 书中的一页 |
| `layout.tsx` | 包裹页面的布局 | 影响其子页面 | 书的版式模板 |
| `loading.tsx` | 加载态 fallback | 自动显示 | 等菜时的开胃小菜 |
| `error.tsx` | 错误边界 | 显示错误 UI | 出错时的提示牌 |
| `not-found.tsx` | 404 页面 | 未找到资源时显示 | 迷路指引牌 |
| `route.ts` | API Endpoint | 处理 HTTP 请求 | 后厨窗口 |
| `template.tsx` | 模板（每次导航重新挂载） | 用于动画等场景 | 每次翻页都刷新的模板 |

### 基本页面

```tsx
// src/app/page.tsx (首页 /)
// 当用户访问你的网站根路径（如 https://myapp.com/）时，会显示这个组件
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to My Next.js App</h1>
      {/* 这是一个最简单的页面，返回一段 HTML */}
      <p>This is the home page.</p>
    </main>
  );
}
```

### 嵌套路由和布局

**什么是 Layout？** Layout 是包裹在一组页面外面的"壳"。比如你的网站每个页面都有顶部导航栏和底部版权信息，你不需要在每个页面重复写，而是写一个 Layout 包裹它们。

```tsx
// src/app/layout.tsx (Root Layout - 所有页面的最外层容器)
// 这个文件定义了整个网站的"外壳"——每个页面都会被这个布局包裹
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 使用 Google 字体 Inter（Next.js 会自动优化字体加载）
const inter = Inter({ subsets: ['latin'] });

// 设置整个网站的 SEO 元数据
export const metadata: Metadata = {
  title: 'My Awesome App',
  description: 'Built with Next.js and TypeScript',
};

// children 就是当前路由对应的页面内容
// 类比：Layout 是相框，children 是相框里的照片
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* inter.className 会自动应用字体样式 */}
      <body className={inter.className}>
        <Header />           {/* 全局 Header - 所有页面都有 */}
        {children}           {/* 这里会根据当前路由注入不同的 page */}
        <Footer />           {/* 全局 Footer - 所有页面都有 */}
      </body>
    </html>
  );
}
```

```tsx
// src/app/dashboard/layout.tsx (Dashboard 区域专用布局)
// 这个布局只对 /dashboard 及其子路由生效
import DashboardNav from '@/components/layout/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* 侧边栏只在 /dashboard 及其子路由下显示 */}
      <aside>
        <DashboardNav />
      </aside>
      {/* /dashboard, /dashboard/settings 等都渲染在这里 */}
      <section className="content">
        {children}
      </section>
    </div>
  );
}
```

### 动态路由（Dynamic Routes）

**什么是动态路由？** 比如你的博客有 100 篇文章，你不可能创建 100 个文件。你需要一个"模板"页面，根据 URL 中的参数（如文章 slug）来显示不同的内容。

用方括号 `[slug]` 来表示动态参数：

```
src/app/blog/[slug]/page.tsx

访问 /blog/hello-world    → slug = 'hello-world'
访问 /blog/nextjs-tutorial → slug = 'nextjs-tutorial'
访问 /blog/react-hooks     → slug = 'react-hooks'
```

```tsx
// src/app/blog/[slug]/page.tsx (动态文章详情页)

// 定义参数类型
type BlogPostParams = { params: { slug: string } };

// 服务端获取数据（Server Components 默认行为）
// 注意：这里直接用 await！这在普通 React 里是不行的
// 因为这个组件运行在服务器上，不是浏览器里
async function getBlogPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${process.env.API_URL}/posts/${slug}`, {
    // ISR: Incremental Static Regeneration（增量静态再生成）
    // 含义：先返回缓存的 HTML（快），然后在后台检查数据是否更新
    // 如果有更新，下次请求就会拿到新的
    next: { revalidate: 3600 }  // 每 1 小时后台重新生成一次静态页面
  });
  
  if (!res.ok) {
    // 找不到文章时，显示 404 页面
    notFound();
  }
  
  return res.json();
}

// 动态生成 SEO 元数据（搜索引擎会读取这些信息）
export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  return {
    title: post.title,                    // 页面标题
    description: post.excerpt,            // 页面描述
    openGraph: {                          // 社交媒体分享预览
      images: [post.coverImage],
    },
  };
}

// 默认导出的函数就是页面组件
export default async function BlogPostPage({ params }: BlogPostParams) {
  // 直接 await 获取数据，不需要 useState + useEffect
  const post = await getBlogPost(params.slug);

  return (
    <article className="blog-post">
      <header>
        <h1>{post.title}</h1>
        <time dateTime={post.publishedAt}>
          {formatDate(post.publishedAt)}
        </time>
        <span>By {post.author.name}</span>
      </header>

      {/* 使用 Server Component 直接渲染 HTML 内容 */}
      <div 
        dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        className="prose prose-lg max-w-none"
      />

      {/* Client Components（需要交互的部分需要标记 'use client'） */}
      <CommentSection postId={post.id} />
      <LikeButton postId={post.id} initialCount={post.likesCount} />
    </article>
  );
}

// 生成静态参数（用于 SSG - 构建时生成所有可能的静态页面）
export async function generateStaticParams() {
  const posts = await fetch(`${process.env.API_URL}/posts`).then(res => res.json());
 
  // 返回所有可能的 slug 值数组
  // 构建时，Next.js 会为每个 slug 生成一个 HTML 文件
  return posts.map((post: BlogPost) => ({
    slug: post.slug,
  }));
}
```

---

## 🎨 渲染策略详解

### 什么是渲染策略？

渲染策略就是决定**"在什么时候、在哪里把页面内容生成为 HTML"**的策略。不同的策略有不同的优缺点，就像不同的烹饪方式适合不同的食材。

### 策略对比

| 策略 | HTML 在哪生成？ | 速度 | 数据新鲜度 | 适合场景 | 类比 |
|------|----------------|------|-----------|---------|------|
| **CSR** | 浏览器 | 首屏慢 | 每次最新 | 仪表盘、后台 | 现做现吃 |
| **SSR** | 服务器 | 首屏较快 | 每次最新 | 个人主页、搜索结果 | 点菜现做 |
| **SSG** | 构建时 | 最快 | 构建时固定 | 博客、文档 | 预制菜 |
| **ISR** | 构建时+定期刷新 | 快 | 定期更新 | 商品列表、新闻 | 半预制菜 |

### 1. CSR (Client-Side Rendering) - 客户端渲染

**是什么**：服务器返回一个空的 HTML 壳子 + JavaScript 代码，浏览器下载 JS 后执行它，去获取数据并渲染页面。

**原理**：浏览器 → 下载 HTML（几乎是空的）→ 下载 JS → 执行 JS → 调用 API 获取数据 → 用数据渲染页面。

```tsx
// CSR 示例
'use client';  // ★ 必须标记为客户端组件！告诉 Next.js 这个组件在浏览器里运行

import { useEffect, useState } from 'react';

export default function ClientOnlyWidget() {
  // 传统方式：useState 存数据，useEffect 请求数据
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 组件挂载后，在浏览器里发送请求获取数据
    fetch('/api/dashboard-stats')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  // 加载中显示骨架屏
  if (loading) return <Skeleton />;
  // 数据加载完成后显示图表
  return <Chart data={data} />;
}
```

**适用场景**: 高度交互、不需要 SEO 的页面（如仪表盘、设置面板、用户个人后台）

### 2. SSR (Server-Side Rendering) - 服务端渲染

**是什么**：每次用户请求页面时，服务器都会重新运行组件代码，获取最新数据，生成完整的 HTML 返回给浏览器。

**原理**：浏览器 → 请求 URL → 服务器执行 React 组件 + 获取数据 → 生成完整 HTML → 返回给浏览器（用户立刻看到内容）。

```tsx
// src/app/profile/[id]/page.tsx
// 默认就是 Server Component（服务端组件），不需要任何标记
export default async function UserProfilePage({ params }: { params: { id: string } }) {
  // 这个 fetch 发生在服务器端！
  // 用户不会看到"加载中"的空白，因为 HTML 已经包含了数据
  const user = await fetch(`https://api.example.com/users/${params.id}`).then(r => r.json());

  return (
    <>
      <Head>
        {/* SEO 元数据，搜索引擎和社交媒体会读取这些 */}
        <title>{user.name}'s Profile</title>
        <meta property="og:image" content={user.avatar} />
      </Head>
      
      <ProfileHeader user={user} />
      
      {/* 如果部分区域是高度交互式的，拆分为 Client Component */}
      <UserPosts userId={params.id} />  {/* 这是一个 'use client' 组件 */}
    </>
  );
}
```

**适用场景**: 数据经常变化、个性化内容（如用户个人主页、实时搜索结果）

### 3. SSG (Static Site Generation) / ISR

**是什么 - SSG**：在**构建项目时**（即你运行 `npm run build` 的时候）就把所有页面生成好 HTML 文件。用户请求时直接返回静态文件，速度最快。

**是什么 - ISR**：SSG 的增强版。先像 SSG 一样在构建时生成页面，然后设定一个时间间隔（如 1 小时），在这个间隔内返回缓存的 HTML（快），超过间隔后会在后台重新生成（数据新鲜）。

**原理（ISR）**：
1. 第一次请求 → 返回构建时的 HTML（快）
2. 如果距上次生成超过 1 小时 → 返回旧的 HTML，同时在后台重新生成
3. 下一个请求 → 返回新生成的 HTML（新鲜）

```tsx
// src/app/products/page.tsx
// 使用 revalidate 启用 ISR
async function getProducts(): Promise<Product[]> {
  const res = await fetch('https://api.example.com/products', {
    // ★ 关键配置：告诉 Next.js 缓存此请求结果 3600 秒
    // 在 3600s 内的所有请求都会返回缓存的 HTML（极快！）
    // 3600s 后，下一个请求会触发后台重新生成（Stale-While-Revalidate）
    next: { revalidate: 3600 }  
  });
  
  return res.json();
}

// 也可以在整个页面级别设置
export const revalidate = 3600;

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <section>
      <h1>Our Products</h1>
      <ProductGrid products={products} />
    </section>
  );
}
```

**适用场景**: 营销页、文档站、博客文章等变化频率低的内容。

### 如何选择渲染策略？

```
你的页面需要被搜索引擎收录吗？
  ├─ 是（需要 SEO）→ 数据变化频繁吗？
  │        ├─ 是（如实时股价、用户动态）→ SSR (每次请求获取最新数据)
  │        └─ 否（如博客、商品页、文档）→ SSG / ISR (构建时生成 + 定期刷新)
  │
  └─ 否（纯交互界面，如后台管理）
           └─ CSR ('use client')
```

> **⚠️ 常见错误**：新手经常把所有页面都用 SSR，导致服务器压力大。其实大部分内容型页面用 ISR 就够了，只有需要实时数据的页面才用 SSR。

> **💡 最佳实践**：一个页面可以混合使用多种策略。比如一个博客详情页，文章内容用 SSR（保证最新），但评论区用 CSR（用户交互部分），侧边栏"推荐文章"用 ISR（定期刷新即可）。

---

## 🔌 API Routes（后端逻辑）

### 什么是 API Routes？

在传统的开发中，前端和后端是两个独立的项目。前端用 React 写，后端用 Node.js/Java/Python 写，它们通过 API 通信。

Next.js 的 API Routes 让你可以**在同一个项目里写后端接口**。你只需要在 `app/api/` 目录下创建文件，就能自动创建 API 接口。

类比理解：就像一个餐厅不仅有前厅（前端页面），还自带后厨（API 接口），不需要从外面另一个餐厅订菜。

### 定义 API Endpoint

在 `app/api/` 目录下创建 `route.ts` 文件即可：

```typescript
// src/app/api/users/route.ts
// 这个文件会自动创建两个接口：
// GET  /api/users  - 获取用户列表
// POST /api/users  - 创建新用户
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';  // Prisma client（数据库操作工具）
import { z } from 'zod';         // 输入验证工具

// 定义数据验证规则（就像入场安检，不符合规则的数据不让过）
const createUserSchema = z.object({
  email: z.string().email(),        // 必须是邮箱格式
  name: z.string().min(2),          // 至少 2 个字符
  role: z.enum(['user', 'admin']).default('user'),  // 只能是 user 或 admin，默认 user
});

// GET /api/users - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 解析 URL 中的查询参数（如 /api/users?page=1&limit=10）
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // 查询数据库
    const [users, total] = await Promise.all([
      // 并行执行两个数据库查询，提高效率
      db.user.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
        skip: (page - 1) * limit,  // 跳过前面的记录（分页）
        take: limit,                 // 取多少条
        orderBy: { createdAt: 'desc' },  // 按创建时间倒序
        select: {  // 只查询需要的字段（安全性！不要暴露 password hash 等）
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      // 同时查询总数（用于分页计算）
      db.user.count({ where: /* ... */ }),
    ]);

    // 返回 JSON 格式的响应
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }  // 500 = 服务器内部错误
    );
  }
}

// POST /api/users - 创建新用户
export async function POST(request: NextRequest) {
  try {
    // 从请求体中解析 JSON 数据
    const body = await request.json();
    
    // 验证输入数据（不符合规则会抛出错误）
    const validatedData = createUserSchema.parse(body);
    
    // 检查邮箱是否已注册
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }  // 409 = 冲突（资源已存在）
      );
    }

    // 创建用户（记得哈希密码！这里省略了密码哈希步骤）
    const newUser = await db.user.create({
      data: {
        ...validatedData,
        // password: await bcrypt.hash(validatedData.password, 12),
      },
    });

    // 返回创建成功的响应
    return NextResponse.json(
      { success: true, data: newUser },
      { status: 201 }  // 201 = 创建成功
    );
  } catch (error) {
    // Zod 验证失败的错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: error.errors },
        { status: 400 }  // 400 = 请求格式错误
      );
    }

    console.error('Create user failed:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 动态 API 路由（带参数）

```typescript
// src/app/api/users/[id]/route.ts
// 这个文件会自动创建三个接口：
// GET    /api/users/123 - 获取指定用户
// PUT    /api/users/123 - 更新指定用户
// DELETE /api/users/123 - 删除指定用户
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/123
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: Number(params.id) },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }  // 404 = 未找到
    );
  }

  return NextResponse.json({ success: true, data: user });
}

// PUT /api/users/123
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updatedUser = await db.user.update({
      where: { id: Number(params.id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 400 }
    );
  }
}

// DELETE /api/users/123
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.user.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ success: true, message: 'User deleted' });
}
```

---

## 🗄️ 数据库集成（以 Prisma 为例）

### 什么是 Prisma？

Prisma 是一个现代化的**数据库操作工具（ORM）**。ORM 的意思是"对象关系映射"——它让你不用写 SQL 语句，而是用 JavaScript/TypeScript 代码来操作数据库。

类比理解：SQL 就像用**英语**和数据库对话（`SELECT * FROM users WHERE id = 1`），而 Prisma 就像一个**翻译官**，你用 TypeScript 说话（`prisma.user.findUnique({ where: { id: 1 } })`），翻译官自动翻译成 SQL 去执行。

### 安装与配置

```bash
# 安装 Prisma
npm install prisma @prisma/client

# 初始化 Prisma（会生成 schema.prisma 配置文件）
npx prisma init
```

```prisma
// prisma/schema.prisma
// 这是 Prisma 的配置文件，用来定义数据库结构（"数据库蓝图"）
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // 数据库类型：也支持 mysql, sqlite, mongodb 等
  url      = env("DATABASE_URL")  // 从 .env 文件读取数据库连接地址
}

// 定义 User 表（模型）
model User {
  id        Int      @id @default(autoincrement())  // 主键，自增
  email     String   @unique                         // 邮箱，唯一（不能重复）
  name      String?                                  // 名字，可选（? 表示可以为空）
  password  String                                   // 密码，必填
  role      Role     @default(USER)                  // 角色，默认 USER
  posts     Post[]                                   // 关联：一个用户有多篇文章
  createdAt DateTime @default(now())                 // 创建时间，默认当前时间
  updatedAt DateTime @updatedAt                     // 更新时间，自动更新

  @@map("users")  // 映射到数据库中的 users 表
}

// 定义 Post 表
model Post {
  id        Int      @id @default(autoincrement())
  title     String                                    // 文章标题
  content   String   @db.Text                        // 文章内容（长文本）
  published Boolean  @default(false)                 // 是否发布
  authorId  Int                                       // 作者 ID（外键）
  author    User     @relation(fields: [authorId], references: [id])  // 关联到 User
  tags      String[]                                  // 标签（数组）
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([published])  // 为 published 字段创建索引（加速查询）
  @@index([authorId])   // 为 authorId 字段创建索引
  @@map("posts")
}

// 定义枚举（有限的几个值）
enum Role {
  USER     // 普通用户
  ADMIN    // 管理员
}
```

### 在 API Routes 中使用 Prisma

```typescript
// lib/prisma.ts (Singleton 模式，避免多个实例)
// 开发模式下，React 的热更新会导致模块重新加载
// 如果不使用 Singleton，每次热更新都会创建新的数据库连接，很快就会耗尽连接池
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 如果已经存在实例就复用，否则创建新实例
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

// 非生产环境下保存到全局变量，防止热更新时重复创建
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// src/app/api/posts/route.ts - 使用 Prisma 查询数据
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const authorId = searchParams.get('authorId');

  // 用 TypeScript 代码代替 SQL 来查询数据库
  const posts = await prisma.post.findMany({
    where: {
      // 根据查询参数动态构建查询条件
      ...(published !== null ? { published: published === 'true' } : {}),
      ...(authorId ? { authorId: Number(authorId) } : {}),
    },
    include: {  // 关联查询：同时查询作者信息
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },  // 按创建时间倒序
  });

  return NextResponse.json(posts);
}
```

---

## 🔐 认证与授权（NextAuth.js）

### 什么是认证和授权？

- **认证（Authentication）**：确认"你是谁"。就像进小区要刷门禁卡，证明你是住户。
- **授权（Authorization）**：确认"你能做什么"。就像住户能进自己家，但不能进邻居的家。

NextAuth.js 是一个为 Next.js 设计的认证库，让你几行代码就能实现登录/注册功能。

### 安装配置

```bash
npm install next-auth @auth/prisma-adapter
```

```typescript
// src/auth.ts - NextAuth 配置
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';  // 密码比对工具
import { prisma } from '@/lib/prisma';

// 配置认证
export const { handlers, signIn, signOut, auth } = NextAuth({
  // 认证方式：这里用"用户名+密码"方式
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 验证用户输入
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // 在数据库中查找用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 用户不存在或密码错误
        if (!user || !(await compare(credentials.password, user.password))) {
          throw new Error('Invalid email or password');
        }

        // 验证通过，返回用户信息
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // 还可以轻松添加第三方登录：Google, GitHub, Discord 等
    // GoogleProvider({ clientId: "...", clientSecret: "..." }),
  ],

  session: {
    strategy: 'jwt',  // 使用 JWT（一种加密的令牌）存储登录状态
    // JWT 的好处：不需要在数据库中存 session 表，更适合无状态架构
  },

  callbacks: {
    // 在生成 JWT 时，把自定义字段（如 role）加进去
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    // 在读取 session 时，把 JWT 中的信息暴露给前端
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',  // 自定义登录页路径
    error: '/auth/error',   // 自定义错误页路径
  },
});
```

### 保护路由（Middleware）

**什么是中间件（Middleware）？** 中间件就像是"门卫"，在请求到达页面之前先拦截它，检查用户是否有权限访问。

```typescript
// src/middleware.ts (中间件：拦截所有匹配的路由)
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;                          // 是否已登录
  const isAdmin = req.auth?.user?.role === 'admin';      // 是否是管理员
  const pathname = req.nextUrl.pathname;                  // 当前访问的路径
  
  // 保护 /dashboard 路径（必须登录才能访问）
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    // 未登录 → 跳转到登录页，并记住原本想去的页面
    const newUrl = new URL('/auth/login', req.url);
    newUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(newUrl);
  }
  
  // 保护 /admin 路径（必须是管理员才能访问）
  if (pathname.startsWith('/admin') && !isAdmin) {
    // 非管理员 → 跳转到"无权限"页面
    return NextResponse.redirect(newURL('/forbidden'));
  }

  // 通过检查，继续正常访问
  return NextResponse.next();
});

// 配置中间件的作用范围（只拦截这些路径）
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## 🚀 性能优化与部署

### Image Optimization - 图片优化

**为什么要优化图片？** 图片通常占网页总大小的 50% 以上。未优化的图片会让页面加载很慢。

```tsx
import Image from 'next/image';

// ✅ 使用内置 Image 组件（自动 WebP/AVIF、响应式尺寸、懒加载）
// Next.js 的 Image 组件会自动：
// 1. 根据屏幕大小提供合适尺寸的图片
// 2. 转换为 WebP/AVIF 等现代格式（体积更小）
// 3. 用户滚动到图片位置时才加载（懒加载）
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority  // 首屏重要图片（LCP 元素）可以加这个属性提前加载
/>

// 远程图片需要在 next.config.js 配置允许的域名
<Image
  src="https://cdn.example.com/images/product.png"
  alt="Product"
  width={500}
  height={500}
/>
```

```javascript
// next.config.js/ts - 配置允许的远程图片域名
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

### 字体优化

```tsx
import { Inter, Lora } from 'next/font/google';

// 使用 Next.js 内置的字体优化
// 它会自动：
// 1. 在构建时下载字体文件（不依赖 Google Fonts CDN，国内也能用）
// 2. 消除布局偏移（FOIT/FOUT）
// 3. 只加载用到的字符子集
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',  // CSS 变量名
  display: 'swap',           // 字体加载前先用系统字体显示
});

const lora = Lora({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### 部署到 Vercel（官方平台，零配置）

```bash
# 安装 Vercel 命令行工具
npm i -g vercel

# 登录并部署（跟着提示操作即可）
vercel
# 首次部署后，以后只需要：
git push origin main  # 自动触发 Vercel CI/CD 部署
```

> **💡 提示**：Vercel 是 Next.js 的开发公司，部署 Next.js 项目到 Vercel 是"官方推荐"方案，几乎零配置。也可以部署到其他平台如 Docker、AWS、阿里云等。

---

## 💡 实战案例：博客系统

结合以上知识点，快速搭建一个功能完整的博客：

### 功能清单

- ✅ 文章列表（SSG + ISR）
- ✅ 文章详情（SSR + 动态路由）
- ✅ Markdown/MDX 支持
- ✅ 评论系统（CSR + API Route）
- ✅ 管理后台（需认证）
- ✅ SEO 优化（Metadata API）
- ✅ 响应式设计（Tailwind CSS）
- ✅ 图片优化

### 核心代码片段

只需按照上述结构组织文件即可快速成型。重点在于理解 **Server vs Client Component** 的边界划分，以及合理选择 **渲染策略**。

> **💡 最佳实践**：Server Component 和 Client Component 的划分原则——
> - **Server Component**（默认）：获取数据、访问数据库、读取文件系统、使用后端密钥
> - **Client Component**（标记 `'use client'`）：处理用户交互（点击、输入）、使用浏览器 API（useState、useEffect、addEventListener）

---

## ⚠️ 常见错误

### 1. 在 Server Component 中使用 useState/useEffect

```tsx
// ❌ 错误：Server Component（默认）不能使用 useState 和 useEffect
// 因为 Server Component 运行在服务器上，没有浏览器的"状态"概念
export default function BadComponent() {
  const [count, setCount] = useState(0);  // 会报错！
  return <div>{count}</div>;
}

// ✅ 正确：加上 'use client' 声明
'use client';
export default function GoodComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

### 2. 忘记导出 async 函数的 generateStaticParams

```tsx
// ❌ 错误：动态路由页面没有处理 404
export default async function BlogPost({ params }) {
  const post = await fetch(`.../${params.slug}`).then(r => r.json());
  // 如果 slug 不存在，post 为 null，页面会报错
  return <h1>{post.title}</h1>;
}

// ✅ 正确：检查数据是否存在
export default async function BlogPost({ params }) {
  const res = await fetch(`.../${params.slug}`);
  if (!res.ok) notFound();  // 显示 404 页面
  const post = await res.json();
  return <h1>{post.title}</h1>;
}
```

### 3. 环境变量没有 NEXT_PUBLIC_ 前缀

```tsx
// ❌ 错误：在客户端组件中使用服务器端环境变量
// 只有以 NEXT_PUBLIC_ 开头的环境变量才能在浏览器中访问
const apiKey = process.env.API_KEY;  // 在浏览器中是 undefined

// ✅ 正确：客户端环境变量加 NEXT_PUBLIC_ 前缀
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// 或者把这段代码放在 Server Component / API Route 中
```

---

## ✅ 阶段检查清单

- [ ] 能够使用 create-next-app 创建并运行项目
- [ ] 掌握 App Router 的目录结构和路由映射关系
- [ ] 理解并能区分 Server Component 和 Client Component
- [ ] 熟悉 SSR、SSG、ISR 三种渲染模式的原理和使用场景
- [ ] 会编写 RESTful API Routes（GET/POST/PUT/DELETE）
- [ ] 能够集成 Prisma（或其他 ORM）进行数据库 CRUD
- [ ] 了解基本的认证授权流程（如 NextAuth.js）
- [ ] 掌握 Next.js 特有的性能优化手段（Images、Fonts、Metadata）
- [ ] 成功将应用部署到 Vercel（或其他 Node.js 平台）

---

## 📝 练习任务

### 练习 1（基础）：创建个人博客
1. 用 `create-next-app` 创建项目
2. 创建首页、文章列表页、文章详情页
3. 文章列表用 ISR，文章详情用 SSR
4. 添加 `generateMetadata` 优化 SEO

### 练习 2（进阶）：电商产品页
1. 使用 ISR 展示商品列表，点击进入详情页（SSR）
2. 商品详情页包含评论系统（API + CSR）
3. 实现搜索功能（动态路由 + API Route）

### 练习 3（挑战）：SaaS 仪表盘
1. 受保护的管理后台（Middleware 认证）
2. 图表数据从 API 获取
3. 尝试将之前用 CRA 构建的 Todo App 迁移到 Next.js，体验 SSR/API Routes 的便利性

---

[→ 20 - 进阶主题](../20-realworld-examples/)
