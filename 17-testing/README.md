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

## 🧪 测试调试技巧与高级实践

### 1. 测试失败时的排查方法论

#### 看懂 Jest 的错误输出（Expected vs Received）

Jest 断言失败时，输出格式非常关键：

```
  ● Button > should display correct text

    expect(received).toBe(expected) // Object.is equality

    Expected: "Submit"
    Received: "submit"

      23 |     expect(button).toHaveTextContent('Submit');
    > 24 |     expect(screen.getByRole('button')).toHaveTextContent('Submit');
         |                                              ^
      25 |   });
```

💡 **排查步骤：**

| 关键信息 | 含义 | 排查方向 |
|---------|------|---------|
| `Expected` | 你期望的值 | 检查测试期望是否正确 |
| `Received` | 实际得到的值 | 检查组件逻辑是否正确 |
| 行号+高亮 | 断言所在位置 | 定位到具体断言语句 |
| diff 区域 | 两者的差异 | 找出具体不同的字段 |

⚠️ **常见误区：** 不要只看 `Expected` 和 `Received`，还要注意 diff 输出——对于大对象差异，diff 区域最有价值。可以添加 `--verbose` 参数让输出更详细。

#### "finds nothing" 类错误的排查步骤

当 `getByRole` / `getByText` 找不到元素时：

```
TestingLibraryElementError: Unable to find an element with the role "button"

⟨body⟩
  ⟨div⟩
    ⟨p⟩Some text⟨/p⟩
  ⟨/div⟩
```

📋 **排查清单：**

1. **组件是否渲染了？** — 先用 `screen.debug()` 打印整个 DOM
2. **元素是否存在？** — 用 `queryBy`（不抛错，返回 null）确认
3. **选择器是否正确？** — 用 `screen.getByRole('button')` 替代 `getByTestId`
4. **是否在异步渲染完成前查询？** — 用 `findBy` 或 `waitFor` 等待
5. **是否有条件渲染？** — 确认传入的 props 能触发正确的渲染分支

```tsx
// 调试技巧：打印当前 DOM 树
it('debugging demo', () => {
  render(<MyComponent isLoading={true} />);
  screen.debug();           // 打印整个 DOM
  screen.debug(screen.getByRole('status')); // 打印特定元素
});
```

#### "act()" 警告的原理和解决

```
Warning: An update to MyComponent inside a test was not wrapped in act(...).
```

💡 **原因：** React 在测试中追踪状态更新，当你触发了一个异步操作（如 fetch、setTimeout），React 无法自动等到它完成。

✅ **解决方案：**

```tsx
// 方案 1：用 waitFor 包裹断言（推荐）
await waitFor(() => {
  expect(screen.getByText('数据加载完成')).toBeInTheDocument();
});

// 方案 2：用 findBy（内置 waitFor）
const element = await screen.findByText('数据加载完成');
expect(element).toBeInTheDocument();

// 方案 3：用 act 包裹手动状态更新
import { act } from '@testing-library/react';

act(() => {
  // 触发会引发状态更新的操作
  fireEvent.click(button);
});
```

#### 测试超时的常见原因和解决

| 原因 | 症状 | 解决方案 |
|------|------|---------|
| 异步操作未 mock | `Timeout - async callback was not invoked within 5000ms` | Mock `fetch` / `axios` |
| `waitFor` 未等到元素 | `waiting for element timed out` | 增加 timeout 或检查渲染逻辑 |
| `findBy` 找不到元素 | `Unable to find an element` | 检查条件渲染逻辑 |
| 定时器未清理 | 测试挂起不结束 | 用 `jest.useFakeTimers()` |

```tsx
// 自定义 waitFor 超时时间
await waitFor(() => {
  expect(screen.getByText('加载完成')).toBeInTheDocument();
}, { timeout: 5000 }); // 默认 1000ms，可适当增加

// jest.config 中全局设置
// testTimeout: 10000
```

#### 如何调试失败的测试

```bash
# 只运行一个测试文件
npx jest src/components/Button.test.tsx

# 只运行一个测试用例（匹配名称）
npx jest -t "should display correct text"

# 使用 --verbose 查看详细输出
npx jest --verbose

# 运行后不退出（watch 模式）
npx jest --watch
```

