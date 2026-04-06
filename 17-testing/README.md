# 17 - 单元测试 (Jest + React Testing Library)

## 🎯 本节目标
- 理解前端测试的重要性和测试策略
- 掌握 Jest 和 React Testing Library 的核心 API
- 学会编写可维护的组件测试和 Hook 测试
- 了解测试覆盖率、Mock 等高级主题

---

## 📖 前端测试概览

### 测试金字塔

```
        /\
       /  \     E2E Tests (端到端)
      /────\    少量（关键流程）
     /      \
    /────────\   Integration (集成测试)
   /          \  适量
  /────────────\
 /              \ Unit Tests (单元测试)
/________________\ 大量（基础保障）
```

### 各类测试对比

| 类型 | 范围 | 速度 | 示例工具 | 目标 |
|------|------|------|---------|------|
| **Unit** | 单个函数/Hook | ⚡⚡⚡ 最快 | Jest, RTL | 验证逻辑正确性 |
| **Component** | 组件渲染/交互 | ⚡⚡ 快 | RTL, Enzyme | 验证 UI 行为 |
| **Integration** | 多组件协作 | ⚡ 中等 | Cypress, Testing Lib | 验证功能完整性 |
| **E2E** | 完整应用 | 🐢 慢 | Cypress, Playwright | 模拟真实用户场景 |

---

## 🛠️ 工具链配置

### 安装依赖

```bash
# Create React App 已内置 Jest + RTL
# Vite 项目需要额外安装：
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
# 或使用 Jest:
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest
```

### 配置文件

