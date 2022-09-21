/*
 * 进一步压缩json, 减少体积
 *
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-21 19:20:04
 */
const utils = require('../utils')

const __anime = utils.root('data/agefans/anime.json')
const __min = utils.root('data/agefans/anime.min.json')
const anime = utils.read(__anime)

const min = anime.map(item => {
  const temp = {
    id: Number(item.id),
    a: Number(item.ageId)
  }
  if (item.type && item.type !== 'TV') temp.ty = item.type
  if (item.area && item.area !== 'jp') temp.ar = item.area
  if (item.status && item.status !== '完结') temp.st = item.status
  if (item.official && item.official !== '暂无') temp.o = item.official
  if (item.tags  && item.tags !== '暂无') temp.t = item.tags
  if (item.ep) temp.e = utils.HTMLDecode(item.ep.replace(/\[|\]/g, ''))
  if (item.cn || item.jp) temp.c = utils.HTMLDecode(item.cn || item.jp)
  // if (item.jp && item.jp !== item.cn) temp.j = item.jp
  if (item.image) {
    temp.i = item.image
  }
  if (item.begin && item.begin !== '0000-00-00') temp.b = item.begin
  if (item.score) temp.s = item.score
  if (item.rank) temp.r = item.rank
  return temp
})

utils.write(__min, min, true)
process.exit()
