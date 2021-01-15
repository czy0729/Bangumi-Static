/*
 * @Author: czy0729
 * @Date: 2021-01-13 20:13:18
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-13 20:17:45
 */
const utils = require('../utils')

const __min = utils.root('data/wenku8/wenku.min.json')
const __author = utils.root('data/wenku8/author.json')
const wenku = utils.read(__min)

const author = {
  sum: {},
  data: []
}
wenku.forEach(item => {
  if (item.a) {
    if (author.sum[item.a]) {
      author.sum[item.a] += 1
    } else {
      author.sum[item.a] = 1
    }
  }
})

author.data = Object.keys(author.sum)
  .filter(item => author.sum[item] >= 6)
  .sort((a, b) => author.sum[b] - author.sum[a])
utils.write(__author, author)
process.exit()