#### Vitest 配置（推荐，Vite 项目）

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  test: {
    globals: true,
    environment: 'jsdom',           // DOM 环境
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

```typescript
// src/test/setup.ts
// 测试环境初始化
import '@testing-library/jest-dom';  // 扩展匹配器（如 toBeInTheDocument）

// Mock window.matchMedia（如果需要）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};
```

---

## ✅ 基础：核心 API 与模式

### 渲染组件

```tsx
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/Button';

describe('Button Component', () => {
  // 基本 render 测试
  it('renders with text content', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  // props 测试
  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    
    expect(container.firstChild).toHaveClass('btn-primary');
  });

  // disabled 状态
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 用户交互模拟

```tsx
describe('User Interactions', () => {
  // 设置 userEvent 实例（推荐方式）
  const user = userEvent.setup();

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();  // Mock 函数
    
    render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles form submission', async () => {
    const handleSubmit = jest.fn();

    render(
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter name" data-testid="name-input" />
        <button type="submit">Submit</button>
      </form>
    );

    await user.type(screen.getByPlaceholderText(/enter name/i), 'John Doe');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
```

### 查询元素的方法

```tsx
import { render, screen } from '@testing-library/react';

render(<MyComponent />);

// 1. 通过 Role 查询（推荐！语义化）
screen.getByRole('button');                    // 按钮
screen.getByRole('textbox');                    // 输入框
screen.getByRole('heading', { level: 2 });       // h2 标题
screen.getByRole('link', { name: /about/i });   // 链接
screen.getByRole('img', { name: 'logo' });      // 图片

// 2. 通过文本查询
screen.getByText('Hello World');                // 完全匹配
screenByText(/hello world/i);                   // 正则匹配
screen.getAllByText('Item');                     // 返回数组

// 3. 通过表单控件 Label
screen.getByLabelText('Username');               // 关联 label
screen.getByPlaceholderText('Search...');         // placeholder

// 4. 通过 test-id（最后手段）
screen.getByTestId('custom-element');            // data-testid="custom-element"

// 5. 变体：getBy vs queryBy vs findBy
getBy...    // 同步，找不到立即报错
queryBy...  // 同步，找不到返回 null
findBy...   // 异步，等待出现（默认 1000ms）
getAllBy... // 同步，返回所有匹配的数组
```

**选择建议优先级：**
```
getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId
```

---

## 🔧 实战：复杂组件测试

### 表单组件测试

```tsx
// components/LoginForm.tsx (待测组件)
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = '请输入邮箱';
    if (!password) newErrors.password = '请输入密码';
    else if (password.length < 6) newErrors.password = '密码至少6位';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        await onLogin({ email, password });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="login-form">
      {/* Email */}
      <div>
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-msg">{errors.password}</span>}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}

// LoginForm.test.tsx (测试文件)
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm Component', () => {
  const mockOnLogin = jest.fn().mockResolvedValue(undefined);  // 异步 mock
  
  beforeEach(() => {
    // 每个 it 之前重置 mocks
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      render(<LoginForm onLogin={mockOnLogin} />);
      
      await user.click(screen.getByRole('button', { name: /登录/i }));
      
      expect(screen.getByText('请输入邮箱')).toBeInTheDocument();
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('shows error when password is too short', async () => {
      const user = userEvent.setup();
      render(<LoginForm onLogin={mockOnLogin} />);

      await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
      await user.type(screen.getByLabelText(/密码/i), '123');
      await user.click(screen.getByRole('button'));

      expect(screen.getByText('密码至少6位')).toBeInTheDocument();
    });

    it('clears errors when input is corrected', async () => {
      const user = userEvent.setup();
      render(<LoginForm onLogin={mockOnLogin} />);

      // 先触发错误
      await user.click(screen.getByRole('button'));
      expect(screen.getByText('请输入邮箱')).toBeInTheDocument();

      // 输入正确的值
      await user.type(screen.getByLabelText(/邮箱/i), 'test@test.com');

      expect(screen.queryByText('请输入邮箱')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onLogin with correct credentials', async () => {
      const user = userEvent.setup();
      render(<LoginForm onLogin={mockOnLogin} />);

      await user.type(screen.getByLabelText(/邮箱/i), 'user@example.com');
      await user.type(screen.getByLabelText(/密码/i), 'password123');
      await user.click(screen.getByRole('button'));

      expect(mockOnLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      });
    });

    it('displays loading state during submission', async () => {
      // 创建一个长时间未 resolve 的 promise 来模拟网络请求
      let resolvePromise;
      mockOnLogin.mockReturnValue(new Promise(resolve => { resolvePromise = resolve; }));

      const user = userEvent.setup();
      render(<LoginForm onLogin={mockOnLogin} />);

      await user.type(screen.getByLabelText(/邮箱/i), 'user@test.com');
      await user.type(screen.getByLabelText(/密码/i), 'password');
      await user.click(screen.getByRole('button'));

      // 应该显示 loading 状态
      expect(screen.getByRole('button', { name: /登录中/i })).toBeDisabled();
      
      // 完成请求
      resolvePromise();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登录/i })).toBeEnabled();
      });
    });

    it('handles login failure gracefully', async () => {
      const error = new Error('Invalid credentials');
      mockOnLogin.mockRejectedValue(error);

      // 注意：实际项目中应该有 UI 展示错误信息
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const user = userEvent.setup();
      render(<LoginForm onLogin={mockOnLogin} />);

      await user.type(screen.getByLabelText(/邮箱/i), 'wrong@email.com');
      await user.type(screen.getByLabelText(/密码/i), 'wrongpass');
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for inputs', () => {
      render(<LoginForm onLogin={() => {}} />);
      
      expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    });

    it('has submit button with descriptive text', () => {
      render(<LoginForm onLogin={() => {}} />);
      
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    });
  });
});
```

### 列表与条件渲染

```tsx
// components/UserList.tsx
interface UserListProps {
  users: User[];
  isLoading?: boolean;
  error?: string | null;
  onSelectUser?: (userId: number) => void;
  emptyMessage?: string;
}

function UserList({ users, isLoading, error, onSelectUser, emptyMessage }: UserListProps) {
  if (isLoading && users.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!users.length) return <EmptyState message={emptyMessage || '暂无数据'} />;

  return (
    <ul role="list">
      {users.map(user => (
        <li key={user.id} onClick={() => onSelectUser?.(user.id)}>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </li>
      ))}
    </ul>
  );
}

