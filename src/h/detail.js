/*
 * @Author: czy0729
 * @Date: 2021-06-23 06:06:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-15 02:42:31
 */
const fs = require('fs')
const utils = require('../utils')

const __list = utils.root('data/h/list.json')
const list = utils.read(__list).filter(item => !!item.bgm)
const __detail = utils.root('data/h/detail.json')
const detail = utils.read(__detail)

const host = 'https://hanime1.me'
const accessToken = {
  access_token: '4e8826ba0a3496fa9468ff272fa8e05283304930',
  expires_in: 604800,
  token_type: 'Bearer',
  scope: null,
  user_id: 456208,
  refresh_token: 'b0517c280758e892952c95e56bbff54c9afb4ca2'
}
const updated = []

async function run() {
  for (let index = 0; index < list.length; index++) {
    const itemList = list[index]
    const idBgm = Number(
      String(itemList.bgm).replace('https://bgm.tv/subject/', '')
    )
    if (!idBgm || !itemList.id) {
      console.log(`skip: ${itemList}`)
      continue
    }

    let itemDetail
    if (detail[idBgm]) {
      itemDetail = detail[idBgm]
    } else {
      itemDetail = {
        id: idBgm,
        h: itemList.id,
        title: itemList.title,
        tags: []
      }
      const data = String(
        fs.readFileSync(utils.root(`src/h/html/${itemList.id}`))
      )
      const $ = utils.cheerio(data)
      itemDetail.tags =
        $('.single-video-tag a')
          .map((index, element) => {
            const $row = utils.cheerio(element)
            return $row.text().trim()
          })
          .get() || []
    }

    if (itemDetail.id && !updated.includes(itemDetail.id)) {
      updated.push(itemDetail.id)
      const url = `https://api.bgm.tv/v0/subjects/${itemDetail.id}?app_id=bgm8885c4d524cd61fc`
      const data = await utils.fetch(url, {
        Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
        'User-Agent':
          'Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Build/SKQ1.211006.001) 1661803607'
      })
      if (data) {
        itemDetail.images =
          data.images && data.images.large
            ? data.images.large.replace(
                /https:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
                ''
              )
            : ''
        itemDetail.jp = data.name || ''
        itemDetail.cn = data.name_cn || ''
        itemDetail.score = (data.rating && data.rating.score) || 0
        itemDetail.rank = (data.rating && data.rating.rank) || 0
        itemDetail.total = (data.rating && data.rating.total) || 0
        itemDetail.air = data.date || ''
        itemDetail.ep = data.eps || ''
      }
      detail[itemDetail.id] = itemDetail
      console.log(
        `https://bgm.tv/subject/${itemDetail.id}`,
        detail[itemDetail.id].cn || detail[itemDetail.id].jp,
        detail[itemDetail.id].score,
        detail[itemDetail.id].rank
      )
    }

    if (index % 10 === 0) {
      utils.write(__detail, detail)
    }
  }

  utils.write(__detail, detail)
  process.exit()
}
run()
