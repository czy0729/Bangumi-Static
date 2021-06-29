/*
 * 挑选一些好的资源, 留给 App 没能获取云端数据时使用
 *
 * @Author: czy0729
 * @Date: 2021-01-06 01:30:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 06:27:37
 */
const utils = require('../utils')

const __min = utils.root('data/agefans/anime.min.json')
const min = utils.read(__min)
const __app = utils.root('data/agefans/anime.app.json')

// 挑选有 rank, 今年和去年的
// const eg = [
// {
//   "id": 259,
//   "a": 20080002,
//   "o": "Brain's Base",
//   "t": "奇幻 搞笑 神魔 励志 治愈",
//   "e": "TV 01-13",
//   "c": "夏目友人帐",
//   "j": "夏目友人帳",
//   "i": "cf/a0/259_BlBeX",
//   "b": "2008-07-07",
//   "s": 8.1,
//   "r": 183
// }
// ]
const app = min
  .filter(item => {
    if (item.b && (item.b.includes('2021-') || item.b.includes('2020-'))) {
      return true
    }

    if (!item.r) return false

    return item.r <= 800
  })
  .map(item => {
    delete item.a
    delete item.o
    delete item.e
    delete item.j
    if (item.b) {
      item.b = item.b
        .split('-')
        .filter((i, index) => index < 2)
        .join('-')
    }
    // if (item.t) {
    //   item.t = item.t
    //     .split(' ')
    //     .filter((i, index) => index < 2)
    //     .join(' ')
    // }
    return item
  })

utils.write(__app, app, true)
process.exit()
