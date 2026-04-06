# 28 - GraphQL 与 Apollo Client

## 🎯 本节目标
- 理解GraphQL的核心概念及其相对于REST的优势
- 掌握Apollo Client在React中的完整用法
- 构建高效、类型安全的前端数据层

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

---

## 🏗️ GraphQL基础

### 1. Schema 定义 (服务端)

```graphql
# schema.graphql (服务端定义)

# 标量类型
scalar DateTime
scalar Upload  # 文件上传

# 枚举
enum Role {
  ADMIN
  USER
  GUEST
}

enum OrderDirection {
  ASC
  DESC
}

# 输入类型(Create/Update操作的参数)
input CreateUserInput {
  name: String!
  email: String!
  password: String!
  avatar: Upload
  role: Role = USER
}

input UpdateUserInput {
  name: String
  email: String
  avatar: Upload
}

input PaginationInput {
  page: Int = 1
  pageSize: Int = 20
}

input UserFilterInput {
  search: String
  role: Role
  isActive: Boolean
  createdAfter: DateTime
}

# 类型定义
type User {
  id: ID!
  name: String!
  email: String!
  avatar: URL
  role: Role!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  posts(
    pagination: PaginationInput
    orderBy: PostOrderByInput
  ): PostConnection!  # 关联查询(嵌套)
  followersCount: Int!  # 计算字段(解析器中计算)
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  category: Category!
  tags: [Tag!]!
  comments(
    pagination: PaginationInput
  ): CommentConnection!
  viewCount: Int!
  createdAt: DateTime!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Query (读操作)
type Query {
  me: User  # 当前登录用户
  user(id: ID!): User
  users(filter: UserFilterInput, pagination: PaginationInput): UserConnection!
  post(id: ID!): Post
  posts(pagination: PaginationInput, filter: PostFilterInput): PostConnection!
  search(query: String!, limit: Int): SearchResultUnion!
}

# Mutation (写操作)
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createPost(title: String!, content: String!, categoryId: ID!): Post!
  likePost(postId: ID!): Post!
  followUser(userId: ID!): User!
}

# Subscription (实时订阅)
type Subscription {
  postCreated: Post!
  commentAdded(postId: ID!): Comment!
  userOnline(userId: ID!): User!
}

# Union (联合类型 - 用于搜索等多态返回)
union SearchResultUnion = User | Post | Tag
```

### 2. 查询语法示例

```graphql
# 基础查询 - 获取当前用户信息
query GetCurrentUser {
  me {
    id
    name
    email
    avatar
    role
    followersCount
    createdAt
  }
}

# 带变量的查询 - 分页获取文章列表
query GetPosts($page: Int!, $pageSize: Int!) {
  posts(pagination: { page: $page, pageSize: $pageSize }) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        id
        title
        content
        author {
          id
          name
          avatar
        }
        createdAt
      }
    }
  }
}
# Variables: { "page": 1, "pageSize": 10 }

# 嵌套查询 - 获取文章及评论(一次请求!)
query GetPostDetail($postId: ID!) {
  post(id: $postId) {
    id
    title
    content
    author {
      id
      name
      followersCount
    }
    category {
      id
      name
    }
    tags {
      id
      name
    }
    comments(pagination: { page: 1, pageSize: 5 }) {
      totalCount
      edges {
        node {
          id
          content
          author {
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

# 别名(Alias) - 同一查询获取不同参数的结果
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

# Fragment (片段) - 复用公共字段
fragment UserInfo on User {
  id
  name
  avatar
  role
}

query GetFollowers($userId: ID!) {
  user(id: $userId) {
    ...UserInfo
    followers(pagination: { pageSize: 20 }) {
      edges {
        node {
          ...UserInfo
        }
      }
    }
  }
}

# Directive (指令) - 条件包含/@skip/@include
query GetUser($userId: ID!, $withDetails: Boolean!) {
  user(id: $userId) {
    id
    name
    email
    ... on User {
      bio @include(if: $withDetails)  # 仅当withDetails=true时才请求bio
      posts(pagination: { pageSize: 3 }) {
        edges { node { id title } }
      }
    }
  }
}
```

