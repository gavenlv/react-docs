import { useState, useMemo } from 'react'
import { schools2025Full } from '../data/schools2025Full.js'

export default function SchoolManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterScope, setFilterScope] = useState('')
  const [sortBy, setSortBy] = useState('minScore')
  const [sortOrder, setSortOrder] = useState('desc')
  
  const filteredSchools = useMemo(() => {
    let result = schools2025Full.filter(school => {
      const matchSearch = school.name.includes(searchTerm) || school.id.includes(searchTerm)
      const matchType = !filterType || school.type === filterType
      const matchScope = !filterScope || school.scope === filterScope
      return matchSearch && matchType && matchScope
    })
    
    result.sort((a, b) => {
      let valueA, valueB
      
      if (sortBy === 'minScore') {
        valueA = a.hukou?.minScore || 0
        valueB = b.hukou?.minScore || 0
      } else if (sortBy === 'name') {
        valueA = a.name
        valueB = b.name
      } else if (sortBy === 'lastVolunteer') {
        valueA = a.hukou?.lastVolunteer || 0
        valueB = b.hukou?.lastVolunteer || 0
      }
      
      if (sortOrder === 'desc') {
        return valueB > valueA ? 1 : -1
      }
      return valueA > valueB ? 1 : -1
    })
    
    return result
  }, [searchTerm, filterType, filterScope, sortBy, sortOrder])
  
  const stats = useMemo(() => {
    const publicSchools = schools2025Full.filter(s => s.section === 'public')
    const privateSchools = schools2025Full.filter(s => s.section === 'private')
    
    return {
      total: schools2025Full.length,
      public: publicSchools.length,
      private: privateSchools.length,
      withHukouData: schools2025Full.filter(s => s.hukou).length,
      withNonHukouData: schools2025Full.filter(s => s.nonHukou).length,
    }
  }, [])
  
  const getTypeBadge = (type) => {
    if (type === '公办') {
      return <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>公办</span>
    }
    return <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>民办</span>
  }
  
  const getScopeBadge = (scope) => {
    if (scope === '全市') {
      return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>全市</span>
    }
    return <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{scope}</span>
  }
  
  const getScoreColor = (score) => {
    if (score >= 730) return '#dc2626'
    if (score >= 700) return '#f97316'
    if (score >= 670) return '#f59e0b'
    if (score >= 630) return '#84cc16'
    if (score >= 590) return '#22c55e'
    return '#3b82f6'
  }
  
  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1d4ed8' }}>{stats.total}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>学校总数</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a' }}>{stats.public}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>公办学校</div>
        </div>
        <div style={{ background: '#fefce8', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #fef08a' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ca8a04' }}>{stats.private}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>民办学校</div>
        </div>
        <div style={{ background: '#faf5ff', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e9d5ff' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#9333ea' }}>{stats.withHukouData}</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>有户籍生数据</div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">2025年广州市普通高中学校名单</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            数据来源：2025年广州市普通高中第三批录取数据
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="搜索学校名称或代码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '120px',
            }}
          >
            <option value="">全部类型</option>
            <option value="公办">公办</option>
            <option value="民办">民办</option>
          </select>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '120px',
            }}
          >
            <option value="">全部范围</option>
            <option value="全市">全市</option>
            <option value="本区">本区</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}
            style={{
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px',
            }}
          >
            <option value="minScore-desc">录取线从高到低</option>
            <option value="minScore-asc">录取线从低到高</option>
            <option value="name-asc">按名称排序</option>
            <option value="lastVolunteer-desc">末位志愿从高到低</option>
          </select>
        </div>
        
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
          共找到 <strong>{filteredSchools.length}</strong> 所学校
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>代码</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>学校名称</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>类型</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>范围</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>户籍生<br/>录取线</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>户籍生<br/>末位志愿</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>非户籍生<br/>录取线</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>非户籍生<br/>末位志愿</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((school, idx) => (
                <tr key={school.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{school.id}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{school.name}</div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getTypeBadge(school.type)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{getScopeBadge(school.scope)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {school.hukou ? (
                      <div>
                        <div style={{ fontWeight: '600', color: getScoreColor(school.hukou.minScore) }}>
                          {school.hukou.minScore}分
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          序号{school.hukou.minScoreSeq}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {school.hukou ? (
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          第{school.hukou.lastVolunteer}志愿
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {school.hukou.lastScore}分
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {school.nonHukou ? (
                      <div>
                        <div style={{ fontWeight: '600', color: getScoreColor(school.nonHukou.minScore) }}>
                          {school.nonHukou.minScore}分
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          序号{school.nonHukou.minScoreSeq}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {school.nonHukou ? (
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          第{school.nonHukou.lastVolunteer}志愿
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {school.nonHukou.lastScore}分
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
