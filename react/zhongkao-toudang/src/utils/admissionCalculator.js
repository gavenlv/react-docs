import { schools2025Full } from '../data/schools2025Full.js'

export const GRADIENT_LINES = {
  first: 707,
  second: 667,
  third: 627,
  fourth: 587,
  fifth: 547,
  minimum: 487,
}

export function getGradientLevel(score) {
  const s = parseInt(score)
  if (isNaN(s)) return 7
  if (s >= GRADIENT_LINES.first) return 1
  if (s >= GRADIENT_LINES.second) return 2
  if (s >= GRADIENT_LINES.third) return 3
  if (s >= GRADIENT_LINES.fourth) return 4
  if (s >= GRADIENT_LINES.fifth) return 5
  if (s >= GRADIENT_LINES.minimum) return 6
  return 7
}

export function getGradientLabel(level) {
  const labels = {
    1: '第一梯度',
    2: '第二梯度',
    3: '第三梯度',
    4: '第四梯度',
    5: '第五梯度',
    6: '普高最低线',
    7: '未达普高线',
  }
  return labels[level] || '未知'
}

export function getGradientScoreRange(level) {
  const ranges = {
    1: `≥${GRADIENT_LINES.first}分`,
    2: `${GRADIENT_LINES.second}-${GRADIENT_LINES.first - 1}分`,
    3: `${GRADIENT_LINES.third}-${GRADIENT_LINES.second - 1}分`,
    4: `${GRADIENT_LINES.fourth}-${GRADIENT_LINES.third - 1}分`,
    5: `${GRADIENT_LINES.fifth}-${GRADIENT_LINES.fourth - 1}分`,
    6: `${GRADIENT_LINES.minimum}-${GRADIENT_LINES.fifth - 1}分`,
    7: `<${GRADIENT_LINES.minimum}分`,
  }
  return ranges[level] || '未知'
}

export const gradientColors = {
  1: '#dc2626',
  2: '#f97316',
  3: '#f59e0b',
  4: '#84cc16',
  5: '#22c55e',
  6: '#3b82f6',
  7: '#6b7280',
}

function getGradientLine(level) {
  const lines = {
    1: GRADIENT_LINES.first,
    2: GRADIENT_LINES.second,
    3: GRADIENT_LINES.third,
    4: GRADIENT_LINES.fourth,
    5: GRADIENT_LINES.fifth,
    6: GRADIENT_LINES.minimum,
  }
  return lines[level] || 0
}

function getSchoolAdmissionGradient(minScore) {
  if (minScore >= GRADIENT_LINES.first) return '第一梯度'
  if (minScore >= GRADIENT_LINES.second) return '第二梯度'
  if (minScore >= GRADIENT_LINES.third) return '第三梯度'
  if (minScore >= GRADIENT_LINES.fourth) return '第四梯度'
  if (minScore >= GRADIENT_LINES.fifth) return '第五梯度'
  if (minScore >= GRADIENT_LINES.minimum) return '普高最低线以上'
  return '普高最低线以下'
}

