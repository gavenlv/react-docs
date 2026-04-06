/**
 * React 动画演示 - 主应用组件
 * 
 * 本章涵盖内容：
 * 1. CSS transition / animation 基础
 * 2. framer-motion 核心用法（motion.div, animate, transition）
 * 3. AnimatePresence 退出动画
 * 4. Drag 拖拽交互
 * 5. Layout 布局动画
 * 6. Hover / Tap 手势
 * 7. Variants 动画变体复用
 * 8. Stagger 子元素依次动画
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

/* ==================== Tab 数据配置 ==================== */
const TABS = [
  'CSS基础', 'Framer入门', 'AnimatePresence', 'Drag拖拽',
  'Layout布局', '手势交互', 'Variants复用', 'Stagger子动画'
]

/* ==================== 颜色工具 ==================== */
// 生成渐变色对的辅助函数
const gradients = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
]

/* ==================== 1. CSS 基础动画 ==================== */
function CssBasicDemo() {
  /**
   * CSS 基础动画演示
   * - transition: 属性变化时的过渡效果
   * - @keyframes animation: 关键帧动画
   * 这些是纯 CSS 动画，不需要任何 JS 库
   */
  return (
    <div className="demo-section">
      <h3 className="demo-title">1. CSS Transition / Animation 基础</h3>
      <p className="demo-desc">
        纯 CSS 实现的过渡和关键帧动画，hover 试试看效果
      </p>

      {/* CSS transition 演示 */}
      <h4 style={{ color: '#aaa', marginBottom: 8 }}>CSS Transition（悬停触发）</h4>
      <div className="css-transition-box">Hover 我</div>

      {/* CSS @keyframes 演示 */}
      <h4 style={{ color: '#aaa', marginBottom: 8, marginTop: 20 }}>CSS @keyframes（脉冲动画）</h4>
      <div style={{ textAlign: 'center' }}>
        <div className="css-keyframe-box">脉冲 1</div>
        <div className="css-keyframe-box">脉冲 2</div>
        <div className="css-keyframe-box">脉冲 3</div>
      </div>
    </div>
  )
}

