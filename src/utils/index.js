/*
 * @Author: czy0729
 * @Date: 2020-12-29 11:11:10
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-01 01:51:26
 */
const fs = require('fs')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const readline = require('readline')
const opn = require('opn')
const ncp = require('copy-paste')
const ora = require('./ora')

require('events').EventEmitter.defaultMaxListeners = 0
axios.defaults.timeout = 3000

/*
  JSON.stringify({
    'User-Agent': navigator.userAgent,
    Cookie: document.cookie,
  })
*/
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  Cookie:
    'chii_cookietime=2592000; chii_theme_choose=1; prg_list_mode=full; chii_theme=dark; __utmz=1.1607152658.2102.85.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_auth=Bmn0EEpQr1rIvfuVSrrsM8fnbswYFqk15mgr29Zr32cl7pFtV0LJjXJWaTuHNYbc3DW9OBpOEmavwsz5oreJlyGwId%2BUB9OVn9tB; prg_display_mode=normal; __utmc=1; __utma=1.7292625.1567003648.1609379980.1609382681.2191; chii_searchDateLine=0; chii_sid=R3eq4j; __utmt=1; __utmb=1.74.10.1609382681',
  Host: 'bgm.tv',
}

/**
 * 读
 * @param {*} path
 */
function read(path) {
  return JSON.parse(fs.readFileSync(path))
}

/**
 * 写
 * @param {*} path
 * @param {*} data
 * @param {*} min
 */
function write(path, data, min = false) {
  return fs.writeFileSync(path, min ? JSON.stringify(data) : JSON.stringify(data, null, 2))
}

/**
 * 请求
 * @param {*} url
 * @param {*} headers
 */
async function fetch(
  url,
  headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
  }
) {
  try {
    const { data } = await axios({
      url,
      headers,
    })
    return data
  } catch (error) {
    return fetch(url, headers)
  }
}

/**
 * $
 * @param {*} target
 */
function cheerio(target) {
  return typeof target === 'string'
    ? cheerioRN.load(target, undefined, undefined, {
        decodeEntities: false,
      })
    : cheerioRN(target, undefined, undefined, {
        decodeEntities: false,
      })
}

/**
 * 获取键盘输入命令
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
const getLine = (function () {
  const getLineGen = (async function* () {
    for await (const line of rl) {
      yield line
    }
  })()
  return async () => (await getLineGen.next()).value
})()

/**
 * 统一log
 * @param {*} index
 * @param {*} len
 * @param {*} url
 * @param {*} content
 */
function log(index, len, url, content) {
  console.log(`[${index} | ${len}]`, url, content)
}

/**
 *
 * @param {*} content
 */
function loading(content) {
  return ora(content).start()
}

/**
 *
 * @param {*} url
 */
function open(url) {
  return opn(url)
}

/**
 *
 * @param {*} str
 */
function htmlTrim(str) {
  return str.replace(/(\n+)|(<!--.*?-->)|(\/\*.*?\*\/)|/gi, '').replace(/[ ]+</gi, '<')
}

module.exports = {
  headers,
  read,
  write,
  fetch,
  cheerio,
  rl,
  getLine,
  log,
  loading,
  open,
  htmlTrim,
}
