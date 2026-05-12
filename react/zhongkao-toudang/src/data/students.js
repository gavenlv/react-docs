import { SCORE_DISTRIBUTION_2025, STATS_2025, GRADIENT_LINES } from '../utils/admission.js'

const surnames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高']
const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '华', '慧', '建', '建国', '建军', '志强', '志明', '志伟', '文静', '文杰', '文华', '思远', '思源', '思琪', '雨欣', '雨涵', '雨萱', '子轩', '子涵', '子墨', '浩然', '浩宇', '欣怡', '欣悦', '嘉怡', '嘉欣', '嘉豪', '梓涵', '梓萱', '梓豪', '梓轩', '诗涵', '诗琪']

function generateName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)]
  const name = names[Math.floor(Math.random() * names.length)]
  return surname + name
}

function generateExamId(index) {
  return `2025${String(index).padStart(6, '0')}`
}

function generateScoreBasedOnDistribution() {
  const rand = Math.random() * 100
  let cumulative = 0
  
  const distribution = [
    { minScore: 750, maxScore: 810, percentage: 0.72 },
    { minScore: 740, maxScore: 749, percentage: 1.89 - 0.72 },
    { minScore: 730, maxScore: 739, percentage: 3.80 - 1.89 },
    { minScore: 720, maxScore: 729, percentage: 6.25 - 3.80 },
    { minScore: 710, maxScore: 719, percentage: 9.21 - 6.25 },
    { minScore: 700, maxScore: 709, percentage: 12.34 - 9.21 },
    { minScore: 690, maxScore: 699, percentage: 15.68 - 12.34 },
    { minScore: 680, maxScore: 689, percentage: 19.13 - 15.68 },
    { minScore: 670, maxScore: 679, percentage: 22.57 - 19.13 },
    { minScore: 660, maxScore: 669, percentage: 25.91 - 22.57 },
    { minScore: 650, maxScore: 659, percentage: 29.24 - 25.91 },
    { minScore: 640, maxScore: 649, percentage: 32.51 - 29.24 },
    { minScore: 630, maxScore: 639, percentage: 35.71 - 32.51 },
    { minScore: 620, maxScore: 629, percentage: 38.74 - 35.71 },
    { minScore: 610, maxScore: 619, percentage: 41.67 - 38.74 },
    { minScore: 600, maxScore: 609, percentage: 44.52 - 41.67 },
    { minScore: 590, maxScore: 599, percentage: 47.18 - 44.52 },
    { minScore: 580, maxScore: 589, percentage: 49.80 - 47.18 },
    { minScore: 570, maxScore: 579, percentage: 52.36 - 49.80 },
    { minScore: 560, maxScore: 569, percentage: 54.81 - 52.36 },
    { minScore: 550, maxScore: 559, percentage: 57.07 - 54.81 },
    { minScore: 540, maxScore: 549, percentage: 59.25 - 57.07 },
    { minScore: 530, maxScore: 539, percentage: 61.40 - 59.25 },
    { minScore: 520, maxScore: 529, percentage: 63.42 - 61.40 },
    { minScore: 510, maxScore: 519, percentage: 65.39 - 63.42 },
    { minScore: 500, maxScore: 509, percentage: 67.25 - 65.39 },
    { minScore: 490, maxScore: 499, percentage: 69.02 - 67.25 },
    { minScore: 480, maxScore: 489, percentage: 70.75 - 69.02 },
    { minScore: 470, maxScore: 479, percentage: 72.43 - 70.75 },
    { minScore: 460, maxScore: 469, percentage: 74.05 - 72.43 },
    { minScore: 450, maxScore: 459, percentage: 75.68 - 74.05 },
    { minScore: 440, maxScore: 449, percentage: 77.27 - 75.68 },
    { minScore: 430, maxScore: 439, percentage: 78.81 - 77.27 },
    { minScore: 420, maxScore: 429, percentage: 80.25 - 78.81 },
    { minScore: 410, maxScore: 419, percentage: 81.65 - 80.25 },
    { minScore: 400, maxScore: 409, percentage: 83.05 - 81.65 },
    { minScore: 350, maxScore: 399, percentage: 16.95 },
  ]
  
  for (const range of distribution) {
    cumulative += range.percentage
    if (rand <= cumulative) {
      const total = Math.floor(Math.random() * (range.maxScore - range.minScore + 1)) + range.minScore
      return generateSubjectScores(total)
    }
  }
  
  return generateSubjectScores(Math.floor(Math.random() * 100) + 350)
}

