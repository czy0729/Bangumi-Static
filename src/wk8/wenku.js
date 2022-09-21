/*
 * @Author: czy0729
 * @Date: 2021-01-06 18:15:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-21 01:12:37
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

const wenku = []
const unique = {}
utils
  .read(__wenku)
  .forEach(item => {
    if (unique[item.id]) return

    unique[item.id] = true
    wenku.push(item)
  })

async function run() {
  const bgmIds = Object.keys(map)
  for (let i = 0; i <= bgmIds.length; i += 1) {
    try {
      const bgmId = bgmIds[i]
      if (!bgmId) {
        continue
      }

      const wId = map[bgmId]
      const item = raw[wId] || {}

      const url = `https://api.bgm.tv/v0/subjects/${bgmId}`
      const data = await fetch(url)
      if (data) {
        let begin = data.date
        if (!begin) {
          begin = getDate(data)

          // 没有找到日期就从vol.01里面找 (道别的方法，我不愿知晓。40)
          if (!begin) {
            const subjects = await fetch(
              `https://api.bgm.tv/v0/subjects/${bgmId}/subjects`
            )
            if (Array.isArray(subjects)) {
              const vol = subjects
                .filter(item => item.relation === '单行本')
                .sort((a, b) => a.localeCompare(b))?.[0]
              if (vol) {
                const { id } = vol
                const data = await fetch(`https://api.bgm.tv/v0/subjects/${id}`)
                begin = getDate(data)
                console.log('begin', begin)
              }
            }
          }
        }

        const itemData = {
          cn: data.name_cn || item.title || '',
          jp: data.name || '',
          ep: item.ep || '',
          update: item.time || '',
          begin: begin || '',
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
          itemData.id,
          itemData.cn || itemData.jp,
          itemData.begin,
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
    } catch (error) {
      continue
    }
  }

  utils.write(
    __wenku,
    wenku.sort((a, b) => {
      if (a.rank || b.rank) return (a.rank || 9999) - (b.rank || 9999)
      if (a.total || b.total) return b.total - a.total
      return b.id - a.id
    })
  )
  process.exit()
}
run()

function fetch(url) {
  return utils.fetch(`${url}?app_id=bgm8885c4d524cd61fc`, {
    Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
    'User-Agent':
      'Dalvik/2.1.0 (Linux; U; Android 12; Mi 10 Build/SKQ1.211006.001) 1661803607'
  })
}

function getDate(data = {}) {
  let begin
  if (Array.isArray(data.infobox)) {
    let item = data.infobox.find(item => item.key === '发售日')
    if (item) begin = item.value

    if (!item) item = data.infobox.find(item => item.key.includes('开始'))
    if (item)
      begin = (
        String(item.value).match(/\d{4}-\d{2}-\d{2}/g)?.[0] ||
        String(item.value).match(/\d{4}年-\d{2}月-\d{2}日/g)?.[0] ||
        String(item.value).match(/\d{4}年-\d{2}月/g)?.[0] ||
        String(item.value).match(/\d{4}年/g)?.[0] ||
        String(item.value).match(/\d{4}-\d{2}/g)?.[0] ||
        String(item.value).match(/\d{4}/g)?.[0] ||
        ''
      )
        .replace(/年|月|日/g, ' ')
        .trim()
        .replace(/ /g, '-')
  }
  return begin
}
