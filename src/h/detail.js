/*
 * @Author: czy0729
 * @Date: 2021-06-23 06:06:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-23 07:21:51
 */
const utils = require('../utils')

const __list = utils.root('data/h/list.json')
const list = utils.read(__list).filter(item => !!item.bgm)
const __detail = utils.root('data/h/detail.json')
const detail = utils.read(__detail)

const host = 'https://hanime1.me'

async function run() {
  for (let index = 0; index < list.length; index++) {
    const itemList = list[index]
    const idBgm = Number(
      String(itemList.bgm).replace('https://bgm.tv/subject/', '')
    )
    if (!idBgm) continue
    if (detail[idBgm]) {
      console.log('skip')
      continue
    }

    const itemDetail = {
      id: idBgm,
      h: itemList.id,
      title: itemList.title,
      tags: []
    }

    if (itemDetail.h) {
      const url = `${host}/watch?v=${itemDetail.h}`
      console.log(url)
      const data = await utils.fetch(url)

      const $ = utils.cheerio(data)
      itemDetail.tags =
        $('.single-video-tag a')
          .map((index, element) => {
            const $row = utils.cheerio(element)
            return $row.text().trim()
          })
          .get() || []
    }

    if (itemDetail.id) {
      const url = `https://api.bgm.tv/subject/${itemDetail.id}?responseGroup=large`
      console.log(url)
      const data = await utils.fetch(url)
      if (data) {
        itemDetail.images =
          data.images && data.images && data.images.large
            ? data.images.large.replace(
                /http:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
                ''
              )
            : ''
        itemDetail.jp = data.name || ''
        itemDetail.cn = data.name_cn || ''
        itemDetail.score = data.rating && data.rating.score
        itemDetail.rank = data.rank
      }
    }

    detail[itemDetail.id] = itemDetail

    if (index % 10 === 0) {
      utils.write(__detail, detail)
    }
  }

  utils.write(__detail, detail)
  process.exit()
}
run()
