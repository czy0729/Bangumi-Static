/*
 * 文库8 => bangumi 条目对应关系爬爬
 *  - 支持全自动匹配大部分条目
 *  - 半自动手动匹配余下条目
 *
 * @Author: czy0729
 * @Date: 2020-08-03 09:55:03
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-15 20:34:01
 */
const fs = require('fs')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const utils = require('./utils/utils')
const readline = require('readline')
const opn = require('opn')
const ora = require('ora')
const ncp = require('copy-paste')

axios.defaults.timeout = 3000

// 配置
const autoSkip = false // 是否开启全自动
const host = 'https://bgm.tv'
const headers = {
  Host: host.split('//')[1],
  Cookie:
    'chii_sec_id=UbWhSkzVgWMCEAMVkRyXrW04%2BPftIpKVVfG6965j; chii_cookietime=2592000; chii_theme_choose=1; chii_theme=dark; prg_display_mode=normal; prg_list_mode=full; chii_auth=8m92d08nnEwIs5QW11vYBJyPmnpOBQqX9BwU70Lf6qkXMvKdD%2BTKjbHoQcaXalLXwF8YdCO2eLIXxXOkgOEtLuv06qd22BS3y1F%2F; __utmz=1.1662831581.1779.27.utmcsr=tongji.baidu.com|utmccn=(referral)|utmcmd=referral|utmcct=/; __utmc=1; chii_sid=Uj56yb; __utma=1.825736922.1638495774.1663234883.1663239961.1811; __utmt=1; __utmb=1.3.10.1663239961',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
}

// 固定配置
const __config = './data/wenku8/deprecated/config.json'
const __raw = './data/wenku8/deprecated/raw.json'
const __data = './data/wenku8/deprecated/data.json'

const config = JSON.parse(fs.readFileSync(__config))
const raw = JSON.parse(fs.readFileSync(__raw))
const data = JSON.parse(fs.readFileSync(__data))

const rawArr = Object.keys(raw)
  .map(key => raw[key])
  .reverse()

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
let spinner

/** cheerio */
function cheerio(target) {
  return typeof target === 'string'
    ? cheerioRN.load(target, undefined, undefined, {
        decodeEntities: false
      })
    : cheerioRN(target, undefined, undefined, {
        decodeEntities: false
      })
}

/** 睡眠 */
function sleep(ms = 1200) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

/** 获取键盘输入命令 */
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

/** 跳过并写入 */
function skip() {
  console.log(`skip ${item.title}`)
  // spinner.warn(`skip ${item.title}`)

  config.skip[item.wid] = item
  delete raw[item.wid]

  save()
}

/** 写入保存 */
let _save = 0
function save(immediate) {
  if (immediate) {
    _save = 10
  } else {
    _save += 1
  }

  if (_save % 10 === 0) {
    console.log(
      `save skip: ${Object.keys(config.skip).length}, raw: ${
        Object.keys(raw).length
      }, data: ${Object.keys(data).length}`
    )
    // spinner.succeed(`save skip: ${Object.keys(config.skip).length}, raw: ${
    //   Object.keys(raw).length
    // }, data: ${Object.keys(data).length}`)

    fs.writeFileSync(__config, JSON.stringify(config, null, 2))
    fs.writeFileSync(__raw, JSON.stringify(raw))
    fs.writeFileSync(__data, JSON.stringify(data, null, 2))
  }

  reset()
}

/** 写入成功后重置临时变量 */
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

function log(item = {}) {
  console.log(`search empty ${item.author}`)
  console.log(`https://www.wenku8.net/book/${item.wid}.htm`)
  console.log(`https://bgm.tv/subject_search/${item.title}?cat=1`)
  console.log(`https://bgm.tv/mono_search/${item.author}?cat=prsn`)
  console.log(`https://baike.baidu.com/item/${item.title}`)
  console.log(`https://fsoufsou.com/search?q=${item.title}`)
  console.log(`https://www.lightnovel.us/cn/search?keywords=${item.title}`)
}

