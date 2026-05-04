# 20 - 实战案例集

## 🎯 本节目标
通过真实场景的完整实现，将前面学到的所有知识融会贯通。

---

## 📋 案例列表

### 1. 电商产品页面（完整版）

包含：ISR 列表、SSR 详情、购物车、评论系统

```tsx
// src/app/products/page.tsx
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

// 使用 ISR 缓存商品列表
export const revalidate = 3600; // 1小时

async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { reviews: true } },
    },
  });
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="products-page">
      <header>
        <h1>全部商品</h1>
        <p>共 {products.length} 件商品</p>
      </header>

      <div className="product-grid">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="product-card">
            <div className="image-container">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={300}
                className="product-image"
              />
              {product.discount > 0 && (
                <span className="discount-badge">-{product.discount}%</span>
              )}
            </div>
            
            <div className="info">
              <h3>{product.name}</h3>
              <div className="price-row">
                <span className={`price ${product.discount > 0 ? 'old-price' : ''}`}>
                  ¥{product.price}
                </span>
                {product.discount > 0 && (
                  <span className="sale-price">
                    ¥{Math.round(product.price * (1 - product.discount / 100))}
                  </span>
                )}
              </div>
              
              <div className="meta">
                <span>⭐ {product.rating}</span>
                <span>({product._count.reviews} 条评价)</span>
              </div>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product.id);
                }}
                className="add-to-cart-btn"
              >
                加入购物车
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* 购车车组件（Client Component） */}
      <CartDrawer />
    </div>
  );
}
```

```tsx
// src/app/products/[slug]/page.tsx (商品详情页 - SSR)
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery'; // 图片轮播
import AddToCartButton from '@/components/AddToCartButton';
import ReviewList from '@/components/ReviewList';         // 评论列表（CSR）
import WriteReview from '@/components/WriteReview';       // 写评论表单

// 动态渲染，每次请求获取最新数据
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      category: true,
    },
  });

  if (!product) notFound();

  return (
    <article className="product-detail">
      <ProductGallery images={product.images} />

      <section className="product-info">
        <h1>{product.name}</h1>
        
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
          ))}
          <span>({product._count.reviews})</span>
        </div>

        <p className="description">{product.description}</p>

        <div className="purchase-section">
          <div className="price">
            <span className="current">¥{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="original">¥{product.originalPrice}</span>
            )}
          </div>

          <AddToCartButton productId={product.id} />
          
          {/* 收藏按钮 */}
          <FavoriteButton productId={product.id} />
        </div>

        {/* 规格选择 */}
        <VariantSelector variants={product.variants} />

        {/* 商品详情富文本 */}
        <div 
          dangerouslySetInnerHTML={{ __html: product.content }} 
          className="rich-content"
        />
      </section>

      {/* 评论区 */}
      <section className="reviews-section">
        <h2>用户评价</h2>
        <WriteReview productId={product.id} />
        <ReviewList initialReviews={product.reviews} productId={product.id} />
      </section>
    </article>
  );
}

// SEO 元数据
export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, image: true },
  });

  if (!product) return { title: '商品未找到' };

  return {
    title: `${product.name} | 我的商城`,
    description: product.description,
    openGraph: {
      images: [product.image],
      type: 'website',
    },
  };
}
```

---

### 2. 实时聊天应用

使用 WebSocket + Zustand + TypeScript