🔧 **VS Code 调试配置**（`.vscode/launch.json`）：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest: Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "${relativeFile}"],
      "console": "integratedTerminal"
    }
  ]
}
```

> 💡 推荐安装 VS Code 扩展：**Jest Runner**，可以右键单个测试直接运行或调试。

---

### 2. Mock 的高级用法

#### jest.fn() / jest.spyOn() / jest.mock() 的区别

```
┌──────────────────────────────────────────────────────┐
│              Mock 三兄弟的区别                         │
├──────────────┬───────────────────────────────────────┤
│  jest.fn()   │ 创建一个全新的空 Mock 函数             │
│              │ 用途：替换回调函数 props               │
├──────────────┼───────────────────────────────────────┤
│ jest.spyOn() │ 在真实对象上"偷听"一个方法             │
│              │ 用途：想保留原函数行为 + 记录调用信息   │
├──────────────┼───────────────────────────────────────┤
│ jest.mock()  │ 替换整个模块                           │
│              │ 用途：Mock 第三方库（axios / fetch 等） │
└──────────────┴───────────────────────────────────────┘
```

```tsx
// 1. jest.fn() —— 创建空 Mock
const handleClick = jest.fn();
handleClick('arg1', 'arg2');
expect(handleClick).toHaveBeenCalledWith('arg1', 'arg2');

// 2. jest.spyOn() —— 偷听真实方法
const utils = { formatDate: (d) => d.toISOString() };
const spy = jest.spyOn(utils, 'formatDate');
utils.formatDate(new Date());
expect(spy).toHaveBeenCalledTimes(1);
spy.mockRestore(); // 恢复原方法

// 3. jest.mock() —— 替换整个模块
jest.mock('../services/api');
// 之后所有 import 该模块的代码都会使用 Mock 版本
```

#### Mock 模块的隔离范围

```
⚠️  Mock 作用域规则：

┌─────────────────────────────────────────────────┐
│  jest.mock('module')  →  作用范围：整个 describe │
│                                                 │
│  jest.mock('module', factory)                   │
│    → 被提升到文件顶部（hoisting）                │
│    → 不能放在 if/条件语句中！                     │
│                                                 │
│  jest.requireActual('module')                   │
│    → 在 mock 中使用真实模块的部分功能             │
└─────────────────────────────────────────────────┘
```

```tsx
// 部分模拟（Partial Mock）：保留真实模块，只 Mock 某些导出
jest.mock('../services/api', () => {
  const actual = jest.requireActual('../services/api');
  return {
    ...actual,               // 保留所有原始导出
    fetchData: jest.fn(),     // 只 Mock 这一个函数
  };
});
```

#### Mock 定时器（jest.useFakeTimers）

```tsx
describe('倒计时组件', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // 所有定时器变为可控的
  });

  afterEach(() => {
    jest.useRealTimers(); // 恢复真实定时器
  });

  it('每秒倒计时一次', () => {
    render(<Countdown seconds={10} />);

    // 初始状态
    expect(screen.getByText('10')).toBeInTheDocument();

    // 快进 3 秒
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('7')).toBeInTheDocument();

    // 快进到 0
    act(() => {
      jest.advanceTimersByTime(7000);
    });
    expect(screen.getByText('时间到！')).toBeInTheDocument();
  });

  it('处理 setInterval 循环', () => {
    const callback = jest.fn();
    setInterval(callback, 1000);

    // 快进 5 秒
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(callback).toHaveBeenCalledTimes(5);
  });
});
```

#### Mock fetch / axios 的最佳方式

💡 **推荐方式：MSW（Mock Service Worker）**

MSW 在网络层面拦截请求，不依赖 Jest mock，更接近真实场景：

```bash
npm install -D msw
npx msw init public/ --save  # 初始化 Service Worker
```

```tsx
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ]);
  }),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@test.com') {
      return HttpResponse.json({ token: 'fake-token' });
    }
    return HttpResponse.json({ error: '认证失败' }, { status: 401 });
  }),
];
```

```tsx
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```tsx
// src/test/setup.ts（测试入口）
import { server } from '../mocks/server';

// 所有测试开始前启动 MSW
beforeAll(() => server.listen());

// 每个测试后重置 handler
afterEach(() => server.resetHandlers());

// 所有测试结束后关闭
afterAll(() => server.close());
```

