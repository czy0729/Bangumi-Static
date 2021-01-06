/*
 * @Author: czy0729
 * @Date: 2021-01-06 18:14:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-06 20:11:42
 */
const utils = require('../utils')

const __detail = utils.root('data/wenku8/detail.json')
const __data = utils.root('data/wenku8/data.json')
const __wenku = utils.root('data/wenku8/wenku.json')
const data = utils.read(__data)
const wenku = utils.read(__wenku)

const detail = {}
Object.keys(data).forEach(bgmId => {
  const item = data[bgmId]
  const { id, wid } = item
  const { begin } = wenku.find(i => i.id == item.id)
  detail[wid] = {
    id: Number(item.id || wid),
    jp: item.title,
    cn: item.w || item.title,
    cate: item.cate,
    author: item.author,
    status: item.status,
    begin,
    update: item.time,
    len: item.len || 0,
    hot: item.hot,
    up: item.up,
    ep: item.ep,
    anime: item.anime
  }
})

utils.write(__detail, detail)
process.exit()
