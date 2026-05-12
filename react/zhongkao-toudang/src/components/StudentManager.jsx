import { useState, useMemo } from 'react'
import { schools2025Full } from '../data/schools2025Full.js'

function StudentForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState(student || {
    id: '',
    name: '',
    gender: '男',
    district: '天河区',
    middleSchool: '',
    score: {
      total: 0,
      chinese: 0,
      math: 0,
      english: 0,
      physics: 0,
      chemistry: 0,
      politics: 0,
      history: 0,
      pe: 60,
      experiment: 20,
      threeMain: 0,
    },
    volunteers: [],
  })
  
  const [schoolSearch, setSchoolSearch] = useState('')
  
  const filteredSchools = useMemo(() => {
    if (!schoolSearch) return schools2025Full.slice(0, 50)
    return schools2025Full.filter(s => 
      s.name.includes(schoolSearch) || s.id.includes(schoolSearch)
    ).slice(0, 50)
  }, [schoolSearch])
  
  const handleScoreChange = (field, value) => {
    const newScore = {
      ...formData.score,
      [field]: parseInt(value) || 0,
    }
    newScore.threeMain = newScore.chinese + newScore.math + newScore.english
    setFormData({ ...formData, score: newScore })
  }
  
  const handleVolunteerChange = (order, schoolId) => {
    const school = schools2025Full.find(s => s.id === schoolId)
    const newVolunteers = formData.volunteers.filter(v => v.order !== order)
    if (schoolId && school) {
      newVolunteers.push({ order, schoolId, schoolName: school.name })
    }
    newVolunteers.sort((a, b) => a.order - b.order)
    setFormData({ ...formData, volunteers: newVolunteers })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    const total = formData.score.chinese + formData.score.math + formData.score.english +
      formData.score.physics + formData.score.chemistry + formData.score.politics +
      formData.score.history + formData.score.pe + formData.score.experiment
    onSave({
      ...formData,
      score: { ...formData.score, total },
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">考号</label>
          <input
            type="text"
            className="form-input"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">姓名</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">性别</label>
          <select
            className="form-select"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">所在区</label>
          <select
            className="form-select"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          >
            {['越秀区', '海珠区', '荔湾区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">毕业中学</label>
          <input
            type="text"
            className="form-input"
            value={formData.middleSchool}
            onChange={(e) => setFormData({ ...formData, middleSchool: e.target.value })}
          />
        </div>
      </div>
      
      <h4 style={{ margin: '20px 0 12px', color: '#333' }}>成绩信息</h4>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">语文</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.chinese}
            onChange={(e) => handleScoreChange('chinese', e.target.value)}
            max={120}
          />
        </div>
        <div className="form-group">
          <label className="form-label">数学</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.math}
            onChange={(e) => handleScoreChange('math', e.target.value)}
            max={120}
          />
        </div>
        <div className="form-group">
          <label className="form-label">英语</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.english}
            onChange={(e) => handleScoreChange('english', e.target.value)}
            max={120}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">物理</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.physics}
            onChange={(e) => handleScoreChange('physics', e.target.value)}
            max={100}
          />
        </div>
        <div className="form-group">
          <label className="form-label">化学</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.chemistry}
            onChange={(e) => handleScoreChange('chemistry', e.target.value)}
            max={100}
          />
        </div>
        <div className="form-group">
          <label className="form-label">道德与法治</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.politics}
            onChange={(e) => handleScoreChange('politics', e.target.value)}
            max={100}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">历史</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.history}
            onChange={(e) => handleScoreChange('history', e.target.value)}
            max={100}
          />
        </div>
        <div className="form-group">
          <label className="form-label">体育</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.pe}
            onChange={(e) => handleScoreChange('pe', e.target.value)}
            max={60}
          />
        </div>
        <div className="form-group">
          <label className="form-label">实验操作</label>
          <input
            type="number"
            className="form-input"
            value={formData.score.experiment}
            onChange={(e) => handleScoreChange('experiment', e.target.value)}
            max={20}
          />
        </div>
      </div>
      
      <h4 style={{ margin: '20px 0 12px', color: '#333' }}>志愿填报</h4>
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <label className="form-label">搜索学校</label>
        <input
          type="text"
          className="form-input"
          placeholder="输入学校名称或代码搜索..."
          value={schoolSearch}
          onChange={(e) => setSchoolSearch(e.target.value)}
        />
      </div>
      {[1, 2, 3, 4, 5, 6].map(order => (
        <div key={order} className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label">第{order}志愿</label>
          <select
            className="form-select"
            value={formData.volunteers.find(v => v.order === order)?.schoolId || ''}
            onChange={(e) => handleVolunteerChange(order, e.target.value)}
          >
            <option value="">-- 请选择学校 --</option>
            {filteredSchools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name} ({school.hukou?.minScore || '-'}分)
              </option>
            ))}
          </select>
        </div>
      ))}
      
      <div className="modal-footer">
        <button type="button" className="btn" onClick={onCancel}>取消</button>
        <button type="submit" className="btn btn-primary">保存</button>
      </div>
    </form>
  )
}

export default function StudentManager({ students, onAddStudent, onUpdateStudent, onDeleteStudent }) {
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')
  
  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.includes(searchTerm) || 
      student.id.includes(searchTerm)
    const matchDistrict = !filterDistrict || student.district === filterDistrict
    return matchSearch && matchDistrict
  })
  
  const handleSave = (studentData) => {
    if (editingStudent) {
      onUpdateStudent(editingStudent.id, studentData)
    } else {
      onAddStudent(studentData)
    }
    setShowModal(false)
    setEditingStudent(null)
  }
  
  const handleEdit = (student) => {
    setEditingStudent(student)
    setShowModal(true)
  }
  
  const handleDelete = (studentId) => {
    if (confirm('确定要删除该学生信息吗？')) {
      onDeleteStudent(studentId)
    }
  }
  
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">学生管理</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingStudent(null)
              setShowModal(true)
            }}
          >
            添加学生
          </button>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="搜索姓名或考号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            style={{ width: '150px' }}
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">全部区域</option>
            {['越秀区', '海珠区', '荔湾区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>考号</th>
              <th>姓名</th>
              <th>性别</th>
              <th>区域</th>
              <th>总分</th>
              <th>语数英</th>
              <th>志愿数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.slice(0, 20).map(student => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.gender}</td>
                <td>{student.district}</td>
                <td><strong>{student.score.total}</strong></td>
                <td>{student.score.threeMain}</td>
                <td>{student.volunteers.length}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(student)}
                    style={{ marginRight: '8px' }}
                  >
                    编辑
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(student.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStudents.length > 20 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '16px' }}>
            显示前20条，共 {filteredStudents.length} 条记录
          </p>
        )}
      </div>
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingStudent ? '编辑学生信息' : '添加学生'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <StudentForm
              student={editingStudent}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
