# 22 - React动画与交互效果

## 🎯 本节目标
- 掌握React中实现动画的多种方式
- 学会构建流畅的用户界面过渡效果
- 了解性能优化的动画实践

---

## 📖 React动画方案概览

### 方案对比

| 方案 | 适用场景 | 性能 | 复杂度 | 推荐度 |
|------|---------|------|--------|--------|
| CSS Transitions/Animations | 简单状态切换 | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Framer Motion | 复杂手势、布局动画 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| React Spring | 物理弹簧动画 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| GSAP | 时间线控制、复杂序列 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| CSS-in-JS (styled-components) | 样式驱动的动画 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## 🎨 CSS动画方案

### 1. CSS Transitions基础

```jsx
// ✅ 使用CSS类名切换实现过渡
function ToggleButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '关闭' : '打开'}
      </button>
      
      <div className={`panel ${isOpen ? 'open' : ''}`}>
        面板内容
      </div>
    </div>
  );
}

/* styles.css */
.panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.panel.open {
  max-height: 500px; /* 足够大的值 */
  opacity: 1;
}
```

### 2. CSSTransition组件(react-transition-group)

```bash
npm install react-transition-group
```

```jsx
import { useState } from 'react';
import { CSSTransition, SwitchTransition, TransitionGroup } from 'react-transition-group';

// ✅ 单个元素的进入/离开动画
function Modal({ isOpen, onClose, children }) {
  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="modal"
      unmountOnExit  // 离开后卸载DOM
    >
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content" 
          onClick={e => e.stopPropagation()}
        >
          {children}
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    </CSSTransition>
  );
}

/* modal.css */
.modal-enter { opacity: 0; transform: scale(0.9); }
.modal-enter-active { opacity: 1; transform: scale(1); transition: all 300ms; }
.modal-exit { opacity: 1; transform: scale(1); }
.modal-exit-active { opacity: 0; transform: scale(0.9); transition: all 300ms; }

// ✅ 列表项动画
function TodoList({ todos }) {
  return (
    <TransitionGroup component="ul" className="todo-list">
      {todos.map(todo => (
        <CSSTransition
          key={todo.id}
          timeout={500}
          classNames="todo-item"
        >
          <li className="todo-item">
            {todo.text}
            <button onClick={() => removeTodo(todo.id)}>删除</button>
          </li>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}

/* todo-item.css */
.todo-item-enter { opacity: 0; transform: translateX(-20px); }
.todo-item-enter-active { opacity: 1; transform: translateX(0); transition: all 500ms; }
.todo-item-exit { opacity: 1; transform: translateX(0); }
.todo-item-exit-active { opacity: 0; transform: translateX(20px); transition: all 500ms; }
```

### 3. 自定义CSS Transition Hook

```jsx
import { useState, useCallback, useRef } from 'react';

// ✅ 通用的CSS过渡Hook
function useCSSTransition(duration = 300) {
  const [phase, setPhase] = useState('idle'); // idle | entering | entered | exiting | exited
  
  const enter = useCallback(() => {
    setPhase('entering');
    
    // 触发重排以启动transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('entered');
      });
    });
  }, []);

  const exit = useCallback(() => {
    setPhase('exiting');

    setTimeout(() => {
      setPhase('exited');
    }, duration);
  }, [duration]);

  const classnames = [
    phase !== 'idle' && `transition-${phase}`,
  ].filter(Boolean).join(' ');

  return { phase, classnames, enter, exit };
}

// 使用
function AnimatedCard({ isVisible }) {
  const { classnames, enter, exit } = useCSSTransition(400);

  useEffect(() => {
    if (isVisible) {
      enter();
    } else {
      exit();
    }
  }, [isVisible]);

  return <div className={`card ${classnames}`}>卡片内容</div>;
}
```

---

## 🚀 Framer Motion (推荐用于复杂场景)

### 安装与基础用法

```bash
npm install framer-motion
```

```jsx
import { motion, AnimatePresence } from 'framer-motion';

// ✅ 基础动画属性
function BasicAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}     // 初始状态
      animate={{ opacity: 1, y: 0 }}       // 目标状态
      exit={{ opacity: 0, y: -20 }}        // 卸载动画
      transition={{ duration: 0.5 }}        // 过渡配置
    >
      带有淡入和上滑效果的元素
    </motion.div>
  );
}

// ✅ 悬停、点击等手势响应
function InteractiveCard({ title, content }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      whileTap={{ scale: 0.95 }}
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
    >
      <h3>{title}</h3>
      <p>{content}</p>
    </motion.div>
  );
}

// ✅ 列表动画(staggerChildren)
function StaggeredList({ items }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1  // 子元素依次延迟出现
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map(item => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### 2. 页面路由过渡动画

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';

// ✅ 页面切换动画
function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// 在App中使用
function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
```

