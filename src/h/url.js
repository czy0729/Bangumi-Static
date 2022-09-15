/*
 * @Author: czy0729
 * @Date: 2021-06-23 06:06:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-15 02:24:10
 */
const utils = require('../utils')

const __list = utils.root('data/h/list.json')
const list = utils.read(__list).filter(item => !!item.bgm)
const __detail = utils.root('data/h/detail.json')
const detail = utils.read(__detail)

const host = 'https://hanime1.me'

const bgms = []
const urls = []

async function run() {
  for (let index = 0; index < list.length; index++) {
    const itemList = list[index]
    const idBgm = Number(
      String(itemList.bgm).replace('https://bgm.tv/subject/', '')
    )
    if (!idBgm) continue
    if (detail[idBgm]) continue

    const itemDetail = {
      id: idBgm,
      h: itemList.id,
      title: itemList.title,
      tags: []
    }

    if (itemDetail.h) {
      if (!bgms.includes(idBgm) && !urls.includes(itemDetail.h)) {
        bgms.push(idBgm)
        urls.push(itemDetail.h)
      }
    }
  }
  console.log(urls)
  process.exit()
}
run()
