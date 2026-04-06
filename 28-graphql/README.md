# 28 - GraphQL 与 Apollo Client

## 🎯 本节目标
- 理解GraphQL的核心概念及其相对于REST的优势
- 掌握Apollo Client在React中的完整用法
- 构建高效、类型安全的前端数据层

---

## 💡 前置知识：API是什么？

在开始学习GraphQL之前，我们先理解几个基础概念：

### 什么是API？

> **类比**：想象你去餐厅吃饭。你（前端）需要点菜，但你不能直接进厨房。你需要一个**服务员**（API）来传递你的需求。
> - 你告诉服务员："我要一份宫保鸡丁，微辣" → 这就是**请求（Request）**
> - 服务员去厨房告诉你 → 厨房（服务器）做好菜
> - 服务员把菜端给你 → 这就是**响应（Response）**

**API（Application Programming Interface，应用程序编程接口）** 就是前端和后端之间"对话"的约定。

### 什么是REST API？

> **类比**：REST就像餐厅的**固定菜单**。菜单上有什么，你就能点什么，不能改。

```
前端发出的请求（HTTP）:
GET /api/users/1          → 获取1号用户
GET /api/users/1/posts    → 获取1号用户的文章
POST /api/posts           → 创建新文章

后端返回的数据（固定格式）:
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",    // ← 你可能只需要name，但服务器把所有字段都返回了
  "address": "...",
  "birthday": "..."
}
```

**REST的问题**：
- **过度获取（Over-fetching）**：你只需要用户的名字，但服务器返回了20个字段，浪费流量
- **获取不足（Under-fetching）**：你需要用户信息+文章列表，需要发**两个**请求
- **端点太多**：每个资源都需要一个URL，大型项目可能有上百个API端点

### 什么是GraphQL？

> **类比**：GraphQL就像你去**自助餐厅**。你可以**精确选择**自己想要的食物，而且可以**一次拿完**所有想吃的东西，不需要跑好几趟。

```
前端发出的请求（GraphQL）：
{
  user(id: 1) {
    name              ← 只要名字
    avatar            ← 只要头像
    posts(first: 3) { ← 只要最近3篇文章
      title           ← 文章只要标题和发布时间
      createdAt
    }
  }
}

后端返回的数据（精确匹配请求）：
{
  "data": {
    "user": {
      "name": "张三",
      "avatar": "https://...",
      "posts": [
        { "title": "我的第一篇文章", "createdAt": "2024-01-15" },
        { "title": "GraphQL入门", "createdAt": "2024-01-20" },
        { "title": "React最佳实践", "createdAt": "2024-02-01" }
      ]
    }
  }
}
```

**GraphQL的核心特点**：
- **按需获取**：你需要什么字段就写什么字段，不多不少
- **一次请求**：可以同时获取用户、文章、评论等关联数据
- **单一端点**：所有请求都发到同一个地址（通常是 `/graphql`）
- **强类型**：有明确的Schema定义，IDE可以自动补全

---

## 📖 GraphQL vs REST 对比

| 特性 | REST API | GraphQL |
|------|---------|---------|
| **端点数量** | 每个资源一个endpoint | 单一endpoint (`/graphql`) |
| **数据获取方式** | 固定结构,可能over-fetching/under-fetching | 客户端精确指定需要的字段 |
| **请求数量** | 多个资源需要多次请求 | 一次请求获取所有关联数据 |
| **版本控制** | URL版本号(`/v1/`, `/v2/`) | 废弃字段而非版本(渐进式) |
| **类型系统** | 无强类型(OpenAPI/Swagger可选补充) | 内置Schema强类型 |
| **自描述性** | 需额外文档 | Schema本身即是文档(GraphiQL可探索) |
| **错误处理** | HTTP状态码 + Body | 部分成功/失败(errors数组) |
| **缓存策略** | 手动或HTTP缓存 | Apollo Client智能归一化缓存 |

### 直观对比：获取一篇文章详情+评论

**REST方式（需要2-3次请求）**：
```
第1次请求: GET /api/posts/123
→ 返回文章信息（包含authorId）

第2次请求: GET /api/users/456
→ 返回作者信息

第3次请求: GET /api/posts/123/comments
→ 返回评论列表（每个评论又包含userId...）

如果还要展示评论者信息？第4次、第5次请求...
```

**GraphQL方式（只需1次请求）**：
```graphql
query {
  post(id: "123") {
    title
    content
    author {
      name
      avatar
    }
    comments(first: 10) {
      text
      createdAt
      author {
        name
        avatar
      }
    }
  }
}
```

> **小结**：GraphQL就像一个智能服务员，你把所有需求一次性告诉他，他帮你把所有东西都端过来。

---

## 🏗️ GraphQL基础

### 1. Schema 定义 (服务端)

> **类比**：Schema就像餐厅的**菜单规则**——它规定了有哪些菜品（类型）、每道菜用什么材料（字段）、以及每道菜怎么做法（操作）。