export function calculateAdmissionStrict(studentScore, isHukou, volunteers, scoreSeq = 1) {
  const score = parseInt(studentScore)
  
  if (isNaN(score) || score < 0 || score > 810) {
    return { success: false, error: '分数无效，请输入0-810之间的分数' }
  }
  
  const studentGradientLevel = getGradientLevel(score)
  
  if (studentGradientLevel === 7) {
    return { 
      success: true, 
      admitted: false,
      error: '分数未达到普高最低控制线(487分)，无法被普通高中录取',
      score,
      gradientLevel: studentGradientLevel,
      processLog: [{
        step: '梯度判定',
        status: 'failed',
        message: `分数${score}分未达到普高最低控制线${GRADIENT_LINES.minimum}分，无法参与普通高中投档录取`,
      }],
    }
  }
  
  const validVolunteers = volunteers.filter(v => v && v.schoolId)
  if (validVolunteers.length === 0) {
    return { success: false, error: '请至少填报一个志愿' }
  }
  
  const processLog = []
  
  processLog.push({
    step: '梯度判定',
    status: 'info',
    message: `考生分数${score}分，处于${getGradientLabel(studentGradientLevel)}（${getGradientScoreRange(studentGradientLevel)}）`,
    details: {
      score,
      gradientLevel: studentGradientLevel,
      gradientRange: getGradientScoreRange(studentGradientLevel),
    }
  })
  
  for (let i = 0; i < validVolunteers.length; i++) {
    const volunteer = validVolunteers[i]
    const school = schools2025Full.find(s => s.id === volunteer.schoolId)
    const volunteerOrder = i + 1
    
    if (!school) {
      processLog.push({
        step: `第${volunteerOrder}志愿`,
        status: 'error',
        message: '学校不存在',
        volunteerOrder,
      })
      continue
    }
    
    const admissionData = isHukou ? school.hukou : school.nonHukou
    if (!admissionData) {
      processLog.push({
        step: `第${volunteerOrder}志愿`,
        status: 'error',
        message: `${isHukou ? '户籍生' : '非户籍生'}无录取数据`,
        volunteerOrder,
        schoolName: school.name,
      })
      continue
    }
    
    const { minScore, minScoreSeq, lastVolunteer, lastScore, lastScoreSeq } = admissionData
    const schoolGradientLevel = getGradientLevel(minScore)
    const schoolAdmissionGradient = getSchoolAdmissionGradient(minScore)
    
    processLog.push({
      step: `第${volunteerOrder}志愿`,
      volunteerOrder,
      schoolName: school.name,
      schoolMinScore: minScore,
      schoolMinScoreSeq: minScoreSeq,
      lastVolunteer,
      lastScore,
      lastScoreSeq,
      schoolGradientLevel,
      schoolAdmissionGradient,
    })
    
    if (minScore < getGradientLine(studentGradientLevel)) {
      processLog[processLog.length - 1].status = 'success'
      processLog[processLog.length - 1].admissionType = '跨梯度录取'
      processLog[processLog.length - 1].message = `【录取成功】学校录取最低分数${minScore}分（${schoolAdmissionGradient}）低于${getGradientLabel(studentGradientLevel)}控制线${getGradientLine(studentGradientLevel)}分。说明该校在${getGradientLabel(studentGradientLevel)}投档时未完成招生计划，您作为第${volunteerOrder}志愿填报该校，可以被录取。`
      
      return {
        success: true,
        admitted: true,
        school: school,
        volunteerOrder: volunteerOrder,
        score,
        scoreSeq,
        gradientLevel: studentGradientLevel,
        admissionType: '跨梯度录取',
        details: {
          schoolMinScore: minScore,
          schoolMinScoreSeq: minScoreSeq,
          lastVolunteer,
          lastScore,
          lastScoreSeq,
          note: `该校录取分数线${minScore}分低于您所在梯度控制线，说明该校在您所在梯度投档时未录满，您被录取。`,
        },
        processLog,
      }
    }
    
    if (lastVolunteer < volunteerOrder) {
      processLog[processLog.length - 1].status = 'failed'
      processLog[processLog.length - 1].message = `【未录取】该校在${schoolAdmissionGradient}第${lastVolunteer}志愿已完成招生计划（末位考生分数${lastScore}分）。您填报的是第${volunteerOrder}志愿，志愿序号${volunteerOrder} > 末位志愿序号${lastVolunteer}，该校不会录取第${volunteerOrder}志愿的考生。`
      continue
    }
    
    if (score < minScore) {
      processLog[processLog.length - 1].status = 'failed'
      processLog[processLog.length - 1].message = `【未录取】您的分数${score}分 < 学校录取最低分数${minScore}分。该校在${schoolAdmissionGradient}第${lastVolunteer}志愿录取的最低分数为${minScore}分，您的分数未达到录取要求。`
      continue
    }
    
    if (score > minScore) {
      processLog[processLog.length - 1].status = 'success'
      processLog[processLog.length - 1].admissionType = '分数优先录取'
      processLog[processLog.length - 1].message = `【录取成功】该校在${schoolAdmissionGradient}第${lastVolunteer}志愿完成招生计划（末位分数${lastScore}分）。您填报第${volunteerOrder}志愿，志愿序号${volunteerOrder} ≤ 末位志愿序号${lastVolunteer}，且您的分数${score}分 > 学校最低录取分数${minScore}分，按分数优先原则录取。`
      
      return {
        success: true,
        admitted: true,
        school: school,
        volunteerOrder: volunteerOrder,
        score,
        scoreSeq,
        gradientLevel: studentGradientLevel,
        admissionType: '分数优先录取',
        details: {
          schoolMinScore: minScore,
          schoolMinScoreSeq: minScoreSeq,
          scoreGap: score - minScore,
          lastVolunteer,
          lastScore,
          lastScoreSeq,
          note: `您以${score}分（高出录取线${score - minScore}分）被该校第${volunteerOrder}志愿录取。`,
        },
        processLog,
      }
    }
    
    if (score === minScore) {
      if (lastVolunteer > volunteerOrder) {
        processLog[processLog.length - 1].status = 'success'
        processLog[processLog.length - 1].admissionType = '志愿优先录取'
        processLog[processLog.length - 1].message = `【录取成功】您的分数${score}分 = 学校最低录取分数${minScore}分。该校在${schoolAdmissionGradient}第${lastVolunteer}志愿完成招生计划，您填报第${volunteerOrder}志愿，志愿序号${volunteerOrder} < 末位志愿序号${lastVolunteer}，您的志愿优先于末位考生，可以被录取。`
        
        return {
          success: true,
          admitted: true,
          school: school,
          volunteerOrder: volunteerOrder,
          score,
          scoreSeq,
          gradientLevel: studentGradientLevel,
          admissionType: '志愿优先录取',
          details: {
            schoolMinScore: minScore,
            schoolMinScoreSeq: minScoreSeq,
            scoreGap: 0,
            lastVolunteer,
            lastScore,
            lastScoreSeq,
            note: `您以${score}分（压线）被该校第${volunteerOrder}志愿录取，您的志愿序号优先于末位考生。`,
          },
          processLog,
        }
      }
      
      if (lastVolunteer === volunteerOrder) {
        if (scoreSeq <= minScoreSeq) {
          processLog[processLog.length - 1].status = 'success'
          processLog[processLog.length - 1].admissionType = '同分录取'
          processLog[processLog.length - 1].message = `【录取成功】您的分数${score}分 = 学校最低录取分数${minScore}分（同分）。该校在${schoolAdmissionGradient}第${volunteerOrder}志愿录取的同分考生最大序号为${minScoreSeq}，您的同分序号${scoreSeq} ≤ ${minScoreSeq}，可以被录取。`
          
          return {
            success: true,
            admitted: true,
            school: school,
            volunteerOrder: volunteerOrder,
            score,
            scoreSeq,
            gradientLevel: studentGradientLevel,
            admissionType: '同分录取',
            details: {
              schoolMinScore: minScore,
              schoolMinScoreSeq: minScoreSeq,
              scoreGap: 0,
              lastVolunteer,
              lastScore,
              lastScoreSeq,
              note: `您以${score}分（同分压线）被该校第${volunteerOrder}志愿录取，同分序号${scoreSeq}满足条件。`,
            },
            processLog,
          }
        } else {
          processLog[processLog.length - 1].status = 'failed'
          processLog[processLog.length - 1].message = `【未录取】您的分数${score}分 = 学校最低录取分数${minScore}分（同分）。该校在${schoolAdmissionGradient}第${volunteerOrder}志愿录取的同分考生最大序号为${minScoreSeq}，您的同分序号${scoreSeq} > ${minScoreSeq}，不满足录取条件。`
          continue
        }
      }
    }
    
    if (lastVolunteer >= volunteerOrder) {
      if (score > lastScore) {
        processLog[processLog.length - 1].status = 'success'
        processLog[processLog.length - 1].admissionType = '志愿优先录取'
        processLog[processLog.length - 1].message = `【录取成功】该校在${schoolAdmissionGradient}第${lastVolunteer}志愿完成招生计划，末位考生分数${lastScore}分。您填报第${volunteerOrder}志愿，志愿序号${volunteerOrder} ≤ 末位志愿序号${lastVolunteer}，且您的分数${score}分 > 末位分数${lastScore}分，可以被录取。`
        
        return {
          success: true,
          admitted: true,
          school: school,
          volunteerOrder: volunteerOrder,
          score,
          scoreSeq,
          gradientLevel: studentGradientLevel,
          admissionType: '志愿优先录取',
          details: {
            schoolMinScore: minScore,
            lastVolunteer,
            lastScore,
            lastScoreSeq,
            note: `该校第${volunteerOrder}志愿录取分数范围${minScore}-${lastScore}分，您以${score}分被录取。`,
          },
          processLog,
        }
      }
      
      if (score === lastScore) {
        if (scoreSeq <= lastScoreSeq) {
          processLog[processLog.length - 1].status = 'success'
          processLog[processLog.length - 1].admissionType = '志愿优先录取'
          processLog[processLog.length - 1].message = `【录取成功】该校在${schoolAdmissionGradient}第${lastVolunteer}志愿完成招生计划，末位考生分数${lastScore}分、同分序号${lastScoreSeq}。您填报第${volunteerOrder}志愿，分数${score}分 = 末位分数${lastScore}分，且同分序号${scoreSeq} ≤ ${lastScoreSeq}，可以被录取。`
          
          return {
            success: true,
            admitted: true,
            school: school,
            volunteerOrder: volunteerOrder,
            score,
            scoreSeq,
            gradientLevel: studentGradientLevel,
            admissionType: '志愿优先录取',
            details: {
              schoolMinScore: minScore,
              lastVolunteer,
              lastScore,
              lastScoreSeq,
              note: `您以${score}分（同分）被该校第${volunteerOrder}志愿录取，同分序号${scoreSeq}满足条件。`,
            },
            processLog,
          }
        } else {
          processLog[processLog.length - 1].status = 'failed'
          processLog[processLog.length - 1].message = `【未录取】该校在${schoolAdmissionGradient}第${lastVolunteer}志愿完成招生计划，末位考生分数${lastScore}分、同分序号${lastScoreSeq}。您填报第${volunteerOrder}志愿，分数${score}分 = 末位分数${lastScore}分，但同分序号${scoreSeq} > ${lastScoreSeq}，不满足录取条件。`
          continue
        }
      }
      
      if (score < lastScore && score >= minScore) {
        processLog[processLog.length - 1].status = 'failed'
        processLog[processLog.length - 1].message = `【未录取】该校在${schoolAdmissionGradient}第${lastVolunteer}志愿完成招生计划，末位考生分数${lastScore}分。您填报第${volunteerOrder}志愿，虽然志愿序号${volunteerOrder} ≤ 末位志愿序号${lastVolunteer}，但您的分数${score}分 < 末位分数${lastScore}分，该校第${volunteerOrder}志愿录取的最低分数为${lastScore}分，您未达到录取要求。`
        continue
      }
    }
  }
  
  processLog.push({
    step: '录取结果',
    status: 'failed',
    message: '所填志愿均未达到录取条件，建议调整志愿顺序或选择录取分数线更低的学校。',
  })
  
  return {
    success: true,
    admitted: false,
    score,
    scoreSeq,
    gradientLevel: studentGradientLevel,
    error: '所填志愿均未达到录取条件',
    suggestion: '建议调整志愿顺序或选择录取分数线更低的学校',
    processLog,
  }
}