/** Bangumi搜索 */
async function search(keyword) {
  try {
    console.log('\n')
    keyword = keyword.replace(/\!|\?|\/|／|\.|官方小说/g, '')

    console.log(`search ${keyword}`)
    // spinner = ora(`search ${keyword}`).start()
    const { data: html } = await axios({
      url: `${host}/subject_search/${encodeURIComponent(keyword)}?cat=1`,
      headers
    })
    // spinner.succeed()

    const $ = cheerio(html)
    const items = (
      $('#browserItemList li h3 a.l')
        .map((index, element) => {
          const $row = cheerio(element)
          return {
            id: $row.attr('href').replace('/subject/', ''),
            title: $row.text().trim()
          }
        })
        .get() || []
    ).filter(
      item =>
        !(
          (item.title.includes('<') && item.title.includes('>')) ||
          (item.title.includes('〈') && item.title.includes('〉')) ||
          (item.title.includes('第') && item.title.includes('卷'))
        )
    )

    items.forEach((item, index) =>
      console.log(` [${index + 1}] ${item.id} - ${item.title}`)
    )
    return items
  } catch (error) {
    console.log(String(error))
    // await spinner.fail(String(error))
    return search(keyword)
  }
}

/** 获取下一个原始数据 */
function next() {
  return rawArr.shift()
}

/** Bangumi 查询条目 */
async function subject(subjectId) {
  const url = `${host}/subject/${subjectId}`
  console.log(`fetch subject ${url}`)
  // spinner.info(`fetch subject ${url}`)

  try {
    console.log(`search ${subjectId}`)
    // spinner = ora(`search ${subjectId}`).start()
    const { data: html } = await axios({
      url,
      headers
    })
    console.log('success')
    // spinner.succeed()

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

    console.log(info)
    // info.includes('小说') ? spinner.succeed(info) : spinner.warn(info)
    return {
      id: parseInt(subjectId),
      title,
      cover,
      rank,
      score,
      info
    }
  } catch (error) {
    console.log(String(error))
    // await spinner.fail(String(error))
    return subject(subjectId)
  }
}

/** 爬爬 */
;(async function () {
  const saveThenNext = async () => {
    if (autoSkip) {
      await sleep()
    }

    // 递归, 有id则保存
    if (id) {
      data[id] = {
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
        anime: item.anime
      }
      if (data[id].title === data[id].w) {
        delete data[id].w
      }

      console.log(`confirm ${JSON.stringify(data[id], null, 2)}`)
      // spinner.succeed(`confirm ${JSON.stringify(data[id], null, 2)}`)
      delete raw[item.wid]

      save()
    }

    // 执行下一次循环
    item = next()
    items = await search(item.title)

    if (!items.length) {
      if (autoSkip) {
        // spinner.warn(`search empty ${item.author}`)
        console.log(`search empty ${item.author}`)
        skip()
        saveThenNext()
      } else {
        // spinner.warn(`search empty ${item.author}`)
        log(item)
        ncp.copy(item.title)
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
          console.log(
            `auto select [${
              items.findIndex(item => item.id == subjectId) + 1
            }] ${subjectId} - ${log}`
          )
          // spinner.info(`auto select [${
          //   items.findIndex((item) => item.id == subjectId) + 1
          // }] ${subjectId} - ${log}`)
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

            console.log(`auto save ${temp.info}`)
            // spinner.info(`auto save ${temp.info}`)
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
        log(item)
        break

      case 'os':
        console.log(
          `${host}/subject_search/${encodeURIComponent(item.title)}?cat=1`
        )
        break

      case 'ow':
        console.log(`https://www.wenku8.net/book/${item.wid}.htm`)
        break

      case 'oo':
        console.log(`https://bgm.tv/subject/${id}`)
        break

      case 'oa':
        console.log(`https://bgm.tv/mono_search/${item.author}?cat=prsn`)
        break

      case 'ob':
        console.log(`https://baike.baidu.com/item/${item.title}`)
        break

      case 'i':
        console.log(`https://lain.bgm.tv/pic/cover/l/${cover}.jpg`)
        // spinner.info(`https://lain.bgm.tv/pic/cover/l/${cover}.jpg`)
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
          commands = command.split(' ').filter(item => !!item)
          for (let i = 0; i < commands.length; i++) {
            if (
              !isNaN(Number(commands[i])) &&
              typeof Number(commands[i]) === 'number'
            ) {
              // 输入大于10的数字会直接认为是subjectId, 少于10认为是选择一个搜索项
              id =
                Number(commands[i]) > 10
                  ? Number(commands[i])
                  : Number(
                      items[Number(commands[i]) - 1] &&
                        items[Number(commands[i]) - 1].id
                    )
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
                console.log(`auto save ${temp.info}`)
                // spinner.info(`auto save ${temp.info}`)
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