function generateSubjectScores(total) {
  const maxMain = Math.min(total, 360)
  const mainTotal = Math.floor(maxMain * (0.85 + Math.random() * 0.15))
  
  const chinese = Math.floor(mainTotal * (0.3 + Math.random() * 0.1))
  const math = Math.floor(mainTotal * (0.3 + Math.random() * 0.1))
  const english = mainTotal - chinese - math
  
  const remaining = total - mainTotal
  const physics = Math.floor(remaining * 0.18 + Math.random() * 10)
  const chemistry = Math.floor(remaining * 0.16 + Math.random() * 10)
  const politics = Math.floor(remaining * 0.14 + Math.random() * 8)
  const history = Math.floor(remaining * 0.12 + Math.random() * 8)
  const pe = Math.floor(55 + Math.random() * 5)
  const experiment = Math.floor(16 + Math.random() * 4)
  
  return {
    total,
    chinese: Math.max(0, Math.min(120, chinese)),
    math: Math.max(0, Math.min(120, math)),
    english: Math.max(0, Math.min(120, english)),
    physics: Math.max(0, Math.min(100, physics)),
    chemistry: Math.max(0, Math.min(100, chemistry)),
    politics: Math.max(0, Math.min(100, politics)),
    history: Math.max(0, Math.min(100, history)),
    pe: Math.max(0, Math.min(60, pe)),
    experiment: Math.max(0, Math.min(20, experiment)),
    threeMain: chinese + math + english,
  }
}

function generateVolunteers(schools, score) {
  const volunteers = []
  const thirdBatchSchools = schools.filter(s => s.batch === 'third')
  const fourthBatchSchools = schools.filter(s => s.batch === 'fourth')
  
  const targetScore = score.total
  
  const sortedThirdSchools = [...thirdBatchSchools].sort((a, b) => {
    const diffA = Math.abs((a.minScore2025 || a.minScore) - targetScore)
    const diffB = Math.abs((b.minScore2025 || b.minScore) - targetScore)
    return diffA - diffB
  })
  
  const numVolunteers = Math.min(6, sortedThirdSchools.length)
  
  for (let i = 0; i < numVolunteers; i++) {
    const schoolIndex = Math.floor(Math.random() * Math.min(5, sortedThirdSchools.length))
    const school = sortedThirdSchools[schoolIndex]
    
    if (!volunteers.find(v => v.schoolId === school.id)) {
      volunteers.push({
        order: i + 1,
        schoolId: school.id,
        schoolName: school.name,
      })
    }
  }
  
  if (volunteers.length < 6 && fourthBatchSchools.length > 0) {
    const shuffledFourth = [...fourthBatchSchools].sort(() => Math.random() - 0.5)
    for (const school of shuffledFourth) {
      if (volunteers.length >= 6) break
      if (!volunteers.find(v => v.schoolId === school.id)) {
        volunteers.push({
          order: volunteers.length + 1,
          schoolId: school.id,
          schoolName: school.name,
        })
      }
    }
  }
  
  return volunteers
}

export function generateStudents(schools, count = 500) {
  const students = []
  const districts = ['越秀区', '海珠区', '荔湾区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区', '从化区', '增城区']
  const districtWeights = {
    '越秀区': 0.10,
    '海珠区': 0.10,
    '荔湾区': 0.10,
    '天河区': 0.12,
    '白云区': 0.14,
    '黄埔区': 0.10,
    '番禺区': 0.12,
    '花都区': 0.08,
    '南沙区': 0.06,
    '从化区': 0.04,
    '增城区': 0.04,
  }
  const studentTypes = ['local', 'migrant', 'policy']
  const middleSchools = [
    '广州市第一中学初中部', '广州市第二中学初中部', '广州市第三中学初中部',
    '广州市第四中学初中部', '广州市第五中学初中部', '广州市第六中学初中部',
    '广州市第七中学初中部', '广州市第十六中学初中部', '广州市执信中学初中部',
    '广东实验中学初中部', '华南师范大学附属中学初中部', '广州市铁一中学初中部',
    '广州市天河中学初中部', '广州市培正中学初中部', '广州市育才中学初中部',
  ]
  
  for (let i = 0; i < count; i++) {
    const score = generateScoreBasedOnDistribution()
    const volunteers = generateVolunteers(schools, score)
    
    let district = '天河区'
    const rand = Math.random()
    let cumulative = 0
    for (const [d, w] of Object.entries(districtWeights)) {
      cumulative += w
      if (rand <= cumulative) {
        district = d
        break
      }
    }
    
    const studentType = Math.random() > 0.15 ? 'local' : (Math.random() > 0.5 ? 'migrant' : 'policy')
    
    students.push({
      id: generateExamId(i + 1),
      name: generateName(),
      gender: Math.random() > 0.5 ? '男' : '女',
      district,
      middleSchool: middleSchools[Math.floor(Math.random() * middleSchools.length)],
      studentType,
      score,
      volunteers,
      result: null,
    })
  }
  
  return students.sort((a, b) => b.score.total - a.score.total)
}