export function batchAdmission(students) {
  const results = []
  const schoolAdmissionCounts = {}
  
  schools2025Full.forEach(s => {
    schoolAdmissionCounts[s.id] = { hukou: 0, nonHukou: 0 }
  })
  
  const sortedStudents = [...students].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.scoreSeq - b.scoreSeq
  })
  
  for (const student of sortedStudents) {
    const result = calculateAdmissionStrict(
      student.score,
      student.isHukou,
      student.volunteers,
      student.scoreSeq || 1
    )
    
    if (result.admitted && result.school) {
      const type = student.isHukou ? 'hukou' : 'nonHukou'
      schoolAdmissionCounts[result.school.id][type]++
    }
    
    results.push({
      ...student,
      result,
    })
  }
  
  const stats = {
    total: students.length,
    admitted: results.filter(r => r.result.admitted).length,
    notAdmitted: results.filter(r => !r.result.admitted).length,
    byGradient: {},
    bySchool: {},
  }
  
  for (let i = 1; i <= 7; i++) {
    stats.byGradient[i] = {
      total: results.filter(r => r.result.gradientLevel === i).length,
      admitted: results.filter(r => r.result.gradientLevel === i && r.result.admitted).length,
    }
  }
  
  schools2025Full.forEach(s => {
    if (schoolAdmissionCounts[s.id].hukou > 0 || schoolAdmissionCounts[s.id].nonHukou > 0) {
      stats.bySchool[s.id] = {
        name: s.name,
        hukou: schoolAdmissionCounts[s.id].hukou,
        nonHukou: schoolAdmissionCounts[s.id].nonHukou,
        total: schoolAdmissionCounts[s.id].hukou + schoolAdmissionCounts[s.id].nonHukou,
      }
    }
  })
  
  return { results, stats, schoolAdmissionCounts }
}

export function generateRandomStudents(count, scoreRange = [487, 810], volunteerCount = 6) {
  const students = []
  
  for (let i = 0; i < count; i++) {
    const score = Math.floor(Math.random() * (scoreRange[1] - scoreRange[0] + 1)) + scoreRange[0]
    const scoreSeq = Math.floor(Math.random() * 500) + 1
    const isHukou = Math.random() > 0.2
    
    const availableSchools = [...schools2025Full]
    const volunteers = []
    
    const shuffled = availableSchools.sort(() => Math.random() - 0.5)
    for (let j = 0; j < Math.min(volunteerCount, shuffled.length); j++) {
      volunteers.push({ schoolId: shuffled[j].id })
    }
    
    students.push({
      id: `STU${String(i + 1).padStart(4, '0')}`,
      score,
      scoreSeq,
      isHukou,
      volunteers,
    })
  }
  
  return students
}
