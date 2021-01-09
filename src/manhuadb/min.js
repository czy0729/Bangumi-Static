/*
 * 进一步压缩json, 减少体积
 *
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-09 22:45:50
 */
const utils = require('../utils')

const __manga = utils.root('data/manhuadb/manga.json')
const __min = utils.root('data/manhuadb/manga.min.json')
const manga = utils.read(__manga)
const regEp = /(^第\d+话$)|(^第\d+回$)/
const regCn = /（(.+?)）/g

const min = manga.map(item => {
  const temp = {
    id: Number(item.id),
    m: Number(item.manhuaId)
  }
  if (item.status) temp.st = item.status
  if (item.author) temp.a = utils.HTMLDecode(item.author.split(' ')[0].trim())
  if (item.tags) temp.t = utils.HTMLDecode(item.tags.trim())
  if (item.ep) {
    const { ep } = item
    temp.e = regEp.test(ep) ? Number(ep.replace(/第|话|回/g, '')) : ep
  }
  if (item.cn) temp.c = utils.HTMLDecode(item.cn.trim()).replace(regCn, '')
  if (item.jp) temp.j = utils.HTMLDecode(item.jp.trim())
  if (item.image) temp.i = item.image
  if (item.begin) temp.b = item.begin
  if (item.score) temp.s = item.score
  if (item.rank) temp.r = item.rank
  return temp
})

utils.write(__min, min, true)
process.exit()
