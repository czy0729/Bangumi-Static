/*
 * 从 https://bookwalker.jp 中查找到文库的标签
 *  - https://bookwalker.jp/search/?word=雲のむこう、約束の場所&order=score&detail=1
 *
 * @Author: czy0729
 * @Date: 2020-09-04 10:34:57
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-09-04 17:41:22
 */
const fs = require('fs')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const readline = require('readline')
const opn = require('opn')
const ora = require('ora')

axios.defaults.timeout = 6000

// 固定配置
const wenkuPath = './data/wenku8/wenku.json'
const wenkuData = JSON.parse(fs.readFileSync(wenkuPath)).filter(
  (item) => !('tags' in item)
)
let wenkuTagsData = {}

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

let spinner
let url
let items = []
let item = {}
let tags = ''

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

function next() {
  return wenkuData.shift()
}

function skip() {
  spinner.warn(`skip ${item.jp || item.cn}`)
  wenkuTagsData[item.id] = ''
  save()
}

/**
 * 写入保存
 */
let _save = 0
function save(immediate) {
  _save = immediate ? 10 : 1
  if (_save % 10 === 0) {
    spinner.succeed('save')
    const data = JSON.parse(fs.readFileSync(wenkuPath))
    Object.keys(wenkuTagsData).forEach((id) => {
      const tags = wenkuTagsData[id]
      const index = data.findIndex((i) => i.id == id)
      data[index].tags = tags || ''
    })

    wenkuTagsData = {}
    fs.writeFileSync(wenkuPath, JSON.stringify(data, null, 2))
  }
  reset()
}

function reset() {
  items = []
  item = {}
  tags = ''
}

async function search(keyword = '') {
  try {
    url = `https://bookwalker.jp/search/?word=${encodeURIComponent(
      keyword
    )}&order=score&detail=1`
    const { data: html } = await axios({ url })
    spinner.succeed()

    const $ = cheerio(htmlTrim(html))
    const items =
      $('.detailbookItem')
        .map((index, element) => {
          const $row = cheerio(element)
          return {
            title: $row.find('h2').text().trim(),
            writer: $row.find('.writerDl').text().trim(),
            tags: (
              $row
                .find('.genleDl dd')
                .map((i, e) => {
                  const $dd = cheerio(e)
                  return $dd.text().trim()
                })
                .get() || []
            ).join(' '),
          }
        })
        .get() || []
    items
      .filter((item, index) => index < 5)
      .sort((a, b) => (a.tags.includes('ライトノベル') ? 1 : 0))
      .forEach((item, index) =>
        console.log(
          ` [${index + 1}] ${item.title} | ${item.writer} | ${item.tags} `
        )
      )
    return items
  } catch (ex) {
    if (String(ex).includes('code 404')) {
      await spinner.fail('code 404')
      return []
    }

    await spinner.fail(String(ex))
    return search(keyword)
  }
}

;(async function () {
  const saveThenNext = async () => {
    if (tags) {
      wenkuTagsData[item.id] = tags
      spinner.succeed(`confirm ${item.id} | ${item.cn || item.jp} | ${tags}`)
      save()
    }
    console.log('\n')

    item = next()
    const keyword = item.jp || item.cn
    spinner = ora(`search ${keyword} ${item.author} ${item.cate}`).start()
    items = await search(keyword)
    if (!items.length) {
      skip()
      saveThenNext()
    }
  }
  saveThenNext()

  while (true) {
    const command = String(await getLine()).trim()
    switch (command) {
      case 'o':
        opn(url)
        opn(`https://www.wenku8.net/book/${item.wid}.htm`)
        break

      case 'c':
        saveThenNext()
        break

      case 'n':
        skip()
        saveThenNext()
        break

      case 's':
        save(true)
        break

      case 'q':
        process.exit(0)
        break

      default:
        if (!command) {
          break
        }

        if (/^(\d| ){1,}$/.test(command)) {
          if (items[parseInt(command) - 1]) {
            tags = items[parseInt(command) - 1].tags
            saveThenNext()
            break
          }
        }

        items = await search(command)
        break
    }
  }
})()