/* ==================== 2. Framer Motion 入门 ==================== */
function FramerBasicDemo() {
  /**
   * framer-motion 基础演示
   * - motion.div: 动画化的 HTML 元素
   * - initial: 初始状态
   * - animate: 动画目标状态
   * - transition: 过渡配置（duration, type, bounce 等）
   */
  const [isAnimated, setIsAnimated] = useState(false)

  return (
    <div className="demo-section">
      <h3 className="demo-title">2. Framer Motion 入门</h3>
      <p className="demo-desc">
        motion.div + animate 属性实现声明式动画，点击按钮切换状态
      </p>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <motion.button
          style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: 'none',
            background: isAnimated
              ? 'linear-gradient(135deg, #667eea, #764ba2)'
              : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={() => setIsAnimated(!isAnimated)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAnimated ? '重置动画' : '播放动画'}
        </motion.button>
      </div>

      {/* 基础移动动画 */}
      <motion.div
        style={{
          width: 100,
          height: 100,
          borderRadius: 16,
          background: gradients[0],
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 600,
        }}
        // 初始状态：x 轴偏移 -100，透明度 0
        initial={{ x: -100, opacity: 0 }}
        // 动画目标状态
        animate={{
          x: isAnimated ? 100 : -100,
          opacity: isAnimated ? 1 : 0.3,
          rotate: isAnimated ? 180 : 0,
          scale: isAnimated ? 1.1 : 0.9,
        }}
        // 过渡配置：弹簧效果
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        移动
      </motion.div>

      {/* 不同 transition type 对比 */}
      <h4 style={{ color: '#aaa', marginBottom: 12, textAlign: 'center' }}>
        不同 transition.type 效果对比
      </h4>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* spring 类型 */}
        <motion.div
          animate={{ y: isAnimated ? -20 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ width: 70, height: 70, borderRadius: 12, background: gradients[1], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}
        >
          spring
        </motion.div>
        {/* tween 类型 */}
        <motion.div
          animate={{ y: isAnimated ? -20 : 0 }}
          transition={{ type: 'tween', duration: 0.5 }}
          style={{ width: 70, height: 70, borderRadius: 12, background: gradients[2], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}
        >
          tween
        </motion.div>
        {/* inertia 类型 */}
        <motion.div
          animate={{ y: isAnimated ? -20 : 0 }}
          transition={{ type: 'inertia', velocity: 200 }}
          style={{ width: 70, height: 70, borderRadius: 12, background: gradients[3], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}
        >
          inertia
        </motion.div>
      </div>
    </div>
  )
}

/* ==================== 3. AnimatePresence 演示 ==================== */
function AnimatePresenceDemo() {
  /**
   * AnimatePresence: 当组件从 DOM 中移除时播放退出动画
   * - 必须包裹动态渲染的元素
   * - 子元素需要设置 key 和 exit 属性
   */
  const [visibleItems, setVisibleItems] = useState(['项目 A'])

  // 添加新项目
  const addItem = useCallback(() => {
    const names = ['项目 A', '项目 B', '项目 C', '项目 D', '项目 E']
    const idx = visibleItems.length % names.length
    setVisibleItems(prev => [...prev, names[idx]])
  }, [visibleItems.length])

  // 移除最后一个项目
  const removeItem = useCallback(() => {
    setVisibleItems(prev => prev.length > 0 ? prev.slice(0, -1) : prev)
  }, [])

  return (
    <div className="demo-section">
      <h3 className="demo-title">3. AnimatePresence 退出动画</h3>
      <p className="demo-desc">
        当元素从 DOM 移除时仍然能播放动画，这是 React 原生做不到的
      </p>

      <div className="presence-controls">
        <button className="presence-btn" onClick={addItem}>添加项目</button>
        <button className="presence-btn" onClick={removeItem}>移除项目</button>
      </div>

      {/* AnimatePresence 包裹条件渲染的列表 */}
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, i) => (
          <motion.div
            key={`${item}-${i}`}
            layout
            className="presence-item"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ background: gradients[i % gradients.length] }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>

      {visibleItems.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: 20 }}>
          没有项目了，点击「添加项目」试试
        </p>
      )}
    </div>
  )
}

/* ==================== 4. Drag 拖拽演示 ==================== */
function DragDemo() {
  /**
   * Drag 拖拽演示
   * - drag: 开启拖拽（可选 "x" | "y" 限制方向）
   * - dragConstraints: 限制拖拽范围
   * - dragElastic: 拖拽弹性系数
   * - dragSnapToOrigin: 释放后回弹到原位
   */
  return (
    <div className="demo-section">
      <h3 className="demo-title">4. Drag 拖拽交互</h3>
      <p className="demo-desc">用鼠标拖动下方的方块，体验不同的拖拽约束</p>

      <div className="drag-area">
        {/* 自由拖拽 */}
        <motion.div
          className="drag-box"
          style={{ background: gradients[0] }}
          drag
          // 拖拽时有轻微放大效果
          whileDrag={{ scale: 1.15, zIndex: 10 }}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        >
          自由拖拽
        </motion.div>

        {/* 仅 X 轴拖拽 */}
        <motion.div
          className="drag-box"
          style={{ background: gradients[1] }}
          drag="x"
          // 拖拽约束：左右各 80px
          dragConstraints={{ left: -80, right: 80 }}
          whileDrag={{ scale: 1.15, zIndex: 10 }}
        >
          X 轴拖拽
        </motion.div>

        {/* 仅 Y 轴拖拽 */}
        <motion.div
          className="drag-box"
          style={{ background: gradients[2] }}
          drag="y"
          dragConstraints={{ top: -80, bottom: 80 }}
          whileDrag={{ scale: 1.15, zIndex: 10 }}
        >
          Y 轴拖拽
        </motion.div>

        {/* 弹性拖拽 */}
        <motion.div
          className="drag-box"
          style={{ background: gradients[3] }}
          drag
          // 释放后回弹到原位
          dragSnapToOrigin
          dragElastic={0.3}
          whileDrag={{ scale: 1.15, zIndex: 10 }}
        >
          弹性回弹
        </motion.div>
      </div>
    </div>
  )
}

