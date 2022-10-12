/*
 * @Author: czy0729
 * @Date: 2021-01-12 16:39:05
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-10-03 11:08:51
 */
const utils = require('../utils')

const __items = utils.root('data/bangumi-data/items.json')
const __min = utils.root('data/bangumi-data/bangumiData.min.json')
const items = utils.read(__items)

/**
 * j: jp
 * c: cn
 * t: type
 * s: sites
 */
const sitesMap = {
  acfun: 'a',
  bilibili: 'b',
  bilibili_hk_mo_tw: 'bhmt',
  // sohu: 's',
  // youku: 'y',
  qq: 'q',
  iqiyi: 'i',
  // letv: 'l',
  // pptv: 'p',
  // mgtv: 'm',
  // nicovideo: 'ni',
  // netflix: 'n'
}
let min = []
items.forEach(item => {
  const { sites = [] } = item
  const find = sites.find(i => i.site === 'bangumi')
  if (find) {
    const { id } = find
    const temp = {
      id: Number(id),
      j: item.title
    }

    let cn
    if (
      item.titleTranslate &&
      item.titleTranslate['zh-Hans'] &&
      item.titleTranslate['zh-Hans'][0]
    ) {
      cn = item.titleTranslate['zh-Hans'][0]
    }
    if (cn) {
      temp.c = cn
    }

    if (item.type && item.type !== 'tv') {
      temp.t = item.type
    }

    const sitesWithoutBagnumi = sites.filter(i => i.site !== 'bangumi')
    if (sitesWithoutBagnumi.length) {
      const _sites = {}
      sitesWithoutBagnumi.forEach(i => {
        if (sitesMap[i.site]) {
          const siteId = Number(i.id)
          _sites[sitesMap[i.site]] = isNaN(siteId) ? i.id : siteId
        }
      })
      temp.s = _sites
    }

    min.push(temp)
  }
})

min = min.filter(item => {
  // { "id": 327561 }
  if (Object.keys(item).length <= 1) {
    return false
  }

  // { "id": 90390, "c": "海贼王 奈美特别篇 领航员之泪与伙伴的羁绊", "s": {} },
  if (item.s && !Object.keys(item.s).length) {
    delete item.s
  }

  return true
})

utils.write(__min, min.reverse(), true)
process.exit()
