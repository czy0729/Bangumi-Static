/*
 * @Author: czy0729
 * @Date: 2021-01-11 20:31:06
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-11 20:33:51
 */
const utils = require('../utils')

const __manga = utils.root('data/manhuadb/manga.min.json')
const __ids = utils.root('data/manhuadb/ids.json')
const manga = utils.read(__manga)

const ids = manga.map(item => item.id)
utils.write(__ids, ids, true)
process.exit()
