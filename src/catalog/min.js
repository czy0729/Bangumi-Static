/*
 * @Author: czy0729
 * @Date: 2022-09-06 04:43:56
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-06 16:30:00
 */
const utils = require('../utils')

const __raw = utils.root('data/catalog/raw.json')
const __min = utils.root('data/catalog/min.json')

const raw = utils.read(__raw)
const min = raw
  .filter(item => {
    const total = item.book + item.anime + item.music + item.game + item.real
    return total >= 10
  })
  .filter((item, index) => index < 1000)
  .map(item => {
    const data = {
      i: item.id,
      // n: item.name,
      // u: item.userId,
      d: item.date,
      t: item.title
      // f: item.info.slice(0, 10)
    }
    if (item.book) data.b = item.book
    if (item.anime) data.a = item.anime
    if (item.music) data.m = item.music
    if (item.game) data.g = item.game
    if (item.real) data.r = item.real
    return data
  })

utils.write(__min, min, true)
process.exit()