// UserList.test.tsx
describe('UserList Component', () => {
  const mockUsers = [
    { id: 1, name: 'Alice', email: 'alice@test.com' },
    { id: 2, name: 'Bob', email: 'bob@test.com' },
  ];

  it('renders loading spinner when loading and no users', () => {
    render(<UserList users={[]} isLoading={true} />);
    
    // 假设 LoadingSpinner 有特定的 role 或 text
    expect(screen.getByRole('status')).toBeInTheDocument();  // 或其他标识
  });

  it('renders error message when error is provided', () => {
    render(<UserList users={[]} error="Network Error" />);
    
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('renders custom empty message when list is empty', () => {
    render(<UserList users={[]} emptyMessage="No users found" />);
    
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders list of users correctly', () => {
    const handleSelect = jest.fn();
    render(<UserList users={mockUsers} onSelectUser={handleSelect} />);
    
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    
    // 检查内容
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('calls onSelectUser when a user item is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = jest.fn();
    
    render(<UserList users={mockUsers} onSelectUser={handleSelect} />);
    
    await user.click(screen.getByText('Alice'));
    expect(handleSelect).toHaveBeenCalledWith(1);  // Alice's ID
  });
});
```

---

## 🪝 测试自定义 Hooks

### 使用 act 和 renderHook

```tsx
// hooks/useCounter.ts
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => Math.max(0, c - 1)), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}

// useCounter.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../hooks/useCounter';

describe('useCounter Hook', () => {
  it('should initialize with default value of 0', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });

  it('should initialize with provided initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });

  it('increments the count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements the count but not below 0', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(0);  // 不允许负数
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(5);  // 回到初始值 5
  });
});

