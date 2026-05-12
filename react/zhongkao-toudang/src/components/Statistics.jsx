import { getGradientLevel, getGradientLabel, GRADIENT_LINES } from '../utils/admission'

export default function Statistics({ results }) {
  if (!results) {
    return (
      <div className="card">
        <div className="empty-state">
          <p>请先执行投档操作查看统计数据</p>
        </div>
      </div>
    )
  }
  
  const { students, schools, stats } = results
  
  const scoreRanges = [
    { min: 750, max: 810, label: '750分以上' },
    { min: 702, max: 749, label: '702-749分(第一梯度)' },
    { min: 662, max: 701, label: '662-701分(第二梯度)' },
    { min: 622, max: 661, label: '622-661分(第三梯度)' },
    { min: 582, max: 621, label: '582-621分(第四梯度)' },
    { min: 542, max: 581, label: '542-581分(第五梯度)' },
    { min: 502, max: 541, label: '502-541分(最低控制线)' },
    { min: 0, max: 501, label: '502分以下' },
  ]
  
  const scoreDistribution = scoreRanges.map(range => {
    const count = students.filter(s => 
      s.score.total >= range.min && s.score.total <= range.max
    ).length
    const admitted = students.filter(s => 
      s.score.total >= range.min && 
      s.score.total <= range.max && 
      s.result?.admitted
    ).length
    return {
      ...range,
      count,
      admitted,
      rate: count > 0 ? ((admitted / count) * 100).toFixed(1) : 0,
    }
  })
  
  const gradientDistribution = []
  for (let i = 1; i <= 7; i++) {
    const studentsInG = students.filter(s => getGradientLevel(s.score.total) === i)
    const admittedInG = studentsInG.filter(s => s.result?.admitted)
    gradientDistribution.push({
      level: i,
      label: getGradientLabel(i),
      total: studentsInG.length,
      admitted: admittedInG.length,
      rate: studentsInG.length > 0 
        ? ((admittedInG.length / studentsInG.length) * 100).toFixed(1)
        : 0,
    })
  }
  
  const districtStats = {}
  students.forEach(student => {
    if (!districtStats[student.district]) {
      districtStats[student.district] = { total: 0, admitted: 0 }
    }
    districtStats[student.district].total++
    if (student.result?.admitted) {
      districtStats[student.district].admitted++
    }
  })
  
  const districtAnalysis = Object.entries(districtStats)
    .map(([district, data]) => ({
      district,
      total: data.total,
      admitted: data.admitted,
      rate: ((data.admitted / data.total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.total - a.total)
  
  const volunteerStats = [1, 2, 3, 4, 5, 6].map(order => {
    const admitted = students.filter(s => 
      s.result?.admitted && s.result?.volunteerOrder === order
    ).length
    return {
      order,
      count: admitted,
      label: `第${order}志愿`,
    }
  }).filter(v => v.count > 0)
  
  const topSchools = schools
    .filter(s => s.admittedCount > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10)
  
  const maxGradientCount = Math.max(...gradientDistribution.map(g => g.total))
  
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">考生总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{stats.admittedCount}</div>
          <div className="stat-label">录取人数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.admissionRate}%</div>
          <div className="stat-label">录取率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.usedQuota}</div>
          <div className="stat-label">已用名额</div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">梯度控制线说明</h3>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontWeight: '600', color: '#dc2626' }}>第一梯度</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>≥{GRADIENT_LINES.first}分</div>
          </div>
          <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontWeight: '600', color: '#f59e0b' }}>第二梯度</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{GRADIENT_LINES.second}-{GRADIENT_LINES.first - 1}分</div>
          </div>
          <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontWeight: '600', color: '#10b981' }}>第三梯度</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{GRADIENT_LINES.third}-{GRADIENT_LINES.second - 1}分</div>
          </div>
          <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontWeight: '600', color: '#3b82f6' }}>第四梯度</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{GRADIENT_LINES.fourth}-{GRADIENT_LINES.third - 1}分</div>
          </div>
          <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontWeight: '600', color: '#8b5cf6' }}>第五梯度</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{GRADIENT_LINES.fifth}-{GRADIENT_LINES.fourth - 1}分</div>
          </div>
          <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid #6b7280' }}>
            <div style={{ fontWeight: '600', color: '#6b7280' }}>最低控制线</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{GRADIENT_LINES.minimum}分</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">梯度分布统计</h3>
        </div>
        <div style={{ padding: '20px 0' }}>
          {gradientDistribution.map((gradient, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '500' }}>{gradient.label}</span>
                <span style={{ color: '#666' }}>
                  {gradient.total}人 (录取{gradient.admitted}人，{gradient.rate}%)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ 
                  flex: gradient.total / maxGradientCount,
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  height: '24px',
                  minWidth: '2px',
                  position: 'relative',
                }}>
                  <div style={{ 
                    width: `${(gradient.admitted / gradient.total) * 100}%`,
                    background: gradient.level <= 2 ? '#dc2626' : gradient.level <= 4 ? '#f59e0b' : '#10b981',
                    borderRadius: '4px',
                    height: '100%',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">各区录取情况</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>区域</th>
                <th>考生数</th>
                <th>录取数</th>
                <th>录取率</th>
              </tr>
            </thead>
            <tbody>
              {districtAnalysis.map((item, index) => (
                <tr key={index}>
                  <td>{item.district}</td>
                  <td>{item.total}</td>
                  <td>{item.admitted}</td>
                  <td>
                    <span className={`badge ${parseFloat(item.rate) >= 80 ? 'badge-success' : parseFloat(item.rate) >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                      {item.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">志愿录取分布</h3>
          </div>
          <div style={{ padding: '20px 0' }}>
            {volunteerStats.map((item, index) => {
              const maxCount = Math.max(...volunteerStats.map(v => v.count))
              return (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.label}</span>
                    <span style={{ color: '#666' }}>{item.count}人</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">录取分数线TOP10学校</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>学校名称</th>
              <th>类型</th>
              <th>批次</th>
              <th>录取人数</th>
              <th>最高分</th>
              <th>最低分</th>
              <th>平均分</th>
              <th>末位志愿</th>
            </tr>
          </thead>
          <tbody>
            {topSchools.map((school, index) => (
              <tr key={school.id}>
                <td>{index + 1}</td>
                <td>
                  {school.name}
                  {school.shortName && <span style={{ color: '#999', marginLeft: '8px' }}>({school.shortName})</span>}
                </td>
                <td>
                  <span className={`badge ${school.type === 'key' ? 'badge-warning' : 'badge-info'}`}>
                    {school.type === 'key' ? '重点' : '示范'}
                  </span>
                </td>
                <td>{school.batch === 'third' ? '第三批' : '第四批'}</td>
                <td>{school.admittedCount}</td>
                <td>{school.finalMaxScore}</td>
                <td>{school.finalMinScore}</td>
                <td><strong>{school.avgScore}</strong></td>
                <td>{school.lastVolunteerOrder ? `第${school.lastVolunteerOrder}志愿` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">多梯度投档录取规则说明</h3>
        </div>
        <div style={{ lineHeight: '1.8', color: '#555' }}>
          <p><strong>遵照"梯度投档、志愿优先、择优录取"原则</strong></p>
          <ol style={{ paddingLeft: '20px', marginTop: '12px' }}>
            <li><strong>梯度投档：</strong>先用梯度投档控制线将考生按成绩分成若干档，投档时先投第一档考生，第一档考生全部志愿投完后再投第二档考生……依此类推。</li>
            <li><strong>志愿优先：</strong>同一档内的考生，按照"志愿优先、择优录取"原则，先投第一志愿考生，在第一志愿的考生中按考生成绩从高分到低分录取，若志愿学校招生计划已完成的就不再投档；第一志愿全部投完后再投第二志愿……依此类推。</li>
            <li><strong>同分比较：</strong>
              <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                <li>首先比较语文、数学、英语三科总分</li>
                <li>三科总分相同，比较语文成绩</li>
                <li>语文成绩相同，比较数学成绩</li>
                <li>数学成绩相同，比较英语成绩</li>
              </ul>
            </li>
            <li><strong>梯度间隔：</strong>各梯度控制线间隔为40分，第一梯度控制线约为702分。</li>
          </ol>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#f0f9ff', 
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '8px', color: '#0369a1' }}>举例说明：</p>
            <p style={{ fontSize: '14px' }}>
              假设某考生总成绩为710分，处于第一梯度控制线702分以上，某批次所填第一志愿学校的录取最低分数为715分，那他的第一志愿就落选了。所填第二志愿学校的录取最低分数为705分，末位考生志愿序号为1，表示该校在705分的第一志愿就已完成招生计划，那该生的第二志愿也落选。所填第三志愿的学校录取最低分数为698分，低于第一梯度投档控制线，表示该校在第一梯度投档控制线上未完成计划，该生虽然第三志愿填报该校，也是可以被录取的，优先于成绩在第二梯度投档控制线的考生投档。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