```tsx
// 测试文件中使用 —— 可以针对单个测试覆盖 handler
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

it('显示用户列表', async () => {
  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('张三')).toBeInTheDocument();
  });
});

it('处理加载失败', async () => {
  // 针对这个测试覆盖 handler
  server.use(
    http.get('/api/users', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/加载失败/i)).toBeInTheDocument();
  });
});
```

⚠️ **传统 Mock fetch 的方式（简单场景）：**

```tsx
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('mock fetch 简单示例', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'hello' }),
  });

  // ... 运行测试
});
```

#### 验证 Mock 函数的调用信息

```tsx
const mockFn = jest.fn();

mockFn('arg1', 'arg2');
mockFn('arg3');

// 验证调用次数
expect(mockFn).toHaveBeenCalledTimes(2);

// 验证最后一次调用参数
expect(mockFn).toHaveBeenLastCalledWith('arg3');

// 验证特定一次调用的参数
expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1', 'arg2');

// 获取所有调用记录
expect(mockFn.mock.calls).toEqual([
  ['arg1', 'arg2'],
  ['arg3'],
]);

// 获取所有返回值
expect(mockFn.mock.results).toEqual([
  { type: 'return', value: undefined },
  { type: 'return', value: undefined },
]);

// 设置返回值
mockFn.mockReturnValueOnce('first').mockReturnValueOnce('second').mockReturnValue('default');
mockFn(); // 'first'
mockFn(); // 'second'
mockFn(); // 'default'
mockFn(); // 'default'
```

#### 部分模拟（Partial Mock）的技巧

```tsx
// 场景：一个工具模块，只想 Mock 其中一个函数
// utils/helpers.ts
export function formatDate(date) { /* 真实实现 */ }
export function formatCurrency(amount) { /* 真实实现 */ }
export function calculateTax(price, rate) { /* 真实实现 */ }

// 测试文件
jest.mock('../utils/helpers', () => {
  const actual = jest.requireActual('../utils/helpers');
  return {
    ...actual,
    // 只 mock 这个函数，保留其他函数的真实实现
    calculateTax: jest.fn().mockReturnValue(0),
  };
});

it('uses real formatDate but mocked calculateTax', () => {
  const result = processOrder({
    date: new Date('2024-01-01'),
    price: 100,
  });
  // formatDate 使用真实逻辑
  expect(result.dateStr).toBe('2024-01-01');
  // calculateTax 被 mock 了
  expect(result.tax).toBe(0);
});
```

---

### 3. React Testing Library 的进阶技巧

#### findBy vs getBy vs queryBy 的选择决策树

```
你要查询一个元素？
│
├─ 元素应该已经存在（同步渲染）
│   ├─ 找不到应该报错 → getBy...（默认选择）
│   └─ 找不到应该返回 null → queryBy...（判断"不存在"时用）
│
└─ 元素可能稍后才出现（异步渲染）
    └─ 等待元素出现 → findBy...（异步，默认等 1000ms）

特殊变体：
├─ getAllBy...   → 返回数组，匹配多个元素
├─ queryAllBy... → 返回数组，找不到返回空数组
└─ findAllBy...  → 异步返回数组
```

```tsx
// getBy：元素必须存在，否则立即报错
expect(screen.getByRole('heading')).toBeInTheDocument();

// queryBy：用于判断"元素不存在"的场景
expect(screen.queryByText('错误消息')).not.toBeInTheDocument(); // ✅
// 注意：用 getBy 在元素不存在时会直接报错，无法到达 .not.toBeInTheDocument

// findBy：等待异步元素出现
const submitBtn = await screen.findByRole('button', { name: /提交/i });
```

#### waitFor 的超时和重试机制