```graphql
# schema.graphql (服务端定义)

# 标量类型 —— 相当于"基础食材"
# GraphQL内置了 String, Int, Float, Boolean, ID
scalar DateTime    # 自定义标量：日期时间
scalar Upload      # 自定义标量：文件上传

# 枚举 —— 相当于"有限的选项列表"
enum Role {
  ADMIN    # 管理员
  USER     # 普通用户
  GUEST    # 访客
}

enum OrderDirection {
  ASC      # 升序
  DESC     # 降序
}

# 输入类型 —— 相当于"顾客填写的点菜单"
# 用于Create/Update操作的参数
input CreateUserInput {
  name: String!        # ! 表示必填（不能为null）
  email: String!       # 邮箱
  password: String!    # 密码
  avatar: Upload       # 头像（可选）
  role: Role = USER    # 默认值为USER
}

input UpdateUserInput {
  name: String         # 更新时，所有字段变为可选
  email: String
  avatar: Upload
}

input PaginationInput {
  page: Int = 1        # 页码，默认第1页
  pageSize: Int = 20   # 每页数量，默认20条
}

input UserFilterInput {
  search: String       # 搜索关键词
  role: Role           # 按角色筛选
  isActive: Boolean    # 按是否激活筛选
  createdAfter: DateTime  # 创建时间在此之后
}

# 类型定义 —— 相当于"菜品描述"
type User {
  id: ID!              # 唯一标识符，! 表示不能为空
  name: String!        # 用户名
  email: String!       # 邮箱
  avatar: URL          # 头像URL
  role: Role!          # 角色
  isActive: Boolean!   # 是否激活
  createdAt: DateTime! # 创建时间
  updatedAt: DateTime! # 更新时间
  posts(               # 关联查询：该用户的所有文章
    pagination: PaginationInput
    orderBy: PostOrderByInput
  ): PostConnection!   # 返回分页连接类型
  followersCount: Int! # 计算字段（在服务器端解析器中计算）
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!              # 关联到User类型
  category: Category!
  tags: [Tag!]!              # 标签列表，! 表示列表不能为null，Tag! 表示每个标签不能为null
  comments(
    pagination: PaginationInput
  ): CommentConnection!
  viewCount: Int!
  createdAt: DateTime!
}

# 分页连接类型 —— GraphQL推荐的分页方式（Relay Connection规范）
type PostConnection {
  edges: [PostEdge!]!    # 边：包含游标和节点
  pageInfo: PageInfo!    # 分页信息
  totalCount: Int!       # 总数
}

type PostEdge {
  cursor: String!        # 游标：用于定位数据位置
  node: Post!            # 实际的数据节点
}

type PageInfo {
  hasNextPage: Boolean!       # 是否有下一页
  hasPreviousPage: Boolean!   # 是否有上一页
  startCursor: String         # 当前页第一条数据的游标
  endCursor: String           # 当前页最后一条数据的游标
}

# Query (读操作) —— 相当于"顾客看菜单、点菜"
type Query {
  me: User                            # 获取当前登录用户（无需参数）
  user(id: ID!): User                 # 根据ID获取用户
  users(filter: UserFilterInput, pagination: PaginationInput): UserConnection!  # 获取用户列表
  post(id: ID!): Post                 # 根据ID获取文章
  posts(pagination: PaginationInput, filter: PostFilterInput): PostConnection!  # 获取文章列表
  search(query: String!, limit: Int): SearchResultUnion!  # 搜索（返回联合类型）
}

# Mutation (写操作) —— 相当于"顾客下单、退菜、修改订单"
type Mutation {
  createUser(input: CreateUserInput!): User!     # 创建用户
  updateUser(id: ID!, input: UpdateUserInput!): User!  # 更新用户
  deleteUser(id: ID!): Boolean!                  # 删除用户
  createPost(title: String!, content: String!, categoryId: ID!): Post!  # 创建文章
  likePost(postId: ID!): Post!                   # 点赞文章
  followUser(userId: ID!): User!                 # 关注用户
}

# Subscription (实时订阅) —— 相当于"服务员主动通知你：菜做好了"
type Subscription {
  postCreated: Post!                    # 有新文章发布
  commentAdded(postId: ID!): Comment!   # 某篇文章有新评论
  userOnline(userId: ID!): User!        # 某用户上线
}

# Union (联合类型) —— 类似于TypeScript中的联合类型
# 表示搜索结果可以是User、Post或Tag中的任意一种
union SearchResultUnion = User | Post | Tag
```

### 2. 查询语法示例

#### 基础查询 —— 获取当前用户信息

```graphql
# query是操作类型，GetCurrentUser是操作名称（方便调试）
query GetCurrentUser {
  me {             # 调用Query中定义的me字段
    id             # 只需要这些字段
    name
    email
    avatar
    role
    followersCount
    createdAt
  }
}
```

#### 带变量的查询 —— 分页获取文章列表

> **类比**：变量就像函数的参数，让你可以复用同一个查询，只是参数不同。

