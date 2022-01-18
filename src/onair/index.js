/*
 * @Author: czy0729
 * @Date: 2022-01-11 04:24:32
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-01-11 05:17:04
 */
const utils = require('../utils')

const __raw = utils.root('data/onair/raw.json')
const __onair = utils.root('data/onair/onair.json')
const __min = utils.root('data/onair/onair.min.json')
const raw = utils.read(__raw)

const min = {
  type: [],
  data: {}
}
const data = Object.keys(raw)
  .map(key => raw[key])
  .filter(item => item.userId === 'lilyurey')
  .map(item => {
    let url = item.joinUrl.split('/collect?gh=')
    url = url[0]
    const _item = {
      title: item.title,
      url: `https://bgm.tv${url}`,
      list: item.list
        .filter(i => i.comment.includes('|'))
        .map(i => {
          let sites = i.comment.split('|')
          sites = sites[sites.length - 1]
            .trim()
            .replace('271', '爱奇艺')
            .replace('优土', '优酷')
            .replace('疼讯', '腾讯')

          if (min.type.indexOf(sites) === -1) min.type.push(sites)
          min.data[i.id] = min.type.indexOf(sites)

          return {
            id: Number(i.id),
            title: i.title,
            sites
          }
        })
    }
    return _item
  })

utils.write(__onair, data)
utils.write(__min, min, true)

process.exit()
