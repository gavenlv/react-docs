import { schools2025 } from './schools2025.js'

export const GRADIENT_LINES = {
  first: 707,
  second: 667,
  third: 627,
  fourth: 587,
  fifth: 547,
  minimum: 487,
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
    6: '普高最低线(487-546分)',
    7: '未达普高线(<487分)',
  }
  return labels[level] || '未知'
}

export function calculateAdmission(studentScore, isHukou, volunteers, studentDistrict) {
  const score = parseInt(studentScore)
  if (isNaN(score) || score < 0 || score > 810) {
    return { success: false, error: '分数无效' }
  }
  
  const gradientLevel = getGradientLevel(score)
  
  if (gradientLevel === 7) {
    return { 
      success: false, 
      error: '分数未达到普高最低控制线',
      score,
      gradientLevel,
    }
  }
  
  const validVolunteers = volunteers.filter(v => v.schoolId)
  if (validVolunteers.length === 0) {
    return { success: false, error: '请至少填报一个志愿' }
  }
  
  for (let i = 0; i < validVolunteers.length; i++) {
    const volunteer = validVolunteers[i]
    const school = schools2025.find(s => s.id === volunteer.schoolId)
    
    if (!school) continue
    
    const admissionData = isHukou ? school.hukou : school.nonHukou
    if (!admissionData) continue
    
    const { minScore, lastVolunteer, lastScore } = admissionData
    
    if (score > minScore) {
      return {
        success: true,
        admitted: true,
        school: school,
        volunteerOrder: i + 1,
        score,
        gradientLevel,
        admissionType: '分数优先录取',
        details: {
          schoolMinScore: minScore,
          scoreGap: score - minScore,
          lastVolunteer: lastVolunteer,
          lastScore: lastScore,
        }
      }
    }
    
    if (score === minScore) {
      return {
        success: true,
        admitted: true,
        school: school,
        volunteerOrder: i + 1,
        score,
        gradientLevel,
        admissionType: '同分录取',
        details: {
          schoolMinScore: minScore,
          scoreGap: 0,
          lastVolunteer: lastVolunteer,
          lastScore: lastScore,
          note: '同分情况下按同分序号排序录取',
        }
      }
    }
    
    if (lastVolunteer >= (i + 1) && score >= lastScore) {
      return {
        success: true,
        admitted: true,
        school: school,
        volunteerOrder: i + 1,
        score,
        gradientLevel,
        admissionType: '志愿优先录取',
        details: {
          schoolMinScore: minScore,
          lastVolunteer: lastVolunteer,
          lastScore: lastScore,
          note: `该校末位考生志愿序号为${lastVolunteer}，您的志愿序号为${i + 1}，符合录取条件`,
        }
      }
    }
  }
  
  return {
    success: true,
    admitted: false,
    score,
    gradientLevel,
    error: '所填志愿均未达到录取条件',
    suggestion: '建议调整志愿顺序或选择录取分数线更低的学校',
  }
}

export function analyzeVolunteers(studentScore, isHukou, volunteers) {
  const score = parseInt(studentScore)
  if (isNaN(score)) return []
  
  const results = []
  
  for (let i = 0; i < volunteers.length; i++) {
    const volunteer = volunteers[i]
    if (!volunteer.schoolId) continue
    
    const school = schools2025.find(s => s.id === volunteer.schoolId)
    if (!school) continue
    
    const admissionData = isHukou ? school.hukou : school.nonHukou
    if (!admissionData) continue
    
    const { minScore, lastVolunteer, lastScore } = admissionData
    
    let status = 'unknown'
    let reason = ''
    
    if (score > minScore) {
      status = 'will_admit'
      reason = `分数${score}分超过该校最低录取线${minScore}分，将被录取`
    } else if (score === minScore) {
      status = 'may_admit'
      reason = `分数${score}分等于该校最低录取线，同分情况下需看同分序号`
    } else if (lastVolunteer >= (i + 1) && score >= lastScore) {
      status = 'may_admit'
      reason = `虽然分数低于最低线，但该校末位考生志愿序号为${lastVolunteer}，您填报的是第${i + 1}志愿，有机会录取`
    } else if (score >= lastScore && lastVolunteer < (i + 1)) {
      status = 'unlikely'
      reason = `该校末位考生志愿序号为${lastVolunteer}，您填报的是第${i + 1}志愿，志愿序号靠后，录取机会较小`
    } else {
      status = 'not_admit'
      reason = `分数${score}分低于该校录取要求`
    }
    
    results.push({
      order: i + 1,
      school: school,
      minScore,
      lastVolunteer,
      lastScore,
      status,
      reason,
      scoreGap: score - minScore,
    })
  }
  
  return results
}
