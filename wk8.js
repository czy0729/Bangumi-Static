/*
 * https://www.wenku8.net/book/1.htm
 *
 * @Author: czy0729
 * @Date: 2020-07-29 15:10:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-09-27 09:58:50
 */
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const iconv = require('iconv-lite')

const fileConfig = './data/wenku8/config.json'
const fileRaw = './data/wenku8/raw.json'
const pages = 2827

function cheerio(target) {
  return typeof target === 'string'
    ? cheerioRN.load(target, undefined, undefined, {
        decodeEntities: false,
      })
    : cheerioRN(target, undefined, undefined, {
        decodeEntities: false,
      })
}

function htmlTrim(str) {
  return str
    .replace(/(\n+)|(<!--.*?-->)|(\/\*.*?\*\/)|/gi, '')
    .replace(/[ ]+</gi, '<')
}

function matchInfo(html, keywords) {
  return keywords.map((keyword) => {
    const reg = new RegExp(`<td width="20%">${keyword}：(.+?)</td>`)
    const match = html.match(reg)
    return match ? String(match[1]).trim() : ''
  })
}

async function getHtml(url) {
  const res = await axios({
    url,
    headers: {
      // 'User-Agent':
      //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    },
    responseType: 'stream',
  })

  return new Promise((resolve) => {
    const chunks = []
    res.data.on('data', (chunk) => {
      chunks.push(chunk)
    })
    res.data.on('end', () => {
      const buffer = Buffer.concat(chunks)
      const str = iconv.decode(buffer, 'gb2312')
      resolve(str)
    })
  })
}

function save(config, data) {
  fs.writeFileSync(fileConfig, JSON.stringify(config))
  fs.writeFileSync(fileRaw, JSON.stringify(data))
  console.log('save', config)
}

;(async function run() {
  const config = JSON.parse(fs.readFileSync(fileConfig))
  const data = JSON.parse(fs.readFileSync(fileRaw))

  for (let page = config._page; page <= pages + 1; page++) {
    const url = `http://www.wenku8.net/book/${page}.htm`
    const html = await getHtml(url)

    const $ = cheerio(html)
    const title = $('title').text().trim().split(' - ')[0]
    if (title !== '出现错误') {
      const [cate, author, status, time, len = ''] = matchInfo(html, [
        '文库分类',
        '小说作者',
        '文章状态',
        '最后更新',
        '全文长度',
      ])

      let hot = html.match(/作品热度：(.+?)级 ，/)
      hot = (hot && hot[1]) || ''

      let up = html.match(/当前热度上升指数为：(.+?)级/)
      up = (up && up[1]) || ''

      let ep = html.match(
        /<span class="hottext">最近章节：<\/span><br \/><span style="font-size:14px;"><a href="https:\/\/www.wenku8.net\/novel\/.+?.htm">(.+?)<\/a>/
      )
      ep = (ep && ep[1]) || ''

      data[page] = {
        wid: page,
        title,
        // img: // 有规律不需要分析 http://img.wenku8.com/image/{0/2/2s}.jpg,
        cate,
        author,
        status: status === '已完成' ? 1 : 0, // 连载中 0 | 已完成 1
        time,
        len: parseInt(len.replace('字', '')),
        hot,
        up,
        ep,
        anime: html.includes('本作已动画化') ? 1 : 0,
      }
      console.log(url, data[page].title)
    }

    config._page = page
    if (page % 10 === 0) {
      save(config, data)
    }
  }

  save(config, data)
})()