### 3. 布局动画(Layout Animation)

```jsx
import { motion, LayoutGroup } from 'framer-motion';

// ✅ 自动处理布局变化的平滑过渡
function SortableGrid({ items }) {
  const [sortedItems, setSortedItems] = useState(items);

  const handleSort = () => {
    // 改变顺序后,Framer Motion会自动计算并应用动画
    setSortedItems([...sortedItems].reverse());
  };

  return (
    <LayoutGroup>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {sortedItems.map(item => (
          <motion.div
            key={item.id}
            layout  // 关键!启用layout动画
            layoutId={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: 16,
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            {item.content}
          </motion.div>
        ))}
      </div>
      
      <button onClick={handleSort}>翻转排序</button>
    </LayoutGroup>
  );
}

// ✅ 共享布局动画(元素在页面间移动)
function ProductList({ products, onSelect }) {
  return (
    <LayoutGroup>
      {products.map(product => (
        <motion.div
          key={product.id}
          layoutId={`product-${product.id}`}  // 共享ID
          onClick={() => onSelect(product)}
        >
          {/* 点击后这个元素会平滑移动到详情页对应位置 */}
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
        </motion.div>
      ))}
    </LayoutGroup>
  );
}

function ProductDetail({ product, onBack }) {
  return (
    <motion.div
      layoutId={`product-${product.id}`}  // 相同ID触发共享布局动画
    >
      <img src={product.image.large} alt={product.name} />
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <button onClick={onBack}>返回</button>
    </motion.div>
  );
}
```

### 4. 手势与拖拽

```jsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

// ✅ 可滑动的删除按钮(Swipe to Delete)
function SwipeToDelete({ item, onDelete }) {
  const x = useMotionValue(0);
  
  // 根据x位置改变背景色和透明度
  const bg = useTransform(x, [-100, 0], ['rgba(255,0,0,0.5)', 'rgba(0,0,0,0)']);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  return (
    <motion.div style={{ position: 'relative' }}>
      {/* 删除提示背景 */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 20,
        }}
      >
        <motion.span style={{ opacity: deleteOpacity, color: '#fff', fontWeight: 'bold' }}>
          删除
        </motion.span>
      </motion.div>

      {/* 内容层 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={(e, info) => {
          // 滑动超过阈值则执行删除
          if (info.offset.x < -100) {
            onDelete(item.id);
          }
        }}
        onDrag={(e, info) => {
          // 实时反馈
        }}
      >
        {item.content}
      </motion.div>
    </motion.div>
  );
}

// ✅ 拖拽排序列表
function DraggableSortList({ items, onReorder }) {
  const [listItems, setListItems] = useState(items);

  return (
    {listItems.map((item, index) => (
      <Reorder.Item
        key={item.id}
        value={item}
        style={{
          listStyle: 'none',
          padding: 16,
          margin: '8px 0',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {item.content}
      </Reorder.Item>
    ))}
    <Reorder.Group
      axis="y"
      values={listItems}
      onReorder={(newOrder) => {
        setListItems(newOrder);
        onReorder(newOrder);
      }}
    />
  );
}
```

---

## 🔮 React Spring (物理动画)

### 安装与基础

```bash
npm install @react-spring/web
```

```jsx
import { useSpring, animated, useChain, useSprings } from '@react-spring/web';

// ✅ 弹簧动画基础
function SpringExample() {
  // spring配置: tension(张力), friction(摩擦力)
  const [spring, api] = useSpring(() => ({
    opacity: 0,
    transform: 'scale(0.9)',
    config: { tension: 170, friction: 26 },  // 默认配置
  }));

  useEffect(() => {
    // 启动动画
    api.start({
      opacity: 1,
      transform: 'scale(1)',
    });
  }, [api]);

  return <animated.div style={spring}>弹性动画</animated.div>;
}

// ✅ 交互动画
function InteractiveSpring() {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: { mass: 1, tension: 280, friction: 20 },
  }));

  const onMouseEnter = () => api.start({ scale: 1.1, rotate: 5 });
  const onMouseLeave = () => api.start({ scale: 1, rotate: 0 });

  return (
    <animated.div
      style={spring}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      悬停我!
    </animated.div>
  );
}

// ✅ 弹簧链式动画(多个动画按序执行)
function ChainedAnimation() {
  const springRef1 = useRef();
  const springRef2 = useRef();
  const springRef3 = useRef();

  const spring1 = useSpring({
    ref: springRef1,
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0 },
  });

  const spring2 = useSpring({
    ref: springRef2,
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0 },
  });

  const spring3 = useSpring({
    ref: springRef3,
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0 },
  });

  // 设置执行顺序
  useChain([springRef1, springRef2, springRef3], [0, 0.2, 0.4]);  // 延迟时间

  return (
    <div>
      <animated.div style={spring1}>第一行</animated.div>
      <animated.div style={spring2}>第二行</animated.div>
      <animated.div style={spring3}>第三行</animated.div>
    </div>
  );
}

// ✅ 多个元素使用useSprings
function SpringsList({ count }) {
  const [springs, api] = useSprings(count, i => ({
    opacity: 0,
    y: 20 * i,
  }));

  useEffect(() => {
    api.start(i => ({
      opacity: 1,
      y: 0,
      delay: i * 100,  // 每个延迟100ms
    }));
  }, [api]);

  return springs.map((style, i) => (
    <animated.div key={i} style={style}>
      项目 {i + 1}
    </animated.div>
  ));
}
```