// hooks/useFetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const json: T = await response.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// useFetch.test.tsx (需要 Mock fetch)
describe('useFetch Hook', () => {
  beforeEach(() => {
    // Mock fetch API
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();  // 清理 mocks
  });

  it('fetches data successfully', async () => {
    const mockData = [{ id: 1, title: 'Test' }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch<typeof mockData>('/api/items')
    );

    // 初始状态
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    // 等待异步操作完成
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/fail')
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('cancels request on unmount', async () => {
    let resolvePromise: (value: any) => void;
    (global.fetch as jest.Mock).mockReturnValueOnce(
      new Promise(resolve => { resolvePromise = resolve; })
    );

    const { unmount, waitForNextUpdate } = renderHook(() =>
      useFetch('/api/slow')
    );

    // 卸载组件
    unmount();

    // 完成 fetch（但不应更新 state）
    resolvePromise?.({ ok: true, json: async () => [] });

    // 不应再触发更新（因为没有 waitForNextUpdate 可用）
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🎭 高级技巧：Mocking & Stubbing

### Mock 外部模块

```tsx
// services/api.ts
export const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

// components/DataFetcher.tsx
import { fetchData } from '../services/api';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('/api/data').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
}

// DataFetcher.test.tsx - Mock API module
jest.mock('../services/api');  // 自动 mock 整个模块

import { fetchData } from '../services/api';
const mockedFetchData = fetchData as jest.MockedFunction<typeof fetchData>;

beforeEach(() => {
  mockedFetchData.mockClear();
});

it('displays fetched data', async () => {
  const testData = { items: [1, 2, 3] };
  mockedFetchData.mockResolvedValue(testData);  // 设置返回值

  render(<DataFetcher />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // 等待加载完成
  await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

  expect(screen.getByText(JSON.stringify(testData))).toBeInTheDocument();
  expect(mockedFetchData).toHaveBeenCalledWith('/api/data');
});
```

### Mock React Context

```tsx
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType>(undefined!);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// AuthContext.test.tsx
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// 创建一个包装 Provider 的辅助函数
const renderWithAuth = (ui: React.ReactElement, authOverrides?: Partial<AuthContextType>) => {
  return render(
    <AuthProvider {...(authOverrides || {})}>
      {ui}
    </AuthProvider>
  );
};

it('renders differently based on auth state', () => {
  // 未认证
  const { rerender } = renderWithAuth(<AuthAwareComponent />, {
    isAuthenticated: false
  });
  expect(screen.getByText('Please log in')).toBeInTheDocument();

  // 认证后
  rerender(
    <AuthProvider isAuthenticated={true} user={{ name: 'Admin' }}>
      <AuthAwareComponent />
    </AuthProvider>
  );
  expect(screen.getByText(/welcome, admin/i)).toBeInTheDocument();
});
```

### Mock Router (React Router)

```tsx
// 使用 MemoryRouter 替代 BrowserRouter 进行测试
import { MemoryRouter, Route, Routes } from 'react-router-dom';

test('navigates to profile after login', async () => {
  const user = userEvent.setup();
  
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>
  );

  // 登录操作...
  await user.fillForm(/* ... */);
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  // 验证导航到 /profile
  await waitFor(() => {
    expect(screen.getByText(/my profile/i)).toBeInTheDocument();
  });
});
```

---

## 📊 测试覆盖率与 CI/CD

### 配置覆盖阈值

```javascript
// package.json 或 vite/jest config
"vitest": {
  "coverage": {
    "thresholds": {
      "branches": 80,
      "functions": 90,
      "lines": 85,
      "statements": 85
    },
    "include": [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/test/**'
    ]
  }
}
```

### GitHub Actions 示例

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run build --if-present
      - run: npm test -- --coverage --watch=false
      
      # 上传覆盖率报告（可选）
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false
```

---

## 💡 最佳实践总结

### ✅ Do's（推荐做法）

1. **以用户视角编写测试**: 模拟真实用户行为（点击、输入），而不是测试内部实现细节
2. **优先使用 getByRole**: 让你的测试更接近无障碍访问标准
3. **每个测试只验证一件事**: 单一职责原则同样适用于测试
4. **使用描述性命名**: `it('renders user avatar when logged in')` 而不是 `it('works')`
5. **隔离外部依赖**: Mock API、数据库等，确保测试独立可靠
6. **清理副作用**: 在 afterEach 中重置全局状态或 mocks

### ❌ Don'ts（避免的做法）

1. **不要测试实现细节**: 如内部函数名、state 变量名等，这些可能重构时改变
2. **不要过度 Mock**: 只 mock 必要的外部依赖，过度 mock 会降低测试可信度
3. **不要忽略异步**: 使用 `waitFor`、`act` 正确处理异步代码和状态更新
4. **不要写脆弱的选择器**: 避免 CSS 类名或 DOM 结构作为主要查询方式（容易因重构而失败）
5. **不要忽略覆盖率**: 但也不要盲目追求 100% 覆盖率（边际效益递减）

---

## ✅ 阶段检查清单

- [ ] 能搭建完整的测试环境（Jest/Vitest + RTL）
- [ ] 熟练使用 render、screen、userEvent 等 API
- [ ] 掌握各种元素查询方法及其适用场景
- [ ] 能为复杂组件（如表单、列表）编写全面测试
- [ ] 会测试自定义 Hooks（包括异步 Hooks）
- [ ] 了解如何 Mock 外部依赖（API、Context、Router）
- [ ] 知道如何在 CI/CD 中集成测试并检查覆盖率

---

## 📝 练习任务

1. **Todo App 测试套件**: 为第 10 章的 Todo App 编写完整的测试（目标覆盖率 > 80%）
2. **TDD 开发实践**: 采用测试驱动开发的方式重构某个现有组件
3. **E2E 测试引入**: 为核心用户流程添加 Playwright/Cypress E2E 测试

---

[→ 16 - TypeScript + React](../16-typescript-react/)
