/*
 * @Author: czy0729
 * @Date: 2021-01-09 22:51:06
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-09 23:03:35
 */
const utils = require('../utils')

const __min = utils.root('data/manhuadb/manga.min.json')
const __tags = utils.root('data/manhuadb/tags.json')
const manga = utils.read(__min)

const tags = {
  sum: {},
  data: []
}
manga.forEach(item => {
  if (item.t) {
    item.t.split(' ').forEach(i => {
      if (tags.sum[i]) {
        tags.sum[i] += 1
      } else {
        tags.sum[i] = 1
      }
    })
  }
})

tags.data = Object.keys(tags.sum)
  .filter(item => tags.sum[item] >= 10)
  .sort((a, b) => tags.sum[b] - tags.sum[a])
utils.write(__tags, tags)
process.exit()
