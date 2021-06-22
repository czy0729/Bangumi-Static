/*
 * @Author: czy0729
 * @Date: 2021-06-23 04:55:32
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-23 05:21:43
 */
const utils = require('../utils')

const __raw = utils.root('data/h/raw.json')
const raw = utils.read(__raw)

const host = 'https://hanime1.me'
const p = 58

async function run() {
  for (let page = 1; page <= p; page++) {
    const url = `${host}/search?genre=${encodeURIComponent(
      'H動漫'
    )}&sort=${encodeURIComponent('最新內容')}&page=${page}`
    console.log(url)
    const data = await utils.fetch(url)

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
