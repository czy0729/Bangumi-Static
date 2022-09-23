/*
 * @Author: czy0729
 * @Date: 2022-09-23 06:54:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-23 11:54:57
 */
const utils = require('../utils')
const { getPinYinFirstCharacter } = require('../utils/third-party/pinyin')

const __raw = utils.root('data/agefans/raw.json')
const __anime = utils.root('data/agefans/anime.json')
const __tags = utils.root('data/agefans/tags.json')
const __officials = utils.root('data/agefans/officials.json')
const __finger = utils.root('data/agefans/finger.json')

const raw = utils.read(__raw, true)
const anime = utils.read(__anime, true)
anime.forEach(item => {
  const find = raw[item.ageId] || {}
  item.ep = find.ep || item.ep
  item.type = find.type || item.type
  item.begin = find.begin || item.begin
  item.tags = find.tags || item.tags
  item.official = find.official || item.official
})
utils.write(__anime, anime)

const tags = {
  data: [],
  nums: {}
}
const officials = {
  data: [],
  nums: {}
}
let finger = []

anime.forEach(item => {
  if (item.tags) {
    item.tags.split(' ').forEach(i => {
      if (!i || i === '暂无') return

      if (!tags.nums[i]) {
        tags.nums[i] = 1
      } else {
        tags.nums[i] += 1
      }
    })
  }

  if (item.official) {
    item.official.split(' / ').forEach(i => {
      if (!i || i === '暂无') return

      if (!officials.nums[i]) {
        officials.nums[i] = 1
      } else {
        officials.nums[i] += 1
      }
    })
  }
})
tags.data = Object.keys(tags.nums).sort((a, b) => tags.nums[b] - tags.nums[a])
officials.data = Object.keys(officials.nums)
  .filter(item => officials.nums[item] >= 10)
  .sort((a, b) => officials.nums[b] - officials.nums[a])

anime.forEach(item => {
  const i = {
    i: item.id,
    f: getPinYinFirstCharacter(item.cn)
  }
  if (item.score) i.s = item.score
  if (item.rank) i.r = item.rank
  if (item.total) i.l = item.total

  if (item.status && item.status !== '完结') {
    i.st = item.status === '连载' ? 1 : 2 // 未播放 2
  }
  if (item.type && item.type !== 'TV') i.ty = item.type

  if (item.official) {
    const data = []
    item.official.split(' / ').forEach(official => {
      const index = officials.data.findIndex(o => o === official)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.o = data
  }

  if (item.tags) {
    const data = []
    item.tags.split(' ').forEach(tag => {
      const index = tags.data.findIndex(t => t === tag)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.t = data
  }

  if (item.area && item.area !== 'jp') i.ar = item.area
  if (item.begin && item.begin !== '0000-00-00') i.b = String(item.begin)

  finger.push(i)
})

utils.write(__tags, tags)
utils.write(__officials, officials)
utils.write(__finger, finger, true)
process.exit()