```graphql
# $page和$pageSize是变量，用$符号标识
# 后面的 Int! 表示变量类型和是否必填
query GetPosts($page: Int!, $pageSize: Int!) {
  posts(pagination: { page: $page, pageSize: $pageSize }) {
    totalCount     # 总共多少条数据
    pageInfo {     # 分页信息
      hasNextPage      # 还有下一页吗？
      hasPreviousPage  # 有上一页吗？
      startCursor      # 当前页开头的游标
      endCursor        # 当前页末尾的游标
    }
    edges {         # 数据列表
      cursor         # 每条数据的游标（用于翻页）
      node {         # 实际的数据
        id
        title
        content
        author {     # 嵌套查询：获取作者信息
          id
          name
          avatar
        }
        createdAt
      }
    }
  }
}
# 调用时传入变量: { "page": 1, "pageSize": 10 }
```

#### 嵌套查询 —— 一次请求获取文章详情+评论+作者

```graphql
# 这就是GraphQL的威力：一次请求，获取所有关联数据！
query GetPostDetail($postId: ID!) {
  post(id: $postId) {
    id
    title
    content
    author {               # 文章作者信息
      id
      name
      followersCount
    }
    category {             # 文章分类
      id
      name
    }
    tags {                 # 文章标签
      id
      name
    }
    comments(pagination: { page: 1, pageSize: 5 }) {  # 评论（嵌套分页）
      totalCount
      edges {
        node {
          id
          content
          author {         # 评论者信息（多层嵌套）
            id
            name
            avatar
          }
          createdAt
        }
      }
    }
  }
}
```

#### 别名(Alias) —— 同一查询获取不同参数的结果

```graphql
# 别名：当你想在同一次请求中调用同一个字段多次（不同参数）
# 比如：同时获取管理员列表和普通用户列表
query GetUsersByRole {
  admins: users(filter: { role: ADMIN }, pagination: { pageSize: 5 }) {
    totalCount
    edges { node { id name email } }
  }
  regular: users(filter: { role: USER }, pagination: { pageSize: 5 }) {
   totalCount
    edges { node { id name email } }
  }
}
# 返回结果中，admins和regular分别对应各自的数据
```

#### Fragment (片段) —— 复用公共字段

> **类比**：Fragment就像"预制菜单套餐"。你定义好一次套餐内容，之后每次点餐直接说"来一份A套餐"，不用再逐个报菜名。

```graphql
# 定义Fragment：提取User的公共字段
fragment UserInfo on User {   # on User表示这个Fragment属于User类型
  id
  name
  avatar
  role
}

# 使用Fragment：用 ...Fragment名 的方式引用
query GetFollowers($userId: ID!) {
  user(id: $userId) {
    ...UserInfo              # 引用UserInfo Fragment
    followers(pagination: { pageSize: 20 }) {
      edges {
        node {
          ...UserInfo        # 再次引用，避免重复写字段
        }
      }
    }
  }
}
```

#### Directive (指令) —— 条件包含字段

```graphql
# @include 和 @skip 指令：根据条件决定是否包含某个字段
query GetUser($userId: ID!, $withDetails: Boolean!) {
  user(id: $userId) {
    id
    name
    email
    bio @include(if: $withDetails)     # 仅当withDetails=true时才请求bio字段
    posts(pagination: { pageSize: 3 }) {
      edges { node { id title } }
    }
  }
}
# 当 withDetails=false 时，bio字段不会出现在请求和返回结果中
```

---

## 🚀 Apollo Client 集成

### 什么是Apollo Client？

> **类比**：如果GraphQL是"语言"，那么Apollo Client就是"翻译官"。它帮你的React应用"说"GraphQL语言，与服务器对话。

**Apollo Client的核心功能**：
- **发送请求**：帮你把GraphQL查询发送到服务器
- **缓存数据**：智能缓存已获取的数据，避免重复请求
- **自动更新**：数据变化时自动更新UI
- **乐观更新**：在等待服务器响应时，先让UI显示预期结果

### 1. 安装

```bash
# 安装Apollo Client和GraphQL
npm install @apollo/client graphql
```

### 2. 初始化配置

```jsx
// apollo-client.js —— 这一步就像"安装翻译官"

import {
  ApolloClient,          // Apollo客户端（核心）
  InMemoryCache,         // 内存缓存（存储已获取的数据）
  ApolloProvider,        // React Context Provider（让所有组件都能使用Apollo）
  split,                 // 根据条件分流请求
  HttpLink,              // HTTP连接（用于普通的查询和变更）
  from,                  // 组合多个Link
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';  // WebSocket订阅
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';  // 错误处理
import { RetryLink } from '@apollo/client/link/retry';  // 自动重试

// ========================================
// 第1步：配置HTTP连接（用于Query和Mutation）
// ========================================
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || '/graphql',  // 服务器地址
  credentials: 'same-origin',  // 发送Cookie（用于登录状态）
});

// ========================================
// 第2步：配置WebSocket连接（用于Subscription实时订阅）
// ========================================
const wsLink = new GraphQLWsLink(createClient({
  url: process.env.REACT_APP_WS_ENDPOINT || 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: localStorage.getItem('token'),  // 认证token
  },
  retryAttempts: 5,  // 断线重试次数
}));

// ========================================
// 第3步：根据操作类型分流
// Query和Mutation走HTTP，Subscription走WebSocket
// ========================================
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'  // Subscription走WebSocket
    );
  },
  wsLink,    // 是Subscription → 走WebSocket
  httpLink   // 不是 → 走HTTP
);

// ========================================
// 第4步：配置错误处理
// ========================================
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(`[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // 处理特定错误码
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Token过期，尝试刷新
        return forward(operation);
      }
      
      // 全局Toast提示
      toast.error(message);
    });
  }

  if (networkError) {
    console.error(`[Network Error]:`, networkError);
    
    if (networkError.statusCode === 401) {
      redirectToLogin();  // 未授权，跳转登录
    }
    
    if (!navigator.onLine) {
      toast.warning('网络连接中断,请检查网络');  // 离线提示
    }
  }
});

