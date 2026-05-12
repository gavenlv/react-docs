export const GRADIENT_INTERVAL = 40

export const GRADIENT_LINES = {
  first: 707,
  second: 667,
  third: 627,
  fourth: 587,
  fifth: 547,
  minimum: 487,
}

export const SCORE_DISTRIBUTION_2025 = [
  { score: 750, count: 1004, rate: 0.72 },
  { score: 740, count: 2644, rate: 1.89 },
  { score: 730, count: 5302, rate: 3.80 },
  { score: 720, count: 8737, rate: 6.25 },
  { score: 710, count: 12865, rate: 9.21 },
  { score: 700, count: 17244, rate: 12.34 },
  { score: 690, count: 21899, rate: 15.68 },
  { score: 680, count: 26724, rate: 19.13 },
  { score: 670, count: 31526, rate: 22.57 },
  { score: 660, count: 36193, rate: 25.91 },
  { score: 650, count: 40846, rate: 29.24 },
  { score: 640, count: 45415, rate: 32.51 },
  { score: 630, count: 49880, rate: 35.71 },
  { score: 620, count: 54115, rate: 38.74 },
  { score: 610, count: 58204, rate: 41.67 },
  { score: 600, count: 62181, rate: 44.52 },
  { score: 590, count: 65900, rate: 47.18 },
  { score: 580, count: 69565, rate: 49.80 },
  { score: 570, count: 73141, rate: 52.36 },
  { score: 560, count: 76560, rate: 54.81 },
  { score: 550, count: 79724, rate: 57.07 },
  { score: 540, count: 82758, rate: 59.25 },
  { score: 530, count: 85771, rate: 61.40 },
  { score: 520, count: 88595, rate: 63.42 },
  { score: 510, count: 91344, rate: 65.39 },
  { score: 500, count: 93938, rate: 67.25 },
  { score: 490, count: 96412, rate: 69.02 },
  { score: 480, count: 98826, rate: 70.75 },
  { score: 470, count: 101171, rate: 72.43 },
  { score: 460, count: 103436, rate: 74.05 },
  { score: 450, count: 105707, rate: 75.68 },
  { score: 440, count: 107931, rate: 77.27 },
  { score: 430, count: 110079, rate: 78.81 },
  { score: 420, count: 112103, rate: 80.25 },
  { score: 410, count: 114057, rate: 81.65 },
  { score: 400, count: 116007, rate: 83.05 },
]

export const STATS_2025 = {
  totalStudents: 139000,
  avgScore: 555,
  totalQuota: 90476,
  quotaAllocationQuota: 27794,
  quotaAllocationAdmitted: 24719,
  quotaAllocationRate: 89,
}

export function getGradientLevel(score) {
  if (score >= GRADIENT_LINES.first) return 1
  if (score >= GRADIENT_LINES.second) return 2
  if (score >= GRADIENT_LINES.third) return 3
  if (score >= GRADIENT_LINES.fourth) return 4
  if (score >= GRADIENT_LINES.fifth) return 5
  if (score >= GRADIENT_LINES.minimum) return 6
  return 7
}

export function getGradientLabel(level) {
  const labels = {
    1: '第一梯度(≥707分)',
    2: '第二梯度(667-706分)',
    3: '第三梯度(627-666分)',
    4: '第四梯度(587-626分)',
    5: '第五梯度(547-586分)',
    6: '普通高中最低控制线(487-546分)',
    7: '低于最低控制线(<487分)',
  }
  return labels[level] || '未知'
}

export function compareStudents(a, b) {
  if (a.score.total !== b.score.total) {
    return b.score.total - a.score.total
  }
  if (a.score.threeMain !== b.score.threeMain) {
    return b.score.threeMain - a.score.threeMain
  }
  if (a.score.chinese !== b.score.chinese) {
    return b.score.chinese - a.score.chinese
  }
  if (a.score.math !== b.score.math) {
    return b.score.math - a.score.math
  }
  if (a.score.english !== b.score.english) {
    return b.score.english - a.score.english
  }
  return 0
}

