import { useState } from 'react'
import { getGradientLevel, getGradientLabel, GRADIENT_LINES } from '../utils/admission'

export default function AdmissionResults({ results, schools }) {
  const [activeView, setActiveView] = useState('students')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterGradient, setFilterGradient] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  if (!results) {
    return (
      <div className="card">
        <div className="empty-state">
          <p>请先执行投档操作</p>
        </div>
      </div>
    )
  }
  
  const { students, schools: schoolResults, stats } = results
  
  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.includes(searchTerm) || 
      student.id.includes(searchTerm)
    const matchStatus = !filterStatus || 
      (filterStatus === 'admitted' && student.result?.admitted) ||
      (filterStatus === 'notAdmitted' && !student.result?.admitted)
    const matchSchool = !filterSchool || 
      student.result?.school?.id === filterSchool
    const studentGradient = getGradientLevel(student.score.total)
    const matchGradient = !filterGradient || studentGradient === parseInt(filterGradient)
    return matchSearch && matchStatus && matchSchool && matchGradient
  })
  
  const getStatusBadge = (student) => {
    if (student.result?.admitted) {
      return <span className="badge badge-success">已录取</span>
    }
    return <span className="badge badge-danger">未录取</span>
  }
  
  const getGradientBadge = (score) => {
    const level = getGradientLevel(score)
    const colors = {
      1: '#dc2626',
      2: '#f59e0b',
      3: '#10b981',
      4: '#3b82f6',
      5: '#8b5cf6',
      6: '#6b7280',
      7: '#374151',
    }
    return (
      <span 
        className="badge" 
        style={{ background: colors[level], color: 'white' }}
      >
        第{level}梯度
      </span>
    )
  }
  
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">考生总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.admittedCount}</div>
          <div className="stat-label">已录取</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.notAdmittedCount}</div>
          <div className="stat-label">未录取</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.admissionRate}%</div>
          <div className="stat-label">录取率</div>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">梯度控制线</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {Object.entries(stats.gradientStats).map(([level, data]) => (
            <div key={level} style={{ 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              borderLeft: `4px solid ${level <= 2 ? '#dc2626' : level <= 4 ? '#f59e0b' : '#6b7280'}`
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                第{level}梯度
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {data.admitted}/{data.total}
              </div>
              <div style={{ fontSize: '12px', color: data.rate >= 80 ? '#10b981' : data.rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                录取率 {data.rate}%
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab ${activeView === 'students' ? 'active' : ''}`}
          onClick={() => setActiveView('students')}
        >
          学生录取结果
        </button>
        <button 
          className={`tab ${activeView === 'schools' ? 'active' : ''}`}
          onClick={() => setActiveView('schools')}
        >
          学校录取情况
        </button>
      </div>
      
      {activeView === 'students' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">学生录取结果</h3>
          </div>
          
          <div className="filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="搜索姓名或考号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="form-select"
              style={{ width: '120px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="admitted">已录取</option>
              <option value="notAdmitted">未录取</option>
            </select>
            <select
              className="form-select"
              style={{ width: '130px' }}
              value={filterGradient}
              onChange={(e) => setFilterGradient(e.target.value)}
            >
              <option value="">全部梯度</option>
              {[1, 2, 3, 4, 5, 6, 7].map(level => (
                <option key={level} value={level}>第{level}梯度</option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ width: '200px' }}
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
            >
              <option value="">全部学校</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>考号</th>
                <th>姓名</th>
                <th>总分</th>
                <th>梯度</th>
                <th>录取学校</th>
                <th>志愿</th>
                <th>状态</th>
                <th>详情</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 50).map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td><strong>{student.score.total}</strong></td>
                  <td>{getGradientBadge(student.score.total)}</td>
                  <td>
                    {student.result?.admitted 
                      ? student.result.school?.name 
                      : '-'}
                  </td>
                  <td>
                    {student.result?.admitted 
                      ? `第${student.result.volunteerOrder}志愿` 
                      : '-'}
                  </td>
                  <td>{getStatusBadge(student)}</td>
                  <td>
                    <button 
                      className="btn btn-sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length > 50 && (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '16px' }}>
              显示前50条，共 {filteredStudents.length} 条记录
            </p>
          )}
        </div>
      )}
      
      {activeView === 'schools' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">学校录取情况</h3>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>学校名称</th>
                <th>类型</th>
                <th>批次</th>
                <th>招生计划</th>
                <th>已录取</th>
                <th>剩余名额</th>
                <th>最低分</th>
                <th>最高分</th>
                <th>平均分</th>
                <th>末位志愿</th>
              </tr>
            </thead>
            <tbody>
              {schoolResults.map(school => (
                <tr key={school.id}>
                  <td>
                    {school.name}
                    {school.shortName && <span style={{ color: '#999', marginLeft: '8px' }}>({school.shortName})</span>}
                  </td>
                  <td>
                    <span className={`badge ${school.type === 'key' ? 'badge-warning' : school.type === 'demonstration' ? 'badge-info' : ''}`}>
                      {school.type === 'key' ? '重点' : school.type === 'demonstration' ? '示范' : '普通'}
                    </span>
                  </td>
                  <td>
                    <span className="badge">
                      {school.batch === 'third' ? '第三批' : '第四批'}
                    </span>
                  </td>
                  <td>{school.quota}</td>
                  <td>{school.admittedCount}</td>
                  <td>{school.remainingQuota}</td>
                  <td>{school.finalMinScore || '-'}</td>
                  <td>{school.finalMaxScore || '-'}</td>
                  <td>{school.avgScore || '-'}</td>
                  <td>
                    {school.lastVolunteerOrder 
                      ? `第${school.lastVolunteerOrder}志愿` 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">学生详情</h3>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>&times;</button>
            </div>
            
            <div style={{ padding: '20px 0' }}>
              <div className="form-row">
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>考号</p>
                  <p style={{ fontWeight: '600' }}>{selectedStudent.id}</p>
                </div>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>姓名</p>
                  <p style={{ fontWeight: '600' }}>{selectedStudent.name}</p>
                </div>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>性别</p>
                  <p style={{ fontWeight: '600' }}>{selectedStudent.gender}</p>
                </div>
              </div>
              
              <h4 style={{ margin: '20px 0 12px', color: '#333' }}>成绩信息</h4>
              <div className="form-row">
                <div className="stat-card" style={{ padding: '12px' }}>
                  <div className="stat-value" style={{ fontSize: '24px' }}>{selectedStudent.score.total}</div>
                  <div className="stat-label">总分</div>
                </div>
                <div className="stat-card" style={{ padding: '12px' }}>
                  <div className="stat-value" style={{ fontSize: '24px' }}>{selectedStudent.score.threeMain}</div>
                  <div className="stat-label">语数英</div>
                </div>
                <div className="stat-card" style={{ padding: '12px' }}>
                  <div className="stat-value" style={{ fontSize: '24px' }}>{getGradientLevel(selectedStudent.score.total)}</div>
                  <div className="stat-label">梯度</div>
                </div>
              </div>
              
              <div className="form-row" style={{ marginTop: '12px' }}>
                <div><strong>语文:</strong> {selectedStudent.score.chinese}</div>
                <div><strong>数学:</strong> {selectedStudent.score.math}</div>
                <div><strong>英语:</strong> {selectedStudent.score.english}</div>
                <div><strong>物理:</strong> {selectedStudent.score.physics}</div>
                <div><strong>化学:</strong> {selectedStudent.score.chemistry}</div>
              </div>
              
              <h4 style={{ margin: '20px 0 12px', color: '#333' }}>志愿填报</h4>
              <div className="volunteer-list">
                {selectedStudent.volunteers.map((v, index) => (
                  <div key={index} className="volunteer-item">
                    <span className="volunteer-num">{v.order}</span>
                    <span>{v.schoolName}</span>
                    {selectedStudent.result?.admitted && 
                      selectedStudent.result?.volunteerOrder === v.order && (
                      <span className="badge badge-success">录取</span>
                    )}
                  </div>
                ))}
              </div>
              
              <h4 style={{ margin: '20px 0 12px', color: '#333' }}>录取结果</h4>
              <div style={{ 
                padding: '16px', 
                background: selectedStudent.result?.admitted ? '#d1fae5' : '#fee2e2',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {selectedStudent.result?.admitted ? (
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                      已录取
                    </p>
                    <p>{selectedStudent.result.school?.name}</p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      第{selectedStudent.result.volunteerOrder}志愿 | 第{selectedStudent.result.gradient}梯度
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                      未录取
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      所有志愿均未满足录取条件
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