// ========================================
// 第5步：配置自动重试
// ========================================
const retryLink = new RetryLink({
  delay: {
    initial: 300,      // 初始延迟300毫秒
    max: Infinity,     // 最大延迟无上限
    jitter: true,      // 随机抖动，避免同时重试
  },
  attempts: {
    max: 3,            // 最多重试3次
    retryIf: (error, _operation) => {
      // 只重试网络错误，不重试4xx错误（如401未授权、422参数错误）
      return !!error && error.statusCode !== 422 && error.statusCode !== 401;
    },
  },
});

// ========================================
// 第6步：组合所有Link（执行顺序：error → retry → split(http/ws)）
// ========================================
const link = from([errorLink, retryLink, splitLink]);

// ========================================
// 第7步：配置缓存
// ========================================
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // 自定义分页字段的合并策略
        posts: {
          keyArgs: ['filter'],  // filter变化时视为不同查询
          merge(existing, incoming, { args }) {
            if (!args?.pagination?.page || args.pagination.page === 1) {
              return incoming;  // 第一页直接替换
            }
            // 翻页：追加edges（将新旧数据合并）
            return {
              ...incoming,
              edges: [...(existing?.edges || []), ...incoming.edges],
            };
          },
          read(existing, { args }) {
            if (!existing) return existing;
            const page = args?.pagination?.page || 1;
            const pageSize = args?.pagination?.pageSize || 20;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            return {
              ...existing,
              edges: existing.edges?.slice(start, end),
            };
          },
        },
      },
    },
    // 类型级别的key配置（告诉Apollo如何唯一识别一个对象）
    User: {
      keyFields: ['id'],  // 用id来区分不同的用户
    },
    Post: {
      keyFields: ['id'],
    },
  },
});

// ========================================
// 第8步：创建客户端实例
// ========================================
const client = new ApolloClient({
  link,       // 连接配置
  cache,      // 缓存配置
  
  // 默认选项（所有查询/变更都会使用这些默认值）
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',                // 即使有错误也返回部分数据
      fetchPolicy: 'cache-and-network',  // 先读缓存，同时发网络请求更新
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',        // 优先从缓存读取
    },
    mutation: {
      errorPolicy: 'all',
    },
  },
  
  connectToDevTools: process.env.NODE_ENV === 'development',  // 开发环境启用DevTools
});

export default client;
```

### 3. 在React应用中注入Apollo Client

```jsx
// index.jsx —— 入口文件
// 这一步就像把"翻译官"介绍给你的整个应用
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>  {/* 所有子组件都能使用Apollo */}
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
```

### 4. 数据查询 Hooks

#### useQuery —— 发送查询（读数据）

> **类比**：useQuery就像你去图书馆**借书**。你告诉图书管理员（Apollo）你想要什么书（查询语句），管理员先看看书架上有没有（缓存），有的话直接给你（cache-first），没有的话去仓库取（网络请求）。

```jsx
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GET_POSTS, CREATE_POST } from './graphql/queries';

