/*
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-21 16:07:30
 */
const utils = require('../utils')

const __raw = utils.root('data/agefans/raw.json')
const __anime = utils.root('data/agefans/anime.json')
const __detail = utils.root('data/agefans/detail.json')
const __matched = utils.root('data/agefans/matched.json')

const raw = utils.read(__raw)
const anime = utils.read(__anime)
const detail = utils.read(__detail)
const matched = utils.read(__matched)

Object.keys(matched).forEach(aid => {
  if (matched[aid].cn.includes('动态漫')) {
    delete detail[aid]
    delete matched[aid]
  }
})

const rewrite = false

const temp = {}
anime.forEach(item => (temp[item.id] = item))

// 更新raw数据到detail
Object.keys(raw).forEach(idRaw => {
  if (raw[idRaw].cn.includes('动态漫')) return

  if (!detail[idRaw] && !temp[idRaw]) detail[idRaw] = raw[idRaw]
})

async function run() {
  const idsDetail = Object.keys(detail)
  for (let indexDetail = 0; indexDetail <= idsDetail.length; indexDetail++) {
    const idDetail = Number(idsDetail[indexDetail])
    const itemDetail = detail[idDetail] || {}

    // 若item中id和key一样, 就是没处理过的数据, 跳过
    if (!itemDetail.id || itemDetail.id === idDetail) {
      continue
    }

    // 非重写情况, 若anime中有记录, 跳过
    if (!rewrite) {
      const findIndex = anime.findIndex(item => item.ageId === idDetail)
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
      cn: data.name_cn || itemDetail.cn,
      jp: data.name || itemDetail.jp,
      image:
        data.images && data.images && data.images.large
          ? data.images.large.replace(
              /http:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
              ''
            )
          : '',
      score: data.rating && data.rating.score,
      rank: data.rank,
      id: idBgm,
      ageId: idDetail
    }

    if (temp[idBgm].cn === temp[idBgm].jp) delete temp[idBgm].jp
    if (temp[idBgm].ep === '') delete temp[idBgm].ep
    if (!temp[idBgm].score) delete temp[idBgm].score
    if (!temp[idBgm].rank) delete temp[idBgm].rank
    matched[idDetail] = detail[idDetail]

    if (indexDetail % 10 === 0) {
      utils.write(
        __anime,
        Object.keys(temp).map(id => temp[id])
      )
    }
  }

  anime.forEach(item => {
    if (raw[item.ageId]) {
      item.ep = raw[item.ageId].ep
      item.status = raw[item.ageId].status
    }
  })
  if (rewrite) {
    const idsAnime = Object.keys(anime)
    for (let indexAnime = 0; indexAnime <= idsAnime.length; indexAnime++) {
      const idAnime = Number(idsAnime[indexAnime])
      const itemAnime = anime[idAnime] || {}
      if (itemAnime.status !== '连载') {
        continue
      }

      // 从bgm条目页获取实时数据
      const idBgm = Number(itemAnime.id)
      const url = `https://api.bgm.tv/subject/${idBgm}?responseGroup=large`
      const data = await utils.fetch(url)

      anime[indexAnime].score = data.rating && data.rating.score
      anime[indexAnime].rank = data.rank
      console.log(
        `[${indexAnime} | ${idsAnime.length}]`,
        itemAnime.cn,
        anime[indexAnime].score,
        anime[indexAnime].rank
      )
    }
  }
  utils.write(
    __anime,
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
