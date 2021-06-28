/*
 * 挑选一些好的资源, 留给 App 没能获取云端数据时使用
 *
 * @Author: czy0729
 * @Date: 2021-01-06 01:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-28 07:46:24
 */
const utils = require('../utils')

const __min = utils.root('data/wenku8/wenku.min.json')
const min = utils.read(__min)
const __app = utils.root('data/wenku8/wenku.app.json')

// 挑选有 rank, 今年和去年的
// const eg = [
//   {
//     id: 29,
//     w: 38,
//     an: 1,
//     a: '新海诚',
//     e: '第一卷 一卷全',
//     c: '云之彼端约定之地',
//     j: '雲のむこう、約束の場所',
//     i: '44/13/11408_jp',
//     b: '2006-01-05',
//     up: '2009-03-08',
//     ca: 'Fami通文库',
//     h: 1,
//     u: 1,
//     l: 2,
//     s: 7.6,
//     r: 1673
//   }
// ]
const app = min.filter(item => {
  if (item.b && (item.b.includes('2021-') || item.b.includes('2020-'))) {
    return true
  }

  if (!item.r) return false

  return item.r >= 2000
})

utils.write(__app, app, true)
process.exit()
