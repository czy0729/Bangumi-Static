/*
 * @Author: czy0729
 * @Date: 2022-10-03 11:01:06
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-10-03 11:04:13
 */
const utils = require('../utils')

const __min = utils.root('data/bangumi-data/bangumiData.min.json')
const __map = utils.root('data/bangumi-data/bangumiData.map.json')

const map = {}
const min = utils.read(__min)

min.forEach(item => {
  const data = {
    ...item
  }
  delete data.id
  if (data.c === data.j) delete data.c

  map[item.id] = data
})


utils.write(__map, map, true)
process.exit()
