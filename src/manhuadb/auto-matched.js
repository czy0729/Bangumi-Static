/*
 * manhuadb与bgm数据映射
 *
 * - node auto-matched
 *   --auto             自动匹配, 命中标题和作者, 且是漫画系列, 主动提交
 *   --auto --no-skip   自动匹配, 一旦命中标题和作者, 不跳过变成手动判断
 *   --unmatched        ep中若带短篇, 直接标记为不匹配, 用于过滤manhuadb没版号的漫画
 *   无参数              手动匹配
 *
 * 通常按这个顺序各跑一次完成整个匹配流程
 *   --auto => --auto --no-skip => --auto --unmatched => 无参数
 *
 * @Author: czy0729
 * @Date: 2020-12-31 11:58:22
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-05 15:33:05
 */

const utils = require('../utils')

const isAuto = process.argv.includes('--auto')
const isNoSkip = process.argv.includes('--no-skip')
const isAutoUnmatched = process.argv.includes('--unmatched')

const __detail = utils.root('data/manhuadb/detail.json')
const detail = utils.read(__detail)

const idsDetail = Object.keys(detail)
console.log(idsDetail.length)

let loading
let rlManhuaId = 0
let rlQ = ''
let rlItems = []
let rlItem = {}
let confirmNum = 0
let skipNum = 0

async function run() {
  next()

  while (1) {
    const command = String(await utils.getLine()).trim()
    if (!command || command === 'undefined') {
      continue
    }

    switch (command) {
      case 'o':
        utils.open(`https://www.manhuadb.com/manhua/${rlManhuaId}`)
        break

      case 'a':
      case 'oa':
        utils.open(
          `https://bgm.tv/mono_search/${encodeURIComponent(
            detail[rlManhuaId].author
          )}?cat=prsn`
        )
        break

      case 'b':
      case 'ob':
        if (rlItem.id) {
          utils.open(`https://bgm.tv/subject/${rlItem.id}`)
        } else {
          utils.open(
            `https://bgm.tv/subject_search/${encodeURIComponent(rlQ)}?cat=1`
          )
        }
        break

      case 'k':
      case 'ok':
        utils.open(`https://baike.baidu.com/item/${encodeURIComponent(rlQ)}`)
        break

      case 'oo':
        if (rlItem.id) {
          utils.open(`https://bgm.tv/subject/${rlItem.id}`)
        } else {
          utils.open(
            `https://bgm.tv/subject_search/${encodeURIComponent(rlQ)}?cat=1`
          )
        }
        utils.open(`https://www.manhuadb.com/manhua/${rlManhuaId}`)
        break

      case 'c':
      case 'y':
        doConfirm()
        next()
        break

      case "'":
      case '.':
      case 'n':
        doSkip()
        next()
        break

      case 'q':
        loading.info('[done]')
        return process.exit()

      case 's':
        doSave()
        loading.info('[save]')
        break

      case 'qs':
        doSave()
        loading.info('[save && done]')
        return process.exit()

      default:
        if (/^(\d| ){1,}$/.test(command)) {
          if (Number(command) >= 20) {
            rlItem.id = command
          } else {
            const index = Number(command - 1)
            rlItem = rlItems[index]
          }

          const { info } = await subject(rlItem)
          info.includes('漫画') ? loading.info(info) : loading.warn(info)
          if (info.includes('漫画系列')) {
            doConfirm()
            next()
          }
        }
        break
    }
  }
}
run()