---

## 🚀 Apollo Client 集成

### 1. 初始化配置

```bash
npm install @apollo/client graphql
```

```jsx
// apollo-client.js
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink,
  from,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';  // WebSocket订阅
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// HTTP连接(用于Query/Mutation)
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || '/graphql',
  credentials: 'same-origin',  // 发送Cookie
  headers: {
    // 可以在这里添加全局认证头
    // 'Authorization': `Bearer ${getToken()}`
  },
});

// WebSocket连接(用于Subscription)
const wsLink = new GraphQLWsLink(createClient({
  url: process.env.REACT_APP_WS_ENDPOINT || 'ws://localhost:4000/graphql',
  connectionParams: {
    // 认证参数
    authToken: localStorage.getItem('token'),
  },
  retryAttempts: 5,
}));

// 根据操作类型分流(Query/Mutation走HTTP, Subscription走WebSocket)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// 错误处理链路
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(`[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      
      // 处理特定错误码
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Token过期,尝试刷新
        return forward(operation);  // 或跳转到登录页
      }
      
      // 全局Toast提示
      toast.error(message);
    });
  }

  if (networkError) {
    console.error(`[Network Error]:`, networkError);
    
    if (networkError.statusCode === 401) {
      // 未授权
      redirectToLogin();
    }
    
    if (!navigator.onLine) {
      toast.warning('网络连接中断,请检查网络');
    }
  }
});

// 重试链路(针对网络错误自动重试)
const retryLink = new RetryLink({
  delay: {
    initial: 300,  // 初始延迟(ms)
    max: Infinity,  // 最大延迟
    jitter: true,  // 随机抖动避免同时重试风暴
  },
  attempts: {
    max: 3,  // 最大重试次数
    retryIf: (error, _operation) => {
      // 只重试网络错误和特定的服务端错误,不重试4xx
      return !!error && error.statusCode !== 422 && error.statusCode !== 401;
    },
  },
});

// 组合所有链接(执行顺序: error -> retry -> split(http/ws))
const link = from([errorLink, retryLink, splitLink]);

// 缓存配置(InMemoryCache)
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
            
            // 翻页:追加edges
            return {
              ...incoming,
              edges: [...(existing?.edges || []), ...incoming.edges],
            };
          },
          read(existing, { args }) {
            // 读取时按分页截取
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
        
        // 自定义排序/过滤
        sortedUsers: {
          read(_, { args, toReference }) {
            // 从缓存中读取所有User并排序
            return [];
          },
        },
      },
    },
    
    // 类型级别的key配置
    User: {
      keyFields: ['id'],  // 使用id作为唯一标识
      fields: {
        posts: {
          merge: false,  // 不合并,总是使用最新值
        },
      },
    },
    
    Post: {
      keyFields: ['id'],
    },
  },
  
  // 类型可能的Types(用于Interface/Union)
  possibleTypes: {
    SearchResultUnion: ['User', 'Post', 'Tag'],
  },
});

// 创建客户端实例
const client = new ApolloClient({
  link,
  cache,
  
  // 默认选项
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',  // 即使有错误也返回部分数据
      fetchPolicy: 'cache-and-network',  // 默认先缓存再网络
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutation: {
      errorPolicy: 'all',  // mutation也允许部分失败
    },
  },
  
  // DevTools集成
  connectToDevTools: process.env.NODE_ENV === 'development',
  
  // 认证相关(可选)
  assumeImmutableResults: true,  // 性能优化:假设缓存不会被外部修改
});

export default client;
```

```jsx
// index.jsx (入口文件)
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
```

### 2. 数据查询 Hooks

```jsx
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GET_POSTS, GET_POST_DETAIL, CREATE_POST, LIKE_POST } from './graphql/queries';

