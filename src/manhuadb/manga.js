/*
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-12-31 11:31:37
 */
const utils = require('../utils')

const __detail = '../../data/manhuadb/detail.json'
const __mathced = '../../data/manhuadb/mathced.json'
const __manga = '../../data/manhuadb/manga.json'
const detail = utils.read(__detail)
const mathced = utils.read(__mathced)
const manga = utils.read(__manga)
const temp = {}
manga.forEach((item) => (temp[item.id] = item))

const rewrite = false
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; prg_list_mode=full; chii_theme=dark; __utmz=1.1607152658.2102.85.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_auth=Bmn0EEpQr1rIvfuVSrrsM8fnbswYFqk15mgr29Zr32cl7pFtV0LJjXJWaTuHNYbc3DW9OBpOEmavwsz5oreJlyGwId%2BUB9OVn9tB; prg_display_mode=normal; __utmc=1; chii_searchDateLine=0; chii_sid=1353EV; __utma=1.7292625.1567003648.1609210332.1609222388.2184; __utmt=1; __utmb=1.1.10.1609222388',
}

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
          ? data.images.large.replace(
              /http:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
              ''
            )
          : '',
      begin: itemDetail.year,
      score: data.rating && data.rating.score ? data.rating.score : 0,
      id: idBgm,
      manhuaId: idDetail,
    }

    delete temp[idBgm].title
    delete temp[idBgm].year
  }

  utils.write(
    __manga,
    Object.keys(temp).map((id) => temp[id]),
    true
  )
}

run()

/*
  JSON.stringify({
    'User-Agent': navigator.userAgent,
    Cookie: document.cookie,
  })
*/
