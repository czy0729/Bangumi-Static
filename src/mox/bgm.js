/*
 * @Author: czy0729
 * @Date: 2021-01-06 18:15:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-22 17:49:47
 */
const utils = require('../utils')

const __mox = utils.root('data/mox/mox.json')

const mox = utils.read(__mox)

const accessToken = {
  access_token: '369aa586dd76d44dc6f7d85c09e8982087018bc2',
  expires_in: 604800,
  token_type: 'Bearer',
  scope: null,
  user_id: 456208,
  refresh_token: '3cdeee299f3f60777eb6a4e0081f4470fa5357aa'
}

async function run() {
  for (let i = 7800; i <= mox.length; i += 1) {
    try {
      const item = mox[i] || {}
      if (!item.id) continue

      const url = `https://api.bgm.tv/v0/subjects/${item.id}`
      const data = await fetch(url)
      if (data) {
        let begin = data.date
        if (!begin) {
          begin = getDate(data)

          // 没有找到日期就从vol.01里面找 (道别的方法，我不愿知晓。40)
          if (!begin) {
            const subjects = await fetch(
              `https://api.bgm.tv/v0/subjects/${item.id}/subjects`
            )
            if (Array.isArray(subjects)) {
              const vol = subjects
              .filter(item => item.relation === '单行本')
              .sort((a, b) => a.name.localeCompare(b.name))?.[0]
              if (vol) {
                console.log(vol)
                const { id } = vol
                const data = await fetch(`https://api.bgm.tv/v0/subjects/${id}`)
                begin = getDate(data)
                console.log('begin', begin)
              }
            }
          }
        }

        item.title = data.name_cn || item.title || ''
        item.score = data.rating.score || 0
        item.rank = data.rating.rank || 0
        item.total = data.rating.total || 0
        if (data.images.medium && data.images.medium.includes('/m/')) {
          item.image = data.images.medium.split('/m/')[1].replace('.jpg', '')
        }
        item.publish = begin || item.publish || ''
        item.author = data.author || item.author || ''

        console.log(
          `${i + 1} / ${mox.length}`,
          item.id,
          item.title,
          item.publish,
          item.score,
          item.rank,
          item.total,
          item.image
        )
      } else {
        console.log('error', item.id)
      }

      if (i && i % 100 === 0) {
        utils.write(__mox, mox)
      }
    } catch (error) {
      console.log(error)
      continue
    }
  }

  utils.write(
    __mox,
    mox.sort((a, b) => {
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