```typescript
// stores/useChatStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  typingUsers: Set<string>;
  
  connect: () => void;
  disconnect: () => void;
  sendMessage: (text: string) => void;
  addMessage: (msg: Message) => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [],
      isConnected: false,
      typingUsers: new Set(),

      connect: () => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

        ws.onopen = () => set({ isConnected: true });
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message':
              get().addMessage(data.payload);
              break;
            case 'user_typing':
              get().setTypingUser(data.userId, data.isTyping);
              break;
            case 'history':
              set({ messages: data.messages.reverse() });
              break;
          }
        };

        ws.onclose = () => set({ isConnected: false });

        // 存储实例以便发送消息
        (window as any).__chatWs = ws;
      },

      sendMessage: (text) => {
        const ws = (window as any).__chatWs;
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'message', payload: { text } }));
        }
      },

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      setTypingUser: (userId, isTyping) =>
        set((state) => {
          const newSet = new Set(state.typingUsers);
          if (isTyping) newSet.add(userId);
          else newSet.delete(userId);
          return { typingUsers: newSet };
        }),

      clearMessages: () => set({ messages: [] }),

      disconnect: () => {
        (window as any).__chatWs?.close();
        set({ isConnected: false });
      },
    }),
    { name: 'chat-store' }
  )
);

// components/ChatWindow.tsx
'use client';
import { useChatStore } from '@/stores/useChatStore';
import { useEffect, useRef, useState } from 'react';

function ChatWindow() {
  const { messages, isConnected, typingUsers, connect, sendMessage, disconnect } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  let typingTimeout: NodeJS.Timeout;

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    sendMessage(input.trim());
    setInput('');
    
    // 停止"正在输入"
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (!isTyping) {
      setIsTyping(true);
      // 发送开始输入信号
      sendTypingStatus(true);
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 3000); // 3秒无操作视为停止输入
  };

  const sendTypingStatus = (typing: boolean) => {
    const ws = (window as any).__chatWs;
    ws?.send(JSON.stringify({ type: 'user_typing', isTyping: typing }));
  };

  const stopTyping = () => {
    setIsTyping(false);
    clearTimeout(typingTimeout);
    sendTypingStatus(false);
  };

  return (
    <div className="chat-window">
      <header>
        <h2>实时聊天</h2>
        <span className={`status ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? '已连接' : '断开连接'}
        </span>
      </header>

      <main className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.isOwn ? 'own' : 'other'}`}>
            {!msg.isOwn && <strong className="sender">{msg.senderName}</strong>}
            <p>{msg.text}</p>
            <time dateTime={msg.timestamp.toISOString()}>
              {formatTime(msg.timestamp)}
            </time>
          </div>
        ))}

        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <span>{Array.from(typingUsers).join(', ')} 正在输入...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="input-area">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
          disabled={!isConnected}
        />
        <button onClick={handleSend} disabled={!isConnected || !input.trim()}>
          发送
        </button>
      </footer>
    </div>
  );
}
```

---

### 3. 数据可视化仪表盘

使用 Recharts + React Query + 自定义 Hooks

```tsx
// hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueTrend: DataPoint[];
  topProducts: ProductSales[];
  recentOrders: Order[];
}

export function useDashboardData(dateRange: DateRange) {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', dateRange],
    queryFn: () => dashboardAPI.getStats(dateRange),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}

// components/DashboardPage.tsx
'use client';
import { useDashboardData } from '@/hooks/useDashboardData';
import { AreaChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Bar, Pie, Cell } from 'recharts';
import { useState, useMemo } from 'react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import StatCard from './StatCard';
import LoadingSkeleton from './LoadingSkeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const { data, isLoading, error } = useDashboardData(dateRange);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorFallback error={error} />;

  const statsCards = useMemo(() => [
    { title: '总营收', value: data.totalRevenue, prefix: '¥', trend: '+12.5%' },
    { title: '订单数', value: data.totalOrders, trend: '+8.3%' },
    { title: '客户数', value: data.totalCustomers, trend: '+15.2%' },
    { title: '转化率', value: `${data.conversionRate}%`, trend: '-2.1%', negative: true },
  ], [data]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>数据概览</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </header>

      <section className="stats-grid">
        {statsCards.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <div className="charts-grid">
        <div className="chart-card large">
          <h3>营收趋势</h3>
          <AreaChart width={800} height={400} data={data.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatChartDate} />
            <YAxis tickFormatter={(v) => `¥${v / 1000}k`} />
            <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '营收']} />
            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </AreaChart>
        </div>

        <div className="chart-card">
          <h3>热销 TOP 5</h3>
          <BarChart width={500} height={350} data={data.topProducts} layout="vertical">
            <XAxis type="number" tickFormatter={(v) => `${v} 件`} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="salesCount" fill="#82ca9d" radius={[0, 4, 4, 0]} />
          </BarChart>
        </div>

        <div className="chart-card">
          <h3>品类分布</h3>
          <PieChart width={400} height={350}>
            <Pie
              data={getCategoryDistribution(data.topProducts)}
              cx={200}
              cy={175}
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {(data) => data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>

      {/* 最近订单表格 */}
      <RecentOrdersTable orders={data.recentOrders} />
    </div>
  );
}
```

