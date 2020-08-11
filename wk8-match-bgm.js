/*
 * 文库8 => bangumi 条目对应关系爬爬
 *  - 支持全自动匹配大部分条目
 *  - 半自动手动匹配余下条目
 *
 * @Author: czy0729
 * @Date: 2020-08-03 09:55:03
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-08-10 11:28:33
 */
const fs = require('fs')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const utils = require('./utils/utils')
const readline = require('readline')
const opn = require('opn')

axios.defaults.timeout = 3000

// 配置
const autoSkip = false // 是否开启全自动
const host = 'https://bangumi.tv'
const headers = {
  Host: host.split('//')[1],
  Cookie:
    'chii_cookietime=2592000; prg_display_mode=normal; chii_theme_choose=1; chii_theme=dark; __utmz=1.1589339084.751.82.utmcsr=bgm.tv|utmccn=(referral)|utmcmd=referral|utmcct=/group/topic/356269; __utmc=1; __utma=1.359815985.1557241163.1596459404.1596507054.767; __utmt=1; chii_sid=pnVI57; chii_auth=YUS11qnJW9MTRltnbl0Uy3gD4cN0dYlAv4937ITC8zqH5bh0CSUoq6TGjVsGKWknVVWiywkZOwkbMFZsQqtK3v15ayYW82wSC95C; __utmb=1.4.10.1596507054',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
}

// 固定配置
const configFilePath = './data/wenku8/config.json'
const rawFilePath = './data/wenku8/raw.json'
const dataFilePath = './data/wenku8/data.json'
const configData = JSON.parse(fs.readFileSync(configFilePath))
const matchData = JSON.parse(fs.readFileSync(dataFilePath))
const rawData = JSON.parse(fs.readFileSync(rawFilePath))
const rawArray = Object.keys(rawData).map((key) => rawData[key])

// 临时变量
let commands = []
let temp = null
let url = ''
let item = {}
let items = []
let id = 0
let title = ''
let cover = ''
let rank = ''
let score = ''

// 工具方法
let clear
function loading() {
  let n = 0
  const interval = setInterval(() => {
    n += 1
    process.stdout.clearLine()
    process.stdout.write(new Array((n % 8) + 1).join('.'))
    process.stdout.cursorTo(0)
  }, 400)

  return () => {
    clearInterval(interval)
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    clear = null
  }
}

/**
 * cheerio
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
 * 睡眠
 * @param {*} ms
 */
