/*
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-23 07:26:47
 */
const utils = require('../utils')

const __anime = utils.root('data/agefans/anime.json')
const anime = utils.read(__anime)

const accessToken = {
  access_token: '369aa586dd76d44dc6f7d85c09e8982087018bc2',
  expires_in: 604800,
  token_type: 'Bearer',
  scope: null,
  user_id: 456208,
  refresh_token: '3cdeee299f3f60777eb6a4e0081f4470fa5357aa'
}
const headers = {
  Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
  'User-Agent':
    'Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Build/SKQ1.211006.001) 1661803607'
}

async function run() {
  const idsAnime = Object.keys(anime)
  for (let indexAnime = 0; indexAnime <= idsAnime.length; indexAnime++) {
    const itemAnime = anime[indexAnime] || {}
    // if (itemAnime.cn || itemAnime.jp) continue

    const idBgm = Number(itemAnime.id)
    if (itemAnime && idBgm) {
      // 从bgm条目页获取实时数据
      const url = `https://api.bgm.tv/v0/subjects/${idBgm}?app_id=bgm8885c4d524cd61fc`
      const data = await utils.fetch(url, headers)

      const item = anime[indexAnime]
      if (data && item) {
        if (data.date) item.begin = data.date

        item.score = data.rating.score || 0
        item.rank = data.rating.rank || 0
        item.total = data.rating.total || 0

        item.jp = data.name || ''
        item.cn = data.name_cn || ''
        if (
          data.images &&
          data.images.medium &&
          data.images.medium.includes('/m/')
        ) {
          item.image = data.images.medium.split('/m/')[1].replace('.jpg', '')
        }

        console.log(
          `[${indexAnime} | ${idsAnime.length}]`,
          item.cn || item.jp,
          item.score,
          item.rank,
          item.image
        )
      }

      if (indexAnime % 50 === 0) {
        console.log('save', indexAnime)
        utils.write(__anime, anime)
      }
    }
  }

  utils.write(__anime, anime)
  process.exit()
}
run()
