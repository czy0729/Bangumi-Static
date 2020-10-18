/*
 * 生成bangumi app使用的缩略版bangumi-data
 *
 * @Author: czy0729
 * @Date: 2020-10-11 13:30:50
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-10-11 14:06:46
 */
const bangumiData = require('bangumi-data')
const fs = require('fs')
const path = require('path')

const items = bangumiData.items.map((item) => {
  const data = {
    title: item.title,
    type: item.type,
    sites: item.sites.map((i) => ({
      site: i.site,
      id: i.id,
    })),
  }

  if (
    item.titleTranslate &&
    item.titleTranslate['zh-Hans'] &&
    item.titleTranslate['zh-Hans'][0]
  ) {
    data.titleTranslate = {
      'zh-Hans': [item.titleTranslate['zh-Hans'][0]],
    }
  }

  return data
})

fs.writeFileSync(
  './data/bangumi-data/mini.json',
  JSON.stringify({
    items: items.reverse(),
  })
)