export function runAdmission(students, schools, batch = 'third') {
  const schoolQuotas = {}
  const schoolAdmitted = {}
  const schoolScores = {}
  const schoolLastVolunteer = {}
  
  schools.forEach(school => {
    schoolQuotas[school.id] = school.quota
    schoolAdmitted[school.id] = []
    schoolScores[school.id] = []
    schoolLastVolunteer[school.id] = null
  })
  
  const sortedStudents = [...students].sort(compareStudents)
  
  const gradientStudents = {}
  for (let i = 1; i <= 7; i++) {
    gradientStudents[i] = []
  }
  sortedStudents.forEach(student => {
    const level = getGradientLevel(student.score.total)
    gradientStudents[level].push(student)
  })
  
  const results = []
  
  for (let gradient = 1; gradient <= 7; gradient++) {
    const studentsInGradient = gradientStudents[gradient]
    if (studentsInGradient.length === 0) continue
    
    const maxVolunteers = Math.max(...studentsInGradient.map(s => s.volunteers.length), 1)
    
    for (let volunteerOrder = 1; volunteerOrder <= maxVolunteers; volunteerOrder++) {
      const studentsForThisVolunteer = studentsInGradient.filter(s => 
        s.volunteers.length >= volunteerOrder && !results.find(r => r.id === s.id && r.result?.admitted)
      )
      
      studentsForThisVolunteer.sort(compareStudents)
      
      for (const student of studentsForThisVolunteer) {
        const volunteer = student.volunteers[volunteerOrder - 1]
        if (!volunteer) continue
        
        const schoolId = volunteer.schoolId
        const remainingQuota = schoolQuotas[schoolId]
        
        if (remainingQuota > 0) {
          schoolQuotas[schoolId]--
          schoolAdmitted[schoolId].push({
            ...student,
            volunteerOrder,
            gradient,
          })
          schoolScores[schoolId].push(student.score.total)
          schoolLastVolunteer[schoolId] = volunteerOrder
          
          const existingResult = results.find(r => r.id === student.id)
          if (existingResult) {
            existingResult.result = {
              admitted: true,
              school: schools.find(s => s.id === schoolId),
              volunteerOrder,
              gradient,
              score: student.score.total,
            }
          } else {
            results.push({
              ...student,
              result: {
                admitted: true,
                school: schools.find(s => s.id === schoolId),
                volunteerOrder,
                gradient,
                score: student.score.total,
              },
            })
          }
        }
      }
    }
    
    for (const student of studentsInGradient) {
      if (!results.find(r => r.id === student.id)) {
        results.push({
          ...student,
          result: {
            admitted: false,
            school: null,
            volunteerOrder: 0,
            gradient,
            score: student.score.total,
          },
        })
      }
    }
  }
  
  const schoolResults = schools.map(school => {
    const admitted = schoolAdmitted[school.id]
    const scores = schoolScores[school.id]
    const finalMinScore = scores.length > 0 ? Math.min(...scores) : null
    const finalMaxScore = scores.length > 0 ? Math.max(...scores) : null
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : null
    
    return {
      ...school,
      admittedCount: admitted.length,
      remainingQuota: schoolQuotas[school.id],
      finalMinScore,
      finalMaxScore,
      avgScore,
      lastVolunteerOrder: schoolLastVolunteer[school.id],
      admittedStudents: admitted,
    }
  })
  
  const stats = {
    totalStudents: students.length,
    admittedCount: results.filter(s => s.result?.admitted).length,
    notAdmittedCount: results.filter(s => !s.result?.admitted).length,
    admissionRate: ((results.filter(s => s.result?.admitted).length / students.length) * 100).toFixed(2),
    totalQuota: schools.reduce((sum, s) => sum + s.quota, 0),
    usedQuota: schools.reduce((sum, s) => sum + (s.quota - schoolQuotas[s.id]), 0),
    gradientStats: {},
  }
  
  for (let i = 1; i <= 7; i++) {
    const studentsInG = results.filter(s => getGradientLevel(s.score.total) === i)
    const admittedInG = studentsInG.filter(s => s.result?.admitted)
    stats.gradientStats[i] = {
      total: studentsInG.length,
      admitted: admittedInG.length,
      rate: studentsInG.length > 0 
        ? ((admittedInG.length / studentsInG.length) * 100).toFixed(1)
        : 0,
    }
  }
  
  return {
    students: results,
    schools: schoolResults,
    stats,
    gradientLines: GRADIENT_LINES,
  }
}

export function analyzeResults(admissionResults) {
  const { students, schools, stats } = admissionResults
  
  const scoreDistribution = []
  const scoreRanges = [
    { min: 750, max: 810, label: '750分以上' },
    { min: 700, max: 749, label: '700-749分' },
    { min: 650, max: 699, label: '650-699分' },
    { min: 600, max: 649, label: '600-649分' },
    { min: 550, max: 599, label: '550-599分' },
    { min: 502, max: 549, label: '502-549分' },
    { min: 0, max: 501, label: '502分以下' },
  ]
  
  scoreRanges.forEach(range => {
    const count = students.filter(s => 
      s.score.total >= range.min && s.score.total <= range.max
    ).length
    const admitted = students.filter(s => 
      s.score.total >= range.min && 
      s.score.total <= range.max && 
      s.result?.admitted
    ).length
    scoreDistribution.push({
      ...range,
      count,
      admitted,
      rate: count > 0 ? ((admitted / count) * 100).toFixed(1) : 0,
    })
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
      districtStats[student.district] = {
        total: 0,
        admitted: 0,
      }
    }
    districtStats[student.district].total++
    if (student.result?.admitted) {
      districtStats[student.district].admitted++
    }
  })
  
  const districtAnalysis = Object.entries(districtStats).map(([district, data]) => ({
    district,
    total: data.total,
    admitted: data.admitted,
    rate: ((data.admitted / data.total) * 100).toFixed(1),
  }))
  
  const volunteerStats = [1, 2, 3, 4, 5, 6].map(order => {
    const admitted = students.filter(s => s.result?.admitted && s.result?.volunteerOrder === order).length
    return {
      order,
      count: admitted,
      label: `第${order}志愿`,
    }
  }).filter(v => v.count > 0)
  
  return {
    scoreDistribution,
    gradientDistribution,
    districtAnalysis,
    volunteerStats,
    overallStats: stats,
  }
}
