/*
 * https://www.wenku8.net/book/1.htm
 *
 * @Author: czy0729
 * @Date: 2020-07-29 15:10:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-07-30 11:02:39
 */
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const iconv = require('iconv-lite')

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

async function getHtml(url) {
  const res = await axios({
    url,
    headers: {
      // 'User-Agent':
      //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
      Referer: 'https://reactnative.cn/',
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

async function run() {
  const config = JSON.parse(fs.readFileSync('./data/wenku8/config.json'))
  const data = JSON.parse(fs.readFileSync('./data/wenku8/raw.json'))

  for (let page = config._page; page <= 1; page++) {
    const url = `https://cdn.jsdelivr.net/npm/focus-visible@5.0.2/dist/focus-visible.min.js`
    const html = await getHtml(url)
    console.log(html)

    // fs.writeFileSync('./data/agefans/raw.json', JSON.stringify(data))

    // config._page = page
    // fs.writeFileSync('./data/agefans/config.json', JSON.stringify(config))
  }
}

run()
