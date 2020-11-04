/*
 * @Author: czy0729
 * @Date: 2020-10-28 19:40:30
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-10-29 17:31:37
 */
const fs = require('fs')

// const relation = JSON.parse(fs.readFileSync('./data/tinygrail/relation.json'))
// Object.keys(relation.data).forEach((monoId) => {
//   delete relation.data[monoId].n
//   delete relation.data[monoId].i
//   delete relation.data[monoId].l
//   if (!relation.data[monoId].r.length) {
//     delete relation.data[monoId].r
//   }
// })
// fs.writeFileSync(
//   './data/tinygrail/relation-mini.json',
//   JSON.stringify(relation)
// )
// return

const xsb = {}
const subject = {}
const ids = {}
const name = {}

JSON.parse(fs.readFileSync('./data/tinygrail/msrc.json')).map((item) => {
  const { id } = item
  const filePath = `../Bangumi-Mono/data/${Math.floor(id / 100)}/${id}.json`
  const jobs = (JSON.parse(fs.readFileSync(filePath)).jobs || [])
    .filter((item) => [1, 2, 4].includes(item.type))
    .map((item) => ({
      ...item,
      id: parseInt(item.href.replace('/subject/', '')),
    }))
    .sort((a, b) => {
      const _a = a.type === 2 ? 100 : a.type === 1 ? 10 : 1
      const _b = b.type === 2 ? 100 : b.type === 1 ? 10 : 1
      return _b * (500000 - b.id) - _a * (500000 - a.id)
    })

  if (jobs.length) {
    // 当前角色入库
    xsb[id] = {
      n: item.name,
      i: item.icon,
    }
    if (item.level > 1) {
      xsb[id].l = item.level
    }

    // 选定人物的显示条目
    subject[id] = jobs[0].id
    if (!name[jobs[0].id]) {
      name[jobs[0].id] = jobs[0].nameCn || jobs[0].name
    }

    // 用条目id建立关系
    ids[id] = jobs.map((item) => item.id)
  }
})

// const name = []
// Object.keys(subject).forEach((monoId) => {
//   const cn = subject[monoId]
//   if (!nameMap[cn]) {
//     nameMap[cn] = name.length
//     name.push(cn)
//   }
//   subject[monoId] = nameMap[cn]
// })

const data = {
  name,
  data: {},
  relation: {},
}
Object.keys(xsb).forEach((id) => {
  data.data[id] = xsb[id]
  data.data[id].s = subject[id]
  data.data[id].r = []
})

// 预先计算关联角色
const monoIds = Object.keys(data.data)
monoIds.forEach((monoId) => {
  const a = ids[monoId]
  monoIds.forEach((mid) => {
    const b = ids[mid]
    if (mid !== monoId && hasIntersection(a, b)) {
      data.data[monoId].r.push(parseInt(mid))
    }
  })
})

fs.writeFileSync(
  './data/tinygrail/relation.json',
  JSON.stringify(data, null, 2)
)

function hasIntersection(a, b) {
  return a.findIndex((v) => parseInt(b) === parseInt(v)) !== -1
}
