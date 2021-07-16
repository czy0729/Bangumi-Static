/*
 * https://www.agefans.cc/catalog/all-all-all-all-all-time-1-日本-all-all
 * https://www.agefans.cc/catalog/all-all-all-all-all-time-1-中国-all-all
 *
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-07-16 11:16:37
 */
const utils = require('../utils')

const __raw = utils.root('data/agefans/raw.json')
const raw = utils.read(__raw)

const host = 'https://www.agefans.cc'
const pages = [
  { type: '日本', p: 110, area: 'jp' },
  { type: '中国', p: 20, area: 'cn' }
]

async function run() {
  for (let index = 0; index < pages.length; index++) {
    const { type, p, area } = pages[index]
    for (let page = 0; page <= p; page++) {
      const url = `${host}/catalog/all-all-all-all-all-time-${page}-${encodeURIComponent(
        type
      )}-all-all`
      const data = await utils.fetch(url)
      console.log(url)

      if (data.includes('ipchk:操作太频繁')) {
        throw new Error(data)
      }

      const $ = utils.cheerio(data)
      $('div.cell').map((index, element) => {
        const $row = utils.cheerio(element)
        const id = Number(
          $row.find('a.cell_poster').attr('href').replace('/detail/', '')
        )
        if (!id) return

        const [type, jp, begin, status, tags, official] = matchInfo(
          utils.htmlTrim($row.find('div.cell_imform_kvs').html().trim()),
          [
            '动画种类',
            '原版名称',
            '首播时间',
            '播放状态',
            '剧情类型',
            '制作公司'
          ]
        )
        raw[id] = {
          id,
          cn: $row.find('a.cell_poster img').attr('alt').trim(),
          ep: $row.find('span.newname').text().trim(),
          type,
          jp,
          begin,
          status,
          tags,
          official,
          area
        }
      })

      if (page % 10 === 0) {
        utils.write(__raw, raw)
      }
    }
  }
  utils.write(__raw, raw)
  process.exit()
}
run()

function matchInfo(html, keywords) {
  return keywords.map(keyword => {
    const reg = new RegExp(
      `<span class="cell_imform_tag">${keyword}：</span><span class="cell_imform_value">(.+?)</span>`
    )
    const match = html.match(reg)
    return match ? String(match[1]).trim() : ''
  })
}