/* ==================== 5. Layout 布局动画 ==================== */
function LayoutDemo() {
  /**
   * Layout 布局动画
   * - layout: 自动检测元素在 DOM 中的位置变化并动画过渡
   * - 适用于排序、过滤、展开/折叠等场景
   */
  const [layout, setLayout] = useState('grid')

  // 模拟数据
  const items = [
    { id: 1, name: 'React', color: gradients[0] },
    { id: 2, name: 'Vue', color: gradients[1] },
    { id: 3, name: 'Svelte', color: gradients[2] },
    { id: 4, name: 'Angular', color: gradients[3] },
    { id: 5, name: 'Solid', color: gradients[4] },
    { id: 6, name: 'Qwik', color: gradients[5] },
  ]

  return (
    <div className="demo-section">
      <h3 className="demo-title">5. Layout 布局动画</h3>
      <p className="demo-desc">
        切换布局模式，元素会自动平滑过渡到新位置
      </p>

      <div className="layout-switcher">
        <button
          className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
          onClick={() => setLayout('grid')}
        >
          网格布局
        </button>
        <button
          className={`layout-btn ${layout === 'row' ? 'active' : ''}`}
          onClick={() => setLayout('row')}
        >
          横向排列
        </button>
        <button
          className={`layout-btn ${layout === 'column' ? 'active' : ''}`}
          onClick={() => setLayout('column')}
        >
          纵向排列
        </button>
      </div>

      <LayoutGroup>
        <motion.div
          style={{
            display: 'flex',
            flexWrap: layout === 'grid' ? 'wrap' : 'nowrap',
            flexDirection: layout === 'column' ? 'column' : 'row',
            gap: 10,
            justifyContent: 'center',
            alignItems: layout === 'column' ? 'center' : 'flex-start',
          }}
          layout
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              style={{
                width: layout === 'grid' ? 100 : layout === 'row' ? 'auto' : 200,
                height: 60,
                borderRadius: 12,
                background: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: layout === 'row' ? '0 20px' : 0,
                flexShrink: 0,
              }}
            >
              {item.name}
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}

/* ==================== 6. Hover / Tap 手势 ==================== */
function GestureDemo() {
  /**
   * Hover / Tap 手势演示
   * - whileHover: 鼠标悬停时的动画
   * - whileTap: 按下时的动画
   * - whileFocus: 聚焦时的动画
   */
  return (
    <div className="demo-section">
      <h3 className="demo-title">6. Hover / Tap 手势交互</h3>
      <p className="demo-desc">
        whileHover 和 whileTap 让手势交互变得极其简单
      </p>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Hover 放大 */}
        <motion.div
          className="gesture-box"
          style={{ background: gradients[0] }}
          // 悬停时放大并显示阴影
          whileHover={{
            scale: 1.2,
            boxShadow: '0 10px 40px rgba(102,126,234,0.5)',
          }}
        >
          Hover放大
        </motion.div>

        {/* Tap 缩小 */}
        <motion.div
          className="gesture-box"
          style={{ background: gradients[1] }}
          // 按下时缩小
          whileTap={{ scale: 0.8, rotate: -10 }}
        >
          Tap缩小
        </motion.div>

        {/* Hover + Tap 组合 */}
        <motion.div
          className="gesture-box"
          style={{ background: gradients[2] }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, borderRadius: '50%' }}
        >
          组合手势
        </motion.div>

        {/* Hover 颜色渐变 */}
        <motion.div
          className="gesture-box"
          style={{ background: gradients[3] }}
          whileHover={{
            background: gradients[4],
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.85 }}
        >
          颜色渐变
        </motion.div>

        {/* 3D 倾斜效果 */}
        <motion.div
          className="gesture-box"
          style={{ background: gradients[4] }}
          whileHover={{
            scale: 1.1,
            rotateY: 15,
            rotateX: -5,
            boxShadow: '0 20px 40px rgba(250,112,154,0.3)',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{ transformPerspective: 500, background: gradients[4] }}
        >
          3D倾斜
        </motion.div>
      </div>
    </div>
  )
}

