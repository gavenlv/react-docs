# 19 - Next.js 全栈开发

## 🎯 本节目标
- 理解 Next.js 的核心概念和架构优势
- 掌握 App Router（Pages Router 过渡到新路由系统）
- 学会 SSR、SSG、ISR 等渲染策略
- 构建生产级的全栈应用（含 API Routes 和数据库集成）

---

## 📖 为什么选择 Next.js？

### 传统 SPA 的局限 vs Next.js 的优势

| 特性 | 传统 CRA SPA | Next.js |
|------|-------------|---------|
| **首屏加载** | ⚠️ 白屏时间较长（需下载 JS 后渲染） | ✅ 服务端直接返回 HTML |
| **SEO** | ❌ 需要额外配置（预渲染/SSR） | ✅ 天然支持服务端渲染 |
| **路由** | 需安装 react-router-dom | ✅ 内置基于文件系统的路由 |
| **API** | 需单独部署后端服务 | ✅ API Routes 内置在同一个项目 |
| **图片优化** | 手动处理或第三方库 | ✅ Image 组件自动优化 |
| **性能** | 取决于开发者优化程度 | ✅ 开箱即用的最佳实践（Code Splitting、Tree Shaking 等） |

---

## 🏗️ 项目创建与结构

### 初始化项目

```bash
# 方式一：create-next-app（推荐，交互式引导）
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev

# 方式二：手动配置（更灵活）
mkdir my-app && cd my-app
npm init -y
npm install next react react-dom
# 配置 package.json scripts:
# "dev": "next dev",
# "build": "next build",
# "start": "next start",
# "lint": "next lint"
```

### 推荐的项目结构

```
my-next-app/
├── public/                  # 静态资源（robots.txt, favicon.ico, 图片等）
├── src/
│   ├── app/                 # ★ App Router 目录（Next.js 13+ 推荐）
│   │   ├── layout.tsx       # Root Layout（根布局）
│   │   ├── page.tsx         # Home Page (/)
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
│   │   │   └── [slug]/
│   │   │       └── page.tsx # 文章详情 (/blog/:slug)
│   │   │
│   │   └── api/             # API Routes
│   │       ├── users/
│   │       │   ├── route.ts # GET/POST /api/users
│   │       │   └── [id]/
│   │       │       └── route.ts # GET/PUT/DELETE /api/users/:id
│   │       └── auth/
│   │           └── route.ts # POST /api/auth (login/register)
│   │
│   ├── components/          # 共享 UI 组件
│   │   ├── ui/              # 基础原子组件（Button, Input, Card）
│   │   ├── features/        # 业务特性组件（UserProfile, PostCard）
│   │   └── layout/          # 布局组件（Header, Footer, Sidebar, Navigation）
│   │
│   ├── lib/                 # 工具函数和配置
│   │   ├── utils.ts         # 通用辅助函数（formatDate, cn 等）
│   │   ├── api.ts           # API 客户端封装（fetch wrapper, 错误处理）
│   │   ├── validations.ts   # Zod schemas（表单验证规则）
│   │   └── auth.ts          # 认证相关（session, token 管理, NextAuth.js 配置）
│   │
│   ├── hooks/               # 自定义 Hooks
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
├── .env.local               # 环境变量（不提交 Git）
├── .env.example             # 环境变量模板（提交 Git）
└── package.json
```

---

## 🛣️ 路由系统（App Router）

### 文件约定路由

Next.js 使用**文件系统作为路由**——特定目录下的特殊文件自动成为 URL 路径：

| 文件/目录 | 用途 | 对应路径 |
|-----------|------|----------|
| `page.tsx` | 页面/UI | `/` 或对应目录 |
| `layout.tsx` | 包裹页面的布局 | 影响其子页面 |
| `loading.tsx` | 加载态 fallback（Suspense） | 自动显示 |
| `error.tsx` | 错误边界（捕获运行时错误） | 显示错误 UI |
| `not-found.tsx` | 404 页面 | 未找到资源时显示 |
| `route.ts` | API Endpoint | 处理 HTTP 请求 |
| `template.tsx` | 模板（每次导航重新挂载） | 用于动画等场景 |

### 基本页面

```tsx
// src/app/page.tsx (首页 /)
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to My Next.js App</h1>
      <p>This is the home page.</p>
    </main>
  );
}
```

### 嵌套路由和布局

