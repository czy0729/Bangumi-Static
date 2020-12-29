/*
 * @Author: czy0729
 * @Date: 2020-12-29 11:11:10
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-12-29 14:15:17
 */
const fs = require('fs')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')

function read(path) {
  return JSON.parse(fs.readFileSync(path))
}

function write(path, data, min = false) {
  return fs.writeFileSync(
    path,
    min ? JSON.stringify(data) : JSON.stringify(data, null, 2)
  )
}

async function fetch(
  url,
  headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
  }
) {
  const { data } = await axios({
    url,
    headers,
  })
  return data
}

function cheerio(target) {
  return typeof target === 'string'
    ? cheerioRN.load(target, undefined, undefined, {
        decodeEntities: false,
      })
    : cheerioRN(target, undefined, undefined, {
        decodeEntities: false,
      })
}

module.exports = {
  read,
  write,
  fetch,
  cheerio,
}
