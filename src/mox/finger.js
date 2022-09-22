/*
 * @Author: czy0729
 * @Date: 2022-09-22 21:36:55
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-23 00:35:37
 */
const utils = require('../utils')
const { getPinYinFirstCharacter } = require('../utils/third-party/pinyin')

const __mox = utils.root('data/mox/mox.json')
const __cates = utils.root('data/mox/cates.json')
const __finger = utils.root('data/mox/finger.json')

const mox = utils.read(__mox)

const cates = {
  data: [],
  nums: {}
}
let finger = []

mox.forEach(item => {
  if (item.cates) {
    item.cates.split(' ').forEach(cate => {
      if (!cates.nums[cate]) {
        cates.nums[cate] = 1
      } else {
        cates.nums[cate] += 1
      }
    })
  }
})
cates.data = Object.keys(cates.nums).sort(
  (a, b) => cates.nums[b] - cates.nums[a]
)

mox.forEach(item => {
  const i = {
    i: item.id,
    f: getPinYinFirstCharacter(item.title)
  }
  if (item.score) i.s = item.score
  if (item.rank) i.r = item.rank
  if (item.total) i.l = item.total
  if (item.status === '连载') i.u = 1
  if (item.cates) {
    const tags = []
    item.cates.split(' ').forEach(cate => {
      const index = cates.data.findIndex(c => c === cate)
      if (index !== -1) tags.push(index)
    })
    if (tags.length) i.b = tags
  }
  if (item.publish) i.p = String(item.publish)
  if (item.update) i.d = String(item.update)
  if (item.hot) i.h = item.hot

  finger.push(i)
})

finger.sort((a, b)=> (b.d || '').localeCompare(a.d || '')).forEach(item => {
  delete item.d

  // 过滤不正确的发行日期
  if (item.p && Number(item.p) >= 2023) delete item.p
})


utils.write(__cates, cates)
utils.write(__finger, finger, true)
process.exit()
