import { useState, useEffect } from 'react'
import { schools as initialSchools } from './data/schools'
import { sampleStudents, generateStudents } from './data/students'
import { runAdmission } from './utils/admission'
import StudentManager from './components/StudentManager'
import SchoolManager from './components/SchoolManager'
import AdmissionResults from './components/AdmissionResults'
import Statistics from './components/Statistics'
import FlowChart from './components/FlowChart'
import ScoreDistribution from './components/ScoreDistribution'
import VolunteerForm from './components/VolunteerForm'
import AdmissionSimulation from './components/AdmissionSimulation'

function App() {
  const [activeTab, setActiveTab] = useState('volunteer')
  const [schools, setSchools] = useState(initialSchools)
  const [students, setStudents] = useState([])
  const [results, setResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [studentCount, setStudentCount] = useState(200)
  
  useEffect(() => {
    const generatedStudents = generateStudents(initialSchools, studentCount)
    setStudents(generatedStudents)
  }, [studentCount])
  
  const handleAddStudent = (student) => {
    setStudents([...students, student])
  }
  
  const handleUpdateStudent = (studentId, studentData) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, ...studentData } : s))
  }
  
  const handleDeleteStudent = (studentId) => {
    setStudents(students.filter(s => s.id !== studentId))
  }
  
  const handleAddSchool = (school) => {
    setSchools([...schools, school])
  }
  
  const handleUpdateSchool = (schoolId, schoolData) => {
    setSchools(schools.map(s => s.id === schoolId ? { ...s, ...schoolData } : s))
  }
  
  const handleDeleteSchool = (schoolId) => {
    setSchools(schools.filter(s => s.id !== schoolId))
  }
  
  const handleRunAdmission = () => {
    setIsRunning(true)
    setTimeout(() => {
      const admissionResults = runAdmission(students, schools)
      setResults(admissionResults)
      setIsRunning(false)
      setActiveTab('results')
    }, 500)
  }
  
  const handleReset = () => {
    setResults(null)
    const generatedStudents = generateStudents(initialSchools, studentCount)
    setStudents(generatedStudents)
  }
  
  return (
    <div className="app">
      <header className="header">
        <h1>广州中考投档系统</h1>
        <p>2025年广州市高中阶段学校招生投档模拟系统</p>
      </header>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'volunteer' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteer')}
        >
          模拟填报
        </button>
        <button 
          className={`tab ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          投档模拟
        </button>
        <button 
          className={`tab ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          数据概览
        </button>
        <button 
          className={`tab ${activeTab === 'flowchart' ? 'active' : ''}`}
          onClick={() => setActiveTab('flowchart')}
        >
          投档流程
        </button>
        <button 
          className={`tab ${activeTab === 'schools' ? 'active' : ''}`}
          onClick={() => setActiveTab('schools')}
        >
          学校管理
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          学生管理
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          投档结果
        </button>
        <button 
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          统计分析
        </button>
      </div>
      
      {activeTab !== 'volunteer' && activeTab !== 'simulation' && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ color: '#666' }}>模拟考生数量:</label>
              <select 
                className="form-select" 
                style={{ width: '120px' }}
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value))}
              >
                <option value={50}>50人</option>
                <option value={100}>100人</option>
                <option value={200}>200人</option>
                <option value={500}>500人</option>
                <option value={1000}>1000人</option>
              </select>
            </div>
            <button 
              className="btn btn-success"
              onClick={handleRunAdmission}
              disabled={isRunning || students.length === 0}
            >
              {isRunning ? '投档中...' : '执行投档'}
            </button>
            <button 
              className="btn btn-warning"
              onClick={handleReset}
            >
              重置数据
            </button>
            {results && (
              <span style={{ color: '#10b981', fontWeight: '500' }}>
                投档完成！录取率: {results.stats.admissionRate}%
              </span>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'volunteer' && (
        <VolunteerForm />
      )}
      
      {activeTab === 'simulation' && (
        <AdmissionSimulation />
      )}
      
      {activeTab === 'distribution' && (
        <ScoreDistribution />
      )}
      
      {activeTab === 'flowchart' && (
        <FlowChart />
      )}
      
      {activeTab === 'schools' && (
        <SchoolManager />
      )}
      
      {activeTab === 'students' && (
        <StudentManager
          students={students}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      )}
      
      {activeTab === 'results' && (
        <AdmissionResults results={results} schools={schools} />
      )}
      
      {activeTab === 'statistics' && (
        <Statistics results={results} />
      )}
      
      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
        <p>广州中考投档系统 - 仅供模拟演示使用</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>
          数据来源：2025年广州市高中阶段学校招生计划
        </p>
      </footer>
    </div>
  )
}

export default App
