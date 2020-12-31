/*
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-01 01:51:16
 */
const utils = require('../utils')

const __matched = '../../data/manhuadb/matched.json'
const __detail = '../../data/manhuadb/detail.json'
const __manga = '../../data/manhuadb/manga.json'
const matched = utils.read(__matched)
const detail = utils.read(__detail)
const manga = utils.read(__manga)
const temp = {}
manga.forEach((item) => (temp[item.id] = item))

const rewrite = false

async function run() {
  const idsDetail = Object.keys(detail)
  for (let indexDetail = 0; indexDetail <= idsDetail.length; indexDetail++) {
    const idDetail = Number(idsDetail[indexDetail])
    const itemDetail = detail[idDetail] || {}

    // 若item中id和key一样, 就是没处理过的数据, 跳过
    if (!itemDetail.id || itemDetail.id === idDetail) {
      continue
    }

    // 非重写情况, 若managa中有记录, 跳过
    if (!rewrite) {
      const findIndex = manga.findIndex((item) => item.manhuaId === idDetail)
      if (findIndex !== -1) {
        matched[idDetail] = detail[idDetail]
        continue
      }
    }

    // 从bgm条目页获取实时数据
    const idBgm = Number(itemDetail.id)
    const url = `https://api.bgm.tv/subject/${idBgm}?responseGroup=large`
    const data = await utils.fetch(url)
    console.log(`[${indexDetail} | ${idsDetail.length}]`, url, itemDetail.title)

    temp[idBgm] = {
      ...itemDetail,
      ...(temp[idBgm] || {}),
      cn: data.name_cn || itemDetail.title,
      jp: data.name,
      image:
        data.images && data.images && data.images.large
          ? data.images.large.replace(/http:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g, '')
          : '',
      begin: itemDetail.year,
      score: data.rating && data.rating.score ? data.rating.score : 0,
      id: idBgm,
      manhuaId: idDetail,
    }

    delete temp[idBgm].title
    delete temp[idBgm].year

    matched[idDetail] = detail[idDetail]
  }

  utils.write(
    __manga,
    Object.keys(temp).map((id) => temp[id]),
    true
  )

  Object.keys(matched).forEach((idMathced) => {
    delete detail[idMathced]
  })
  utils.write(__matched, matched)
  utils.write(__detail, detail)
}

run()
