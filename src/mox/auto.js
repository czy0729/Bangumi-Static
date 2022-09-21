/*
 * @Author: czy0729
 * @Date: 2022-09-17 16:29:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-20 00:08:10
 */
const readline = require('readline')
const utils = require('../utils')

// root
const __detail = utils.root('data/mox/detail.json')
const __map = utils.root('data/mox/map.json')
const __searchTemp = utils.root('data/mox/search_temp.json')
const detail = utils.read(__detail) || {}
const map = utils.read(__map) || {}
const searchTemp = utils.read(__searchTemp) || {}

// config
const auto = false // 是否自动匹配
const skipLevel = 10 // 跳过级别
const isFromSub = false // 是否搜索子标题 (可以先设置为 false 跑完一遍再打开)

const headers = {
  referer: 'https://bgm.tv/subject_search/air?cat=all',
  cookie:
    'chii_sec_id=UbWhSkzVgWMCEAMVkRyXrW04%2BPftIpKVVfG6965j; chii_cookietime=2592000; chii_theme_choose=1; chii_theme=dark; prg_display_mode=normal; prg_list_mode=full; chii_auth=8m92d08nnEwIs5QW11vYBJyPmnpOBQqX9BwU70Lf6qkXMvKdD%2BTKjbHoQcaXalLXwF8YdCO2eLIXxXOkgOEtLuv06qd22BS3y1F%2F; __utmz=1.1663248419.1814.28.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; __utmc=1; __utma=1.825736922.1638495774.1663584548.1663598745.1853; chii_sid=5RBdhK; __utmt=1; chii_searchDateLine=1663603488; __utmb=1.142.10.1663598745',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
}

// other
let _fillLen = 10

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

async function run() {
  const maps = Object.keys(map).sort(
    (a, b) => Number(detail[b].hot) - Number(detail[a].hot)
  )
  for (let i = 0; i <= maps.length; i += 1) {
    const item = map[maps[i]] || {}
    if (item.id || item._skip >= skipLevel) {
      continue
    }

    const title = isFromSub
      ? clean(((item.sub || '').split(')')?.[1] || '').split(',')[0])
      : clean(item.title)
    if (!title) {
      continue
    }

    console.log(`\n================== ${i} / ${maps.length} ==================`)
    if (!auto) {
      log('mox.moe', `https://mox.moe/c/${maps[i]}.htm`)
      log(
        'search',
        `https://bgm.tv/subject_search/${encodeURIComponent(
          utils.toSimplifiedChar(title)
        )}?cat=1`
      )

      const sub = (item.sub || '').split(')')?.[1] || ''
      if (sub) {
        log(
          'search 2',
          `https://bgm.tv/subject_search/${encodeURIComponent(
            utils.toSimplifiedChar(sub)
          )}?cat=1`
        )
      }

      log(
        'author',
        `https://bgm.tv/mono_search/${utils.toSimplifiedChar(
          detail[maps[i]].author
        )}?cat=prsn`
      )
    }

    const { items, cache } = await search(title)
    let temp = items
      .filter((item, index) => index < 6)
      .sort((a, b) => {
        return (
          (b.title === title ? 99 : b.title.length) -
          (a.title === title ? 99 : a.title.length)
        )
      })

    if (auto) {
      if (temp.length) {
        let subjectId1
        let log1
        if (temp[0] && eq(title, temp[0].title)) {
          subjectId1 = temp[0].id
          log1 = temp[0].title
        }

        let subjectId2
        let log2
        if (temp[1] && eq(title, temp[1].title)) {
          subjectId2 = temp[1].id
          log2 = temp[1].title
        }

        if (subjectId1) {
          log(
            'auto select',
            `[${
              items.findIndex(item => item.id == subjectId1) + 1
            }] ${subjectId1} - ${log1}`
          )

          temp = await subject(subjectId1)
          if (
            (temp._hasVol && temp.info.includes('漫画系列')) ||
            (!temp._hasVol && temp.info.includes('漫画'))
          ) {
            merge(item, temp)
            log('merge', item, 1)
          } else {
            log('not matched 1', temp.info, 2)
            temp = null
          }

          if (!temp && subjectId2) {
            log(
              'auto select 2',
              `[${
                items.findIndex(item => item.id == subjectId2) + 1
              }] ${subjectId2} - ${log2}`,
              1
            )

            temp = await subject(subjectId2)
            if (temp.info.includes('漫画')) {
              merge(item, temp)
              log('merge 2', item, 1)
            } else {
              skip(item, 4)
              log('not matched 2', temp.info, 2)
            }
          } else {
            skip(item, 3)
          }
        } else {
          skip(item, 5)
          log('not matched 0', '', 2)
        }
      } else {
        skip(item, 10)
        log('empty', '', 2)
      }

      if (!cache) {
        write(i)
        await sleep()
      }
    } else {
      let subjectTemp
      while (1) {
        const command = String(await getLine()).trim()

        if (command === 'n') {
          skip(item, 99)
          subjectTemp = null
          break
        } else if (command === 's') {
          write()
        } else if (command === 'c') {
          merge(item, subjectTemp)
          subjectTemp = null
          log('merge', item, 1)
          break
        } else if (command) {
          if (/^(\d| ){1,}$/.test(command)) {
            const id = Number(command.split(' ').filter(item => !!item))
            if (!Number.isNaN(id)) {
              let subjectId
              if (id >= 10) {
                subjectId = id
              } else {
                const item = items[id - 1]
                if (item) subjectId = item.id
              }

              if (subjectId) {
                subjectTemp = await subject(subjectId)
                if (subjectTemp && subjectTemp.info.includes('漫画')) {
                  merge(item, subjectTemp)
                  subjectTemp = null
                  log('merge', item, 1)
                  break
                } else {
                  console.log(subjectTemp)
                }
              }
            }
          }
        }
      }
    }
  }

  write()
  process.exit()
}
run()

