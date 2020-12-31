/*
 * @Author: czy0729
 * @Date: 2020-12-31 11:58:22
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-12-31 21:53:58
 */
const utils = require('../utils')

const isAuto = process.argv.includes('--auto')
const __detail = '../../data/manhuadb/detail.json'
const detail = utils.read(__detail)

const idsDetail = Object.keys(detail)
let loading
let rlManhuaId = 0
let rlQ = ''
let rlItems = []
let rlItem = {}
let confirmNum = 0
let autoSkipNum = 0

async function run() {
  next()

  while (1) {
    const command = String(await utils.getLine()).trim()
    if (!command || command === 'undefined') {
      continue
    }

    // 半自动不接受退出和保存以外的命令
    // if (isAuto && !['q', 's', 'qs'].includes(command)) {
    //   continue
    // }

    switch (command) {
      case 'o':
        utils.open(`https://www.manhuadb.com/manhua/${rlManhuaId}`)
        if (rlItem.id) {
          utils.open(`https://bgm.tv/subject/${rlItem.id}`)
        } else {
          utils.open(`https://bgm.tv/subject_search/${encodeURIComponent(rlQ)}?cat=1`)
        }
        break

      case 'c':
      case 'y':
        doConfirm()
        next()
        break

      case 'n':
        doSkip()
        next()
        break

      case 's':
        doSave()
        loading.info('【save】')
        break

      case 'q':
        loading.info('【done】')
        process.exit()
        break

      case 'qs':
        doSave()
        loading.info('【save && done】')
        process.exit()
        break

      default:
        if (/^(\d| ){1,}$/.test(command)) {
          if (Number(command) >= 20) {
          } else {
            const index = Number(command - 1)
            rlItem = rlItems[index]
            const { info } = await subject(rlItems[index])
            info.includes('漫画') ? loading.info(info) : loading.warn(info)
          }
        }
        break
    }
  }
}
run()

async function next() {
  if (!idsDetail.length) {
    return
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

  // 搜索
  console.log('\n')
  rlItems = await search(itemDetail)
  if (!rlItems.length) {
    loading.info('【search empty】')

    if (!isAuto) {
      return
    }
  }

  // 打印选项
  rlItems.forEach((item, index) => {
    console.log(` [${index + 1}] ${item.id} - ${item.title}`)
  })

  // 半自动逻辑
  if (isAuto) {
    // 查找与搜索关键字一模一样的项
    const findIndex = rlItems.findIndex((item) => rlQ === item.title)
    if (findIndex === -1) {
      doAutoSkip()
      return next()
    }

    loading.succeed(`【auto selected】 [${findIndex + 1}]`)
    rlItem = rlItems[findIndex]

    const { info, seriesId } = await subject(rlItem)

    // 非漫画或者漫画系列跳过
    if (!info.includes('漫画')) {
      doAutoSkip()
      return next()
    }

    // 漫画系列直接提交
    if (info.includes('漫画系列')) {
      loading.succeed(`【漫画系列】 ${info}`)
      doConfirm()
      return next()
    }

    // 漫画需要判断是不是单行本, 若页面关联没有项, 直接提交
    if (!seriesId) {
      loading.succeed(`【独立漫画】 ${rlItem.id} ${info}`)
      doConfirm()
      return next()
    }

    // 关联里面发现系列, 使用系列id再请求详情
    loading.info(`【查询系列】 ${seriesId} ${info}`)
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
  try {
    const q = (itemDetail.cn || itemDetail.jp || itemDetail.title)
      .split(' / ')[0]
      .replace(/\!|\?|\/|／|\.|官方漫画|漫画/g, '')
    loading = utils.loading(`【search】 ${q} / ${itemDetail.author}`)
    rlQ = q

    const url = `https://bgm.tv/subject_search/${encodeURIComponent(q)}?cat=1`
    const data = await utils.fetch(url, utils.headers)
    loading.info()

    const $ = utils.cheerio(data)
    return (
      $('#browserItemList li h3 a.l')
        .map((index, element) => {
          const $row = utils.cheerio(element)
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
  } catch (ex) {
    await loading.fail(String(ex))
    return search(q)
  }
}

async function subject(itemSearch) {
  try {
    loading = utils.loading(`【subject】 ${itemSearch.id} - ${itemSearch.title}`)

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
      seriesId,
    }
  } catch (ex) {
    await loading.fail(String(ex))
    return subject(itemSearch)
  }
}

function doConfirm() {
  detail[rlManhuaId].id = rlItem.id
  loading.succeed(JSON.stringify(detail[rlManhuaId], null, 2))

  confirmNum += 1
  if (confirmNum % 10 === 0) {
    doSave()
    loading.info('【auto save】')
  }
}

function doSkip() {
  detail[rlManhuaId]._unmatched = 1
}

function doAutoSkip() {
  detail[rlManhuaId]._autoskip = 1
  loading.fail('【skip】')

  autoSkipNum += 1
  if (autoSkipNum % 10 === 0) {
    doSave()
    loading.info('【auto save】')
  }
}

function doSave() {
  utils.write(__detail, detail)
}
