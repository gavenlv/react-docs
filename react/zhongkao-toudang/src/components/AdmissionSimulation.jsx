import { useState } from 'react'
import { schools2025Full } from '../data/schools2025Full.js'
import { 
  batchAdmission, 
  generateRandomStudents,
  getGradientLabel,
  gradientColors,
  GRADIENT_LINES
} from '../utils/admissionCalculator.js'

export default function AdmissionSimulation() {
  const [config, setConfig] = useState({
    studentCount: 100,
    minScore: 487,
    maxScore: 810,
    volunteerCount: 6,
  })
  
  const [results, setResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  
  const runSimulation = () => {
    setIsRunning(true)
    
    setTimeout(() => {
      const students = generateRandomStudents(
        config.studentCount,
        [config.minScore, config.maxScore],
        config.volunteerCount
      )
      
      const { results: admissionResults, stats } = batchAdmission(students)
      
      setResults({
        students: admissionResults,
        stats,
        config: { ...config },
        timestamp: new Date().toLocaleString(),
      })
      
      setIsRunning(false)
    }, 100)
  }
  
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">投档模拟</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            模拟考生投档录取过程，严格按照广州市投档规则执行
          </p>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '24px',
        }}>
          <h4 style={{ marginBottom: '16px' }}>模拟参数设置</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                模拟考生数量
              </label>
              <input
                type="number"
                value={config.studentCount}
                onChange={(e) => setConfig({ ...config, studentCount: parseInt(e.target.value) || 100 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                min="1"
                max="10000"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                最低分数
              </label>
              <input
                type="number"
                value={config.minScore}
                onChange={(e) => setConfig({ ...config, minScore: parseInt(e.target.value) || 487 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                min="0"
                max="810"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                最高分数
              </label>
              <input
                type="number"
                value={config.maxScore}
                onChange={(e) => setConfig({ ...config, maxScore: parseInt(e.target.value) || 810 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                min="0"
                max="810"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                每人志愿数
              </label>
              <input
                type="number"
                value={config.volunteerCount}
                onChange={(e) => setConfig({ ...config, volunteerCount: parseInt(e.target.value) || 6 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                min="1"
                max="6"
              />
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={runSimulation}
              disabled={isRunning}
            >
              {isRunning ? '模拟中...' : '开始模拟投档'}
            </button>
          </div>
        </div>
        
        {results && (
          <div>
            <div style={{ 
              background: '#ecfdf5', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <h4 style={{ color: '#166534', marginBottom: '16px' }}>
                模拟结果统计
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal', marginLeft: '12px' }}>
                  ({results.timestamp})
                </span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>总考生数</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{results.stats.total}</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>录取人数</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>{results.stats.admitted}</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>未录取人数</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>{results.stats.notAdmitted}</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>录取率</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>
                    {(results.stats.admitted / results.stats.total * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>按梯度统计</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {[1, 2, 3, 4, 5, 6].map(level => {
                  const data = results.stats.byGradient[level]
                  if (!data || data.total === 0) return null
                  return (
                    <div 
                      key={level}
                      style={{ 
                        background: '#f8f9fa', 
                        padding: '12px', 
                        borderRadius: '8px',
                        borderLeft: `4px solid ${gradientColors[level]}`,
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '600', color: gradientColors[level] }}>
                        {getGradientLabel(level)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        总数: {data.total} | 录取: {data.admitted}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        录取率: {(data.admitted / data.total * 100).toFixed(1)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>学校录取统计（前20所）</h4>
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>学校名称</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>户籍生</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>非户籍生</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.stats.bySchool)
                      .sort((a, b) => b[1].total - a[1].total)
                      .slice(0, 20)
                      .map(([id, data]) => (
                        <tr key={id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 12px', fontSize: '13px' }}>{data.name}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>{data.hukou}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>{data.nonHukou}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>{data.total}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '12px' }}>录取结果详情（前50条）</h4>
              <div style={{ 
                maxHeight: '500px', 
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>考生ID</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>分数</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>类型</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>梯度</th>
                      <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>录取学校</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>志愿</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.students.slice(0, 50).map((student, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', fontSize: '12px' }}>{student.id}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>{student.score}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px' }}>
                          {student.isHukou ? '户籍' : '非户籍'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px' }}>
                          <span style={{ color: gradientColors[student.result.gradientLevel] }}>
                            {getGradientLabel(student.result.gradientLevel)}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: '12px' }}>
                          {student.result.admitted ? (
                            <span style={{ color: '#16a34a' }}>{student.result.school.name}</span>
                          ) : (
                            <span style={{ color: '#dc2626' }}>未录取</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '12px' }}>
                          {student.result.admitted ? `第${student.result.volunteerOrder}志愿` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">投档规则说明</h3>
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#374151' }}>
          <p><strong>广州市中考投档录取规则：</strong></p>
          <ol style={{ paddingLeft: '20px' }}>
            <li><strong>分数优先：</strong>高分考生优先投档，同分考生按同分序号排序</li>
            <li><strong>志愿优先：</strong>同一所学校，志愿序号小的优先录取</li>
            <li><strong>梯度投档：</strong>按梯度控制线分批次投档</li>
          </ol>
          
          <p style={{ marginTop: '16px' }}><strong>录取判定条件：</strong></p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>分数优先录取：考生分数 &gt; 学校最低录取线</li>
            <li>同分录取：考生分数 = 学校最低录取线 且 同分序号 ≤ 学校最低同分序号</li>
            <li>志愿优先录取：志愿序号 ≤ 末位考生志愿序号 且 分数 ≥ 末位同分序号分数</li>
          </ul>
          
          <p style={{ marginTop: '16px' }}><strong>2025年梯度控制线：</strong></p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
            {[
              { label: '第一梯度', score: GRADIENT_LINES.first },
              { label: '第二梯度', score: GRADIENT_LINES.second },
              { label: '第三梯度', score: GRADIENT_LINES.third },
              { label: '第四梯度', score: GRADIENT_LINES.fourth },
              { label: '第五梯度', score: GRADIENT_LINES.fifth },
              { label: '普高最低线', score: GRADIENT_LINES.minimum },
            ].map(item => (
              <span key={item.label} style={{ fontSize: '13px' }}>
                {item.label}: {item.score}分
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