```
waitFor 内部工作原理：

┌──────────────┐
│  检查断言     │ ← 每隔 ~50ms 检查一次
└──────┬───────┘
       │
       ├─ 断言通过 → ✅ 测试通过
       │
       ├─ 断言失败 → 重试（最多重试到 timeout）
       │
       └─ 超时 → ❌ 抛出错误
```

```tsx
// 默认配置
await waitFor(() => {
  expect(screen.getByText('加载完成')).toBeInTheDocument();
}, {
  timeout: 1000,    // 超时时间（默认 1000ms）
  interval: 50,     // 重试间隔（默认 50ms）
});

// waitFor 的最佳实践：只包裹会变化的断言
// ✅ 好的做法
await waitFor(() => {
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

// ❌ 不好的做法：包裹了不该等待的断言
await waitFor(() => {
  expect(screen.getByText('标题').toBeInTheDocument()); // 这个一开始就在，不需要等
  expect(screen.getByText('异步数据').toBeInTheDocument()); // 才是需要等的
});
```

#### userEvent vs fireEvent 的区别

```
┌────────────────────────────────────────────────────────┐
│          fireEvent    vs    userEvent                   │
├───────────────────┬────────────────────────────────────┤
│ 触发 DOM 事件     │ 模拟真实用户操作                     │
│ fire事件.change() │ user.type() 模拟逐字符输入           │
│ fire事件.click()  │ user.click() 包含 focus/blur 等过程 │
│ 不触发所有相关事件 │ 更接近真实浏览器行为                 │
│ ⚡ 速度快          │ 🐢 稍慢但更准确                     │
├───────────────────┼────────────────────────────────────┤
│ 适用场景：         │ 适用场景：                           │
│ 简单的单元测试     │ 表单交互、复杂用户流程               │
│ 性能敏感的测试     │ ⭐ 推荐！大多数情况下优先使用         │
└───────────────────┴────────────────────────────────────┘
```

```tsx
import userEvent from '@testing-library/user-event';

it('fireEvent vs userEvent 的区别', async () => {
  const user = userEvent.setup();
  render(<SearchInput />);

  // ❌ fireEvent：只触发一次 change 事件
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });

  // ✅ userEvent：逐字符输入，触发完整的键盘事件链
  await user.type(screen.getByRole('textbox'), 'hello');
  // 实际触发：focus → keydown → keypress → input → keyup (× 5次)
});
```

#### 测试异步组件的正确姿势（Loading → Success → Error）

```tsx
// 待测组件
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div role="status">加载中...</div>;
  if (error) return <div role="alert">加载失败: {error.message}</div>;
  return <div>{user.name}</div>;
}

// 完整测试 —— 覆盖三种状态
describe('UserProfile 三种状态', () => {
  it('显示加载状态', () => {
    render(<UserProfile userId={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('加载中');
  });

  it('加载成功后显示用户名', async () => {
    // Mock 成功响应
    jest.spyOn(api, 'fetchUser').mockResolvedValue({ name: '张三' });

    render(<UserProfile userId={1} />);

    // 等待加载完成，验证用户名
    expect(await screen.findByText('张三')).toBeInTheDocument();
    // 加载状态应该消失
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('加载失败后显示错误信息', async () => {
    // Mock 失败响应
    jest.spyOn(api, 'fetchUser').mockRejectedValue(new Error('网络错误'));

    render(<UserProfile userId={1} />);

    // 等待错误信息出现
    expect(await screen.findByRole('alert')).toHaveTextContent('网络错误');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
```

#### 测试表单提交的完整流程

```tsx
it('完整表单提交流程', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<ContactForm onSubmit={onSubmit} />);

  // 第 1 步：填写表单
  await user.type(screen.getByLabelText('姓名'), '张三');
  await user.type(screen.getByLabelText('邮箱'), 'zhangsan@test.com');
  await user.type(screen.getByLabelText('手机'), '13800138000');
  await user.selectOptions(screen.getByLabelText('城市'), '北京');

  // 第 2 步：提交
  await user.click(screen.getByRole('button', { name: /提交/i }));

  // 第 3 步：验证调用
  expect(onSubmit).toHaveBeenCalledWith({
    name: '张三',
    email: 'zhangsan@test.com',
    phone: '13800138000',
    city: '北京',
  });
});

it('表单验证失败时不提交', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<ContactForm onSubmit={onSubmit} />);

  // 不填必填项，直接提交
  await user.click(screen.getByRole('button', { name: /提交/i }));

  // 应该显示验证错误
  expect(screen.getByText('请输入姓名')).toBeInTheDocument();
  expect(screen.getByText('请输入邮箱')).toBeInTheDocument();

  // onSubmit 不应该被调用
  expect(onSubmit).not.toHaveBeenCalled();
});
```

