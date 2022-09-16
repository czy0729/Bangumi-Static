/*
 * @Author: czy0729
 * @Date: 2021-01-06 18:15:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-16 16:04:45
 */
const utils = require('../utils')

const __matched = utils.root('data/wenku8/matched.json')
const __wenku = utils.root('data/wenku8/wenku.v2.json')

const raw = utils.read(utils.root('data/wenku8/raw.json'))
const matched = utils.read(__matched)

const accessToken = {
  access_token: 'efe06c7b9980f817b38b9c4f08d902540c729f80',
  expires_in: 604800,
  token_type: 'Bearer',
  scope: null,
  user_id: 456208,
  refresh_token: '746ed5496b7795f414452093a2580a82fefbbbee'
}

const map = {}
Object.keys(matched).forEach(bgmId => {
  map[bgmId] = matched[bgmId].wid
})

const wenku = utils.read(__wenku)
async function run() {
  const bgmIds = Object.keys(map)
  for (let i = 0; i <= bgmIds.length; i += 1) {
    const bgmId = bgmIds[i]
    if (!bgmId || wenku.find(item => item.id == bgmId)) {
      continue
    }

    const wId = map[bgmId]
    const item = raw[wId] || {}

    const url = `https://api.bgm.tv/v0/subjects/${bgmId}?app_id=bgm8885c4d524cd61fc`
    const data = await utils.fetch(url, {
      Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
      'User-Agent':
        'Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Build/SKQ1.211006.001) 1661803607'
    })

    if (data) {
      const itemData = {
        cn: data.name_cn || item.title || '',
        jp: data.name || '',
        ep: item.ep || '',
        update: item.time || '',
        begin: data.date || '',
        status: item.status || 0,
        anime: item.anime || 0,
        cate: item.cate || '',
        author: item.author || '',
        score: (data.rating && data.rating.score) || 0,
        rank: (data.rating && data.rating.rank) || 0,
        total: (data.rating && data.rating.total) || 0,
        image:
          data.images && data.images.large
            ? data.images.large.replace(
                /https:\/\/lain.bgm.tv\/pic\/cover\/l\/|.jpg/g,
                ''
              )
            : '',
        id: Number(bgmId),
        wid: Number(wId),
        len: parseInt((item.len || 0) / 10000),
        tags: item.tags || '',
        hot:
          item.hot === 'D'
            ? 1
            : item.hot === 'C'
            ? 2
            : item.hot === 'B'
            ? 3
            : item.hot === 'A'
            ? 4
            : item.hot === 'S'
            ? 5
            : 0,
        up:
          item.up === 'D'
            ? 1
            : item.up === 'C'
            ? 2
            : item.up === 'B'
            ? 3
            : item.up === 'A'
            ? 4
            : item.up === 'S'
            ? 5
            : 0
      }
      wenku.push(itemData)
      console.log(
        `${i + 1} / ${bgmIds.length}`,
        itemData.cn || itemData.jp,
        itemData.score,
        itemData.rank,
        itemData.total
      )
    } else {
      console.log('error', bgmId, wId)
    }

    if (i && i % 10 === 0) {
      utils.write(__wenku, wenku)
    }
  }

  // 去重
  const unique = {}
  const _wenku = []
  wenku.forEach(item => {
    if (!unique[item.id]) {
      unique[item.id] = true
      _wenku.push(item)
    }
  })

  utils.write(
    __wenku,
    _wenku.sort((a, b) => {
      if (a.rank || b.rank) return (a.rank || 9999) - (b.rank || 9999)
      if (a.total || b.total) return b.total - a.total
      return b.id - a.id
    })
  )
  process.exit()
}
run()