function sleep(ms = 1200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @echo -e "\e[0;31m Red"
 * @echo -e "\e[0;32m Green"
 * @echo -e "\e[0;33m Yellow"
 * @echo -e "\e[0;34m Blue"
 * @echo -e "\e[0;35m Purple"
 * @echo -e "\e[0;36m Cyan"
 * @param {*} type
 * @param {*} msg
 * @param {*} color
 */
function msg(type, msg, color = '33m') {
  console.log('\x1b[40m \x1b[' + color + '[' + type + '] ' + msg + '\x1b[0m')
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

// 逻辑方法
/**
 * 跳过并写入
 */
function skip() {
  msg('skip', item.title, '31m')

  configData.skip[item.wid] = item
  delete rawData[item.wid]

  save()
}

/**
 * 写入保存
 */
let _save = 0
function save(immediate) {
  if (immediate) {
    _save = 10
  } else {
    _save += 1
  }

  if (_save % 10 === 0) {
    msg(
      'save',
      `skip: ${Object.keys(configData.skip).length}, raw: ${
        Object.keys(rawData).length
      }, data: ${Object.keys(matchData).length}`
    )

    fs.writeFileSync(configFilePath, JSON.stringify(configData))
    fs.writeFileSync(rawFilePath, JSON.stringify(rawData))
    fs.writeFileSync(dataFilePath, JSON.stringify(matchData))
  }

  reset()
}

/**
 * 写入成功后重置临时变量
 */
function reset() {
  temp = null
  url = ''
  item = {}
  items = []

  id = 0
  title = ''
  cover = ''
  rank = ''
  score = ''
}

/**
 * Bangumi搜索
 * @param {*} keyword
 */
async function search(keyword) {
  try {
    console.log('\n')
    msg('fetch search', keyword, '35m')

    keyword = keyword.replace(/\!|\?|\/|／|\.|官方小说/g, '')

    clear = loading()
    const { data: html } = await axios({
      url: `${host}/subject_search/${encodeURIComponent(keyword)}?cat=1`,
      headers,
    })
    clear()

    const $ = cheerio(html)
    const items = (
      $('#browserItemList li h3 a.l')
        .map((index, element) => {
          const $row = cheerio(element)
          return {
            id: $row.attr('href').replace('/subject/', ''),
            title: $row.text().trim(),
          }
        })
        .get() || []
    ).filter(
      (item) =>
        !(
          (item.title.includes('<') && item.title.includes('>')) ||
          (item.title.includes('〈') && item.title.includes('〉')) ||
          (item.title.includes('第') && item.title.includes('卷'))
        )
    )
    // .sort((a, b) => a.title.length - b.title.length)

    items.forEach((item, index) =>
      console.log(` [${index + 1}] ${item.id} - ${item.title}`)
    )
    return items
  } catch (error) {
    msg('error search', error, '31m')
    if (clear) clear()
    return search(keyword)
  }
}

/**
 * 获取下一个原始数据
 */
function next() {
  return rawArray.shift()
}

/**
 * Bangumi查询条目
 */
async function subject(subjectId) {
  const url = `${host}/subject/${subjectId}`
  msg('fetch subject', url, '35m')

  try {
    clear = loading()
    const { data: html } = await axios({
      url,
      headers,
    })
    clear()

    const $ = cheerio(html)
    const title = $('h1 a').text().trim()
    const info = String($('h1').text()).replace(/\r|\n/g, '')
    const cover = String($('#columnSubjectHomeA img').attr('src')).replace(
      /\/\/lain.bgm.tv\/pic\/cover\/c\/|.jpg/g,
      ''
    )
    let rank = String($('small.alarm').text().trim()).replace('#', '')
    rank = rank ? parseInt(rank) : ''

    let score = String($('.global_score .number').text().trim())
    score = score ? parseFloat(parseFloat(score).toFixed(1)) : ''

    msg('subject', info, info.includes('小说') ? '36m' : '31m')
    return {
      id: parseInt(subjectId),
      title,
      cover,
      rank,
      score,
      info,
    }
  } catch (error) {
    msg('error fetch subject', error, '31m')
    if (clear) clear()
    return subject(subjectId)
  }
}

/**
 * 爬爬
 */
;(async function () {
  const saveThenNext = async () => {
    if (autoSkip) {
      await sleep()
    }

    // 递归, 有id则保存
    if (id) {
      matchData[id] = {
        id,
        wid: item.wid,
        cover,
        title,
        w: item.title,
        rank,
        score,
        cate: item.cate,
        author: item.author,
        status: item.status,
        time: item.time,
        len: item.len,
        hot: item.hot,
        up: item.up,
        ep: item.ep,
        anime: item.anime,
      }
      if (matchData[id].title === matchData[id].w) {
        delete matchData[id].w
      }

      msg('confirm', `${JSON.stringify(matchData[id], null, 2)}`, '32m')
      delete rawData[item.wid]

      save()
    }

    // 执行下一次循环
    item = next()
    items = await search(item.title)
    if (!items.length) {
      if (autoSkip) {
        msg('search empty', 'auto skip', '31m')

        skip()
        saveThenNext()
      } else {
        msg('search empty', '', '31m')
      }
      return
    }

    // 半自动查找规则
    if (autoSkip) {
      temp = items
        .filter((item, index) => index < 5)
        .sort((a, b) => a.title.length - b.title.length)
      if (temp.length) {
        let log
        let subjectId
        if (item.title.includes(temp[0].title)) {
          log = temp[0].title
          subjectId = temp[0].id
        } else if (temp[1] && item.title.includes(temp[1].title)) {
          log = temp[1].title
          subjectId = temp[1].id
        } else if (temp[2] && item.title.includes(temp[2].title)) {
          log = temp[2].title
          subjectId = temp[2].id
        }

        if (subjectId) {
          msg(
            'auto select',
            `[${
              items.findIndex((item) => item.id == subjectId) + 1
            }] ${subjectId} - ${log}`
          )
          temp = await subject(subjectId)

          if (
            (items.length > 1 && temp.info.includes('小说系列')) ||
            (items.length === 1 && temp.info.includes('小说'))
          ) {
            id = temp.id
            title = temp.title
            cover = temp.cover
            rank = temp.rank
            score = temp.score

            msg('auto save', temp.info)
            saveThenNext()
          } else if (autoSkip) {
            skip()
            saveThenNext()
          }
        } else if (autoSkip) {
          skip()
          saveThenNext()
        }
      }
    }
  }
  saveThenNext()

  while (true) {
    const command = String(await getLine()).trim()
    switch (command) {
      case 'o':
        opn(`${host}/subject_search/${encodeURIComponent(item.title)}?cat=1`)
        opn(`https://www.wenku8.net/book/${item.wid}.htm`)
        break

      case 'os':
        opn(`${host}/subject_search/${encodeURIComponent(item.title)}?cat=1`)
        break

      case 'ow':
        opn(`https://www.wenku8.net/book/${item.wid}.htm`)
        break

      case 'oo':
        opn(`https://bgm.tv/subject/${id}`)
        break

      case 'i':
        msg('open image', `https://lain.bgm.tv/pic/cover/l/${cover}.jpg`)
        opn(`https://lain.bgm.tv/pic/cover/l/${cover}.jpg`)
        break

      // 写入并查询下一个
      case 'c':
      case 'y':
        saveThenNext()
        break

      // 跳过并查询下一个, 下一次并不会自动选择
      case 'n':
        skip()
        saveThenNext()
        break

      case 's':
        save(true)
        break

      // 查询条目
      default:
        if (!command) {
          break
        }

        if (/^(\d| ){1,}$/.test(command)) {
          commands = command.split(' ').filter((item) => !!item)
          for (let i = 0; i < commands.length; i++) {
            if (
              !isNaN(Number(commands[i])) &&
              typeof Number(commands[i]) === 'number'
            ) {
              // 输入大于10的数字会直接认为是subjectId, 少于10认为是选择一个搜索项
              id =
                Number(commands[i]) > 10
                  ? Number(commands[i])
                  : Number(items[Number(commands[i]) - 1].id)
              temp = await subject(id)
              title = temp.title
              cover = temp.cover
              rank = temp.rank
              score = temp.score

              if (
                (commands.length > 1 && temp.info.includes('小说')) ||
                (commands.length === 1 &&
                  items.length <= 4 &&
                  temp.info.includes('小说')) ||
                (items.length > 1 && temp.info.includes('小说系列')) ||
                (items.length === 1 && temp.info.includes('小说'))
              ) {
                msg('auto save', temp.info)
                saveThenNext()
                break
              } else if (autoSkip) {
                skip()
                saveThenNext()
                break
              }
            }
          }
          break
        }

        items = await search(command)
        break
    }
  }
})()