/* ==================== 7. Variants 动画变体 ==================== */
function VariantsDemo() {
  /**
   * Variants 动画变体
   * - 将动画状态定义为对象，方便复用和同步
   * - 父子组件可通过 variants 自动继承动画
   * - orchestrations: staggerChildren, delayChildren 等
   */
  // 定义动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      // 子元素依次出现
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300 },
    },
  }

  const [isVisible, setIsVisible] = useState(true)

  return (
    <div className="demo-section">
      <h3 className="demo-title">7. Variants 动画变体复用</h3>
      <p className="demo-desc">
        用 variants 对象定义动画，实现父子联动和代码复用
      </p>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <motion.button
          style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: 'none',
            background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={() => setIsVisible(!isVisible)}
          whileTap={{ scale: 0.95 }}
        >
          {isVisible ? '隐藏' : '显示'}
        </motion.button>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="variants-container"
          >
            {['React', 'Hooks', 'State', 'Props', 'JSX'].map((name, i) => (
              <motion.div
                key={name}
                variants={itemVariants}
                className="variant-box"
                style={{ background: gradients[i % gradients.length] }}
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ==================== 8. Stagger 子动画 ==================== */
function StaggerDemo() {
  /**
   * Stagger 子元素依次动画
   * - staggerChildren: 子元素之间的延迟
   * - delayChildren: 所有子元素动画前的等待时间
   * - 本例用 5x5 网格展示波浪式动画效果
   */
  const [show, setShow] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  }

  const cellVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 350, damping: 20 },
    },
    exit: {
      scale: 0,
      opacity: 0,
      rotate: 180,
      transition: { duration: 0.2 },
    },
  }

  // 生成 5x5 网格数据
  const gridItems = Array.from({ length: 25 }, (_, i) => i + 1)

  return (
    <div className="demo-section">
      <h3 className="demo-title">8. Stagger 子元素依次动画</h3>
      <p className="demo-desc">
        staggerChildren 让子元素依次出场，形成波浪式视觉效果
      </p>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <motion.button
          style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: 'none',
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            color: '#000',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={() => setShow(!show)}
          whileTap={{ scale: 0.95 }}
        >
          {show ? '收起' : '展开'}网格
        </motion.button>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="stagger-grid"
          >
            {gridItems.map((num) => (
              <motion.div
                key={num}
                variants={cellVariants}
                className="stagger-item"
                style={{
                  background: gradients[(num - 1) % gradients.length],
                }}
              >
                {num}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ==================== 主应用 ==================== */
function App() {
  // 当前选中的 Tab 索引
  const [activeTab, setActiveTab] = useState(0)

  // Tab 对应的组件数组
  const demos = [
    CssBasicDemo,
    FramerBasicDemo,
    AnimatePresenceDemo,
    DragDemo,
    LayoutDemo,
    GestureDemo,
    VariantsDemo,
    StaggerDemo,
  ]

  // 渲染当前选中的演示组件
  const ActiveDemo = demos[activeTab]

  return (
    <div className="app">
      <h1 className="app-title">React 动画 Animation</h1>
      <p className="app-subtitle">
        CSS 动画 · Framer Motion · AnimatePresence · Drag · Layout · 手势 · Variants · Stagger
      </p>

      {/* Tab 切换导航 */}
      <nav className="tab-nav">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`tab-btn ${i === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 当前演示区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveDemo />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App
