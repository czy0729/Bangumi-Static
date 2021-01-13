/*
 * @Author: czy0729
 * @Date: 2021-01-12 16:28:53
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-12 16:40:30
 */
const bangumiData = require('bangumi-data')
const utils = require('../utils')

const __items = utils.root('data/bangumi-data/items.json')

const items = bangumiData.items.map(item => {
  const data = {
    title: item.title,
    type: item.type,
    sites: item.sites.map(i => ({
      site: i.site,
      id: i.id
    }))
  }

  if (
    item.titleTranslate &&
    item.titleTranslate['zh-Hans'] &&
    item.titleTranslate['zh-Hans'][0]
  ) {
    data.titleTranslate = {
      'zh-Hans': [item.titleTranslate['zh-Hans'][0]]
    }
  }

  return data
})

utils.write(__items, items)
process.exit()
