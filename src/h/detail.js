/*
 * @Author: czy0729
 * @Date: 2021-06-23 06:06:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-22 04:36:04
 */
const fs = require('fs')
const utils = require('../utils')

const __list = utils.root('data/h/list.json')
const __detail = utils.root('data/h/detail.json')
const list = utils.read(__list).filter(item => !!item.bgm)
const detail = utils.read(__detail)

const host = 'https://hanime1.me'
const accessToken = {
  access_token: '369aa586dd76d44dc6f7d85c09e8982087018bc2',
  expires_in: 604800,
  token_type: 'Bearer',
  scope: null,
  user_id: 456208,
  refresh_token: '3cdeee299f3f60777eb6a4e0081f4470fa5357aa'
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
      // itemDetail = {
      //   id: idBgm,
      //   h: itemList.id,
      //   title: itemList.title,
      //   tags: []
      // }
      // const data = String(
      //   fs.readFileSync(utils.root(`src/h/html/${itemList.id}`))
      // )
      // const $ = utils.cheerio(data)
      // itemDetail.tags =
      //   $('.single-video-tag a')
      //     .map((index, element) => {
      //       const $row = utils.cheerio(element)
      //       return $row.text().trim()
      //     })
      //     .get() || []
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
        if (data.images.medium && data.images.medium.includes('/m/')) {
          itemDetail.images = data.images.medium
            .split('/m/')[1]
            .replace('.jpg', '')
        }
        itemDetail.title = data.name_cn || data.name
        itemDetail.score = data.rating.score || 0
        itemDetail.rank = data.rating.rank || 0
        itemDetail.total = data.rating.total || 0
        itemDetail.air = data.date || ''
        itemDetail.ep = data.eps || ''
      }

      detail[itemDetail.id] = itemDetail
      console.log(
        `${index} / ${list.length}`,
        itemDetail.id,
        itemDetail.title,
        itemDetail.score,
        itemDetail.rank,
        itemDetail.total,
        itemDetail.air
      )
    }

    if (index % 50 === 0) {
      utils.write(__detail, detail)
    }
  }

  utils.write(__detail, detail)
  process.exit()
}
run()
