/*
 * @Author: czy0729
 * @Date: 2021-01-13 14:02:22
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-13 14:50:13
 */
/*
 * @Author: czy0729
 * @Date: 2021-01-09 22:51:06
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-09 23:03:35
 */
const utils = require('../utils')

const __min = utils.root('data/agefans/anime.min.json')
const __official = utils.root('data/agefans/official.json')
const anime = utils.read(__min)

const official = {
  sum: {},
  data: []
}
anime.forEach(item => {
  if (item.o) {
    item.o
      .split(' / ')
      .filter(item => !!item)
      .forEach(i => {
        if (official.sum[i]) {
          official.sum[i] += 1
        } else {
          official.sum[i] = 1
        }
      })
  }
})

official.data = Object.keys(official.sum)
  .filter(item => official.sum[item] >= 5)
  .sort((a, b) => official.sum[b] - official.sum[a])
utils.write(__official, official)
process.exit()