async function next() {
  if (!idsDetail.length) {
    doSave()
    return process.exit()
  }

  // 清空旧结果
  rlManhuaId = 0
  rlQ = ''
  rlItems = []
  rlItem = {}

  // 取一项
  const idDetail = idsDetail.pop()
  rlManhuaId = idDetail

  const itemDetail = detail[idDetail]
  if (itemDetail._unmatched || idDetail != itemDetail.id) {
    return next()
  }

  if (isAuto && itemDetail._autoskip) {
    return next()
  }

  // --unmatched, 若ep存在短篇自动unmatched
  if (
    isAutoUnmatched &&
    (detail[rlManhuaId].ep.includes('短篇') ||
      detail[rlManhuaId].ep.includes('全一') ||
      detail[rlManhuaId].ep.includes('第001'))
  ) {
    loading ? loading.info('[跳过短篇]') : console.log('[跳过短篇]')
    doSkip()
    return next()
  }

  // 搜索
  console.log('\n')
  rlItems = await search(itemDetail)
  if (!rlItems.length) {
    loading.info('[search empty]')

    if (detail[rlManhuaId].ep === '短篇') {
      doSkip()
      return next()
    }

    if (!isAuto) {
      return utils.open(`https://www.manhuadb.com/manhua/${rlManhuaId}`)
    }
  }

  // 打印选项
  rlItems.forEach((item, index) => {
    console.log(` [${index + 1}] ${item.id} - ${item.title} / ${item.tip}`)
  })

  // 半自动逻辑
  if (isAuto) {
    // 查找与搜索关键字一模一样的项
    let findIndex = rlItems.findIndex(item => {
      if (
        rlQ.toLowerCase() === utils.toSimplifiedChar(item.title).toLowerCase()
      ) {
        loading.succeed('[标题命中]')
        return 1
      }
      return 0
    })

    if (findIndex === -1) {
      findIndex = rlItems.findIndex(item => {
        let flag
        utils
          .toSimplifiedChar(detail[rlManhuaId].author)
          .split(' ')
          .filter(item => !!item)
          .forEach(author => {
            if (item.tip.includes(author)) {
              flag = 1
              loading.succeed('[作者命中]')
            }
          })
        return flag
      })
    }

    if (findIndex === -1) {
      // 不跳过模式下, 还要比较标题相似度, > 60% 可以认为是命中
      let flagSimilar
      if (isNoSkip) {
        let findIndex = rlItems.findIndex((item, index) => {
          const l = rlQ.toLowerCase().replace(/(^\s*)|(\s*$)/g, '')
          const r = utils
            .toSimplifiedChar(item.title)
            .toLowerCase()
            .replace(/(^\s*)|(\s*$)/g, '')
          const percent = utils.similar(l, r)
          if (percent >= 0.5) {
            flagSimilar = 1
            loading.succeed(
              `[相似命中] [${index + 1}] ${percent * 100}% ${l} <=> ${r}`
            )
            return 1
          }

          if (l.includes(r)) {
            flagSimilar = 1
            loading.succeed(`[相似命中] [${index + 1}] include`)
            return 1
          }

          return 0
        })
      }

      if (flagSimilar) {
        return
      }

      doAutoSkip()
      return next()
    }

    loading.succeed(`[auto selected] [${findIndex + 1}]`)
    rlItem = rlItems[findIndex]

    const { info, seriesId } = await subject(rlItem)

    // 非漫画或者漫画系列跳过
    if (!info.includes('漫画')) {
      if (!isNoSkip) {
        doAutoSkip()
        return next()
      }
      return
    }

    // 漫画系列直接提交
    if (info.includes('漫画系列')) {
      loading.succeed(`[漫画系列] ${info}`)
      doConfirm()
      return next()
    }

    // 漫画需要判断是不是单行本, 若页面关联没有项, 直接提交
    if (!seriesId) {
      loading.succeed(`[独立漫画] ${rlItem.id} ${info}`)
      doConfirm()
      return next()
    }

    // 关联里面发现系列, 使用系列id再请求详情
    loading.info(`[查询系列] ${seriesId} ${info}`)
    rlItem.id = seriesId
    const { info: seriesInfo } = await subject(rlItem)

    // 再次请求的系列id不是漫画系列, 抛弃 (这里待优化)
    if (!seriesInfo.includes('漫画系列')) {
      doAutoSkip()
      return next()
    }

    // 漫画系列提交
    doConfirm()
    return next()
  }
}

async function search(itemDetail) {
  const q = utils.toSimplifiedChar(
    (itemDetail.cn || itemDetail.jp || itemDetail.title)
      .split(' / ')[0]
      .replace(/\!|\?|\/|／|\.|官方漫画|漫画/g, '')
  )
  loading = utils.loading(
    `[search] ${q} / ${itemDetail.author}${
      itemDetail.jp ? ` / ${itemDetail.jp}` : ''
    }`
  )
  rlQ = q

  const url = `https://bgm.tv/subject_search/${encodeURIComponent(q)}?cat=1`
  const data = await utils.fetch(url, {
    'User-Agent': `Chrome/83.0.4103.97 Safari/537.36 ${utils.getTimestamp()}`
  })
  loading.info()

  const $ = utils.cheerio(data)
  return (
    $('#browserItemList li.item')
      .map((index, element) => {
        const $row = utils.cheerio(element)
        const $a = $row.find(' h3 a.l')
        const tips = $row.find('p.info').text().trim().split(' / ')
        return {
          id: $a.attr('href').replace('/subject/', ''),
          title: $a.text().trim(),
          tip: utils.toSimplifiedChar(`${tips[1] ? tips[1] : ''} ${tips[0]}`)
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
}

async function subject(itemSearch) {
  loading = utils.loading(`[subject] ${itemSearch.id} - ${itemSearch.title}`)

  const url = `https://bgm.tv/subject/${itemSearch.id}`
  const data = await utils.fetch(url, utils.headers)
  loading.info()

  const $ = utils.cheerio(data)
  const info = $('h1').text().replace(/\r|\n/g, '')

  let seriesId
  $('div.content_inner > ul.browserCoverMedium > li').each((index, element) => {
    const $row = utils.cheerio(element)
    const type = $row.find('span.sub').text()
    if (type === '系列') {
      const href = $row.find('a.title').attr('href')
      seriesId = Number(href.substring(href.lastIndexOf('/') + 1))
    }
  })

  return {
    info,
    seriesId
  }
}

function doConfirm() {
  detail[rlManhuaId].id = rlItem.id
  loading.succeed(JSON.stringify(detail[rlManhuaId], null, 2))

  confirmNum += 1
  if (confirmNum % 10 === 0) {
    doSave()
  }
}

function doSkip() {
  detail[rlManhuaId]._unmatched = 1

  skipNum += 1
  if (skipNum % 10 === 0) {
    doSave()
  }
}

function doAutoSkip() {
  detail[rlManhuaId]._autoskip = 1
  loading.fail('[skip]')

  skipNum += 1
  if (skipNum % 10 === 0) {
    doSave()
  }
}

function doSave() {
  utils.write(__detail, detail)

  let undo = 0
  let unmatched = 0
  Object.keys(detail).forEach(id => {
    const item = detail[id]
    if (item._unmatched) {
      unmatched += 1
    } else {
      undo += 1
    }
  })

  loading.info(
    `[auto save]confirm:${confirmNum} skip:${skipNum} undo:${undo} unmatched:${unmatched}`
  )
}