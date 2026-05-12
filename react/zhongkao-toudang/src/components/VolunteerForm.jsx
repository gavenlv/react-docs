import { useState, useMemo, useRef, useEffect } from 'react'
import { schools2025Full, searchSchools } from '../data/schools2025Full.js'
import { 
  calculateAdmissionStrict, 
  getGradientLevel, 
  getGradientLabel, 
  gradientColors,
  GRADIENT_LINES 
} from '../utils/admissionCalculator.js'

function SchoolSearchSelect({ schools, selectedId, onSelect, isHukou, placeholder }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  
  const selectedSchool = schools.find(s => s.id === selectedId)
  
  const filteredSchools = useMemo(() => {
    if (!search) return schools.slice(0, 30)
    return searchSchools(search, isHukou).slice(0, 30)
  }, [search, schools, isHukou])
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (school) => {
    onSelect(school.id)
    setSearch('')
    setIsOpen(false)
  }
  
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? search : (selectedSchool ? selectedSchool.name : '')}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {filteredSchools.length === 0 ? (
            <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
              未找到匹配的学校
            </div>
          ) : (
            filteredSchools.map(school => {
              const score = isHukou ? school.hukou?.minScore : school.nonHukou?.minScore
              const isSelected = school.id === selectedId
              return (
                <div
                  key={school.id}
                  onClick={() => handleSelect(school)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background: isSelected ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.target.style.background = '#f8f9fa'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.target.style.background = 'white'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {school.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {school.type} | {school.scope}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: score >= 700 ? '#dc2626' : score >= 667 ? '#f97316' : '#666',
                    minWidth: '50px',
                    textAlign: 'right',
                  }}>
                    {score || '--'}分
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function VolunteerForm() {
  const [studentInfo, setStudentInfo] = useState({
    score: '',
    scoreSeq: '1',
    isHukou: true,
  })
  
  const [volunteers, setVolunteers] = useState([
    { schoolId: '' },
    { schoolId: '' },
    { schoolId: '' },
    { schoolId: '' },
    { schoolId: '' },
    { schoolId: '' },
  ])
  
  const [result, setResult] = useState(null)
  
  const gradientLevel = useMemo(() => {
    const score = parseInt(studentInfo.score)
    if (isNaN(score) || score < 0 || score > 810) return null
    return getGradientLevel(score)
  }, [studentInfo.score])
  
  const sortedSchools = useMemo(() => {
    return [...schools2025Full].sort((a, b) => {
      const scoreA = studentInfo.isHukou ? (a.hukou?.minScore || 999) : (a.nonHukou?.minScore || 999)
      const scoreB = studentInfo.isHukou ? (b.hukou?.minScore || 999) : (b.nonHukou?.minScore || 999)
      return scoreB - scoreA
    })
  }, [studentInfo.isHukou])
  
  const handleVolunteerChange = (index, schoolId) => {
    const newVolunteers = [...volunteers]
    newVolunteers[index] = { schoolId }
    setVolunteers(newVolunteers)
  }
  
  const calculateAdmission = () => {
    const score = parseInt(studentInfo.score)
    const scoreSeq = parseInt(studentInfo.scoreSeq) || 1
    
    const res = calculateAdmissionStrict(score, studentInfo.isHukou, volunteers, scoreSeq)
    setResult(res)
  }
  
  const renderProcessLog = () => {
    if (!result || !result.processLog) return null
    
    return (
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          投档录取过程
        </h4>
        
        <div style={{ 
          background: '#f8f9fa', 
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid #e5e7eb',
        }}>
          {result.processLog.map((log, idx) => {
            const isSuccess = log.status === 'success'
            const isFailed = log.status === 'failed'
            const isError = log.status === 'error'
            const isInfo = log.status === 'info'
            
            let borderColor = '#d1d5db'
            let bgColor = 'white'
            let iconColor = '#6b7280'
            let icon = '○'
            
            if (isSuccess) {
              borderColor = '#22c55e'
              bgColor = '#f0fdf4'
              iconColor = '#22c55e'
              icon = '✓'
            } else if (isFailed) {
              borderColor = '#f97316'
              bgColor = '#fff7ed'
              iconColor = '#f97316'
              icon = '✗'
            } else if (isError) {
              borderColor = '#dc2626'
              bgColor = '#fef2f2'
              iconColor = '#dc2626'
              icon = '!'
            } else if (isInfo) {
              borderColor = '#3b82f6'
              bgColor = '#eff6ff'
              iconColor = '#3b82f6'
              icon = 'i'
            }
            
            return (
              <div 
                key={idx}
                style={{ 
                  marginBottom: idx < result.processLog.length - 1 ? '12px' : 0,
                  padding: '16px',
                  background: bgColor,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${borderColor}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: iconColor,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                      {log.step}
                      {log.schoolName && (
                        <span style={{ color: '#6b7280', fontWeight: '400', marginLeft: '8px' }}>
                          - {log.schoolName}
                        </span>
                      )}
                    </div>
                    
                    {log.message && (
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                        {log.message}
                      </div>
                    )}
                    
                    {log.schoolMinScore && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                        gap: '8px',
                        fontSize: '13px',
                        color: '#6b7280',
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: '4px',
                      }}>
                        <div>
                          <span>学校录取线：</span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{log.schoolMinScore}分</span>
                        </div>
                        <div>
                          <span>最低同分序号：</span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{log.schoolMinScoreSeq}</span>
                        </div>
                        <div>
                          <span>末位志愿序号：</span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{log.lastVolunteer}</span>
                        </div>
                        <div>
                          <span>末位考生分数：</span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{log.lastScore}分</span>
                        </div>
                        <div>
                          <span>末位同分序号：</span>
                          <span style={{ fontWeight: '600', color: '#374151' }}>{log.lastScoreSeq}</span>
                        </div>
                      </div>
                    )}
                    
                    {log.admissionType && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: '#22c55e',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'inline-block',
                      }}>
                        {log.admissionType}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">模拟志愿填报</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            基于2025年广州市中考录取数据，严格按照"梯度投档、志愿优先、择优录取"原则计算
          </p>
        </div>
        
        <div style={{ 
          background: '#f0f9ff', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #bae6fd',
        }}>
          <h4 style={{ color: '#0369a1', marginBottom: '16px' }}>考生信息</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                中考总分 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                value={studentInfo.score}
                onChange={(e) => setStudentInfo({ ...studentInfo, score: e.target.value })}
                placeholder="满分810分"
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
              {studentInfo.score && gradientLevel && (
                <div style={{ marginTop: '6px', fontSize: '13px' }}>
                  <span style={{ 
                    color: gradientColors[gradientLevel],
                    fontWeight: '600',
                  }}>
                    {getGradientLabel(gradientLevel)}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                同分序号
              </label>
              <input
                type="number"
                value={studentInfo.scoreSeq}
                onChange={(e) => setStudentInfo({ ...studentInfo, scoreSeq: e.target.value })}
                placeholder="默认为1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
                min="1"
              />
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                同分时按序号排序
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                考生类型 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={studentInfo.isHukou ? 'hukou' : 'nonHukou'}
                onChange={(e) => setStudentInfo({ ...studentInfo, isHukou: e.target.value === 'hukou' })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                <option value="hukou">户籍生</option>
                <option value="nonHukou">非户籍生(随迁子女)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px' }}>志愿填报（第三批次）</h4>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            可填报6个志愿，按"梯度投档、志愿优先、择优录取"原则投档。输入学校名称可搜索选择。
          </p>
          
          {volunteers.map((volunteer, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '12px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
            }}>
              <div style={{ 
                width: '70px',
                fontWeight: '600',
                color: index < 3 ? '#dc2626' : '#666',
                fontSize: '14px',
              }}>
                第{index + 1}志愿
              </div>
              <div style={{ flex: 1 }}>
                <SchoolSearchSelect
                  schools={sortedSchools}
                  selectedId={volunteer.schoolId}
                  onSelect={(id) => handleVolunteerChange(index, id)}
                  isHukou={studentInfo.isHukou}
                  placeholder="输入学校名称搜索..."
                />
              </div>
              {volunteer.schoolId && (
                <div style={{ fontSize: '13px', minWidth: '60px', textAlign: 'right' }}>
                  {(() => {
                    const school = schools2025Full.find(s => s.id === volunteer.schoolId)
                    if (!school) return null
                    const minScore = studentInfo.isHukou ? school.hukou?.minScore : school.nonHukou?.minScore
                    const score = parseInt(studentInfo.score)
                    if (isNaN(score) || !minScore) return null
                    const gap = score - minScore
                    return (
                      <span style={{ 
                        color: gap >= 0 ? '#16a34a' : '#dc2626',
                        fontWeight: '500',
                      }}>
                        {gap >= 0 ? `+${gap}` : gap}分
                      </span>
                    )
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={calculateAdmission}
            disabled={!studentInfo.score || volunteers.filter(v => v.schoolId).length === 0}
          >
            计算录取结果
          </button>
          <button
            className="btn"
            onClick={() => {
              setVolunteers(volunteers.map(v => ({ schoolId: '' })))
              setResult(null)
            }}
          >
            清空志愿
          </button>
        </div>
        
        {result && (
          <div style={{ marginTop: '24px' }}>
            {result.success && result.admitted ? (
              <div style={{ 
                background: '#ecfdf5', 
                padding: '24px', 
                borderRadius: '12px',
                border: '2px solid #86efac',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{ color: '#166534', margin: 0 }}>录取成功</h3>
                    <p style={{ color: '#15803d', margin: 0, fontSize: '14px' }}>
                      {result.admissionType}
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    {result.school.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>志愿序号：</span>
                      <span style={{ fontWeight: '600' }}>第{result.volunteerOrder}志愿</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>考生分数：</span>
                      <span style={{ fontWeight: '600' }}>{result.score}分</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>学校录取线：</span>
                      <span style={{ fontWeight: '600' }}>{result.details.schoolMinScore}分</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>分数差距：</span>
                      <span style={{ 
                        fontWeight: '600',
                        color: result.details.scoreGap >= 0 ? '#16a34a' : '#dc2626',
                      }}>
                        {result.details.scoreGap >= 0 ? `+${result.details.scoreGap}` : result.details.scoreGap}分
                      </span>
                    </div>
                  </div>
                  {result.details.note && (
                    <div style={{ marginTop: '12px', fontSize: '13px', color: '#15803d', background: '#f0fdf4', padding: '8px', borderRadius: '4px' }}>
                      {result.details.note}
                    </div>
                  )}
                </div>
                
                {renderProcessLog()}
              </div>
            ) : (
              <div style={{ 
                background: '#fef2f2', 
                padding: '24px', 
                borderRadius: '12px',
                border: '2px solid #fecaca',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}>
                    ✗
                  </div>
                  <div>
                    <h3 style={{ color: '#991b1b', margin: 0 }}>
                      {result.admitted === false ? '未被录取' : '计算失败'}
                    </h3>
                    <p style={{ color: '#b91c1c', margin: 0, fontSize: '14px' }}>
                      {result.error}
                    </p>
                  </div>
                </div>
                
                {result.suggestion && (
                  <div style={{ 
                    background: 'white', 
                    padding: '12px', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                  }}>
                    💡 {result.suggestion}
                  </div>
                )}
                
                {renderProcessLog()}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">2025年梯度控制线</h3>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px',
        }}>
          {[
            { label: '第一梯度', score: GRADIENT_LINES.first, color: '#dc2626' },
            { label: '第二梯度', score: GRADIENT_LINES.second, color: '#f97316' },
            { label: '第三梯度', score: GRADIENT_LINES.third, color: '#f59e0b' },
            { label: '第四梯度', score: GRADIENT_LINES.fourth, color: '#84cc16' },
            { label: '第五梯度', score: GRADIENT_LINES.fifth, color: '#22c55e' },
            { label: '普高最低线', score: GRADIENT_LINES.minimum, color: '#3b82f6' },
          ].map(item => (
            <div 
              key={item.label}
              style={{ 
                padding: '16px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                textAlign: 'center',
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: item.color }}>
                {item.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