#### 测试 Modal / Dialog / Portal 的技巧

```tsx
// Modal 组件
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div role="dialog" aria-modal="true" data-testid="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} aria-label="关闭">✕</button>
        {children}
      </div>
    </div>,
    document.body  // Portal 挂载到 body
  );
}

// 测试 Modal
describe('Modal Component', () => {
  beforeEach(() => {
    // 创建 Portal 挂载点
    document.body.innerHTML = '';
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  });

  it('不渲染任何内容当 isOpen=false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal 内容</p>
      </Modal>
    );

    // container 只有空的 root div
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('渲染内容到 Portal 当 isOpen=true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal 内容</p>
      </Modal>
    );

    // getByRole 会在整个 document 中查找（包括 Portal）
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal 内容')).toBeInTheDocument();
  });

  it('点击关闭按钮关闭 Modal', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>内容</p>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: /关闭/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

#### 测试路由相关组件

```tsx
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// 辅助函数：渲染带路由的组件
function renderWithRouter(
  ui: React.ReactElement,
  { route = '/', initialEntries = [route] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path={route} element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

// 测试：带有路由参数的页面
describe('UserProfilePage', () => {
  it('根据路由参数显示用户信息', async () => {
    jest.spyOn(api, 'fetchUser').mockResolvedValue({ id: 42, name: '张三' });

    // 使用 initialEntries 模拟进入 /users/42
    renderWithRouter(<UserProfilePage />, {
      route: '/users/:userId',
      initialEntries: ['/users/42'],
    });

    // 验证显示了对应用户
    expect(await screen.findByText('张三')).toBeInTheDocument();
  });
});

// 测试：导航行为
it('点击链接后导航到新页面', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>
  );

  // 在首页点击导航链接
  await user.click(screen.getByRole('link', { name: /个人中心/i }));

  // 验证导航到了个人中心页面
  await waitFor(() => {
    expect(screen.getByText(/个人资料/i)).toBeInTheDocument();
  });
});
```

---

### 4. 测试最佳实践与反模式

#### 测试行为而不是测试实现

```
❌ 测试实现细节（脆弱测试）：
  "按钮的 onClick 应该调用 handleDelete(42)"
  → 如果重构时把 onClick 改成 useCallback 或换了内部变量名，测试就挂了

✅ 测试行为（健壮测试）：
  "点击删除按钮后，该列表项应该从页面上消失"
  → 无论内部怎么重构，只要用户行为结果正确，测试就通过
```

```tsx
// ❌ 反模式：测试内部 state
it('更新内部的 count state', () => {
  render(<Counter />);
  // 直接访问组件内部 state —— 脆弱！
  expect(screen.getByTestId('count-display').textContent).toBe('1');
});

// ✅ 最佳实践：测试用户可见行为
it('点击 + 按钮后计数增加 1', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: /增加/i }));

  expect(screen.getByText('1')).toBeInTheDocument();
});
```

#### 测试金字塔在 React 项目中的应用

```
        /\           E2E（Playwright / Cypress）
       /  \          关键业务流程（登录、下单、支付）
      /────\         数量：5~10 个
     /      \
    /────────\      集成测试（RTL 多组件交互）
   /          \     用户流程级别的测试
  /────────────\    数量：20~50 个
 /              \
/________________\  单元测试（RTL 组件测试 + Jest 函数测试）
 Unit Tests        工具函数、单个组件、自定义 Hook
                    数量：100+ 个
