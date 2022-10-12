/*
 * @Author: czy0729
 * @Date: 2022-09-24 13:28:45
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-24 13:56:06
 */
const utils = require('../utils')
const { getPinYinFirstCharacter } = require('../utils/third-party/pinyin')

const __wenku = utils.root('data/wenku8/wenku.v2.json')
const __tags = utils.root('data/wenku8/tags.json')
const __cates = utils.root('data/wenku8/cates.json')
const __authors = utils.root('data/wenku8/authors.json')
const __finger = utils.root('data/wenku8/finger.json')

const wenku = utils.read(__wenku)

const tags = {
  data: [],
  nums: {}
}
const cates = {
  data: [],
  nums: {}
}
const authors = {
  data: [],
  nums: {}
}
let finger = []

wenku.forEach(item => {
  if (item.tags) {
    item.tags.split(' ').filter(item => !!item).forEach(i => {
      if (!tags.nums[i]) {
        tags.nums[i] = 1
      } else {
        tags.nums[i] += 1
      }
    })
  }

  if (item.cate && item.cate !== '其他文库') {
    if (!cates.nums[item.cate]) {
      cates.nums[item.cate] = 1
    } else {
      cates.nums[item.cate] += 1
    }
  }

  if (item.author && item.author !== '合作') {
    if (!authors.nums[item.author]) {
      authors.nums[item.author] = 1
    } else {
      authors.nums[item.author] += 1
    }
  }
})
tags.data = Object.keys(tags.nums).sort((a, b) => tags.nums[b] - tags.nums[a])
cates.data = Object.keys(cates.nums).sort(
  (a, b) => cates.nums[b] - cates.nums[a]
)
authors.data = Object.keys(authors.nums)
  .filter(a => authors.nums[a] >= 10)
  .sort((a, b) => authors.nums[b] - authors.nums[a])

wenku.forEach(item => {
  const i = {
    i: item.id,
    f: getPinYinFirstCharacter(item.cn || item.jp || '')
  }
  if (item.status) i.v = 1
  if (item.anime) i.m = 1
  if (item.author) {
    const index = authors.data.findIndex(c => c === item.author)
    if (index !== -1) i.a = index
  }

  if (item.begin) i.b = item.begin
  if (item.update) i.u = item.update

  if (item.cate) {
    const index = cates.data.findIndex(c => c === item.cate)
    if (index !== -1) i.c = index
  }

  if (item.hot) i.h = item.hot
  if (item.up) i.p = item.up
  if (item.len) i.l = item.len

  if (item.score) i.s = item.score
  if (item.rank) i.r = item.rank
  if (item.total) i.k = item.total

  if (item.tags) {
    const data = []
    item.tags.split(' ').forEach(tag => {
      const index = tags.data.findIndex(c => c === tag)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.j = data
  }

  finger.push(i)
})

utils.write(__tags, tags)
utils.write(__cates, cates)
utils.write(__authors, authors)
utils.write(__finger, finger, true)
process.exit()
