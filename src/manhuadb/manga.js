/*
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 09:40:46
 */
const utils = require('../utils')

const __matched = utils.root('data/manhuadb/matched.json')
const __detail = utils.root('data/manhuadb/detail.json')
const __manga = utils.root('data/manhuadb/manga.json')
const __unmatched = utils.root('data/manhuadb/unmatched.json')
const matched = utils.read(__matched)
const detail = utils.read(__detail)
const manga = utils.read(__manga)
const unmatched = utils.read(__unmatched)
const temp = {}
manga.forEach(item => (temp[item.id] = item))

const rewrite = true

async function run() {
  const idsDetail = Object.keys(detail)
  for (let indexDetail = 0; indexDetail <= idsDetail.length; indexDetail++) {
    const idDetail = Number(idsDetail[indexDetail])
    const itemDetail = detail[idDetail] || {}

    // 若item中id和key一样, 就是没处理过的数据, 跳过
    if (!itemDetail.id || itemDetail.id == idDetail) {
      if (itemDetail.id) {
        const mangaItem = manga.find(
          item =>
            item.manhuaId == itemDetail.id && item.author == itemDetail.author
        )
        if (mangaItem) {
          if (itemDetail.year) temp[mangaItem.id].year = itemDetail.year
          if (itemDetail.status) temp[mangaItem.id].status = itemDetail.status
          if (itemDetail.tags) temp[mangaItem.id].tags = itemDetail.tags
          if (itemDetail.ep) temp[mangaItem.id].ep = itemDetail.ep

          delete detail[idDetail]
        }
      }
      continue
    }

    // 非重写情况, 若manga中有记录, 跳过
    if (!rewrite) {
      const findIndex = manga.findIndex(item => item.manhuaId == idDetail)
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
      id: idBgm,
      author: itemDetail.author || '',
      tags: itemDetail.tags || '',
      ep: itemDetail.ep || '',
      cn: data.name_cn || itemDetail.title,
      jp: data.name,
      image:
        data.images && data.images && data.images.large
          ? data.images.large.replace(
              /http:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
              ''
            )
          : '',
      begin: itemDetail.year,
      score: data.rank
        ? data.rating && data.rating.score
          ? data.rating.score
          : 0
        : 0,
      rank: data.rank || 0,
      manhuaId: idDetail,
      status: itemDetail.status == '完结' ? 1 : 0
    }

    delete temp[idBgm].title
    delete temp[idBgm].year
    if (temp[idBgm].cn == temp[idBgm].jp) delete temp[idBgm].jp
    if (temp[idBgm].ep == '') delete temp[idBgm].ep
    if (temp[idBgm].score == 0) delete temp[idBgm].score
    if (temp[idBgm].rank == 0) delete temp[idBgm].rank
    if (temp[idBgm].status == 0) delete temp[idBgm].status
    matched[idDetail] = detail[idDetail]
  }

  utils.write(
    __manga,
    Object.keys(temp).map(id => temp[id])
  )

  Object.keys(matched).forEach(idMathced => {
    delete detail[idMathced]
  })
  utils.write(__matched, matched)

  Object.keys(detail).forEach(idDetail => {
    if (detail[idDetail]._unmatched) {
      unmatched[idDetail] = detail[idDetail]
      delete detail[idDetail]
    }
  })
  utils.write(__detail, detail)
  utils.write(__unmatched, unmatched)

  process.exit()
}

run()
