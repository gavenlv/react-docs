import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import iconv from 'iconv-lite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const csvPath = path.join(__dirname, 'src/data/2025普通高中第三批录取.csv')
const outputPath = path.join(__dirname, 'src/data/schools2025Full.js')

const buffer = fs.readFileSync(csvPath)
const content = iconv.decode(buffer, 'gbk')

const lines = content.split('\n')

const schools = []
let currentSection = 'public'

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue
  
  if (line.includes('普通高中') && line.includes('学校名单')) {
    currentSection = 'private'
    continue
  }
  
  if (line.includes('说明')) continue
  if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')) continue
  
  const cols = line.split(',')
  if (cols.length < 6) continue
  
  const seq = parseInt(cols[0])
  if (isNaN(seq)) continue
  
  const name = cols[1]?.trim()
  const type = cols[2]?.trim()
  const scope = cols[3]?.trim()
  
  if (!name || !type) continue
  
  const school = {
    id: `GZ${String(seq).padStart(3, '0')}`,
    name: name,
    type: type,
    scope: scope,
    section: currentSection,
    hukou: null,
    nonHukou: null,
    outer: null,
  }
  
  const hukouMinScore = parseInt(cols[4])
  if (!isNaN(hukouMinScore)) {
    school.hukou = {
      minScore: hukouMinScore,
      minScoreSeq: parseInt(cols[5]) || 0,
      lastVolunteer: parseInt(cols[6]) || 1,
      lastScore: parseInt(cols[7]) || hukouMinScore,
      lastScoreSeq: parseInt(cols[8]) || 0,
    }
  }
  
  const nonHukouMinScore = parseInt(cols[9])
  if (!isNaN(nonHukouMinScore)) {
    school.nonHukou = {
      minScore: nonHukouMinScore,
      minScoreSeq: parseInt(cols[10]) || 0,
      lastVolunteer: parseInt(cols[11]) || 1,
      lastScore: parseInt(cols[12]) || nonHukouMinScore,
      lastScoreSeq: parseInt(cols[13]) || 0,
    }
  }
  
  const outerMinScore = parseInt(cols[14])
  if (!isNaN(outerMinScore)) {
    school.outer = {
      minScore: outerMinScore,
      minScoreSeq: parseInt(cols[15]) || 0,
      lastVolunteer: parseInt(cols[16]) || 1,
      lastScore: parseInt(cols[17]) || outerMinScore,
      lastScoreSeq: parseInt(cols[18]) || 0,
    }
  }
  
  schools.push(school)
}

const jsContent = `export const schools2025Full = ${JSON.stringify(schools, null, 2)}

export const publicSchools = schools2025Full.filter(s => s.section === 'public')
export const privateSchools = schools2025Full.filter(s => s.section === 'private')

export function getSchoolById(id) {
  return schools2025Full.find(s => s.id === id)
}

export function searchSchools(keyword, isHukou = true) {
  const kw = keyword.toLowerCase()
  return schools2025Full.filter(s => 
    s.name.toLowerCase().includes(kw) ||
    s.type.includes(kw) ||
    s.scope.includes(kw)
  ).sort((a, b) => {
    const scoreA = isHukou ? (a.hukou?.minScore || 999) : (a.nonHukou?.minScore || 999)
    const scoreB = isHukou ? (b.hukou?.minScore || 999) : (b.nonHukou?.minScore || 999)
    return scoreB - scoreA
  })
}
`

fs.writeFileSync(outputPath, jsContent, 'utf8')
console.log(`Generated ${schools.length} schools to ${outputPath}`)
console.log(`Public schools: ${schools.filter(s => s.section === 'public').length}`)
console.log(`Private schools: ${schools.filter(s => s.section === 'private').length}`)
