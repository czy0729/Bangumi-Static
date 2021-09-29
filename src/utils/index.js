/*
 * @Author: czy0729
 * @Date: 2020-12-29 11:11:10
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-09-29 07:18:28
 */
const fs = require('fs')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const readline = require('readline')
const opn = require('opn')
const ncp = require('copy-paste')
const path = require('path')
const http = require('http')
const cnchars = require('cn-chars')
const ora = require('./third-party/ora')
const cnChar = require('./third-party/cn-char/index')

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
  Host: 'bgm.tv'
}

/**
 * 项目根目录
 * @param {*} filePath
 */
function root(filePath = '') {
  return `${path.join(__dirname, '../../')}${filePath}`
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
  return fs.writeFileSync(
    path,
    min ? JSON.stringify(data) : JSON.stringify(data, null, 2)
  )
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
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
  }
) {
  try {
    const { data } = await axios({
      url,
      headers
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
        decodeEntities: false
      })
    : cheerioRN(target, undefined, undefined, {
        decodeEntities: false
      })
}

/**
 * 获取键盘输入命令
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
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
  return str
    .replace(/(\n+)|(<!--.*?-->)|(\/\*.*?\*\/)|/gi, '')
    .replace(/[ ]+</gi, '<')
}

/**
 * 繁体转简体
 * @param {*} str
 */
function toSimplifiedChar(str) {
  return str
    .split('')
    .map(s => cnchars.toSimplifiedChar(s))
    .join('')
}

/**
 *
 * @param {*} src
 */
function large(src = '') {
  if (typeof src !== 'string' || src === '') {
    return src
  }
  return src.replace(/\/g\/|\/s\/|\/m\/|\/c\//, '/l/')
}

async function download(url, pathData) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(pathData)) {
      // console.log(`- skip ${pathData}`)
      return resolve(true)
    }

    const src = url.includes('http:') ? url : `http:${url}`
    http.get(src, (req, res) => {
      let imgData = ''
      req.setEncoding('binary')
      req.on('data', chunk => (imgData += chunk))
      req.on('end', () => {
        const dirPath = path.dirname(pathData)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        console.log(`- write ${url}`)
        fs.writeFileSync(pathData, imgData, 'binary', err => {
          if (err) console.log('- error ${pathData}')
        })

        resolve(true)
      })
    })
  })
}

async function download2(url, pathData) {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(pathData)) {
      // console.log(`- skip ${pathData}`)
      return resolve(true)
    }

    const dirPath = path.dirname(pathData)
    if (!fs.existsSync(dirPath)) {
      const rootPath = path.join(dirPath, '..')
      if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath)
      }
      fs.mkdirSync(dirPath)
    }

    const writer = fs.createWriteStream(pathData)
    const response = await axios({
      url: `https:${url}`,
      method: 'GET',
      responseType: 'stream'
      // headers: {
      //   referer: 'http://bgm.tv/'
      // }
    })

    response.data.pipe(writer)
    writer.on('finish', () => {
      console.log(url)
      resolve()
    })
  })
}

/**
 *
 * @param {*} fetchs
 * @param {*} num
 */
async function queue(fetchs, num = 2) {
  if (!fetchs.length) {
    return false
  }

  await Promise.all(
    new Array(num).fill(0).map(async () => {
      while (fetchs.length) {
        // eslint-disable-next-line no-await-in-loop
        await fetchs.shift()()
      }
    })
  )

  return true
}

/**
 *
 */
function getTimestamp() {
  return Math.floor(new Date().valueOf() / 1000)
}

/**
 * 字符串相似度
 * @param {*} s
 * @param {*} t
 * @param {*} f
 */
function similar(s, t, f) {
  if (!s || !t) {
    return 0
  }
  var l = s.length > t.length ? s.length : t.length
  var n = s.length
  var m = t.length
  var d = []
  f = f || 3
  var min = function (a, b, c) {
    return a < b ? (a < c ? a : c) : b < c ? b : c
  }
  var i, j, si, tj, cost
  if (n === 0) return m
  if (m === 0) return n
  for (i = 0; i <= n; i++) {
    d[i] = []
    d[i][0] = i
  }
  for (j = 0; j <= m; j++) {
    d[0][j] = j
  }
  for (i = 1; i <= n; i++) {
    si = s.charAt(i - 1)
    for (j = 1; j <= m; j++) {
      tj = t.charAt(j - 1)
      if (si === tj) {
        cost = 0
      } else {
        cost = 1
      }
      d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  let res = 1 - d[n][m] / l
  return res.toFixed(f)
}

/**
 *
 * @param {*} str
 */
function HTMLDecode(str = '') {
  if (str.length === 0) {
    return ''
  }
  return (
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      // eslint-disable-next-line quotes
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
  )
}

/**
 * hash
 */
const I64BIT_TABLE =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('')
function hash(input) {
  if (!input) {
    return input
  }
  input = `https://lain.bgm.tv/pic/cover/c/${input}.jpg`

  let hash = 5381
  let i = input.length - 1

  if (typeof input == 'string') {
    for (; i > -1; i--) hash += (hash << 5) + input.charCodeAt(i)
  } else {
    for (; i > -1; i--) hash += (hash << 5) + input[i]
  }
  let value = hash & 0x7fffffff

  let retValue = ''
  do {
    retValue += I64BIT_TABLE[value & 0x3f]
  } while ((value >>= 6))

  return retValue
}

module.exports = {
  headers,
  root,
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
  toSimplifiedChar,
  large,
  download,
  download2,
  queue,
  getTimestamp,
  similar,
  HTMLDecode,
  hash,
  t2s: cnChar.t2s
}
