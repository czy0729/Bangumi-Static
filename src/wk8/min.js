/*
 * 进一步压缩json, 减少体积
 *
 * @Author: czy0729
 * @Date: 2021-01-06 01:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-21 02:16:19
 */
const utils = require('../utils')

const __wenku = utils.root('data/wenku8/wenku.v2.json')
const __min = utils.root('data/wenku8/wenku.min.json')
let wenku = utils.read(__wenku)

// i w v m a e t o b u c h p l s r k j
const unique = {}
wenku = wenku
  .sort((a, b) => b.begin.localeCompare(a.begin))
  .filter(item => {
    if (!unique[item.id]) {
      unique[item.id] = 1
      return true
    }

    return false
  })

const min = wenku.map(item => {
  const temp = {
    i: Number(item.id),
    w: Number(item.wid)
  }
  if (!item.status) temp.v = 1 // 原先1表示已结束, 大部分都是1, 所以现在1改为连载中
  if (item.anime) temp.m = 1
  if (item.author) temp.a = utils.HTMLDecode(item.author)
  if (item.ep) {
    temp.e = utils.HTMLDecode(item.ep)
    if (temp.e.includes('卷 ')) {
      temp.e = `${temp.e.split('卷 ')[0]}卷`
    }
  }
  if (item.cn || item.jp) temp.t = utils.HTMLDecode(item.cn || item.jp)
  // if (item.jp && item.jp !== item.cn) temp.j = utils.HTMLDecode(item.jp)
  if (item.image) temp.o = item.image
  if (item.begin) temp.b = item.begin
  if (item.update) temp.u = item.update
  if (item.cate && item.cate !== '其他文库')
    temp.c = utils.HTMLDecode(item.cate)
  if (item.hot) temp.h = item.hot
  if (item.up) temp.p = item.up
  if (item.len) temp.l = item.len
  if (item.score) temp.s = item.score
  if (item.rank) temp.r = item.rank
  if (item.total) temp.k = item.total
  if (item.tags) temp.j = item.tags
  return temp
})

utils.write(__min, min, true)
process.exit()
