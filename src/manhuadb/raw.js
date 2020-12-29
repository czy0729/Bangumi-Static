/*
 * @Author: czy0729
 * @Date: 2020-12-28 15:53:48
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-12-29 12:14:32
 */
const utils = require('../utils')

const __raw = '../../data/manhuadb/raw.json'
const raw = utils.read(__raw)

const pages = [
  {
    y: 2019,
    p: 14,
  },
  {
    y: 2018,
    p: 36,
  },
]

async function run() {
  for (let index = 0; index < pages.length; index++) {
    const { p, y } = pages[index]
    for (let page = 1; page <= p; page++) {
      const url = `https://www.manhuadb.com/manhua/list-r-4-t-${pages[index].y}-page-${page}.html`
      const data = await utils.fetch(url)
      console.log(url)

      const $ = utils.cheerio(data)
      $('div.comic-book-unit').map((index, element) => {
        const $row = utils.cheerio(element)
        const id = parseInt(
          $row.find('a.d-block').attr('href').replace('/manhua/', '')
        )
        if (!id) return

        let author = ''
        $row
          .find('.my-1 .list-inline-item')
          .each(
            (index, element) =>
              (author += ` ${utils.cheerio(element).text().trim()}`)
          )

        let tags = ''
        let status = ''
        $row.find('.comic-categories .mb-1 .badge').each((index, element) => {
          if (index === 0) {
            status = utils.cheerio(element).text().trim().replace(/中|已/g, '')
          } else {
            tags += ` ${utils.cheerio(element).text().trim()}`
          }
        })

        raw[id] = {
          id,
          title: $row.find('h2 > a').text().trim(),
          status,
          author: author.trim(),
          tags: tags.trim(),
          year: y,
        }
      })

      utils.write(__raw, raw)
    }
  }
}

run()
