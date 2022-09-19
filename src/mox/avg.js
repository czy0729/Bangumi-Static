/*
 * @Author: czy0729
 * @Date: 2022-09-17 22:00:24
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-17 22:09:12
 */
const utils = require('../utils')

const __map = utils.root('data/mox/map.json')
const map = utils.read(__map) || {}

let matched = 0
let skip = 0

const maps = Object.keys(map)
maps.forEach(mid => {
  const item = map[mid]
  if (item.id) {
    matched += 1
  } else if (item._skip) {
    skip += 1
  }
})

console.log(`
  total: ${maps.length},
  matched: ${matched},
  skip: ${skip},
  percent: ${Math.floor((matched / maps.length) * 100)}%`)
process.exit()
