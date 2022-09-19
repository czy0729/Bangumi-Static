/*
 * @Author: czy0729
 * @Date: 2022-09-16 23:59:13
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-19 14:14:29
 */
const utils = require('../utils')
const axios = require('axios')
axios.defaults.withCredentials = false

const __raw = utils.root('data/mox/raw.json')
const __detail = utils.root('data/mox/detail.json')

const raw = utils.read(__raw) || {}
const detail = utils.read(__detail) || {}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  Cookie:
    '__stripe_mid=1ced561a-0278-4207-8b42-59c34cd0aa1be5f111; VOLSKEY=c0dcfec175bb09247dadd5c1af0524f8166334601610631172; Hm_lvt_032bfff3c38eeefc9db7c70d96d9cae4=1663316506,1663340832,1663362494,1663504910; VLIBSID=4rfa635k0hma7bm6rh154ni7ur; VOLSESS=1663528414; Hm_lpvt_032bfff3c38eeefc9db7c70d96d9cae4=1663528415'
}

let retry = 0

async function run() {
  const fetchs = []
  raw.forEach((item, i) => {
    const { mid } = item
    if (mid in detail) return

    fetchs.push(async () => {
      if (i && i % 10 === 0) {
        utils.write(__detail, detail)
        console.log('write')
      }

      return fetch(item, i)
    })
  })
  utils.queue(fetchs, 1)
}
run()

async function fetch(item, i) {
  try {
    const { mid } = item
    const url = `http://mox.moe/c/${mid}.htm`
    const html = await utils.fetch(url, {
      'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) ${i}`
    })
    console.log(url)

    const $ = utils.cheerio(html)
    const title = $('font.font_big b').text().trim()
    if (title) {
      const texts = $('font.status').text().trim().split('\n')

      let find
      let author
      let status
      let cates
      let publish
      let subscribe
      let favor
      let read
      let hot
      let update

      find = texts.find(item => item.includes('作者：'))
      if (find) author = find.replace('作者：', '').trim()

      find = texts.find(item => item.includes('狀態：'))
      if (find) status = find.replace('狀態：', '').trim()

      find = texts.find(item => item.includes('分類：'))
      if (find) cates = find.replace('分類：', '').trim()

      find = texts.find(item => item.includes('最後出版：'))
      if (find) publish = find.replace('最後出版：', '').trim()

      find = texts.find(item => item.includes('訂閱：'))
      if (find) subscribe = find.replace('訂閱：', '').trim()

      find = texts.find(item => item.includes('收藏：'))
      if (find) favor = find.replace('收藏：', '').trim()

      find = texts.find(item => item.includes('讀過：'))
      if (find) read = find.replace('讀過：', '').trim()

      find = texts.find(item => item.includes('熱度：'))
      if (find) hot = find.replace('熱度：', '').trim()

      find = texts.find(item => item.includes('更新：'))
      if (find) update = find.replace('更新：', '').trim()

      detail[mid] = {
        mid,
        title,
        ep: item.ep,
        sub: $('font.listtitle').text().trim(),
        author,
        status,
        cates,
        publish,
        update,
        desc: $('#desc_text').text().trim(),
        score: item.score,
        total: $('td.book_score td').eq(1).find('.filesize').text().trim(),
        subscribe,
        favor,
        read,
        hot
      }
      console.log(
        `${i + 1} / ${raw.length}`,
        mid,
        title,
        item.score,
        detail[mid].total
      )
    } else {
      console.log(html)
    }

    return true
  } catch (error) {
    retry += 1
    if (retry >= 500) process.exit()

    console.log(retry, i, String(error).slice(0, 64))
    return fetch(item)
  }
}

function sleep(ms = 800) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
