import { useState } from 'react'
import { GRADIENT_LINES } from '../utils/admission'

export default function FlowChart() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeSubStep, setActiveSubStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeChart, setActiveChart] = useState('main')
  
  const gradientColors = {
    1: '#dc2626',
    2: '#f59e0b',
    3: '#10b981',
    4: '#3b82f6',
    5: '#8b5cf6',
    6: '#6b7280',
  }
  
  const mainSteps = [
    { title: '考生成绩排序', desc: '按总分从高到低排序所有考生' },
    { title: '划分梯度', desc: '根据梯度控制线将考生分成若干档' },
    { title: '第1梯度投档', desc: '先投第一梯度考生（≥702分）' },
    { title: '第2梯度投档', desc: '投第二梯度考生（662-701分）' },
    { title: '第3梯度投档', desc: '投第三梯度考生（622-661分）' },
    { title: '后续梯度投档', desc: '继续投第四、第五梯度...' },
    { title: '投档结束', desc: '公布录取结果' },
  ]
  
  const gradientSteps = [
    { title: '获取本梯度考生', desc: '取出当前梯度内的所有考生' },
    { title: '按成绩排序', desc: '在本梯度内按总分从高到低排序' },
    { title: '处理第1志愿', desc: '遍历所有考生的第1志愿' },
    { title: '处理第2志愿', desc: '第1志愿录完后，处理第2志愿' },
    { title: '处理后续志愿', desc: '依次处理第3-6志愿' },
    { title: '本梯度结束', desc: '所有考生志愿处理完毕' },
  ]
  
  const volunteerSteps = [
    { title: '取出第N志愿考生', desc: '获取所有填报该校第N志愿的考生' },
    { title: '按成绩排序', desc: '这些考生按总分排序' },
    { title: '检查学校名额', desc: '查看学校剩余招生名额' },
    { title: '录取高分考生', desc: '从高到低录取，直到名额用完' },
    { title: '同分比较', desc: '总分相同则比较语数英总分' },
    { title: '更新名额', desc: '扣除已录取名额，更新学校状态' },
  ]
  
  const volunteerFailSteps = [
    { title: '检查第N志愿结果', desc: '判断该志愿是否成功录取' },
    { title: '录取失败', desc: '学校名额已满或分数不够' },
    { title: '进入下一志愿', desc: 'N+1志愿继续投档' },
    { title: '等待本梯度处理', desc: '所有志愿在本梯度内依次处理' },
    { title: '本梯度全部落选', desc: '6个志愿均未录取' },
    { title: '进入下一梯度', desc: '等待下一梯度投档' },
  ]
  
  const gradientFailSteps = [
    { title: '本梯度投档结束', desc: '该梯度所有考生志愿处理完毕' },
    { title: '检查录取状态', desc: '判断考生是否已被录取' },
    { title: '未录取考生', desc: '本梯度内所有志愿均落选' },
    { title: '进入下一梯度', desc: '降级到下一梯度继续投档' },
    { title: '梯度优先优势', desc: '仍优先于低梯度考生的第1志愿' },
    { title: '全部梯度结束', desc: '进入补录或下一批次' },
  ]
  
  const tieBreakSteps = [
    { title: '比较语数英总分', desc: '三科总分高者优先' },
    { title: '比较语文成绩', desc: '三科总分相同，语文高者优先' },
    { title: '比较数学成绩', desc: '语文相同，数学高者优先' },
    { title: '比较英语成绩', desc: '数学相同，英语高者优先' },
    { title: '确定排名', desc: '最终确定考生录取顺序' },
  ]
  
  const runAnimation = (steps, setStep) => {
    setIsAnimating(true)
    setStep(0)
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      if (currentStep >= steps.length) {
        clearInterval(interval)
        setIsAnimating(false)
        return
      }
      setStep(currentStep)
    }, 1200)
  }
  
  return (
    <div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">投档流程图</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { key: 'main', label: '整体流程' },
            { key: 'gradient', label: '梯度内流程' },
            { key: 'volunteer', label: '志愿投档流程' },
            { key: 'volunteerFail', label: '志愿落榜处理' },
            { key: 'gradientFail', label: '梯度落榜处理' },
            { key: 'tiebreak', label: '同分比较流程' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn ${activeChart === tab.key ? 'btn-primary' : ''}`}
              onClick={() => { setActiveChart(tab.key); setActiveStep(0); setActiveSubStep(0); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeChart === 'main' && (
          <MainFlowChart 
            steps={mainSteps} 
            activeStep={activeStep}
            isAnimating={isAnimating}
            onAnimate={() => runAnimation(mainSteps, setActiveStep)}
            gradientColors={gradientColors}
          />
        )}
        
        {activeChart === 'gradient' && (
          <GradientFlowChart 
            steps={gradientSteps}
            activeStep={activeStep}
            isAnimating={isAnimating}
            onAnimate={() => runAnimation(gradientSteps, setActiveStep)}
            gradientColors={gradientColors}
          />
        )}
        
        {activeChart === 'volunteer' && (
          <VolunteerFlowChart 
            steps={volunteerSteps}
            activeStep={activeStep}
            isAnimating={isAnimating}
            onAnimate={() => runAnimation(volunteerSteps, setActiveStep)}
          />
        )}
        
        {activeChart === 'volunteerFail' && (
          <VolunteerFailFlowChart 
            steps={volunteerFailSteps}
            activeStep={activeStep}
            isAnimating={isAnimating}
            onAnimate={() => runAnimation(volunteerFailSteps, setActiveStep)}
          />
        )}
        
        {activeChart === 'gradientFail' && (
          <GradientFailFlowChart 
            steps={gradientFailSteps}
            activeStep={activeStep}
            isAnimating={isAnimating}
            onAnimate={() => runAnimation(gradientFailSteps, setActiveStep)}
          />
        )}
        
        {activeChart === 'tiebreak' && (
          <TieBreakFlowChart 
            steps={tieBreakSteps}
            activeStep={activeStep}
            isAnimating={isAnimating}
            onAnimate={() => runAnimation(tieBreakSteps, setActiveStep)}
          />
        )}
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">梯度控制线参考</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {Object.entries(GRADIENT_LINES).map(([key, score], index) => {
            const level = key === 'minimum' ? 6 : parseInt(key.replace('th', '').replace('first', '1').replace('second', '2').replace('third', '3').replace('fourth', '4').replace('fifth', '5'))
            return (
              <div key={key} style={{ 
                padding: '16px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                borderLeft: `4px solid ${gradientColors[index + 1] || '#6b7280'}`
              }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {key === 'minimum' ? '最低控制线' : `第${['一','二','三','四','五'][index]}梯度`}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: gradientColors[index + 1] || '#6b7280' }}>
                  {score}分
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MainFlowChart({ steps, activeStep, isAnimating, onAnimate, gradientColors }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onAnimate} disabled={isAnimating}>
          {isAnimating ? '演示中...' : '播放演示'}
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '350px' }}>
          <svg viewBox="0 0 500 700" style={{ width: '100%', maxWidth: '500px' }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.15"/>
              </filter>
            </defs>
            
            <g transform="translate(200, 20)">
              <ellipse cx="50" cy="25" rx="50" ry="25" fill={activeStep >= 0 ? "#3b82f6" : "#e5e7eb"} filter="url(#shadow)" />
              <text x="50" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">开始</text>
            </g>
            
            <line x1="250" y1="70" x2="250" y2="100" stroke="#6b7280" markerEnd="url(#arrow)" />
            
            <g transform="translate(100, 100)">
              <rect width="300" height="50" rx="8" fill={activeStep >= 1 ? "#10b981" : "#e5e7eb"} filter="url(#shadow)" />
              <text x="150" y="30" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">考生成绩排序</text>
            </g>
            
            <line x1="250" y1="150" x2="250" y2="180" stroke="#6b7280" markerEnd="url(#arrow)" />
            
            <g transform="translate(100, 180)">
              <rect width="300" height="50" rx="8" fill={activeStep >= 2 ? "#f59e0b" : "#e5e7eb"} filter="url(#shadow)" />
              <text x="150" y="22" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">划分梯度</text>
              <text x="150" y="38" textAnchor="middle" fill="white" fontSize="10">按控制线分档</text>
            </g>
            
            <line x1="250" y1="230" x2="250" y2="260" stroke="#6b7280" markerEnd="url(#arrow)" />
            
            {[0, 1, 2, 3].map((i) => {
              const y = 260 + i * 80
              const isActive = activeStep >= 3 + i
              return (
                <g key={i}>
                  <g transform={`translate(100, ${y})`}>
                    <rect width="300" height="60" rx="8" fill={isActive ? gradientColors[i + 1] : "#e5e7eb"} filter="url(#shadow)" />
                    <text x="150" y="25" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">第{i + 1}梯度投档</text>
                    <text x="150" y="45" textAnchor="middle" fill="white" fontSize="10">
                      {i === 0 ? '≥702分考生' : i === 1 ? '662-701分考生' : i === 2 ? '622-661分考生' : '582-621分考生'}
                    </text>
                  </g>
                  {i < 3 && <line x1="250" y1={y + 60} x2="250" y2={y + 80} stroke="#6b7280" markerEnd="url(#arrow)" />}
                </g>
              )
            })}
            
            <line x1="250" y1="580" x2="250" y2="620" stroke="#6b7280" markerEnd="url(#arrow)" />
            
            <g transform="translate(100, 620)">
              <rect width="300" height="50" rx="8" fill={activeStep >= 7 ? "#6b7280" : "#e5e7eb"} filter="url(#shadow)" />
              <text x="150" y="30" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">后续批次/补录</text>
            </g>
            
            <line x1="250" y1="670" x2="250" y2="690" stroke="#6b7280" />
            
            <g transform="translate(200, 690)">
              <ellipse cx="50" cy="25" rx="50" ry="25" fill={activeStep >= 7 ? "#6b7280" : "#e5e7eb"} filter="url(#shadow)" />
              <text x="50" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">结束</text>
            </g>
          </svg>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px' }}>流程说明</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                onClick={() => {}}
                style={{
                  padding: '12px 16px',
                  background: activeStep === index ? '#eff6ff' : '#f8f9fa',
                  border: activeStep === index ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: activeStep >= index ? '#3b82f6' : '#d1d5db',
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: '600',
                  }}>{index + 1}</span>
                  <span style={{ fontWeight: '600' }}>{step.title}</span>
                </div>
                {activeStep === index && (
                  <p style={{ marginTop: '8px', paddingLeft: '32px', color: '#666', fontSize: '13px' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VolunteerFailFlowChart({ steps, activeStep, isAnimating, onAnimate }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onAnimate} disabled={isAnimating}>
          {isAnimating ? '演示中...' : '播放演示'}
        </button>
        <span style={{ marginLeft: '16px', color: '#666', fontSize: '14px' }}>
          展示第一志愿落榜后的处理流程
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <svg viewBox="0 0 600 750" style={{ width: '100%', maxWidth: '600px' }}>
            <defs>
              <marker id="arrow5" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            <g transform="translate(225, 20)">
              <ellipse cx="75" cy="25" rx="75" ry="25" fill={activeStep >= 0 ? "#dc2626" : "#e5e7eb"} />
              <text x="75" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">第N志愿投档</text>
              <text x="75" y="36" textAnchor="middle" fill="white" fontSize="9">如：第1志愿</text>
            </g>
            
            <line x1="300" y1="70" x2="300" y2="100" stroke="#6b7280" markerEnd="url(#arrow5)" />
            
            <g transform="translate(100, 100)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 1 ? "#3b82f6" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">检查投档结果</text>
            </g>
            
            <line x1="300" y1="150" x2="300" y2="180" stroke="#6b7280" markerEnd="url(#arrow5)" />
            
            <g transform="translate(150, 180)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 1 ? "#f59e0b" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">是否录取?</text>
            </g>
            
            <line x1="450" y1="215" x2="520" y2="215" stroke="#6b7280" />
            <text x="530" y="220" fill="#10b981" fontSize="11">是</text>
            <line x1="520" y1="215" x2="520" y2="680" stroke="#10b981" markerEnd="url(#arrow5)" />
            
            <line x1="300" y1="250" x2="300" y2="280" stroke="#6b7280" markerEnd="url(#arrow5)" />
            <text x="310" y="270" fill="#dc2626" fontSize="11">否(落榜)</text>
            
            <g transform="translate(100, 280)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 2 ? "#dc2626" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">第N志愿落榜</text>
            </g>
            
            <line x1="300" y1="330" x2="300" y2="360" stroke="#6b7280" markerEnd="url(#arrow5)" />
            
            <g transform="translate(150, 360)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 2 ? "#8b5cf6" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">N &lt; 6 ?</text>
            </g>
            
            <line x1="450" y1="395" x2="520" y2="395" stroke="#6b7280" />
            <text x="530" y="400" fill="#6b7280" fontSize="11">否</text>
            <line x1="520" y1="395" x2="520" y2="530" stroke="#6b7280" markerEnd="url(#arrow5)" />
            
            <line x1="300" y1="430" x2="300" y2="460" stroke="#6b7280" markerEnd="url(#arrow5)" />
            <text x="310" y="450" fill="#10b981" fontSize="11">是</text>
            
            <g transform="translate(100, 460)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 3 ? "#10b981" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">进入第N+1志愿</text>
            </g>
            
            <line x1="100" y1="485" x2="50" y2="485" stroke="#6b7280" />
            <line x1="50" y1="485" x2="50" y2="125" stroke="#6b7280" />
            <line x1="50" y1="125" x2="100" y2="125" stroke="#6b7280" markerEnd="url(#arrow5)" />
            <text x="55" y="300" fill="#6b7280" fontSize="10" transform="rotate(-90, 55, 300)">继续处理</text>
            
            <g transform="translate(100, 530)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 4 ? "#f59e0b" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">本梯度全部落选</text>
            </g>
            
            <line x1="300" y1="580" x2="300" y2="610" stroke="#6b7280" markerEnd="url(#arrow5)" />
            
            <g transform="translate(100, 610)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 5 ? "#3b82f6" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">进入下一梯度投档</text>
            </g>
            
            <g transform="translate(225, 680)">
              <ellipse cx="75" cy="25" rx="75" ry="25" fill={activeStep >= 5 ? "#10b981" : "#e5e7eb"} />
              <text x="75" y="30" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">录取成功</text>
            </g>
          </svg>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px' }}>志愿落榜处理详解</h4>
          
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#dc2626', marginBottom: '8px' }}>落榜原因</h5>
            <ul style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>名额已满</strong>：学校在更高分考生中已完成招生计划</li>
              <li><strong>分数不够</strong>：考生分数低于学校录取最低分</li>
              <li><strong>末位志愿序号限制</strong>：学校在更靠前志愿已完成录取</li>
            </ul>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#92400e', marginBottom: '8px' }}>举例说明</h5>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <strong>考生A</strong>：710分（第一梯度）<br/>
              第1志愿：X校（最低分715）→ 落榜<br/>
              第2志愿：Y校（名额已满）→ 落榜<br/>
              第3志愿：Z校（最低分698）→ <span style={{color: '#10b981'}}>录取成功</span><br/><br/>
              虽然第1、2志愿落榜，但第3志愿仍可录取，且优先于第二梯度考生。
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div key={index} style={{ padding: '12px 16px', background: activeStep === index ? '#eff6ff' : '#f8f9fa', border: activeStep === index ? '2px solid #3b82f6' : '2px solid transparent', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: activeStep >= index ? '#3b82f6' : '#d1d5db', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>{index + 1}</span>
                  <span style={{ fontWeight: '600' }}>{step.title}</span>
                </div>
                {activeStep === index && <p style={{ marginTop: '8px', paddingLeft: '32px', color: '#666', fontSize: '13px' }}>{step.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GradientFailFlowChart({ steps, activeStep, isAnimating, onAnimate }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onAnimate} disabled={isAnimating}>
          {isAnimating ? '演示中...' : '播放演示'}
        </button>
        <span style={{ marginLeft: '16px', color: '#666', fontSize: '14px' }}>
          展示整个梯度落榜后的处理流程
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <svg viewBox="0 0 600 800" style={{ width: '100%', maxWidth: '600px' }}>
            <defs>
              <marker id="arrow6" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            <g transform="translate(200, 20)">
              <ellipse cx="100" cy="25" rx="100" ry="25" fill={activeStep >= 0 ? "#dc2626" : "#e5e7eb"} />
              <text x="100" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">第一梯度投档结束</text>
              <text x="100" y="36" textAnchor="middle" fill="white" fontSize="9">所有考生处理完毕</text>
            </g>
            
            <line x1="300" y1="70" x2="300" y2="100" stroke="#6b7280" markerEnd="url(#arrow6)" />
            
            <g transform="translate(100, 100)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 1 ? "#3b82f6" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">检查考生录取状态</text>
            </g>
            
            <line x1="300" y1="150" x2="300" y2="180" stroke="#6b7280" markerEnd="url(#arrow6)" />
            
            <g transform="translate(150, 180)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 1 ? "#f59e0b" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">是否已录取?</text>
            </g>
            
            <line x1="450" y1="215" x2="520" y2="215" stroke="#6b7280" />
            <text x="530" y="220" fill="#10b981" fontSize="11">是</text>
            <line x1="520" y1="215" x2="520" y2="730" stroke="#10b981" markerEnd="url(#arrow6)" />
            
            <line x1="300" y1="250" x2="300" y2="280" stroke="#6b7280" markerEnd="url(#arrow6)" />
            <text x="310" y="270" fill="#dc2626" fontSize="11">否</text>
            
            <g transform="translate(100, 280)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 2 ? "#dc2626" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">第一梯度全部落选</text>
            </g>
            
            <line x1="300" y1="330" x2="300" y2="360" stroke="#6b7280" markerEnd="url(#arrow6)" />
            
            <g transform="translate(100, 360)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 3 ? "#f59e0b" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">进入第二梯度投档</text>
            </g>
            
            <line x1="300" y1="410" x2="300" y2="440" stroke="#6b7280" markerEnd="url(#arrow6)" />
            
            <g transform="translate(100, 440)">
              <rect width="400" height="60" rx="8" fill={activeStep >= 4 ? "#10b981" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">梯度优先优势</text>
              <text x="200" y="42" textAnchor="middle" fill="white" fontSize="10">第一梯度第6志愿优先于第二梯度第1志愿</text>
            </g>
            
            <line x1="300" y1="500" x2="300" y2="530" stroke="#6b7280" markerEnd="url(#arrow6)" />
            
            <g transform="translate(150, 530)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 4 ? "#8b5cf6" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">是否录取?</text>
            </g>
            
            <line x1="450" y1="565" x2="520" y2="565" stroke="#6b7280" />
            <text x="530" y="570" fill="#10b981" fontSize="11">是</text>
            <line x1="520" y1="565" x2="520" y2="730" stroke="#10b981" markerEnd="url(#arrow6)" />
            
            <line x1="300" y1="600" x2="300" y2="630" stroke="#6b7280" markerEnd="url(#arrow6)" />
            <text x="310" y="620" fill="#dc2626" fontSize="11">否</text>
            
            <g transform="translate(100, 630)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 5 ? "#6b7280" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">继续后续梯度/批次</text>
            </g>
            
            <g transform="translate(200, 730)">
              <ellipse cx="100" cy="25" rx="100" ry="25" fill={activeStep >= 5 ? "#10b981" : "#e5e7eb"} />
              <text x="100" y="30" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">投档结束</text>
            </g>
          </svg>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px' }}>梯度落榜处理详解</h4>
          
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#0369a1', marginBottom: '8px' }}>梯度优先的核心优势</h5>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              即使第一梯度考生所有志愿都落选，进入第二梯度投档时，其第6志愿仍然优先于第二梯度考生的第1志愿。这是"梯度投档"的核心规则。
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#92400e', marginBottom: '8px' }}>举例说明</h5>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <p><strong>考生A</strong>：710分（第一梯度），第6志愿填报Z校</p>
              <p><strong>考生B</strong>：680分（第二梯度），第1志愿填报Z校</p>
              <p style={{ marginTop: '8px', color: '#10b981' }}>
                → Z校投档时，A的第6志愿优先于B的第1志愿<br/>
                → <strong>A先录取</strong>（即使A是第6志愿，B是第1志愿）
              </p>
            </div>
          </div>
          
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#059669', marginBottom: '8px' }}>志愿填报建议</h5>
            <ul style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>合理搭配"冲、稳、保"志愿</li>
              <li>最后一个志愿填报录取分数较低的学校作为保底</li>
              <li>了解学校的末位考生志愿序号，避免扎堆</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div key={index} style={{ padding: '12px 16px', background: activeStep === index ? '#eff6ff' : '#f8f9fa', border: activeStep === index ? '2px solid #3b82f6' : '2px solid transparent', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: activeStep >= index ? '#3b82f6' : '#d1d5db', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>{index + 1}</span>
                  <span style={{ fontWeight: '600' }}>{step.title}</span>
                </div>
                {activeStep === index && <p style={{ marginTop: '8px', paddingLeft: '32px', color: '#666', fontSize: '13px' }}>{step.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GradientFlowChart({ steps, activeStep, isAnimating, onAnimate, gradientColors }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onAnimate} disabled={isAnimating}>
          {isAnimating ? '演示中...' : '播放演示'}
        </button>
        <span style={{ marginLeft: '16px', color: '#666', fontSize: '14px' }}>
          展示同一梯度内"志愿优先、择优录取"的处理流程
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <svg viewBox="0 0 600 750" style={{ width: '100%', maxWidth: '600px' }}>
            <defs>
              <marker id="arrow2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            <g transform="translate(250, 20)">
              <ellipse cx="50" cy="25" rx="60" ry="25" fill={activeStep >= 0 ? "#3b82f6" : "#e5e7eb"} />
              <text x="50" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">进入第N梯度</text>
            </g>
            
            <line x1="300" y1="70" x2="300" y2="100" stroke="#6b7280" markerEnd="url(#arrow2)" />
            
            <g transform="translate(150, 100)">
              <rect width="300" height="50" rx="8" fill={activeStep >= 1 ? "#10b981" : "#e5e7eb"} />
              <text x="150" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">获取本梯度考生</text>
              <text x="150" y="38" textAnchor="middle" fill="white" fontSize="10">如：702分以上的所有考生</text>
            </g>
            
            <line x1="300" y1="150" x2="300" y2="180" stroke="#6b7280" markerEnd="url(#arrow2)" />
            
            <g transform="translate(150, 180)">
              <rect width="300" height="50" rx="8" fill={activeStep >= 2 ? "#f59e0b" : "#e5e7eb"} />
              <text x="150" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">按成绩排序</text>
              <text x="150" y="38" textAnchor="middle" fill="white" fontSize="10">总分从高到低</text>
            </g>
            
            <line x1="300" y1="230" x2="300" y2="260" stroke="#6b7280" markerEnd="url(#arrow2)" />
            
            <g transform="translate(200, 260)">
              <rect width="200" height="40" rx="8" fill={activeStep >= 3 ? "#8b5cf6" : "#e5e7eb"} />
              <text x="100" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">志愿序号 V = 1</text>
            </g>
            
            <line x1="300" y1="300" x2="300" y2="330" stroke="#6b7280" markerEnd="url(#arrow2)" />
            
            <g transform="translate(100, 330)">
              <rect width="400" height="70" rx="8" fill={activeStep >= 3 ? "#3b82f6" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">处理第V志愿</text>
              <text x="200" y="40" textAnchor="middle" fill="white" fontSize="10">1. 取出所有填报第V志愿的考生</text>
              <text x="200" y="55" textAnchor="middle" fill="white" fontSize="10">2. 按成绩排序，依次投档到对应学校</text>
            </g>
            
            <line x1="300" y1="400" x2="300" y2="430" stroke="#6b7280" markerEnd="url(#arrow2)" />
            
            <g transform="translate(150, 430)">
              <polygon points="150,0 300,40 150,80 0,40" fill={activeStep >= 4 ? "#f59e0b" : "#e5e7eb"} />
              <text x="150" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">V ≤ 6 ?</text>
              <text x="150" y="50" textAnchor="middle" fill="white" fontSize="9">(最多6个志愿)</text>
            </g>
            
            <line x1="450" y1="470" x2="520" y2="470" stroke="#6b7280" />
            <text x="530" y="475" fill="#6b7280" fontSize="11">否</text>
            <line x1="520" y1="470" x2="520" y2="650" stroke="#6b7280" markerEnd="url(#arrow2)" />
            
            <line x1="300" y1="510" x2="300" y2="540" stroke="#6b7280" markerEnd="url(#arrow2)" />
            <text x="310" y="530" fill="#6b7280" fontSize="11">是</text>
            
            <g transform="translate(150, 540)">
              <rect width="300" height="50" rx="8" fill={activeStep >= 4 ? "#10b981" : "#e5e7eb"} />
              <text x="150" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">V = V + 1</text>
              <text x="150" y="38" textAnchor="middle" fill="white" fontSize="10">处理下一个志愿</text>
            </g>
            
            <line x1="150" y1="565" x2="80" y2="565" stroke="#6b7280" />
            <line x1="80" y1="565" x2="80" y2="350" stroke="#6b7280" />
            <line x1="80" y1="350" x2="100" y2="350" stroke="#6b7280" markerEnd="url(#arrow2)" />
            <text x="85" y="460" fill="#6b7280" fontSize="10" transform="rotate(-90, 85, 460)">循环</text>
            
            <g transform="translate(250, 650)">
              <ellipse cx="50" cy="25" rx="60" ry="25" fill={activeStep >= 5 ? "#6b7280" : "#e5e7eb"} />
              <text x="50" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">本梯度结束</text>
              <text x="50" y="36" textAnchor="middle" fill="white" fontSize="9">进入下一梯度</text>
            </g>
          </svg>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px' }}>梯度内处理详解</h4>
          
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#0369a1', marginBottom: '8px' }}>志愿优先原则</h5>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              同一梯度内，先处理所有考生的第1志愿，第1志愿全部处理完后，再处理第2志愿，依此类推。
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#92400e', marginBottom: '8px' }}>举例说明</h5>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <strong>考生A</strong>：710分，第1志愿填报X校<br/>
              <strong>考生B</strong>：705分，第2志愿填报X校<br/><br/>
              处理第1志愿时，A先投档到X校。处理第2志愿时，B才投档。即使B分数也很高，也要等第1志愿处理完。
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px 16px',
                  background: activeStep === index ? '#eff6ff' : '#f8f9fa',
                  border: activeStep === index ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: activeStep >= index ? '#3b82f6' : '#d1d5db',
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: '600',
                  }}>{index + 1}</span>
                  <span style={{ fontWeight: '600' }}>{step.title}</span>
                </div>
                {activeStep === index && (
                  <p style={{ marginTop: '8px', paddingLeft: '32px', color: '#666', fontSize: '13px' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VolunteerFlowChart({ steps, activeStep, isAnimating, onAnimate }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onAnimate} disabled={isAnimating}>
          {isAnimating ? '演示中...' : '播放演示'}
        </button>
        <span style={{ marginLeft: '16px', color: '#666', fontSize: '14px' }}>
          展示单个志愿的投档处理过程
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <svg viewBox="0 0 550 700" style={{ width: '100%', maxWidth: '550px' }}>
            <defs>
              <marker id="arrow3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            <g transform="translate(200, 20)">
              <ellipse cx="75" cy="25" rx="75" ry="25" fill={activeStep >= 0 ? "#3b82f6" : "#e5e7eb"} />
              <text x="75" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">开始处理第N志愿</text>
              <text x="75" y="36" textAnchor="middle" fill="white" fontSize="9">如：处理第1志愿</text>
            </g>
            
            <line x1="275" y1="70" x2="275" y2="100" stroke="#6b7280" markerEnd="url(#arrow3)" />
            
            <g transform="translate(75, 100)">
              <rect width="400" height="55" rx="8" fill={activeStep >= 1 ? "#10b981" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">获取第N志愿考生</text>
              <text x="200" y="40" textAnchor="middle" fill="white" fontSize="10">筛选所有填报该校第N志愿且未被录取的考生</text>
            </g>
            
            <line x1="275" y1="155" x2="275" y2="185" stroke="#6b7280" markerEnd="url(#arrow3)" />
            
            <g transform="translate(75, 185)">
              <rect width="400" height="55" rx="8" fill={activeStep >= 2 ? "#f59e0b" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">按成绩排序</text>
              <text x="200" y="40" textAnchor="middle" fill="white" fontSize="10">总分从高到低，同分则按规则比较</text>
            </g>
            
            <line x1="275" y1="240" x2="275" y2="270" stroke="#6b7280" markerEnd="url(#arrow3)" />
            
            <g transform="translate(100, 270)">
              <rect width="350" height="55" rx="8" fill={activeStep >= 3 ? "#8b5cf6" : "#e5e7eb"} />
              <text x="175" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">检查学校剩余名额</text>
              <text x="175" y="40" textAnchor="middle" fill="white" fontSize="10">查询目标学校的招生计划完成情况</text>
            </g>
            
            <line x1="275" y1="325" x2="275" y2="355" stroke="#6b7280" markerEnd="url(#arrow3)" />
            
            <g transform="translate(125, 355)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 4 ? "#f59e0b" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">名额 &gt; 0 ?</text>
              <text x="150" y="46" textAnchor="middle" fill="white" fontSize="9">还有剩余名额</text>
            </g>
            
            <line x1="425" y1="390" x2="480" y2="390" stroke="#6b7280" />
            <text x="490" y="395" fill="#6b7280" fontSize="11">否</text>
            <line x1="480" y1="390" x2="480" y2="620" stroke="#6b7280" markerEnd="url(#arrow3)" />
            
            <line x1="275" y1="425" x2="275" y2="455" stroke="#6b7280" markerEnd="url(#arrow3)" />
            <text x="285" y="445" fill="#6b7280" fontSize="11">是</text>
            
            <g transform="translate(75, 455)">
              <rect width="400" height="55" rx="8" fill={activeStep >= 4 ? "#10b981" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">录取最高分考生</text>
              <text x="200" y="40" textAnchor="middle" fill="white" fontSize="10">从排序队列中取出最高分考生，录取到该校</text>
            </g>
            
            <line x1="275" y1="510" x2="275" y2="540" stroke="#6b7280" markerEnd="url(#arrow3)" />
            
            <g transform="translate(75, 540)">
              <rect width="400" height="55" rx="8" fill={activeStep >= 5 ? "#3b82f6" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">更新学校名额</text>
              <text x="200" y="40" textAnchor="middle" fill="white" fontSize="10">剩余名额 - 1，记录录取信息</text>
            </g>
            
            <line x1="75" y1="567" x2="30" y2="567" stroke="#6b7280" />
            <line x1="30" y1="567" x2="30" y2="390" stroke="#6b7280" />
            <line x1="30" y1="390" x2="100" y2="390" stroke="#6b7280" markerEnd="url(#arrow3)" />
            <text x="35" y="480" fill="#6b7280" fontSize="10" transform="rotate(-90, 35, 480)">继续录取</text>
            
            <g transform="translate(200, 620)">
              <ellipse cx="75" cy="25" rx="75" ry="25" fill={activeStep >= 5 ? "#6b7280" : "#e5e7eb"} />
              <text x="75" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">第N志愿处理完成</text>
              <text x="75" y="36" textAnchor="middle" fill="white" fontSize="9">进入第N+1志愿</text>
            </g>
          </svg>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px' }}>志愿投档详解</h4>
          
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#0369a1', marginBottom: '8px' }}>择优录取原则</h5>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              同一志愿的考生按成绩从高到低录取，直到学校名额用完。成绩高的考生优先录取。
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#92400e', marginBottom: '8px' }}>举例说明</h5>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              X校剩余名额2个，第1志愿填报X校的考生有：<br/>
              <strong>考生A</strong>：710分 → 录取<br/>
              <strong>考生B</strong>：705分 → 录取<br/>
              <strong>考生C</strong>：700分 → 名额已满，无法录取<br/>
              考生C只能等待第2志愿的处理
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px 16px',
                  background: activeStep === index ? '#eff6ff' : '#f8f9fa',
                  border: activeStep === index ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: activeStep >= index ? '#3b82f6' : '#d1d5db',
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: '600',
                  }}>{index + 1}</span>
                  <span style={{ fontWeight: '600' }}>{step.title}</span>
                </div>
                {activeStep === index && (
                  <p style={{ marginTop: '8px', paddingLeft: '32px', color: '#666', fontSize: '13px' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TieBreakFlowChart({ steps, activeStep, isAnimating, onAnimate }) {
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onAnimate} disabled={isAnimating}>
          {isAnimating ? '演示中...' : '播放演示'}
        </button>
        <span style={{ marginLeft: '16px', color: '#666', fontSize: '14px' }}>
          展示同分考生的排名确定规则
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <svg viewBox="0 0 500 600" style={{ width: '100%', maxWidth: '500px' }}>
            <defs>
              <marker id="arrow4" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            <g transform="translate(175, 20)">
              <ellipse cx="75" cy="25" rx="75" ry="25" fill={activeStep >= 0 ? "#dc2626" : "#e5e7eb"} />
              <text x="75" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">发现同分考生</text>
              <text x="75" y="36" textAnchor="middle" fill="white" fontSize="9">总分相同</text>
            </g>
            
            <line x1="250" y1="70" x2="250" y2="100" stroke="#6b7280" markerEnd="url(#arrow4)" />
            
            <g transform="translate(50, 100)">
              <rect width="400" height="60" rx="8" fill={activeStep >= 1 ? "#f59e0b" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">比较语数英三科总分</text>
              <text x="200" y="42" textAnchor="middle" fill="white" fontSize="11">语文 + 数学 + 英语</text>
            </g>
            
            <line x1="250" y1="160" x2="250" y2="190" stroke="#6b7280" markerEnd="url(#arrow4)" />
            
            <g transform="translate(100, 190)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 1 ? "#10b981" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">三科总分相同?</text>
              <text x="150" y="46" textAnchor="middle" fill="white" fontSize="9">是否仍相同</text>
            </g>
            
            <line x1="400" y1="225" x2="450" y2="225" stroke="#6b7280" />
            <text x="455" y="230" fill="#6b7280" fontSize="10">否</text>
            <line x1="450" y1="225" x2="450" y2="530" stroke="#6b7280" markerEnd="url(#arrow4)" />
            
            <line x1="250" y1="260" x2="250" y2="290" stroke="#6b7280" markerEnd="url(#arrow4)" />
            <text x="260" y="280" fill="#6b7280" fontSize="10">是</text>
            
            <g transform="translate(50, 290)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 2 ? "#3b82f6" : "#e5e7eb"} />
              <text x="200" y="30" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">比较语文成绩</text>
            </g>
            
            <line x1="250" y1="340" x2="250" y2="370" stroke="#6b7280" markerEnd="url(#arrow4)" />
            
            <g transform="translate(100, 370)">
              <polygon points="150,0 300,35 150,70 0,35" fill={activeStep >= 2 ? "#8b5cf6" : "#e5e7eb"} />
              <text x="150" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">语文相同?</text>
            </g>
            
            <line x1="400" y1="405" x2="450" y2="405" stroke="#6b7280" />
            <text x="455" y="410" fill="#6b7280" fontSize="10">否</text>
            <line x1="450" y1="405" x2="450" y2="530" stroke="#6b7280" markerEnd="url(#arrow4)" />
            
            <line x1="250" y1="440" x2="250" y2="470" stroke="#6b7280" markerEnd="url(#arrow4)" />
            <text x="260" y="460" fill="#6b7280" fontSize="10">是</text>
            
            <g transform="translate(50, 470)">
              <rect width="400" height="50" rx="8" fill={activeStep >= 3 ? "#ec4899" : "#e5e7eb"} />
              <text x="200" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">比较数学成绩</text>
              <text x="200" y="38" textAnchor="middle" fill="white" fontSize="10">若仍相同，再比较英语成绩</text>
            </g>
            
            <g transform="translate(175, 530)">
              <ellipse cx="75" cy="25" rx="75" ry="25" fill={activeStep >= 4 ? "#10b981" : "#e5e7eb"} />
              <text x="75" y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">确定排名</text>
              <text x="75" y="36" textAnchor="middle" fill="white" fontSize="9">高者优先录取</text>
            </g>
          </svg>
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ marginBottom: '16px' }}>同分比较规则</h4>
          
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#dc2626', marginBottom: '8px' }}>比较顺序</h5>
            <ol style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>语数英三科总分</strong> - 高者优先</li>
              <li><strong>语文成绩</strong> - 高者优先</li>
              <li><strong>数学成绩</strong> - 高者优先</li>
              <li><strong>英语成绩</strong> - 高者优先</li>
            </ol>
          </div>
          
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', marginBottom: '16px' }}>
            <h5 style={{ color: '#92400e', marginBottom: '8px' }}>举例说明</h5>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              <p><strong>考生A</strong>：总分700，语数英285，语文95，数学98</p>
              <p><strong>考生B</strong>：总分700，语数英285，语文95，数学97</p>
              <p style={{ marginTop: '8px', color: '#10b981' }}>
                → 总分相同，三科总分相同，语文相同<br/>
                → 比较数学：A(98) &gt; B(97)<br/>
                → <strong>A优先录取</strong>
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px 16px',
                  background: activeStep === index ? '#eff6ff' : '#f8f9fa',
                  border: activeStep === index ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: activeStep >= index ? '#3b82f6' : '#d1d5db',
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: '600',
                  }}>{index + 1}</span>
                  <span style={{ fontWeight: '600' }}>{step.title}</span>
                </div>
                {activeStep === index && (
                  <p style={{ marginTop: '8px', paddingLeft: '32px', color: '#666', fontSize: '13px' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
