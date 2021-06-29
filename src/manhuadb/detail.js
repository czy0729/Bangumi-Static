/*
 * @Author: czy0729
 * @Date: 2021-01-10 00:41:45
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 07:48:23
 */
const utils = require('../utils')

const __detail = utils.root('data/manhuadb/detail.json')
const detail = utils.read(__detail)

const maxId = 25800

async function run() {
  const fetchs = []
  for (let id = 0; id < maxId; id += 1) {
    if (detail[id]) {
      continue
    }

    fetchs.push(async () => {
      const url = `https://www.manhuadb.com/manhua/${id}`
      const data = await utils.fetch(url)

      const $ = utils.cheerio(data)
      const title = $('.comic-title').text().trim()
      if (!title) {
        console.log(`skip ${url}`)
        return true
      }

      let tags = ''
      let status = ''
      $('.tags a').each((index, element) => {
        if (index === 0) {
          status = utils.cheerio(element).text().trim().replace(/中|已/g, '')
        } else {
          tags += ` ${utils.cheerio(element).text().trim()}`
        }
      })

      const ep = $('.tab-pane.active .fixed-wd-num:last-child').text().trim()
      const vol = $('.tab-pane.active .sort_div:last-child').text().trim()
      detail[id] = {
        id,
        title,
        status,
        author: $('.comic-creator').text().trim(),
        tags,
        year: $('.comic-pub-date').text().trim(),
        ep: ep
          ? ep
          : vol
          ? `${vol}${
              $('.nav-link.active .h3').text().trim() === '单行本' ? '卷' : ''
            }`
          : '',
        cn: $('.comic-titles').text().trim(),
        jp: $('.comic-original-titles').text().trim()
      }
      console.log(url, title)

      if (id % 1000 === 0) {
        utils.write(__detail, detail)
      }
      return true
    })
  }
  await utils.queue(fetchs.reverse(), 20)

  utils.write(__detail, detail)
  process.exit()
}

run()