```tsx
// src/app/layout.tsx (Root Layout - 所有页面的最外层容器)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Awesome App',
  description: 'Built with Next.js and TypeScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />           {/* 全局 Header */}
        {children}           {/* 这里会根据当前路由注入不同的 page */}
        <Footer />           {/* 全局 Footer */}
      </body>
    </html>
  );
}
```

```tsx
// src/app/dashboard/layout.tsx (Dashboard 区域专用布局)
import DashboardNav from '@/components/layout/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <aside>
        <DashboardNav />  {/* 侧边栏只在 /dashboard 及其子路由下显示 */}
      </aside>
      <section className="content">
        {children}  {/* /dashboard, /dashboard/settings 等都渲染在这里 */}
      </section>
    </div>
  );
}
```

### 动态路由（Dynamic Routes）

```tsx
// src/app/blog/[slug]/page.tsx (动态文章详情页)
// 访问: /blog/hello-world → slug = 'hello-world'
// 访问: /blog/nextjs-tutorial → slug = 'nextjs-tutorial'

type BlogPostParams = { params: { slug: string } };

// 服务端获取数据（Server Components 默认行为）
async function getBlogPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${process.env.API_URL}/posts/${slug}`, {
    // ISR: Incremental Static Regeneration（见下方说明）
    next: { revalidate: 3600 }  // 每 1 小时后台重新生成一次静态页面
  });
  
  if (!res.ok) {
    notFound();  // 触发 not-found.tsx 显示
  }
  
  return res.json();
}

export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
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

      {/* 使用 Server Component 直接渲染 MDX/Rich Text */}
      <div 
        dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
        className="prose prose-lg max-w-none"
      />

      {/* Client Components（需要交互的部分） */}
      <CommentSection postId={post.id} />
      <LikeButton postId={post.id} initialCount={post.likesCount} />
    </article>
  );
}

// 生成静态参数（用于 SSG - 构建时生成所有可能的静态页面）
export async function generateStaticParams() {
  const posts = await fetch(`${process.env.API_URL}/posts`).then(res => res.json());
 
  // 返回所有可能的 slug 值数组
  return posts.map((post: BlogPost) => ({
    slug: post.slug,
  }));
}
```

---

## 🎨 渲染策略详解

Next.js 提供多种渲染方式，根据页面需求灵活选择：

### 1. CSR (Client-Side Rendering)

传统 SPA 方式。浏览器先下载空壳 JS，然后执行 JS 获取数据并渲染。

**适用场景**: 高度交互、不需要 SEO 的页面（如仪表盘、设置面板）

```tsx
'use client';  // ★ 必须标记为客户端组件！

import { useEffect, useState } from 'react';

export default function ClientOnlyWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  return <Chart data={data} />;
}
```

### 2. SSR (Server-Side Rendering)

每次请求都在服务器上生成 HTML。数据新鲜，但 TTFB（首字节时间）可能较长。

**适用场景**: 数据经常变化、个性化内容（如用户个人主页、实时搜索结果）

```tsx
// src/app/profile/[id]/page.tsx (默认就是 Server Component)
export default async function UserProfilePage({ params }: { params: { id: string } }) {
  // 这个 fetch 发生在服务器端！用户不会看到加载中的空白
  const user = await fetch(`https://api.example.com/users/${params.id}`).then(r => r.json());

  return (
    <>
      <Head>
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

### 3. SSG (Static Site Generation) / ISR

构建时（或定期）生成 HTML 文件，后续直接从 CDN 分发，速度极快。

**适用场景**: 营销页、文档站、博客文章等变化频率低的内容。

**ISR (Incremental Static Regeneration)**:
结合了 SSG 的速度和 SSR 的数据新鲜度。后台定时刷新页面缓存。

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

export const revalidate = 3600;  // 也可以在整个页面级别设置

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

### 如何选择？

```
是否需要 SEO？
  ├─ 是 → 是否数据频繁变化？
  │        ├─ 是（如实时股价）→ SSR (每次请求获取最新数据)
  │        └─ 否（如博客、商品页）→ SSG / ISR (构建时生成 + 定期刷新)
  │
  └─ 否（纯交互界面）
           └─ CSR ('use client')
```

---

## 🔌 API Routes（后端逻辑）

### 定义 API Endpoint

在 `app/api/` 目录下创建 `route.ts` 文件即可：

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';  // Prisma client
import { z } from 'zod';         // 输入验证

// Schema 验证
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['user', 'admin']).default('user'),
});