export const sampleStudents = [
  {
    id: '2025000001',
    name: '张伟',
    gender: '男',
    district: '天河区',
    middleSchool: '华南师范大学附属中学初中部',
    studentType: 'local',
    score: {
      total: 758,
      chinese: 112,
      math: 118,
      english: 115,
      physics: 98,
      chemistry: 95,
      politics: 88,
      history: 86,
      pe: 60,
      experiment: 20,
      threeMain: 345,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ009', schoolName: '广州市第二中学' },
      { order: 4, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 5, schoolId: 'GZ010', schoolName: '广州市第六中学（海珠校区）' },
      { order: 6, schoolId: 'GZ005', schoolName: '广东广雅中学（荔湾校区）' },
    ],
    result: null,
  },
  {
    id: '2025000002',
    name: '李芳',
    gender: '女',
    district: '越秀区',
    middleSchool: '广东实验中学初中部',
    studentType: 'local',
    score: {
      total: 745,
      chinese: 110,
      math: 115,
      english: 112,
      physics: 95,
      chemistry: 92,
      politics: 85,
      history: 84,
      pe: 58,
      experiment: 19,
      threeMain: 337,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 2, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 3, schoolId: 'GZ009', schoolName: '广州市第二中学' },
      { order: 4, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 5, schoolId: 'GZ031', schoolName: '广州市第十六中学（本部）' },
      { order: 6, schoolId: 'GZ032', schoolName: '广州市培正中学' },
    ],
    result: null,
  },
  {
    id: '2025000003',
    name: '王强',
    gender: '男',
    district: '海珠区',
    middleSchool: '广州市第六中学初中部',
    studentType: 'local',
    score: {
      total: 732,
      chinese: 108,
      math: 112,
      english: 110,
      physics: 92,
      chemistry: 88,
      politics: 82,
      history: 80,
      pe: 58,
      experiment: 18,
      threeMain: 330,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ009', schoolName: '广州市第二中学' },
      { order: 2, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 3, schoolId: 'GZ010', schoolName: '广州市第六中学（海珠校区）' },
      { order: 4, schoolId: 'GZ021', schoolName: '广州市第五中学（本部）' },
      { order: 5, schoolId: 'GZ023', schoolName: '广州市南武中学（校本部）' },
      { order: 6, schoolId: 'GZ033', schoolName: '广州市第七中学（本部）' },
    ],
    result: null,
  },
  {
    id: '2025000004',
    name: '刘静',
    gender: '女',
    district: '荔湾区',
    middleSchool: '广东广雅中学初中部',
    studentType: 'local',
    score: {
      total: 718,
      chinese: 105,
      math: 108,
      english: 106,
      physics: 88,
      chemistry: 85,
      politics: 80,
      history: 78,
      pe: 57,
      experiment: 18,
      threeMain: 319,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ005', schoolName: '广东广雅中学（荔湾校区）' },
      { order: 2, schoolId: 'GZ010', schoolName: '广州市第六中学（海珠校区）' },
      { order: 3, schoolId: 'GZ026', schoolName: '广州市真光中学（校本部）' },
      { order: 4, schoolId: 'GZ029', schoolName: '广州市第一中学' },
      { order: 5, schoolId: 'GZ030', schoolName: '广州市第四中学' },
      { order: 6, schoolId: 'GZ019', schoolName: '广州协和学校' },
    ],
    result: null,
  },
  {
    id: '2025000005',
    name: '陈明',
    gender: '男',
    district: '番禺区',
    middleSchool: '广州市仲元中学初中部',
    studentType: 'local',
    score: {
      total: 695,
      chinese: 100,
      math: 102,
      english: 98,
      physics: 82,
      chemistry: 80,
      politics: 76,
      history: 74,
      pe: 56,
      experiment: 17,
      threeMain: 300,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ043', schoolName: '广州市番禺区仲元中学' },
      { order: 2, schoolId: 'GZ044', schoolName: '广州市番禺区番禺中学' },
      { order: 3, schoolId: 'GZ013', schoolName: '广州大学附属中学' },
      { order: 4, schoolId: 'GZ037', schoolName: '广州中学' },
      { order: 5, schoolId: 'GZ026', schoolName: '广州市真光中学（校本部）' },
      { order: 6, schoolId: 'GZ029', schoolName: '广州市第一中学' },
    ],
    result: null,
  },
  {
    id: '2025000006',
    name: '杨丽',
    gender: '女',
    district: '天河区',
    middleSchool: '广州市天河中学初中部',
    studentType: 'local',
    score: {
      total: 682,
      chinese: 98,
      math: 100,
      english: 95,
      physics: 78,
      chemistry: 76,
      politics: 72,
      history: 70,
      pe: 56,
      experiment: 17,
      threeMain: 293,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ037', schoolName: '广州中学' },
      { order: 2, schoolId: 'GZ038', schoolName: '广州市第一一三中学' },
      { order: 3, schoolId: 'GZ021', schoolName: '广州市第五中学（本部）' },
      { order: 4, schoolId: 'GZ029', schoolName: '广州市第一中学' },
      { order: 5, schoolId: 'GZ030', schoolName: '广州市第四中学' },
      { order: 6, schoolId: 'GZ019', schoolName: '广州协和学校' },
    ],
    result: null,
  },
  {
    id: '2025000007',
    name: '黄浩然',
    gender: '男',
    district: '白云区',
    middleSchool: '广州市培英中学初中部',
    studentType: 'local',
    score: {
      total: 668,
      chinese: 95,
      math: 98,
      english: 92,
      physics: 75,
      chemistry: 72,
      politics: 68,
      history: 66,
      pe: 55,
      experiment: 16,
      threeMain: 285,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ016', schoolName: '广州市铁一中学（白云校区）' },
      { order: 2, schoolId: 'GZ019', schoolName: '广州协和学校' },
      { order: 3, schoolId: 'GZ030', schoolName: '广州市第四中学' },
      { order: 4, schoolId: 'GZ020', schoolName: '广东华侨中学' },
      { order: 5, schoolId: 'GZ056', schoolName: '广州市第十三中学' },
      { order: 6, schoolId: 'GZ057', schoolName: '广州市第十七中学' },
    ],
    result: null,
  },
  {
    id: '2025000008',
    name: '赵欣怡',
    gender: '女',
    district: '黄埔区',
    middleSchool: '广州市第八十六中学初中部',
    studentType: 'local',
    score: {
      total: 658,
      chinese: 92,
      math: 95,
      english: 88,
      physics: 72,
      chemistry: 70,
      politics: 65,
      history: 62,
      pe: 55,
      experiment: 16,
      threeMain: 275,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ041', schoolName: '广州市黄埔区玉岩中学' },
      { order: 2, schoolId: 'GZ042', schoolName: '广州市第八十六中学' },
      { order: 3, schoolId: 'GZ045', schoolName: '广州市花都区秀全中学' },
      { order: 4, schoolId: 'GZ049', schoolName: '广州市南沙第一中学' },
      { order: 5, schoolId: 'GZ056', schoolName: '广州市第十三中学' },
      { order: 6, schoolId: 'GZ058', schoolName: '广州市第四十一中学' },
    ],
    result: null,
  },
  {
    id: '2025000009',
    name: '周子轩',
    gender: '男',
    district: '花都区',
    middleSchool: '广州市花都区秀全中学初中部',
    studentType: 'local',
    score: {
      total: 645,
      chinese: 88,
      math: 92,
      english: 85,
      physics: 68,
      chemistry: 65,
      politics: 62,
      history: 60,
      pe: 54,
      experiment: 15,
      threeMain: 265,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ045', schoolName: '广州市花都区秀全中学' },
      { order: 2, schoolId: 'GZ046', schoolName: '广州市增城区增城中学' },
      { order: 3, schoolId: 'GZ049', schoolName: '广州市南沙第一中学' },
      { order: 4, schoolId: 'GZ047', schoolName: '广州市从化区从化中学' },
      { order: 5, schoolId: 'GZ056', schoolName: '广州市第十三中学' },
      { order: 6, schoolId: 'GZ057', schoolName: '广州市第十七中学' },
    ],
    result: null,
  },
  {
    id: '2025000010',
    name: '吴雨涵',
    gender: '女',
    district: '增城区',
    middleSchool: '广州市增城区增城中学初中部',
    studentType: 'local',
    score: {
      total: 632,
      chinese: 85,
      math: 88,
      english: 82,
      physics: 65,
      chemistry: 62,
      politics: 58,
      history: 56,
      pe: 54,
      experiment: 15,
      threeMain: 255,
    },
    volunteers: [
      { order: 1, schoolId: 'GZ046', schoolName: '广州市增城区增城中学' },
      { order: 2, schoolId: 'GZ047', schoolName: '广州市从化区从化中学' },
      { order: 3, schoolId: 'GZ049', schoolName: '广州市南沙第一中学' },
      { order: 4, schoolId: 'GZ056', schoolName: '广州市第十三中学' },
      { order: 5, schoolId: 'GZ056', schoolName: '广州市第十三中学' },
      { order: 6, schoolId: 'GZ024', schoolName: '广州市第九十七中学（校本部）' },
    ],
    result: null,
  },
]

export const studentTypes = {
  local: { label: '户籍生', color: '#10b981' },
  migrant: { label: '随迁子女', color: '#f59e0b' },
  policy: { label: '政策性照顾', color: '#8b5cf6' },
}