/** 搜索 */
async function search(keyword) {
  try {
    keyword = keyword.replace(/\!|\?|\/|／|\./g, '')

    if (Array.isArray(searchTemp[keyword])) {
      log('search temp', keyword)

      const items = searchTemp[keyword]
      if (!auto) {
        if (items.length) {
          items.forEach((item, index) => {
            const data = [
              `    [${index + 1}] ${item.id} - ${fill(
                item.title,
                undefined,
                '　'
              )}`
            ]
            if (!auto) data.push(`https://bgm.tv/subject/${item.id}`)
            console.log(...data)
          })
        } else {
          console.log(`    [0] 空`)
        }
      }

      return {
        items,
        cache: true
      }
    }

    log('search', keyword)
    const html = await utils.fetch(
      `https://bgm.tv/subject_search/${encodeURIComponent(keyword)}?cat=1`,
      headers
    )
    if (html.includes('秒内只能进行一次搜索')) {
      log('wait', '', 2)
      await sleep(3000)
      return search(keyword)
    }

    const $ = utils.cheerio(html)
    const items = (
      $('#browserItemList li h3 a.l')
        .map((index, element) => {
          const $row = utils.cheerio(element)
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

    searchTemp[keyword] = items
    items.forEach((item, index) =>
      console.log(`    [${index + 1}] ${item.id} - ${item.title}`)
    )
    console.log('\n')

    return {
      items,
      cache: false
    }
  } catch (error) {
    console.log(error)
    return search(keyword)
  }
}

/** 查询条目 */
async function subject(subjectId) {
  try {
    log('subject', subjectId)
    const html = await utils.fetch(`https://bgm.tv/subject/${subjectId}`, {
      cookie: headers.cookie,
      userAgent: headers.userAgent
    })

    const $ = utils.cheerio(html)
    const title = $('h1 a').text().trim()
    const info = String($('h1').text()).replace(/\r|\n/g, '')
    const cover = String($('#columnSubjectHomeA img').attr('src')).replace(
      /\/\/lain.bgm.tv\/pic\/cover\/c\/|.jpg/g,
      ''
    )
    let rank = $('small.alarm').text().trim().replace('#', '')
    rank = rank ? parseInt(rank) : ''

    let score = $('.global_score .number').text().trim()
    score = score ? parseFloat(parseFloat(score).toFixed(1)) : ''

    let total = $('.chart_desc small').text().trim()
    return {
      id: parseInt(subjectId),
      title,
      cover,
      rank,
      score,
      info,
      total,

      // html 里面有单行本块
      _hasVol: html.includes('>单行本<')
    }
  } catch (error) {
    return subject(subjectId)
  }
}

/** 停顿 */
function sleep(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 净化搜索关键词 */
function clean(str) {
  if (!str) return ''
  return utils
    .rmSpec(utils.toSimplifiedChar(String(str).trim()))
    .replace(/全彩版|简体|繁体/g, '')
}

/** 认为是匹配命中 */
function eq(a, b) {
  const _a = clean(a)
    .toLocaleUpperCase()
    .replace(/\.|。|·| |-|之|の|的/g, '')
  const _b = clean(b)
    .toLocaleUpperCase()
    .replace(/\.|。|·| |-|之|の|的/g, '')

  const flag = _a.includes(_b)
  log('eq', `${_a}, ${_b}, ${_a.includes(_b)}`)
  if (flag) return true

  const rate = utils.similar(_a, _b)
  log('rate', `${_a}, ${_b}, ${rate}`, undefined, true)
  if (rate >= 0.6) return true

  return false
}

/** 合并数据 */
function merge(item, temp) {
  item.id = temp.id
  item._title = temp.title
  item._cover = temp.cover
  item._rank = temp.rank
  item._score = temp.score
  item._total = temp.total

  // 删除过期数据
  delete item._id
  delete item._skip
}

/** 跳过标记 */
function skip(item, val = 2) {
  item._skip = val
}

/** 补长 */
function fill(str, len = 10, mark = ' ') {
  if (str?.length > _fillLen) _fillLen = str.length

  let _str = str
  if (_str.length > _fillLen) return _str

  for (let i = _str.length; i < (len || _fillLen); i += 1) _str += mark
  return _str
}

/** 打印 */
function log(label, info, type, needReturn) {
  let _type = ' '
  if (type === 1) {
    _type = 'O'
  } else if (type === 2) {
    _type = 'X'
  }

  const arr = [_type, `【${fill(label)}】`, info]
  if (needReturn) arr.push('\n')

  console.log(...arr)
}

/** 写入 */
function write(i) {
  let flag
  if (i === undefined) flag = true

  if (flag || (i && i % 20 === 0)) {
    utils.write(__map, map)
    log('write', i, 1)
    console.log('========================================')
  }

  if (flag || (i && i % 50 === 0)) {
    utils.write(__searchTemp, searchTemp)
  }
}