// 基础查询 —— 文章列表
function PostList() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // useQuery返回的值：
  // loading: 是否正在加载（第一次加载时为true）
  // error: 错误信息（如果有）
  // data: 服务器返回的数据
  // fetchMore: 加载更多数据（用于分页）
  // refetch: 重新请求（忽略缓存）
  // networkStatus: 网络请求状态（更精细的控制）
  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(GET_POSTS, {
    variables: { page, pageSize: PAGE_SIZE },  // 传入变量
    
    // 缓存策略（重要！）
    fetchPolicy: 'cache-and-network',
    // 可选值：
    // 'cache-first'           → 优先从缓存读取，缓存没有才请求网络（默认）
    // 'cache-and-network'     → 先返回缓存数据，同时请求网络更新
    // 'network-only'          → 总是从网络请求
    // 'no-cache'              → 不使用缓存
    // 'cache-only'            → 只读缓存，不发请求
    
    nextFetchPolicy: 'cache-first',  // 下一次请求的策略
    
    pollInterval: 0,   // 轮询间隔（毫秒），0表示不轮询
    // 设置为5000表示每5秒自动刷新一次（适合聊天消息等实时数据）
    
    notifyOnNetworkStatusChange: true,  // 让loading随网络状态变化而更新
    
    errorPolicy: 'all',  // 即使有错误也返回部分数据
  });

  // 第一次加载时显示骨架屏
  if (loading && !data) {
    return <PostListSkeleton count={PAGE_SIZE} />;
  }

  // 出错时显示错误信息
  if (error && !data) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  // 从data中提取文章列表
  const posts = data.posts.edges.map(edge => edge.node);
  const { hasNextPage } = data.posts.pageInfo;

  return (
    <>
      <div className="post-list-header">
        <h2>文章列表 ({data.posts.totalCount})</h2>
        
        {/* 正在刷新时显示加载指示器 */}
        {networkStatus === NetworkStatus.refetch && <Spinner size="sm" />}
        
        <button 
          onClick={() => refetch()}  // 强制重新请求（忽略缓存）
          disabled={networkStatus === NetworkStatus.refetch}
        >
          刷新
        </button>
      </div>
      
      <ul>
        {posts.map(post => (
          <PostListItem key={post.id} post={post} />
        ))}
      </ul>
      
      {/* 翻页：加载更多 */}
      {hasNextPage && (
        <button
          onClick={() => {
            // fetchMore：追加数据（而不是替换）
            fetchMore({
              variables: { page: page + 1 },
              updateQuery: (prevResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prevResult;
                
                // 将新数据追加到旧数据后面
                return {
                  posts: {
                    ...fetchMoreResult.posts,
                    edges: [
                      ...prevResult.posts.edges,      // 旧数据
                      ...fetchMoreResult.posts.edges,   // 新数据
                    ],
                  },
                };
              },
            });
            setPage(page + 1);
          }}
          disabled={networkStatus === NetworkStatus.fetchMore}
        >
          {networkStatus === NetworkStatus.fetchMore ? '加载中...' : '加载更多'}
        </button>
      )}
    </>
  );
}
```

#### useLazyQuery —— 按需查询（不自动执行）

> **类比**：useQuery是"自动借书"（组件一渲染就去借），useLazyQuery是"按需借书"（你点击按钮才去借）。

```jsx
// 搜索框组件：用户输入关键词后才搜索
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // useLazyQuery返回一个函数和查询结果
  // search: 手动调用这个函数来触发查询
  // called: 是否已经调用过search函数
  const [search, { called, loading, data, error }] = useLazyQuery(SEARCH_QUERY);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // 至少输入2个字符才搜索（避免搜索太短的关键词）
    if (value.length >= 2) {
      search({ variables: { query: value } });  // 手动触发查询
    }
  };

  return (
    <div>
      <input
        value={searchTerm}
        onChange={handleChange}
        placeholder="搜索用户或文章..."
      />
      
      {/* 只有调用过search才显示加载和结果 */}
      {called && loading && <SearchResultSkeleton />}
      {data && <SearchResults results={data.search} />}
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
```

#### useMutation —— 发送变更（写数据）

> **类比**：useMutation就像你去银行**办理业务**（转账/存款等）。你需要提交表单（变量），银行处理后告诉你结果（成功/失败）。

```jsx
// 创建文章表单
function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // useMutation返回一个函数和状态
  // createPost: 调用这个函数来发送变更
  // loading: 是否正在处理
  // error: 错误信息
  const [createPost, { loading, error, reset }] = useMutation(CREATE_POST, {
    // update: 服务器成功响应后，手动更新缓存
    update(cache, { data: { createPost: newPost } }) {
      cache.modify({
        fields: {
          posts(existingPosts = {}) {
            // 把新文章添加到缓存中的文章列表顶部
            const newPostRef = cache.writeFragment({
              data: newPost,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  content
                  createdAt
                  author { id name }
                }
              `,
            });
            
            return {
              ...existingPosts,
              edges: [
                { node: newPostRef, __typename: 'PostEdge' },
                ...existingPosts.edges,
              ],
            };
          },
        },
      });
    },
    
    // 乐观UI：不等服务器响应，先让UI显示预期结果
    optimisticResponse: {
      createPost: {
        id: `temp-${Date.now()}`,    // 临时ID
        title,
        content,
        __typename: 'Post',
        author: {
          id: currentUser.id,
          name: currentUser.name,
          __typename: 'User',
        },
        createdAt: new Date().toISOString(),
      },
    },
    
    // 成功回调
    onCompleted: (data) => {
      toast.success('文章创建成功!');
      setTitle('');       // 清空输入
      setContent('');
    },
    
    // 错误回调
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
      reset();  // 重置mutation状态
    },
    
    errorPolicy: 'all',  // 允许部分失败
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createPost({
        variables: {
          input: { title, content, categoryId: selectedCategory },
        },
      });
    } catch (error) {
      // 已经在onError中处理
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="内容..."
        rows={5}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? '发布中...' : '发布文章'}
      </button>
      
      {error && <ErrorMessage error={error} />}
    </form>
  );
}
```

#### 乐观UI详解 —— 让你的应用"秒响应"

> **类比**：乐观UI就像你在聊天软件里发消息——消息会**立刻**出现在聊天框里（带一个"发送中"的标记），而不是等服务器确认后才显示。如果发送失败，才会显示错误。

```jsx
// 点赞按钮（带乐观更新）
function LikeButton({ postId, initialLikes }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const [likePost] = useMutation(LIKE_POST, {
    variables: { postId },
    
    // 乐观响应：假设服务器会成功，立即更新UI
    optimisticResponse: {
      likePost: {
        id: postId,
        likesCount: isLiked ? likesCount - 1 : likesCount + 1,
        __typename: 'Post',
      },
    },
    
    // 如果服务器返回错误，回滚UI
    onError: (error) => {
      toast.error('操作失败,请重试');
      setIsLiked(!isLiked);           // 撤销点赞状态
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);  // 撤销计数
    },
  });

  const handleLike = () => {
    // 先更新本地状态（让UI立刻响应）
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    // 再发送请求到服务器
    likePost();
  };

  return (
    <button onClick={handleLike} className={`like-btn ${isLiked ? 'liked' : ''}`}>
      ❤️ {likesCount}
    </button>
  );
}
```

### 5. Fragment 复用

```graphql
# graphql/fragments.graphql
# Fragment就像"预制模板"，定义一次，到处使用
fragment PostSummary on Post {
  id
  title
  excerpt
  featuredImage
  category { id name slug }
  author { id name avatar }
  createdAt
  stats { views likes comments }
}
```

```jsx
// 使用Fragment的组件
function PostCard({ postId }) {
  const { data } = useQuery(GET_POST_WITH_FRAGMENT, {
    variables: { id: postId },
  });

  if (!data) return null;

  // data.post自动包含PostSummary的所有字段
  return (
    <article className="post-card">
      <img src={data.post.featuredImage} alt={data.post.title} />
      <div className="content">
        <h3>{data.post.title}</h3>
        <p>{data.post.excerpt}</p>
        <AuthorBadge author={data.post.author} />
        <footer>
          <CategoryTag category={data.post.category} />
          <time dateTime={data.post.createdAt}>
            {formatRelativeTime(data.post.createdAt)}
          </time>
          <Stats stats={data.post.stats} />
        </footer>
      </div>
    </article>
  );
}
```

### 6. Subscription (实时订阅)

> **类比**：Subscription就像**微信群的实时消息**。你加入群聊后，每当有人发消息，你的手机会**立即收到推送**，不需要你手动刷新。

```jsx
import { useSubscription } from '@apollo/client';
import { POST_CREATED_SUBSCRIPTION } from './graphql/subscriptions';

function LiveFeed() {
  // useSubscription：实时订阅新文章发布
  const { data, error, loading } = useSubscription(POST_CREATED_SUBSCRIPTION, {
    variables: { categoryId: selectedCategory },  // 过滤参数
    onData: ({ client, data }) => {
      // 收到新数据时的额外处理
      playNotificationSound();              // 播放通知音效
      showToast(`新文章: ${data.data.postCreated.title}`);
    },
  });

  if (error) {
    console.error('Subscription error:', error);
    return <ConnectionLostWarning onReconnect={reconnect} />;
  }

  return (
    <div className="live-feed">
      <h2>🔴 实时更新</h2>
      {loading && <Spinner />}
      {data?.postCreated && (
        <NewPostNotification post={data.postCreated} />
      )}
    </div>
  );
}

// 聊天室消息实时订阅
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // 先加载历史消息
  const { data: historyData } = useQuery(GET_MESSAGES, {
    variables: { roomId },
    onCompleted: (data) => {
      setMessages(data.messages.edges.map(e => e.node));
    },
  });

  // 再订阅新消息
  const { data: newMessageData } = useSubscription(MESSAGE_ADDED, {
    variables: { roomId },
    onSubscriptionData: ({ subscriptionData }) => {
      const newMessage = subscriptionData.data.messageAdded;
      setMessages(prev => [...prev, newMessage]);  // 追加新消息
    },
  });

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} isOwn={msg.author.id === currentUserId} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

### 7. 本地状态管理 (Reactive Variables)

> **类比**：Reactive Variables就像**全局的白板**。任何组件都可以在上面写东西或读取内容，而且一旦内容变化，所有"正在看"这个白板的组件都会自动更新。

```javascript
// utils/cache.js
import { makeVar, useReactiveVar } from '@apollo/client';

// makeVar创建一个响应式变量
// 类似useState但可以在任何组件外访问/修改

// 创建响应式变量
export const themeVar = makeVar('light');          // 主题：light/dark
export const currentUserVar = makeVar(null);        // 当前用户
export const isSidebarOpenVar = makeVar(true);      // 侧边栏是否打开
export const notificationsVar = makeVar([]);        // 通知列表

// 封装成Hook，方便组件使用
export function useTheme() {
  const theme = useReactiveVar(themeVar);  // 订阅themeVar的变化
  const toggleTheme = useCallback(() => {
    themeVar(theme === 'light' ? 'dark' : 'light');  // 修改变量值
  }, [theme]);
  
  return { theme, toggleTheme };
}
```

```jsx
// 在组件中使用
function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { notifications, removeNotification } = useNotifications();
  const isSidebarOpen = useReactiveVar(isSidebarOpenVar);

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      <Header 
        onToggleTheme={toggleTheme} 
        onToggleSidebar={() => isSidebarOpenVar(!isSidebarOpen)} 
      />
      <main className={cn({ 'sidebar-open': isSidebarOpen })}>
        {/* 页面内容... */}
      </main>
      <NotificationContainer>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </NotificationContainer>
    </div>
  );
}
```

### 8. 分页 & 无限滚动

```jsx
import { useQuery } from '@apollo/client';

// 无限滚动列表
function InfinitePostList() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(INFINITE_POSTS, {
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
  });

  const items = data?.posts?.edges?.map(edge => edge.node) || [];
  const hasNextPage = data?.posts?.pageInfo?.hasNextPage;

  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {items.map(post => (
        <PostListItem key={post.id} post={post} />
      ))}
      
      {hasNextPage && (
        <button
          onClick={() => {
            fetchMore({
              variables: { after: data.posts.pageInfo.endCursor },  // 使用游标翻页
            });
          }}
          disabled={networkStatus === NetworkStatus.fetchMore}
        >
          {networkStatus === NetworkStatus.fetchMore ? '加载中...' : '加载更多'}
        </button>
      )}
    </div>
  );
}
```

---

## 🛡️ 高级模式与最佳实践

### 1. 代码组织 (Colocation)

> **最佳实践**：把相关的文件放在一起（功能内聚），而不是按文件类型分散。

```
src/
├── features/
│   ├── post/                        # 文章功能模块
│   │   ├── components/              # 该功能的组件
│   │   │   ├── PostList.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── CreatePostForm.jsx
│   │   ├── queries/                 # 该功能的GraphQL查询
│   │   │   ├── GET_POSTS.graphql
│   │   │   ├── CREATE_POST.graphql
│   │   │   └── fragments.graphql
│   │   ├── hooks/                   # 该功能的自定义Hooks
│   │   │   ├── useCreatePost.js
│   │   │   └── usePostsPagination.js
│   │   └── index.js                 # 统一导出
│   │
│   └── user/                        # 用户功能模块
│       └── ...
│
├── graphql/
│   ├── client.js                    # ApolloClient实例
│   ├── cache.js                     # 缓存配置
│   └── types.ts                     # TypeScript类型（由codegen生成）
│
└── pages/
    └── ...
```

### 2. TypeScript 集成 (GraphQL Code Generator)

> **为什么需要代码生成？** 因为GraphQL查询返回的数据类型由Schema决定，手写容易出错。代码生成工具可以自动根据你的查询语句生成TypeScript类型。

```bash
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

```yaml
# codegen.yml —— 代码生成配置
schema: http://localhost:4000/graphql  # Schema地址
documents: './src/**/*.graphql'         # 查询文件的位置

generates:
  ./src/generated/graphql.tsx:         # 生成的文件路径
    plugins:
      - 'typescript'                   # 生成TypeScript类型
      - 'typescript-operations'        # 生成操作类型
      - 'typescript-react-apollo'      # 生成React Apollo Hooks
    config:
      withHooks: true                  # 生成Hooks
      withHOC: false
      withComponent: false
      apolloImportFrom: '@apollo/client'
```

```bash
# 执行生成
npx graphql-codegen --config codegen.yml
```

```tsx
// 生成的Hooks具有完整的类型推断！
import { useGetPostsQuery, useCreatePostMutation } from '../generated/graphql';

function TypedExample() {
  // 所有variables和result都是类型安全的
  const { data, loading } = useGetPostsQuery({
    variables: { page: 1, pageSize: 10 },
  });
  
  // IDE会自动补全，且不会拼错字段名
  const title = data?.posts?.edges?.[0]?.node?.title ?? '';
}
```

### 3. Auth & Token Refresh (自动续期)

```javascript
// links/auth-link.js
// 自动刷新Token的Link
// 当Token过期时，自动尝试刷新，而不是直接跳转登录

let isRefreshing = false;       // 是否正在刷新Token
let pendingRequests = [];       // 等待Token刷新的请求队列

const authLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // 检测到Token过期
  if (graphQLErrors?.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
    
    if (isRefreshing) {
      // 正在刷新中：把请求加入等待队列
      return fromPromise(
        new Promise((resolve) => {
          pendingRequests.push({ resolve, operation, forward });
        }).then(() => forward(operation))
      );
    } else {
      // 开始刷新Token
      isRefreshing = true;
      
      return fromPromise(
        refreshAuthToken()  // 调用刷新Token的接口
          .then(newToken => {
            setAuthToken(newToken);
            // Token刷新成功，重试所有排队的请求
            pendingRequests.forEach(({ resolve }) => resolve());
            pendingRequests = [];
            return forward(operation);
          })
          .catch(refreshError => {
            // 刷新也失败，跳转登录
            pendingRequests.forEach(({ resolve }) => resolve());
            redirectToLogin();
            return;
          })
          .finally(() => {
            isRefreshing = false;
          })
      );
    }
  }
});

export default authLink;
```

---

## 🧪 测试Apollo组件

```jsx
// __tests__/PostList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';  // Apollo提供的Mock工具
import { GET_POSTS } from '../features/post/queries';
import PostList from '../features/post/components/PostList';

// 准备Mock数据
const mocks = [
  {
    request: {
      query: GET_POSTS,
      variables: { page: 1, pageSize: 10 },
    },
    result: {
      data: {
        posts: {
          totalCount: 1,
          pageInfo: { hasNextPage: false },
          edges: [
            { 
              node: { 
                id: '1', 
                title: 'Test Post', 
                __typename: 'Post' 
              }, 
              __typename: 'PostEdge' 
            },
          ],
        },
      },
    },
  },
];

test('正确渲染文章列表', async () => {
  // 用MockedProvider包裹组件，提供Mock数据
  render(
    <MockedProvider mocks={mocks} addTypename={true}>
      <PostList />
    </MockedProvider>
  );

  // 等待加载完成
  await waitFor(() => {
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
```

---

## ⚠️ 常见错误与最佳实践

### 常见错误

#### 错误1：忘记加 `__typename`

```jsx
// ❌ 错误：Mock数据中缺少__typename
const mock = {
  result: { data: { user: { id: '1', name: 'Tom' } } }
};

// ✅ 正确：Apollo需要__typename来识别缓存对象
const mock = {
  result: { 
    data: { 
      user: { id: '1', name: 'Tom', __typename: 'User' } 
    } 
  }
};
```

#### 错误2：缓存策略选错

```jsx
// ❌ 错误：实时数据用cache-first
const { data } = useQuery(GET_LATEST_PRICE, {
  fetchPolicy: 'cache-first',  // 股票价格等实时数据不应该缓存！
});

// ✅ 正确：实时数据用network-only或cache-and-network
const { data } = useQuery(GET_LATEST_PRICE, {
  fetchPolicy: 'network-only',
});
```

#### 错误3：Mutation后不更新缓存

```jsx
// ❌ 错误：删除文章后列表不更新
const [deletePost] = useMutation(DELETE_POST, {
  // 没有update函数！删除后缓存中的数据没变
});

// ✅ 正确：手动从缓存中移除已删除的文章
const [deletePost] = useMutation(DELETE_POST, {
  update(cache, { data: { deletePost: deletedId } }) {
    cache.modify({
      fields: {
        posts(existingPosts, { readField }) {
          return {
            ...existingPosts,
            edges: existingPosts.edges.filter(
              edge => readField('id', edge.node) !== deletedId
            ),
          };
        },
      },
    });
  },
});
```

### 最佳实践总结

| 实践 | 说明 |
|------|------|
| **按功能组织代码** | 相关的查询、组件、Hooks放在一起 |
| **使用Fragment** | 避免重复写相同的字段 |
| **选择正确的缓存策略** | 静态数据用cache-first，实时数据用network-only |
| **乐观UI** | 用户体验好，但要注意错误回滚 |
| **TypeScript + Code Generator** | 自动生成类型，减少手写错误 |
| **错误处理** | 在errorLink中统一处理，组件中也要有降级UI |

---

## 📝 练习题

### 练习1（基础）：使用useQuery获取数据
实现一个"用户列表"组件：
1. 定义一个GraphQL查询，获取用户列表（id、name、email）
2. 使用useQuery发送查询
3. 显示加载状态（Skeleton）
4. 显示错误状态（带重试按钮）
5. 显示用户列表

### 练习2（进阶）：实现带乐观UI的点赞功能
1. 创建一个文章卡片组件，显示标题和点赞数
2. 点击点赞按钮时：
   - 使用optimisticResponse立即更新点赞数
   - 发送mutation到服务器
   - 如果失败，回滚到之前的状态
3. 点赞按钮有"已点赞"和"未点赞"两种样式

### 练习3（高级）：构建实时聊天应用
实现：
1. **Subscription**实现消息实时接收
2. **乐观UI**实现消息发送（发送后立即显示，带"发送中"状态）
3. **缓存更新**确保新消息出现在列表中
4. **离线支持**离线时消息排队，上线后自动发送

---

## 🔗 相关资源

- [Apollo Client官方文档](https://www.apollographql.com/docs/react/)
- [GraphQL官网](https://graphql.org/)
- [GraphQL Spec](https://spec.graphql.org/)
- [GraphiQL (在线IDE)](https://graphiql.online/)
- [Apollo Sandbox](https://www.apollographql.com/docs/tools/sandbox/)
- [How to GraphQL (免费教程)](https://www.howtographql.com/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [Apollo Federation (微服务)](https://www.apollographql.com/docs/federation/)

---

[← 27 - PWA离线应用](../27-pwa/) | [→ 29 - React Native移动端](../29-react-native/)