```

#### 什么该测、什么不该测

| ✅ 该测 | ❌ 不该测 |
|---------|----------|
| 用户可见的 UI 行为 | 第三方库的内部逻辑 |
| 关键业务逻辑 | CSS 样式细节 |
| 表单验证规则 | React 内部机制（useState 更新时机） |
| 错误处理流程 | 路由配置是否正确（除非是自定义路由逻辑） |
| API 调用的参数和错误处理 | 已经被库测试覆盖的功能 |
| 组件的条件渲染（空状态、加载中、错误） | 简单的 getter / setter |

#### 测试命名规范

```tsx
// ✅ 好的命名 —— 描述行为和预期
describe('LoginForm', () => {
  it('显示邮箱和密码输入框', () => {});
  it('验证失败时显示错误提示', () => {});
  it('提交成功后调用 onLogin 并传递正确的参数', () => {});
  it('提交中禁用提交按钮并显示加载状态', () => {});
});

// ❌ 不好的命名 —— 描述实现
describe('LoginForm', () => {
  it('works correctly', () => {});         // 太模糊
  it('calls setState with error', () => {}); // 暴露实现
  it('test 1', () => {});                  // 无意义
});
```

#### 避免脆弱测试的技巧

```tsx
// ❌ 脆弱：依赖 DOM 结构和 CSS class
expect(container.querySelector('.btn-primary.btn-large')).toBeInTheDocument();
expect(screen.getByText('Hello').closest('.card').className).toContain('active');

// ✅ 健壮：使用语义化选择器
expect(screen.getByRole('button', { name: /提交/i })).toBeInTheDocument();
expect(screen.getByText('Hello')).toBeInTheDocument();
```

#### 测试覆盖率不是越高越好

```
⚠️ 覆盖率陷阱：

┌──────────────────────────────────────┐
│  100% 行覆盖 ≠ 100% 质量保障           │
│                                      │
│  例如这行代码：                       │
│    if (isAdmin) doSomething();       │
│                                      │
│  测试 isAdmin=true，行覆盖率 100%     │
│  但 isAdmin=false 的行为没有覆盖！     │
└──────────────────────────────────────┘
```

✅ **有意义覆盖率的判断标准：**
- 核心业务逻辑覆盖率 > 90%
- 工具函数覆盖率 > 90%
- UI 组件覆盖率 > 70%（关注用户行为路径）
- 样式和静态内容不需要测试

#### 常见反模式

```tsx
// ❌ 反模式 1：快照测试滥用
// 每次样式改一下就要更新快照，维护成本高
it('matches snapshot', () => {
  const { container } = render(<Header />);
  expect(container).toMatchSnapshot();
});

// ✅ 替代方案：验证关键 UI 元素
it('显示应用标题和导航链接', () => {
  render(<Header />);
  expect(screen.getByRole('heading', { name: /我的应用/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /首页/i })).toBeInTheDocument();
});

// ❌ 反模式 2：测试 CSS class 名
expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

// ❌ 反模式 3：过度使用 testid
// testid 不会随 UI 语义变化，容易与实际内容脱节
screen.getByTestId('submit-button-123');

// ✅ 推荐使用语义化查询
screen.getByRole('button', { name: /提交/i });
```

---

### 5. E2E 测试入门（Cypress / Playwright）

#### Cypress 和 Playwright 的选择对比

| 特性 | Cypress | Playwright |
|------|---------|------------|
| **浏览器支持** | Chrome, Firefox, Edge, WebKit | ⭐ 全部 + 移动端模拟 |
| **语言** | JavaScript/TypeScript | JS/TS + Python + Java + .NET |
| **运行速度** | ⚡ 快（同进程） | ⚡ 快（多浏览器并行） |
| **调试体验** | ✅ Time Travel, 自动截图 | ✅ Trace Viewer, 录屏 |
| **跨 Tab 测试** | ❌ 不支持 | ✅ 支持 |
| **iFrame 测试** | ⚠️ 有限支持 | ✅ 完整支持 |
| **CI 集成** | ✅ 成熟 | ✅ 成熟 |
| **学习曲线** | ⭐ 简单 | ⭐⭐ 稍高 |
| **推荐场景** | 中小型项目 | ⭐ 大型/多浏览器项目 |

> 💡 **建议：** 新项目推荐 **Playwright**——浏览器覆盖更全、API 更现代、支持并行执行。

#### 一个完整的 Cypress E2E 测试示例（登录流程）

```bash
# 安装 Cypress
npm install -D cypress
npx cypress open  # 打开测试运行器
```

```typescript
// cypress/e2e/login.cy.ts

