/*
 * @Author: czy0729
 * @Date: 2022-09-17 16:14:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-19 14:00:36
 */
const utils = require('../utils')

const __detail = utils.root('data/mox/detail.json')
const __map = utils.root('data/mox/map.json')

const detail = utils.read(__detail) || {}
const map = utils.read(__map) || {}

Object.keys(detail).forEach(mid => {
  const item = detail[mid]
  if (!(mid in map)) {
    map[mid] = {
      id: '',
      title: item.title,
      sub: item.sub
    }
  } else if (map[mid].id && '_skip' in map[mid]) {
    delete map[mid]._skip
  }
})

utils.write(__map, map)
process.exit()
