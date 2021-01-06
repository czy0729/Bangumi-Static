/*
 * @Author: czy0729
 * @Date: 2021-01-06 18:15:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-06 20:18:22
 */
const utils = require('../utils')

const __detail = utils.root('data/wenku8/detail.json')
const __wenku = utils.root('data/wenku8/wenku.json')
const __matched = utils.root('data/wenku8/matched.json')
const detail = utils.read(__detail)
const wenku = utils.read(__wenku)
const matched = utils.read(__matched)
const temp = {}
wenku.forEach(item => (temp[item.id] = item))

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

    // 非重写情况, 若wenku中有记录, 跳过
    if (!rewrite) {
      const findIndex = wenku.findIndex(item => item.ageId === idDetail)
      if (findIndex !== -1) {
        matched[idDetail] = detail[idDetail]
        continue
      }
    }

    // 从bgm条目页获取实时数据
    const idBgm = Number(itemDetail.id)
    const url = `https://api.bgm.tv/subject/${idBgm}?responseGroup=large`
    const data = await utils.fetch(url)
    console.log(`[${indexDetail} | ${idsDetail.length}]`, url, itemDetail.cn)

    temp[idBgm] = {
      ...itemDetail,
      ...(temp[idBgm] || {}),
      id: Number(idBgm),
      wid: Number(idDetail),
      status: itemDetail.status,
      anime: itemDetail.anime,
      author: itemDetail.author,
      ep: itemDetail.ep,
      cn: data.name_cn || itemDetail.cn,
      jp: data.name || itemDetail.jp,
      image:
        data.images && data.images && data.images.large
          ? data.images.large.replace(
              /http:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
              ''
            )
          : '',
      begin: itemDetail.begin,
      update: itemDetail.update,
      cate: itemDetail.cate,
      hot:
        itemDetail.hot === 'D'
          ? 1
          : itemDetail.hot === 'C'
          ? 2
          : itemDetail.hot === 'B'
          ? 3
          : itemDetail.hot === 'A'
          ? 4
          : itemDetail.hot === 'S'
          ? 5
          : 0,
      up:
        itemDetail.up === 'D'
          ? 1
          : itemDetail.up === 'C'
          ? 2
          : itemDetail.up === 'B'
          ? 3
          : itemDetail.up === 'A'
          ? 4
          : itemDetail.up === 'S'
          ? 5
          : 0,
      len: parseInt((itemDetail.len || 0) / 10000),
      rank: data.rank,
      score: data.rating && data.rating.score
    }

    if (temp[idBgm].cn === temp[idBgm].jp) delete temp[idBgm].jp
    if (temp[idBgm].ep === '') delete temp[idBgm].ep
    if (!temp[idBgm].rank) {
      delete temp[idBgm].score
      delete temp[idBgm].rank
    }
    matched[idDetail] = detail[idDetail]

    if (indexDetail % 10 === 0) {
      utils.write(
        __wenku,
        Object.keys(temp).map(id => temp[id])
      )
    }
  }

  utils.write(
    __wenku,
    Object.keys(temp).map(id => temp[id])
  )

  Object.keys(matched).forEach(idMathced => {
    delete detail[idMathced]
  })
  utils.write(__matched, matched)
  utils.write(__detail, detail)

  process.exit()
}
run()