// GET /api/users
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // 查询数据库
    const [users, total] = await Promise.all([
      db.user.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {  // 选择需要的字段（安全性！不要暴露 password hash 等）
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      db.user.count({ where: /* ... */ }),
    ]);

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
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入数据
    const validatedData = createUserSchema.parse(body);
    
    // 检查是否已存在
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    // 创建用户（记得哈希密码！这里省略）
    const newUser = await db.user.create({
      data: {
        ...validatedData,
        // password: await bcrypt.hash(validatedData.password, 12),
      },
    });

    return NextResponse.json(
      { success: true, data: newUser },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod 验证失败
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: error.errors },
        { status: 400 }
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
      { status: 404 }
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

### 安装与配置

```bash
npm install prisma @prisma/client
npx prisma init  # 生成 schema.prisma
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // 或 mysql, sqlite, mongodb, sqlserver
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  tags      String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([published])
  @@index([authorId])
  @@map("posts")
}

enum Role {
  USER
  ADMIN
}
```

### 在 API Routes 中使用 Prisma

```typescript
// lib/prisma.ts (Singleton 模式，避免多个实例)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// src/app/api/posts/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const authorId = searchParams.get('authorId');

  const posts = await prisma.post.findMany({
    where: {
      ...(published !== null ? { published: published === 'true' } : {}),
      ...(authorId ? { authorId: Number(authorId) } : {}),
    },
    include: {  // 关联查询
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(posts);
}
```

---

## 🔐 认证与授权（NextAuth.js）

### 安装配置

```bash
npm install next-auth @auth/prisma-adapter
```

```typescript
// src/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !(await compare(credentials.password, user.password))) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // 还可以轻松添加 Google, GitHub, Discord 等 OAuth providers...
  ],

  session: {
    strategy: 'jwt',  // 使用 JWT session（无需数据库 sessions 表，更适合无状态架构）
  },

  callbacks: {
    async jwt({ token, user }) {
      // 首次登录时将自定义字段加入 token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // 将 JWT token 中的信息暴露给前端 session 对象
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',  // 自定义登录页
    error: '/auth/error',   // 自定义错误页
  },
});
```

### 保护路由（Middleware 或 Session Checks）

```typescript
// src/middleware.ts (中间件：拦截所有匹配的路由)
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'admin';
  
  const pathname = req.nextUrl.pathname;
  
  // 保护 /dashboard 路径（必须登录）
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const newUrl = new URL('/auth/login', req.url);
    newUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(newUrl);
  }
  
  // 保护 /admin 路径（必须是管理员）
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(newURL('/forbidden'));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],  // 匹配规则
};
```

---

## 🚀 性能优化与部署

### Image Optimization

```tsx
import Image from 'next/image';

// ✅ 使用内置 Image 组件（自动 WebP/AVIF、响应式尺寸、懒加载）
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority  // 首屏重要图片（LCP 元素）可以加这个属性提前加载
/>

// 远程图片需要在 next.config.js 配置 allowed domains
<Image
  src="https://cdn.example.com/images/product.png"
  alt="Product"
  width={500}
  height={500}
/>
```

```javascript
// next.config.js/ts
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',  // CSS 变量
  display: 'swap',           // 避免 FOIT/FOUT
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
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel
# 按照提示完成首次部署后，以后只需：
git push origin main  # 自动触发 Vercel CI/CD 部署
```

或者通过 Vercel GitHub 集成：连接仓库后，每次 push 都会自动部署 Preview（PR）/ Production（main 分支）环境。

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

### 核心代码片段（已在前文展示大部分）

只需按照上述结构组织文件即可快速成型。重点在于理解 **Server vs Client Component** 的边界划分，以及合理选择 **渲染策略**。

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

1. **电商产品页**: 使用 ISR 展示商品列表，点击进入详情页（SSR），包含评论（API + CSR）
2. **SaaS 仪表盘**: 受保护的管理后台（Middleware 认证），图表数据从 API 获取
3. **迁移现有项目**: 尝试将之前用 CRA 构建的 Todo App 迁移到 Next.js，体验 SSR/API Routes 的便利性

---

[→ 20 - 进阶主题](../20-state-management-redux/)