---

## 🎭 高级动画模式

### 1. 滚动驱动动画

```jsx
import { motion, useScroll, useTransform } from 'framer-motion';

// ✅ 触发滚动视差效果
function ParallaxSection({ children, offset = 50 }) {
  const ref = useRef(null);

  // 获取滚动进度
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]  // 从元素进入视口到完全离开
  });

  // 将滚动进度映射到Y轴偏移
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref}>
      <motion.div style={{ y, opacity }}>
        {children}
      </motion.div>
    </section>
  );
}

// ✅ 滚动进度指示器
function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  
  // 将滚动进度映射到宽度
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 9999,
      }}
    />
  );
}

// ✅ 元素进入视口时触发动画
function RevealOnScroll({ children, direction = 'up' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });  // 只触发一次

  const directions = {
    up: { initial: { y: 50 }, animate: { y: 0 } },
    down: { initial: { y: -50 }, animate: { y: 0 } },
    left: { initial: { x: 50 }, animate: { x: 0 } },
    right: { initial: { x: -50 }, animate: { x: 0 } },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction].initial }}
      animate={isInView ? { opacity: 1, ...directions[direction].animate } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### 2. 数字递增动画

```jsx
import { useSpring, animated } from '@react-spring/web';

// ✅ 数字从0动态增长到目标值
function AnimatedCounter({ target, duration = 2000 }) {
  const [number, spring] = useSpring(() => ({
    value: 0,
    config: { duration },
  }));

  useEffect(() => {
    spring.start({ value: target });
  }, [target, duration, spring]);

  return (
    <animated.span>
      {spring.value.to(v => Math.floor(v).toLocaleString())}  {/* 格式化为千分位 */}
    </animated.span>
  );
}

// 使用
<KPICard
  title="总销售额"
  value={<AnimatedCounter target={1234567} />}
