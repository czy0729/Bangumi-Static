/*
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-10 04:16:13
 */
const utils = require('../../utils')

const __raw = utils.root('data/manhuadb/raw.json')
const __detail = utils.root('data/manhuadb/detail.json')
const raw = utils.read(__raw)
const detail = utils.read(__detail)

const rewrite = false

async function run() {
  const idsRaw = Object.keys(raw)
  for (let indexRaw = 0; indexRaw <= idsRaw.length - 1; indexRaw++) {
    const idRaw = idsRaw[indexRaw]
    const itemRaw = raw[idRaw]
    if (!rewrite && idRaw in detail) {
      continue
    }

    const itemDetail = detail[idRaw] || {}
    const url = `https://www.manhuadb.com/manhua/${idRaw}`
    const data = await utils.fetch(url)
    console.log(`[${indexRaw} | ${idsRaw.length}]`, url, itemRaw.title)

    const $ = utils.cheerio(data)
    detail[idRaw] = {
      ...itemRaw,
      ...itemDetail,
      ep: $('.tab-pane.active .fixed-wd-num:last-child').text().trim(),
      cn: $('.comic-titles').text().trim(),
      jp: $('.comic-original-titles').text().trim(),
    }

    if (indexRaw % 10 === 0) {
      utils.write(__detail, detail)
    }
  }

  utils.write(__detail, detail)
  process.exit()
}

run()
