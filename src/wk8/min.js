/*
 * 进一步压缩json, 减少体积
 *
 * @Author: czy0729
 * @Date: 2021-01-06 01:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-13 20:06:13
 */
const utils = require('../utils')

const __wenku = utils.root('data/wenku8/wenku.json')
const __min = utils.root('data/wenku8/wenku.min.json')
const wenku = utils.read(__wenku)

const min = wenku.map(item => {
  const temp = {
    id: Number(item.id),
    w: Number(item.wid)
  }
  if (!item.status) temp.st = 1 // 原先1表示已结束, 大部分都是1, 所以现在1改为连载中
  if (item.anime) temp.an = 1
  if (item.author) temp.a = utils.HTMLDecode(item.author)
  if (item.ep) temp.e = utils.HTMLDecode(item.ep)
  if (item.cn) temp.c = utils.HTMLDecode(item.cn)
  if (item.jp && item.jp !== item.cn) temp.j = utils.HTMLDecode(item.jp)
  if (item.image) temp.i = item.image
  if (item.begin) temp.b = item.begin
  if (item.update) temp.up = item.update
  if (item.cate) temp.ca = utils.HTMLDecode(item.cate)
  if (item.hot) temp.h = item.hot
  if (item.up) temp.u = item.up
  if (item.len) temp.l = item.len
  if (item.score) temp.s = item.score
  if (item.rank) temp.r = item.rank
  return temp
})

utils.write(__min, min, true)
process.exit()
