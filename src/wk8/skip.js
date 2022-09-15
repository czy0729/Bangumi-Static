/*
 * @Author: czy0729
 * @Date: 2022-09-15 19:20:53
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-15 19:24:06
 */
const utils = require('../utils')

const __raw = utils.root('data/wenku8/raw.json')
const __min = utils.root('data/wenku8/wenku.min.json')
const __notMath = utils.root('data/wenku8/mot-match.json')

const raw = utils.read(__raw)
const min = utils.read(__min)

min.forEach(item => {
  if (item.w) delete raw[item.w]
})

utils.write(__notMath, raw)
