/*
 * 挑选一些好的资源, 留给 App 没能获取云端数据时使用
 *
 * @Author: czy0729
 * @Date: 2021-01-06 01:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 08:23:29
 */
const utils = require('../utils')

const __min = utils.root('data/manhuadb/manga.min.json')
const min = utils.read(__min)
const __app = utils.root('data/manhuadb/manga.app.json')

// 挑选有 rank
// const eg = [
//   {
//     id: 29,
//     m: 5679,
//     st: 1,
//     a: '新海诚',
//     t: '爱情 生活',
//     e: '1卷',
//     c: '云之彼端，约定的地方',
//     j: '雲のむこう、約束の場所',
//     i: '44/13/11408_jp',
//     b: 2012,
//     s: 7.6,
//     r: 1704
//   }
// ]
const app = min
  .filter(item => {
    if (!item.r) return false
    return item.r <= 2000
  })
  .map(item => {
    delete item.j
    delete item.e
    return item
  })

utils.write(__app, app, true)
process.exit()