---

### 4. 无限滚动 + 虚拟化列表

高性能展示大量数据

```tsx
// hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean; total?: number }>;
  initialPageSize?: number;
  threshold?: number; // 触发加载的距离底部像素值
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialPageSize = 20,
  threshold = 200,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>();

  // 加载下一页
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page);
      
      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      if (result.total !== undefined) setTotal(result.total);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, hasMore, loading]);

  // 初始加载 + 监听滚动
  useEffect(() => {
    loadMore(); // 首次加载
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - threshold
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, threshold]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setError(null);
  }, []);

  return { items, loading, error, hasMore, total, reset, retry: loadMore };
}

// components/VirtualizedInfiniteList.tsx
'use client';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { FixedSizeList as List } from 'react-window';
import { useMemo } from 'react';

interface VirtualizedInfiniteListProps<T> {
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean; total?: number }>;
  itemHeight: number;
  containerHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
}

export function VirtualizedInfiniteList<T>({
  fetchFn,
  itemHeight,
  containerHeight,
  renderItem,
  emptyMessage = '暂无数据',
  errorMessage = '加载失败，请重试',
}: VirtualizedInfiniteListProps<T>) {
  const { items, loading, error, hasMore } = useInfiniteScroll(fetchFn);
  const listRef = useRef<List>(null);

  // 当新数据加入时，重新计算列表大小并可能需要调整滚动位置
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0); // 强制重新测量所有行高度（如果动态）
    }
  }, [items.length]);

  // 如果正在加载且没有数据，显示骨架屏
  if (loading && items.length === 0) return <ListSkeleton count={10} itemHeight={itemHeight} />;
  
  // 错误状态
  if (error && !items.length) return <ErrorMessage message={errorMessage} onRetry={() => window.location.reload()} />;

  // 空状态
  if (!loading && !items.length) return <EmptyState message={emptyMessage} />;

  // 渲染每一行的内容（传递给 react-window）
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    // 在最后一条数据后显示加载指示器或“没有更多了”
    if (index === items.length) {
      return (
        <div style={{ ...style, display: 'flex', justifyContent: 'center', padding: '20px' }}>
          {loading ? <Spinner /> : hasMore ? '' : '— 已经到底啦 —'}
        </div>
      );
    }

    return renderItem({ index, style });
  }, [items.length, loading, hasMore, renderItem]); 

  // 总行数 = 数据长度 + 1（用于底部加载指示器）
  const itemCount = items.length + (hasMore || loading ? 1 : 0);

  return (
    <div className="virtualized-infinite-list">
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={itemCount}
        itemSize={itemHeight}
        width="100%"
        overscanCount={5} // 预渲染上下各5项，避免快速滚动时的空白
      >
        {Row}
      </List>
      
      {/* 统计信息 */}
      <div className="list-footer">
        已加载 {items.length} 项
      </div>
    </div>
  );
}

// 使用示例
function UserDirectory() {
  return (
    <VirtualizedInfiniteList<User>
      fetchFn={(page) => userApi.getPaginated(page)}
      itemHeight={80}
      containerHeight={600}
      renderItem={({ index, style }) => (
        <UserListItem style={style} user={users[index]} />
      )}
    />
  );
}
```

---

## 🎯 更多实战建议方向

1. **协作白板**: Canvas API + WebSocket + CRDT 算法（冲突解决）
2. **在线代码编辑器**: Monaco Editor + WebContainers (浏览器端运行 Node.js)
3. **AI 对话界面**: 流式 SSE 响应 + Markdown 渲染 + 代码高亮
4. **拖拽式页面构建器**: react-dnd 或 @dnd-kit + JSON Schema 驱动渲染
5. **多语言 CMS**: next-intl + MDX + 动态路由生成静态页

---

## ✅ 学习检验

完成这些实战后，你应该能够：

- [ ] 独立设计并实现中等复杂度的功能模块
- [ ] 合理组合 SSR/CSR/ISR 策略优化性能和体验
- [ ] 处理真实场景下的边界情况和错误处理
- [ ] 编写可测试、可维护的代码结构
- [ ] 具备阅读开源项目源码并学习其设计思路的能力

---

继续加油！React 的世界非常广阔，保持好奇心和实践热情，你终将成为专家！🚀