describe('用户登录流程', () => {
  beforeEach(() => {
    // 每次测试前访问登录页
    cy.visit('/login');
  });

  it('显示登录表单', () => {
    cy.get('h1').should('contain', '登录');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', '登录');
  });

  it('空表单提交显示验证错误', () => {
    cy.get('button[type="submit"]').click();

    cy.get('.error-message')
      .should('have.length', 2)
      .first()
      .should('contain', '请输入邮箱');
  });

  it('错误密码显示提示', () => {
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('.toast-error', { timeout: 10000 })
      .should('be.visible')
      .and('contain', '邮箱或密码错误');
  });

  it('成功登录后跳转到首页', () => {
    // 填写表单
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('correctpassword');

    // 提交
    cy.get('button[type="submit"]').click();

    // 验证跳转
    cy.url().should('include', '/dashboard');

    // 验证显示用户信息
    cy.get('[data-testid="user-name"]').should('contain', '张三');

    // 验证 localStorage 中存储了 token
    cy.window().its('localStorage.token').should('exist');
  });

  it('记住登录状态（刷新后仍然登录）', () => {
    // 先登录
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('correctpassword');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');

    // 刷新页面
    cy.reload();

    // 应该仍然在 dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-name"]').should('contain', '张三');
  });
});
```

#### E2E 测试的最佳实践和注意事项

📋 **E2E 测试最佳实践：**

1. **使用专用的测试账号和数据**
   - 不要用生产数据
   - 每次测试前重置数据库状态（`cy.exec('npx prisma db seed')`）
   - 使用 `beforeEach` 建立干净的测试环境

2. **使用 data-testid 定位关键元素**
   ```tsx
   // 在 React 组件中
   <button data-testid="login-submit-btn">登录</button>

   // 在 Cypress 中
   cy.get('[data-testid="login-submit-btn"]').click();
   ```

3. **等待策略**：Cypress 有自动重试机制，但显式等待更可靠
   ```typescript
   cy.get('.loading-spinner').should('not.exist'); // 等待加载完成
   cy.get('.data-row', { timeout: 10000 }).should('have.length', 5);
   ```

4. **使用自定义命令减少重复**
   ```typescript
   // cypress/support/commands.ts
   Cypress.Commands.add('login', (email: string, password: string) => {
     cy.visit('/login');
     cy.get('input[name="email"]').type(email);
     cy.get('input[name="password"]').type(password);
     cy.get('button[type="submit"]').click();
     cy.url().should('include', '/dashboard');
   });

   // 在测试中使用
   cy.login('user@test.com', 'password');
   ```

5. **网络请求拦截（cy.intercept）**
   ```typescript
   // 拦截 API 请求，避免依赖后端
   cy.intercept('GET', '/api/users', { fixture: 'users.json' });
   cy.intercept('POST', '/api/login', { statusCode: 200, body: { token: 'xxx' } });
   ```

⚠️ **注意事项：**
- E2E 测试很慢，只覆盖核心流程（登录、注册、支付等）
- 避免 UI 细节测试（留给单元测试/集成测试）
- 在 CI 中使用 `--headless` 模式运行
- 失败时自动截图和录屏

#### CI 环境中运行 E2E 测试

```yaml
# GitHub Actions 中运行 Cypress E2E
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      # 安装 Cypress 浏览器
      - run: npx cypress install

      # 启动应用
      - run: npm run build
      - run: npm run start &
        env:
          PORT: 3000

      # 运行 E2E 测试
      - uses: cypress-io/github-action@v6
        with:
          start: npm run start
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          browser: chrome
          record: true  # 可选：记录到 Cypress Cloud
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

```yaml
# Playwright 的 CI 配置（更简单）
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - run: npx playwright install --with-deps

      - run: npx playwright test

      # 失败时上传报告
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

[→ 16 - TypeScript + React](../16-typescript-react/)
