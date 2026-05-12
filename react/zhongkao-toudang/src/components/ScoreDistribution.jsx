import { useState, useMemo } from 'react'
import { GRADIENT_LINES, getGradientLevel } from '../utils/admission.js'
import { schools2025Full } from '../data/schools2025Full.js'

export default function ScoreDistribution() {
  const [activeTab, setActiveTab] = useState('distribution')
  
  const gradientColors = {
    1: '#dc2626',
    2: '#f97316',
    3: '#f59e0b',
    4: '#84cc16',
    5: '#22c55e',
    6: '#3b82f6',
    7: '#6b7280',
  }
  
  const gradientData = [
    { level: 1, label: '第一梯度', minScore: GRADIENT_LINES.first, maxScore: 810, count: 12865, rate: 9.21, color: '#dc2626' },
    { level: 2, label: '第二梯度', minScore: GRADIENT_LINES.second, maxScore: 706, count: 18661, rate: 13.36, color: '#f97316' },
    { level: 3, label: '第三梯度', minScore: GRADIENT_LINES.third, maxScore: 666, count: 18354, rate: 13.14, color: '#f59e0b' },
    { level: 4, label: '第四梯度', minScore: GRADIENT_LINES.fourth, maxScore: 626, count: 16020, rate: 11.47, color: '#84cc16' },
    { level: 5, label: '第五梯度', minScore: GRADIENT_LINES.fifth, maxScore: 586, count: 13824, rate: 9.89, color: '#22c55e' },
    { level: 6, label: '普高最低控制线', minScore: GRADIENT_LINES.minimum, maxScore: 546, count: 16688, rate: 11.95, color: '#3b82f6' },
  ]
  
  const topSchools = useMemo(() => {
    return schools2025Full
      .filter(s => s.hukou && s.hukou.minScore >= 700)
      .sort((a, b) => b.hukou.minScore - a.hukou.minScore)
      .slice(0, 20)
      .map(s => ({
        name: s.name.substring(0, 10),
        fullName: s.name,
        score: s.hukou.minScore,
        nonHukouScore: s.nonHukou?.minScore || null,
        lastVolunteer: s.hukou.lastVolunteer,
        gradient: getGradientLevel(s.hukou.minScore),
      }))
  }, [])
  
  const gradientSchools = useMemo(() => {
    return {
      first: schools2025Full.filter(s => s.hukou && s.hukou.minScore >= GRADIENT_LINES.first),
      second: schools2025Full.filter(s => s.hukou && s.hukou.minScore >= GRADIENT_LINES.second && s.hukou.minScore < GRADIENT_LINES.first),
      third: schools2025Full.filter(s => s.hukou && s.hukou.minScore >= GRADIENT_LINES.third && s.hukou.minScore < GRADIENT_LINES.second),
      fourth: schools2025Full.filter(s => s.hukou && s.hukou.minScore >= GRADIENT_LINES.fourth && s.hukou.minScore < GRADIENT_LINES.third),
      fifth: schools2025Full.filter(s => s.hukou && s.hukou.minScore >= GRADIENT_LINES.fifth && s.hukou.minScore < GRADIENT_LINES.fourth),
      other: schools2025Full.filter(s => s.hukou && s.hukou.minScore < GRADIENT_LINES.fifth),
    }
  }, [])
  
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { min: 750, max: 810, label: '750分以上' },
      { min: 730, max: 749, label: '730-749分' },
      { min: 710, max: 729, label: '710-729分' },
      { min: 690, max: 709, label: '690-709分' },
      { min: 670, max: 689, label: '670-689分' },
      { min: 650, max: 669, label: '650-669分' },
      { min: 630, max: 649, label: '630-649分' },
      { min: 610, max: 629, label: '610-629分' },
      { min: 590, max: 609, label: '590-609分' },
      { min: 570, max: 589, label: '570-589分' },
      { min: 550, max: 569, label: '550-569分' },
      { min: 520, max: 549, label: '520-549分' },
      { min: 487, max: 519, label: '487-519分' },
    ]
    
    return ranges.map(range => {
      const count = schools2025Full.filter(s => 
        s.hukou && s.hukou.minScore >= range.min && s.hukou.minScore <= range.max
      ).length
      return { ...range, count }
    })
  }, [])
  
  const stats = useMemo(() => {
    const withHukou = schools2025Full.filter(s => s.hukou)
    const withNonHukou = schools2025Full.filter(s => s.nonHukou)
    const publicSchools = schools2025Full.filter(s => s.type === '公办')
    const privateSchools = schools2025Full.filter(s => s.type === '民办')
    
    const avgScore = withHukou.length > 0 
      ? Math.round(withHukou.reduce((sum, s) => sum + s.hukou.minScore, 0) / withHukou.length)
      : 0
    
    const maxScore = withHukou.length > 0 
      ? Math.max(...withHukou.map(s => s.hukou.minScore))
      : 0
    
    const minScore = withHukou.length > 0 
      ? Math.min(...withHukou.map(s => s.hukou.minScore))
      : 0
    
    return {
      total: schools2025Full.length,
      withHukou: withHukou.length,
      withNonHukou: withNonHukou.length,
      public: publicSchools.length,
      private: privateSchools.length,
      avgScore,
      maxScore,
      minScore,
    }
  }, [])
  
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">2025年广州中考数据概览</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            数据来源：2025年广州市普通高中第三批录取数据
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'distribution', label: '分数分布' },
            { key: 'gradient', label: '梯度分布' },
            { key: 'top', label: '名校录取线' },
            { key: 'stats', label: '统计概览' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn ${activeTab === tab.key ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ padding: '8px 16px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'distribution' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>学校录取分数线分布</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {scoreDistribution.map((range, idx) => (
                <div key={idx} style={{ 
                  background: '#f8f9fa', 
                  padding: '16px', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: '500' }}>{range.label}</span>
                  <span style={{ 
                    background: range.count > 10 ? '#dbeafe' : '#f3f4f6',
                    color: range.count > 10 ? '#1d4ed8' : '#6b7280',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}>
                    {range.count} 所
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'gradient' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>各梯度学校分布</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { key: 'first', label: '第一梯度 (≥707分)', color: '#dc2626' },
                { key: 'second', label: '第二梯度 (662-706分)', color: '#f97316' },
                { key: 'third', label: '第三梯度 (622-661分)', color: '#f59e0b' },
                { key: 'fourth', label: '第四梯度 (582-621分)', color: '#84cc16' },
                { key: 'fifth', label: '第五梯度 (542-581分)', color: '#22c55e' },
                { key: 'other', label: '最低控制线以下', color: '#6b7280' },
              ].map(g => (
                <div key={g.key} style={{ 
                  background: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${g.color}`,
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>{g.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: g.color }}>
                    {gradientSchools[g.key].length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>所学校</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'top' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>录取分数线最高的学校 (≥700分)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>排名</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>学校名称</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>户籍生录取线</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>非户籍生录取线</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>末位志愿</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>梯度</th>
                  </tr>
                </thead>
                <tbody>
                  {topSchools.map((school, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ padding: '12px' }}>{school.fullName}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#dc2626' }}>
                        {school.score}分
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#f97316' }}>
                        {school.nonHukouScore ? `${school.nonHukouScore}分` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>第{school.lastVolunteer}志愿</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          background: gradientColors[school.gradient] || '#6b7280',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}>
                          第{school.gradient}梯度
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>数据统计概览</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#1d4ed8' }}>{stats.total}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>学校总数</div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#16a34a' }}>{stats.public}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>公办学校</div>
              </div>
              <div style={{ background: '#fefce8', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#ca8a04' }}>{stats.private}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>民办学校</div>
              </div>
              <div style={{ background: '#faf5ff', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#9333ea' }}>{stats.withHukou}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>有户籍生数据</div>
              </div>
              <div style={{ background: '#fff7ed', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#ea580c' }}>{stats.maxScore}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>最高录取线</div>
              </div>
              <div style={{ background: '#f0f9ff', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#0284c7' }}>{stats.avgScore}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>平均录取线</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#475569' }}>{stats.minScore}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>最低录取线</div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '12px' }}>梯度控制线说明</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>第一梯度控制线：<strong>{GRADIENT_LINES.first}分</strong></div>
                <div>第二梯度控制线：<strong>{GRADIENT_LINES.second}分</strong></div>
                <div>第三梯度控制线：<strong>{GRADIENT_LINES.third}分</strong></div>
                <div>第四梯度控制线：<strong>{GRADIENT_LINES.fourth}分</strong></div>
                <div>第五梯度控制线：<strong>{GRADIENT_LINES.fifth}分</strong></div>
                <div>普高最低控制线：<strong>{GRADIENT_LINES.minimum}分</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