// 基础查询 - 文章列表
function PostList() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { loading, error, data, fetchMore, refetch, networkStatus } = useQuery(GET_POSTS, {
    variables: { page, pageSize: PAGE_SIZE },
    
    // 缓存策略
    fetchPolicy: 'cache-and-network',  // 选项: cache-first/cache-and-network/network-only/no-cache/cache-only
    nextFetchPolicy: 'cache-first',  // 下一次请求的策略
    
    // 轮询(用于实时性要求高的数据,如聊天消息)
    pollInterval: 0,  // ms, 0表示不轮询
    
    // 部分结果指示器
    partialRefetch: true,  // 缓存存在但变量变了也会发请求
    returnPartialData: true,  // 部分错误时仍返回数据
    
    // 通知渲染
    notifyOnNetworkStatusChange: true,  // networkStatus变化触发重新渲染(用于loading状态)
    
    // 错误策略(已在defaultOptions配置也可在此覆盖)
    errorPolicy: 'all',
  });

  if (loading && !data) {
    return <PostListSkeleton count={PAGE_SIZE} />;
  }

  if (error && !data) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  const posts = data.posts.edges.map(edge => edge.node);
  const { hasNextPage } = data.posts.pageInfo;

  return (
    <>
      <div className="post-list-header">
        <h2>文章列表 ({data.posts.totalCount})</h2>
        
        {networkStatus === NetworkStatus.refetch && <Spinner size="sm" />}
        
        <button 
          onClick={() => refetch()}  // 强制重新请求(忽略缓存)
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
      
      {/* 翻页 */}
      {hasNextPage && (
        <button
          onClick={() => {
            fetchMore({
              variables: { page: page + 1 },
              updateQuery: (prevResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prevResult;
                
                return {
                  posts: {
                    ...fetchMoreResult.posts,
                    edges: [
                      ...prevResult.posts.edges,
                      ...fetchMoreResult.posts.edges,
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

// 按需查询(Lazy Query) - 不在组件挂载时立即执行
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [search, { called, loading, data, error }] = useLazyQuery(SEARCH_QUERY, {
    variables: { query: searchTerm },
    debounce: 300,  // 防抖(需要额外配置或手动实现)
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // 手动触发查询
    if (value.length >= 2) {  // 至少输入2个字符才搜索
      search({ variables: { query: value } });
    }
  };

  return (
    <div>
      <input
        value={searchTerm}
        onChange={handleChange}
        placeholder="搜索用户或文章..."
      />
      
      {called && loading && <SearchResultSkeleton />}
      
      {data && <SearchResults results={data.search} />}
      
      {error && <ErrorMessage error={error} />}
    </div>
  );
}

// Mutation (写操作)
function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [createPost, { loading, error, reset }] = useMutation(CREATE_POST, {
    // 更新缓存的策略
    update(cache, { data: { createPost: newPost } }) {
      // 方法1: 手动更新缓存(精确控制)
      cache.modify({
        fields: {
          posts(existingPosts = {}) {
            const newPostRef = cache.writeFragment({
              data: newPost,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  content
                  createdAt
                  author {
                    id
                    name
                  }
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
    
    // 乐观UI (Optimistic Response)
    optimisticResponse: {
      createPost: {
        id: `temp-${Date.now()}`,
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
      setTitle('');
      setContent('');
      // 可选:导航到新文章页面
      // navigate(`/posts/${data.createPost.id}`);
    },
    
    // 错误回调
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
      reset();  // 重置mutation状态
    },
    
    // 错误策略(允许部分失败)
    errorPolicy: 'all',
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

// 点赞功能 (带乐观更新)
function LikeButton({ postId, initialLikes }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const [likePost] = useMutation(LIKE_POST, {
    variables: { postId },
    
    // 乐观UI:立即反映点赞效果,不用等服务器响应
    optimisticResponse: {
      likePost: {
        id: postId,
        likesCount: isLiked ? likesCount - 1 : likesCount + 1,
        __typename: 'Post',
      },
    },
    
    // 服务器响应到达后,如果乐观数据不对,会自动修正
    onError: (error) => {
      toast.error('操作失败,请重试');
      setIsLiked(!isLiked);  // 回滚
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    },
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    likePost();
  };

  return (
    <button onClick={handleLike} className={`like-btn ${isLiked ? 'liked' : ''}`}>
      ❤️ {likesCount}
    </button>
  );
}
```

### 3. Fragment 复用

```graphql
# graphql/fragments.graphql
fragment PostSummary on Post {
  id
  title
  excerpt
  featuredImage
  category {
    id
    name
    slug
  }
  author {
    id
    name
    avatar
  }
  createdAt
  stats {
    views
    likes
    comments
  }
}

fragment AuthorInfo on User {
  id
  name
  username
  avatar
  bio
  followersCount
  isFollowing: amIFollowing(meId: $currentUserId)  # 带变量的fragment(需要配置)
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

### 4. Subscription (实时订阅)

```jsx
import { useSubscription } from '@apollo/client';
import { POST_CREATED_SUBSCRIPTION } from './graphql/subscriptions';

function LiveFeed() {
  // 实时订阅新文章发布
  const { data, error, loading } = useSubscription(POST_CREATED_SUBSCRIPTION, {
    variables: { categoryId: selectedCategory },  // 过滤参数
    onData: ({ client, data }) => {
      // 收到新数据时的额外处理
      playNotificationSound();
      showToast(`新文章: ${data.data.postCreated.title}`);
    },
  });

  if (error) {
    // WebSocket断开等错误的处理
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

### 5. 本地状态管理 (Reactive Variables)

```javascript
// utils/cache.js (Apollo Reactive Variables)
import { makeVar, useReactiveVar } from '@apollo/client';

// 类似于useState但可以在任何组件外访问/修改,且能被Apollo追踪

// 主题
export const themeVar = makeVar('light');  // 'light' | 'dark'

// 当前用户(未持久化的敏感信息不建议放这里,用context更好)
export const currentUserVar = makeVar(null);

// UI状态(模态框、侧边栏等)
export const isSidebarOpenVar = makeVar(true);
export const activeModalVar = makeVar(null);

// 通知列表(纯本地状态)
export const notificationsVar = makeVar([]);

// 使用
export function useTheme() {
  const theme = useReactiveVar(themeVar);
  const toggleTheme = useCallback(() => {
    themeVar(theme === 'light' ? 'dark' : 'light');
  }, [theme]);
  
  return { theme, toggleTheme };
}

export function useNotifications() {
  const notifications = useReactiveVar(notificationsVar);
  
  const addNotification = useCallback((notification) => {
    notificationsVar([notification, ...notifications]);
  }, [notifications]);
  
  const removeNotification = useCallback((id) => {
    notificationsVar(notifications.filter(n => n.id !== id));
  }, [notifications]);
  
  const clearAll = useCallback(() => {
    notificationsVar([]);
  }, []);
  
  return { notifications, addNotification, removeNotification, clearAll };
}
```

```jsx
// 在组件中使用Reactive Variable
function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { notifications, removeNotification } = useNotifications();
  const isSidebarOpen = useReactiveVar(isSidebarOpenVar);

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      <Header onToggleTheme={toggleTheme} onToggleSidebar={() => isSidebarOpenVar(!isSidebarOpen)} />
      
      <main className={cn({ 'sidebar-open': isSidebarOpen })}>
        {/* ... */}
      </main>
      
      {/* Toast通知 */}
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

### 6. 分页 & 无限滚动 (结合虚拟列表)

```jsx
import { useInfiniteQuery, useQuery } from '@apollo/client';
import { FixedSizeList as List } from 'react-window';

// Apollo不支持内置的useInfiniteQuery(像React Query那样),但可以通过fetchMore实现类似效果
function InfinitePostList() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(INFINITE_POSTS, {
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
  });

  // 将edges转为扁平数组(给react-window用)
  const items = data?.posts?.edges?.map(edge => edge.node) || [];

  // 判断是否有下一页
  const hasNextPage = data?.posts?.pageInfo?.hasNextPage;

  // Item组件(react-window需要)
  const Row = useCallback(({ index, style }) => {
    const post = items[index];
    
    // 当滚动到最后几个item时,触发加载更多
    if (index === items.length - 5 && hasNextPage && networkStatus !== NetworkStatus.fetchMore) {
      fetchMore({
        variables: { after: data.posts.pageInfo.endCursor },
      });
    }

    if (!post) {
      return <div style={style}><Spinner /></div>;  // Loading placeholder
    }

    return (
      <div style={style}>
        <PostListItem post={post} />
      </div>
    );
  }, [items, hasNextPage, networkStatus, fetchMore, data]);

  if (error) return <ErrorMessage error={error} />;

  return (
    <div style={{ height: '80vh' }}>
      <List
        height={800}
        itemCount={hasNextPage ? items.length + 1 : items.length}  // +1 for loading indicator
        itemSize={150}  // 每行高度
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
```

---

## 🛡️ 高级模式与最佳实践

### 1. 代码组织 (Colocation)

```
src/
├── features/
│   ├── post/
│   │   ├── components/
│   │   │   ├── PostList.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── CreatePostForm.jsx
│   │   ├── queries/
│   │   │   ├── GET_POSTS.graphql
│   │   │   ├── GET_POST_DETAIL.graphql
│   │   │   ├── CREATE_POST.graphql
│   │   │   └── fragments.graphql
│   │   ├── mutations/
│   │   │   └── CREATE_POST_MUTATION.js  (如果逻辑复杂)
│   │   ├── hooks/
│   │   │   ├── useCreatePost.js  (封装mutation+乐观UI+缓存更新)
│   │   │   └── usePostsPagination.js
│   │   └── index.js  (统一导出)
│   │
│   └── user/
│       └── ...
│
├── graphql/
│   ├── client.js  (ApolloClient实例)
│   ├── cache.js  (缓存配置)
│   ├── links.js  (自定义Links)
│   └── types.ts  (由codegen生成的TypeScript类型)
│
└── pages/
    └── ...
```

### 2. TypeScript 集成 (GraphQL Code Generator)

```bash
# 安装代码生成工具
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

```yaml
# codegen.yml
schema: http://localhost:4000/graphql  # 或指向.schema文件
documents: './src/**/*.graphql'

generates:
  ./src/generated/graphql.tsx:
    plugins:
      - 'typescript'
      - 'typescript-operations'
      - 'typescript-react-apollo'
    config:
      withHooks: true
      withHOC: false
      withComponent: false
      apolloImportFrom: '@apollo/client'
      reactImportFrom: 'react'
      scalars:
        DateTime: string
        Upload: File
hooks:
  afterAllFileWrite:
    - prettier --write  # 自动格式化生成的文件
```

```bash
# 执行生成
npx graphql-codegen --config codegen.yml
```

```tsx
// 生成的Hooks具有完整的类型推断
import { useGetPostsQuery, useCreatePostMutation } from '../generated/graphql';

function TypedExample() {
  // 所有variables和result都是类型安全的!
  const { data, loading } = useGetPostsQuery({
    variables: { page: 1, pageSize: 10 },
  });
  
  // data.posts?.edges?.[0]?.node?.title 会自动补全且不会出错
  const title = data?.posts?.edges?.[0]?.node?.title ?? '';
  
  const [createPost] = useCreatePostMutation({
    variables: {
      input: {
        title: 'Test',  // 类型检查:必须是string!
        content: 'Content',  // 不能少字段!
      },
    },
    onCompleted: (res) => {
      // res.createPost?.author?.name 也是类型安全的
      console.log(res.createPost?.id);
    },
  });

  return <div>{title}</div>;
}
```

### 3. Auth & Token Refresh (自动续期)

```javascript
// links/auth-link.js
import { onError } from '@apollo/client/link/error';
import { fromPromise } from '@apollo/client';
import { getAuthToken, setAuthToken, refreshAuthToken } from './auth-utils';

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (error, token = null) => {
  pendingRequests.map(promises => promises[token ? resolve : reject](error));
  pendingRequests = [];
};

const authLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // 处理401未授权错误
  if (graphQLErrors?.some(err => err.extensions?.code === 'UNAUTHENTICATED') || networkError?.statusCode === 401) {
    
    // 如果正在刷新Token,排队等待
    if (isRefreshing) {
      return fromPromise(
        new Promise((resolve) => {
          pendingRequests.push({ resolve, operation, forward });
        }).then(() => forward(operation))
      );

    // 否则发起刷新
    } else {
      isRefreshing = true;
      
      return fromPromise(
        refreshAuthToken()  // 你的刷新逻辑(调用刷新接口)
          .then(newToken => {
            setAuthToken(newToken);
            resolvePendingRequests(null, newToken);
            
            // 重试原始请求,带上新Token
            operation.context.headers.Authorization = `Bearer ${newToken}`;
            return forward(operation);
          })
          .catch(refreshError => {
            resolvePendingRequests(refreshError);
            redirectToLogin();  // 刷新也失败,跳转登录
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

### 4. 离线支持 (Apollo Persisted Queries + Optimistic UI)

```javascript
// links/offline-link.js
import { ApolloLink, Observable } from '@apollo/client';
import { checkOnlineStatus, addToOfflineQueue, processOfflineQueue } from './offline-utils';

// 拦截Mutation并在离线时排队
const offlineMutationLink = new ApolloLink((operation, forward) => {
  // 只处理Mutation,Query走原来的逻辑
  if (operation.query.definitions[0].operation === 'mutation') {
    if (!navigator.onLine) {
      // 离线时,返回一个永不结束的Observable(保持乐观UI)
      return new Observable(observer => {
        // 加入离线队列
        addToOfflineQueue(operation).then(() => {
          observer.next({ data: operation.getContext().optimisticResponse });
          observer.complete();
        });
      });
    }
  }
  
  return forward(operation);
});

// 恢复联网时自动重放排队的请求
window.addEventListener('online', () => {
  processOfflineQueue();  // 逐个重放
});
```

---

## 🧪 测试Apollo Components

```jsx
// __tests__/PostList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_POSTS } from '../features/post/queries';
import PostList from '../features/post/components/PostList';

const MOCK_POSTS = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Content 1',
    author: { id: 'a1', name: 'Author 1', __typename: 'User' },
    __typename: 'Post',
  },
  // ...more mocks
];

const mocks = [
  {
    request: {
      query: GET_POSTS,
      variables: { page: 1, pageSize: 10 },
    },
    result: {
      data: {
        posts: {
          totalCount: 2,
          pageInfo: { hasNextPage: false, __typename: 'PageInfo' },
          edges: [
            { node: MOCK_POSTS[0], cursor: 'cursor-1', __typename: 'PostEdge' },
            { node: MOCK_POSTS[1], cursor: 'cursor-2', __typename: 'PostEdge' },
          ],
          __typename: 'PostConnection',
        },
      },
    },
  },
  // 还可以mock error的情况
  {
    request: {
      query: GET_POSTS,
    },
    error: new Error('Network Error'),
  },
];

test('正确渲染文章列表', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={true}>
      <PostList />
    </MockedProvider>
  );

  // 等待加载完成
  await waitFor(() => {
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
  });

  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});

test('显示错误状态', async () => {
  render(
    <MockedProvider mocks={[mocks[1]]} addTypename={true}>
      <PostList />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## 📝 练习任务

### 任务1:将REST API迁移到GraphQL
选取之前做的某个项目(如Todo或电商):
1. 设计完整的Schema(User/Todo/Product/Order等类型)
2. 使用Apollo Server搭建Graphql服务端(或使用mock数据)
3. 重构所有数据获取层为Apollo Client Hooks
4. 实现乐观UI(创建/删除/更新操作)
5. 对比迁移前后代码量和请求数量的变化

### 任务2:构建实时协作白板
实现:
1. **Subscription**实现光标位置实时同步
2. **Conflict Resolution**(多人同时编辑同一区域的冲突解决)
3. **离线绘制**(离线时的操作排队,上线后回放)
4. **Presence**(显示当前在线的用户列表)
5. **Undo/Redo** (Operation Transformation算法简化版)

### 任务3:GraphQL Gateway聚合多个微服务
搭建Apollo Federation(联邦):
1. **UserService** (用户认证/资料)
2. **ProductService** (商品CRUD)
3. **OrderService** (订单/支付)
4. **Gateway** (统一Schema,扩展类型)
5. **前端**透明调用,无需关心后端微服务划分

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
