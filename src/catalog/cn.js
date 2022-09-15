/*
 * @Author: czy0729
 * @Date: 2022-09-06 05:04:47
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-06 05:06:02
 */
const utils = require('../utils')

const __min = utils.root('data/catalog/min.json')
const __cn = utils.root('data/catalog/cn.json')

const min = utils.read(__min)
const cn = min.map(item => item.t).join(', ')

utils.write(__cn, cn, true)
process.exit()
