/*
 * @Author: czy0729
 * @Date: 2021-06-23 04:55:32
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-15 00:55:13
 */
const fs = require('fs')
const utils = require('../utils')

const __raw = utils.root('data/h/raw.json')
const raw = utils.read(__raw)

const host = 'https://hanime1.me'
const p = 10

async function run() {
  for (let page = 1; page <= p; page++) {
    const url = `${host}/search?genre=${encodeURIComponent(
      '裏番'
    )}&sort=${encodeURIComponent('最新上市')}&page=${page}`
    // const data = await utils.fetch(url)
    const data = String(fs.readFileSync(utils.root(`src/h/p/${page}.html`)))

    const $ = utils.cheerio(data)
    $('div.home-rows-videos-wrapper a').map((index, element) => {
      const $row = utils.cheerio(element)
      const id = Number($row.attr('href').split('v=')[1])
      const img = $row.find('img').attr('src')
      raw[id] = {
        id: Number($row.attr('href').split('v=')[1]),
        img: $row.find('img').attr('src'),
        title: $row.find('.home-rows-videos-title').text().trim()
      }
    })

    if (page % 10 === 0) {
      utils.write(__raw, raw)
    }
  }
  utils.write(__raw, raw)
  process.exit()
}
run()
