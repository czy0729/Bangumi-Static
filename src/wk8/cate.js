/*
 * @Author: czy0729
 * @Date: 2021-01-13 20:22:53
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-13 20:24:33
 */
const utils = require('../utils')

const __min = utils.root('data/wenku8/wenku.min.json')
const __cate = utils.root('data/wenku8/cate.json')
const wenku = utils.read(__min)

const cate = {
  sum: {},
  data: []
}
wenku.forEach(item => {
  if (item.ca) {
    if (cate.sum[item.ca]) {
      cate.sum[item.ca] += 1
    } else {
      cate.sum[item.ca] = 1
    }
  }
})

cate.data = Object.keys(cate.sum)
  .filter(item => cate.sum[item] >= 10)
  .sort((a, b) => cate.sum[b] - cate.sum[a])
utils.write(__cate, cate)
process.exit()
