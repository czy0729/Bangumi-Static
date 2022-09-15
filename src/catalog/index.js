/*
 * @Author: czy0729
 * @Date: 2022-09-06 02:08:59
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-06 04:53:14
 */
const axios = require('axios')
const utils = require('../utils')

axios.defaults.timeout = 10000

const __raw = utils.root('data/catalog/raw.json')

/*
JSON.stringify({
  'User-Agent': navigator.userAgent,
  Cookie: document.cookie
});
*/
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
  Cookie:
    'chii_sec_id=UbWhSkzVgWMCEAMVkRyXrW04%2BPftIpKVVfG6965j; chii_cookietime=2592000; chii_theme_choose=1; __utmz=1.1660254717.1493.26.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; chii_theme=dark; chii_auth=Gwi%2FkJs2gsqpu10JEyMAt4Nd8kzyhTxZJGYgqKTJrnHIHjoMUykO6d0%2BiqsBePHTmEqb%2F%2FHLgDSqQZhmjaT0Dh7bPeFI5z49QJo%2B; prg_display_mode=normal; prg_list_mode=full; __utmc=1; __utma=1.825736922.1638495774.1662391998.1662400371.1730; chii_sid=5272PI; __utmt=1; __utmb=1.26.10.1662400371'
}

async function run() {
  const raw = []
  for (let page = 1; page < 999; page++) {
    try {
      const url = `https://bgm.tv/index/browser?orderby=collect&page=${page}`
      const { data: html } = await axios({
        url,
        headers
      })
      const items = cheerioCatalog(html)
      items.forEach(item => raw.push(item))
      console.log(url)

      if (page % 20 === 0) {
        utils.write(__raw, raw)
        console.log(`write ${page}`)
      }
    } catch (error) {}
  }
  utils.write(__raw, raw)
}
run()
process.exit()

function cheerioCatalog(HTML) {
  const $ = utils.cheerio(HTML)
  return $('li.tml_item')
    .map((index, element) => {
      const $li = utils.cheerio(element)
      const $tip = $li.find('span.tip_i > a.l')
      const $title = $li.find('h3 > a.l')
      return safeObject({
        avatar: $li.find('img.avatar').attr('src'),
        name: $tip.text().trim(),
        userId: matchUserId($tip.attr('href')),
        date: date(
          getTimestamp() -
            getRecentTimestamp($li.find('span.tip_j').text().trim())
        ),
        title: $title.text().trim(),
        id: Number(($title.attr('href') || '').replace('/index/', '')),
        info: $li.find('span.info > p').text().trim().replace(/\n/g, ' '),
        book: Number($li.find('span.subject_type_1').text().trim() || 0),
        anime: Number($li.find('span.subject_type_2').text().trim() || 0),
        music: Number($li.find('span.subject_type_3').text().trim() || 0),
        game: Number($li.find('span.subject_type_4').text().trim() || 0),
        real: Number($li.find('span.subject_type_6').text().trim() || 0)
      })
    })
    .get()
}

function matchUserId(str = '') {
  return str.substring(str.lastIndexOf('/') + 1)
}

function safeObject(object = {}) {
  Object.keys(object).forEach(key => {
    if (object[key] === undefined) {
      // eslint-disable-next-line no-param-reassign
      object[key] = ''
    }
  })
  return object
}

function pad(n) {
  return Number(n) < 10 ? `0${n}` : n
}

function date(format, timestamp) {
  // 假如第二个参数不存在，第一个参数作为timestamp
  if (!timestamp) {
    timestamp = format
    format = 'Y-m-d'
  }

  const jsdate = timestamp ? new Date(timestamp * 1000) : new Date()
  const f = {
    Y: function () {
      return jsdate.getFullYear()
    },
    y: function () {
      return (jsdate.getFullYear() + '').slice(2)
    },
    m: function () {
      return pad(f.n())
    },
    d: function () {
      return pad(f.j())
    },
    H: function () {
      return pad(jsdate.getHours())
    },
    i: function () {
      return pad(jsdate.getMinutes())
    },
    s: function () {
      return pad(jsdate.getSeconds())
    },
    n: function () {
      return jsdate.getMonth() + 1
    },
    j: function () {
      return jsdate.getDate()
    }
  }
  return format.replace(/[\\]?([a-zA-Z])/g, function (t, s) {
    let ret = ''
    if (t != s) {
      ret = s
    } else {
      if (f[s]) {
        ret = f[s]()
      } else {
        ret = s
      }
    }
    return ret
  })
}

function getTimestamp() {
  return Math.floor(new Date().valueOf() / 1000)
}

function getRecentTimestamp(recent) {
  try {
    let timestamp = 0

    const y = recent.match(/\d+年/g)
    if (y) timestamp += parseInt(y[0]) * 24 * 60 * 60 * 365

    const m = recent.match(/\d+月/g)
    if (m) timestamp += parseInt(m[0]) * 24 * 60 * 60 * 30

    const d = recent.match(/\d+天/g)
    if (d) timestamp += parseInt(d[0]) * 24 * 60 * 60

    const h = recent.match(/\d+小时/g)
    if (h) timestamp += parseInt(h[0]) * 60 * 60

    const i = recent.match(/\d+分钟/g)
    if (i) timestamp += parseInt(i[0]) * 60

    const s = recent.match(/\d+秒/g)
    if (s) timestamp += parseInt(s[0])

    return timestamp
  } catch (error) {
    return 0
  }
}