/>
```

### 3. 加载动画集合

```jsx
// ✅ 骨架屏加载
function SkeletonLoader({ type = 'text', lines = 3 }) {
  const pulseAnimation = {
    opacity: [0.4, 1, 0.4],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  };

  if (type === 'avatar') {
    return <motion.div {...pulseAnimation} className="skeleton-avatar" />;
  }

  if (type === 'image') {
    return <motion.div {...pulseAnimation} className="skeleton-image" />;
  }

  return (
    <div className="skeleton-text-container">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          {...pulseAnimation}
          className="skeleton-line"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// ✅ 微型加载指示器
function LoadingSpinner({ size = 40, color = '#3b82f6' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeDasharray="60"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
```

### 4. 复杂的时间线动画(GSAP集成)

```bash
npm install gsap
```

```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ✅ 使用GSAP创建复杂的滚动时间线动画
function ScrollTimelineAnimation() {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 创建时间线
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "+=2000",  // 滚动2000像素
          scrub: 1,  // 动画进度绑定到滚动位置
          pin: true,  // 固定容器
        }
      });

      // 添加动画步骤
      sectionsRef.current.forEach((section, index) => {
        tl.fromTo(section, 
          { opacity: 0, y: 100, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 1 }
        )
        .to(section.querySelector('.highlight'), {
          backgroundColor: '#fef08a',
          duration: 0.5
        })
        .to(section.querySelector('.highlight'), {
          backgroundColor: 'transparent',
          duration: 0.5
        });
      });
    });

    return () => ctx.revert();  // 清理
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div ref={containerRef} className="timeline-container">
      {[1, 2, 3, 4].map(step => (
        <div key={step} ref={addToRefs} className="timeline-step">
          <h2>步骤 {step}</h2>
          <p className="highlight">这是高亮显示的内容</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ⚡ 性能优化技巧

### 1. GPU加速与will-change

```jsx
// ✅ 对频繁动画的元素启用GPU加速
<motion.div
  style={{
    willChange: 'transform, opacity',  // 提示浏览器优化
  }}
  initial={{ x: -100 }}
  animate={{ x: 0 }}
  transition={{ type: 'spring' }}
>
  GPU加速的动画元素
</motion.div>

/* 注意事项:
- 只在需要持续动画的元素上使用
- 动画结束后移除或设为auto
- 不要在大量元素上同时使用
*/
```

### 2. 减少重绘范围

```jsx
// ❌ 整个大容器都在变化
<div style={{ padding: 20 }}>
  <motion.div animate={{ x: 100 }}>
    移动的部分
  </motion.div>
  {/* 其他不需要重绘的内容也会受影响 */}
  <StaticComponent />
</div>

// ✅ 最小化动画影响范围
<motion.div 
  animate={{ x: 100 }}
  style={{ contain: 'layout paint' } /* CSS Containment */}
>
  只有这个区域会被重绘
</motion.div>
<StaticComponent />  {/* 完全不受影响 */}
```

### 3. 条件渲染 vs visibility

```jsx
// ❌ 条件渲染导致DOM重新创建,无法播放退出动画
{showModal && <Modal onClose={() => setShowModal(false)} />}

// ✅ 使用AnimatePresence保留DOM以播放退出动画
<AnimatePresence>
  {showModal && (
    <Modal 
      onClose={() => setShowModal(false)}
      key="modal"  // 必须有唯一key
    />
  )}
</AnimatePresence>
```

### 4. 减少不必要的动画计算

```jsx
// ❌ 每次渲染都重新计算样式
function BadAnimation({ isActive }) {
  return (
    <motion.div
      animate={{
        x: isActive ? 100 : 0,
        scale: isActive ? 1.2 : 1,
        rotate: isActive ? 180 : 0,
        backgroundColor: isActive ? '#3b82f6' : '#64748b',
        // ...很多属性
      }}
    >
      Content
    </motion.div>
  );
}

// ✅ 使用variants预定义动画状态
const itemVariants = {
  inactive: {
    x: 0,
    scale: 1,
    rotate: 0,
    backgroundColor: '#64748b',
  },
  active: {
    x: 100,
    scale: 1.2,
    rotate: 180,
    backgroundColor: '#3b82f6',
  },
};

function GoodAnimation({ isActive }) {
  return (
    <motion.div
      variants={itemVariants}
      animate={isActive ? 'active' : 'inactive'}
    >
      Content
    </motion.div>
  );
}
```

---

## 📋 动画设计原则

### 1. 有意义的动画
- **引导用户注意力**: 强调重要的操作或信息变更
- **表达状态变化**: 显示元素的出现、消失、展开、收起
- **提供视觉反馈**: 按钮、表单输入等的即时响应
- **增强空间感**: 层级关系、导航路径

### 2. 时长建议
| 类型 | 推荐时长 |
|------|---------|
| 微交互(按钮悬停) | 100-200ms |
| 状态转换(开关切换) | 200-300ms |
| 元素进入/离开 | 300-500ms |
| 页面转场 | 500-800ms |
| 复杂动画序列 | 800-1200ms |

### 3. 缓动函数选择
```javascript
// Framer Motion内置缓动
transition: {
  ease: "easeOut",      // 快出慢入(适合进入动画)
  ease: "easeIn",       // 慢出快进(适合退出动画)
  ease: "easeInOut",    // 两端慢中间快(适合来回运动)
  ease: "linear",       // 匀速(适合循环动画)
}

// 自定义贝塞尔曲线
transition: {
  ease: [0.43, 0.13, 0.23, 0.96],  // 类似ease-out-cubic
}
```

### 4. 无障碍性考虑
```jsx
// ✅ 尊重用户的减少动画偏好
function AccessibleAnimation() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  if (prefersReducedMotion) {
    return <div>静态版本</div>;  // 直接显示最终状态
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      动画版本
    </motion.div>
  );
}
```

---

## 📝 练习任务

### 任务1:构建动画组件库
创建以下可复用的动画组件:
- `AnimatedButton` (带涟漪效果的按钮)
- `Collapsible` (手风琴折叠面板)
- `Toast`通知系统(带进入/离开动画)
- `Modal`对话框(带缩放+淡入淡出)

### 任务2:产品展示页
为一个电商网站的产品展示页添加以下动画:
- Hero区域视差滚动
- 产品卡片悬浮效果
- 图片画廊滑动切换
- 滚动触发的渐显效果

### 任务3:数据可视化仪表盘
为实时数据仪表盘添加:
- KPI数字递增动画
- 图表的平滑数据更新过渡
- 加载状态的骨架屏
- 数据刷新时的脉冲提示

---

## 🔗 相关资源

- [Framer Motion文档](https://www.framer.com/motion/)
- [React Spring文档](https://react-spring.dev/)
- [GSAP文档](https://greensock.com/docs/)
- [MDN: CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

---

[← 21 - 深度性能优化](../21-advanced-performance/) | [→ 23 - 无障碍访问](../23-accessibility/)
