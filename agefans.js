/*
 * https://www.agefans.tv/catalog/all-all-all-all-all-time-1-日本-all-all
 *
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-07-14 20:08:11
 */
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerioRN = require('cheerio-without-node-native')
const bangumiData = require('bangumi-data')

function cheerio(target) {
  return (
    typeof target === 'string' ? cheerioRN.load(target, undefined, undefined, {
      decodeEntities: false
    }) : cheerioRN(target, undefined, undefined, {
      decodeEntities: false
    })
  )
}

function htmlTrim(str) {
  return str
    .replace(/(\n+)|(<!--.*?-->)|(\/\*.*?\*\/)|/ig, '')
    .replace(/[ ]+</ig, '<')
}

function matchInfo(html, keywords) {
  return keywords.map(keyword => {
    const reg = new RegExp(`<span class="cell_imform_tag">${keyword}：</span><span class="cell_imform_value">(.+?)</span>`)
    const match = html.match(reg)
    return match ? String(match[1]).trim() : ''
  })
}

async function run() {
  const config = JSON.parse(fs.readFileSync('./data/agefans/config.json'))
  const data = JSON.parse(fs.readFileSync('./data/agefans/raw.json'))

  for (let page = config._page; page <= 90; page++) {
    const url = `https://www.agefans.tv/catalog/all-all-all-all-all-time-${page}-${encodeURIComponent('日本')}-all-all`
    const { data: html } = await axios({
      url,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
      }
    })

    console.log(url)
    if (html.includes('ipchk:操作太频繁')) {
      throw new Error(html)
    }

    const $ = cheerio(html)
    $('div.cell').map((index, element) => {
      const $row = cheerio(element)
      const id = parseInt($row.find('a.cell_poster').attr('href').replace('/detail/', ''))
      if (!id) return

      const cn = $row.find('a.cell_poster img').attr('alt').trim()
      const ep = $row.find('span.newname').text().trim()
      const htmlInfo = htmlTrim($row.find('div.cell_imform_kvs').html().trim())
      const [type, jp, begin, status, tags, official] = matchInfo(htmlInfo, ['动画种类', '原版名称', '首播时间', '播放状态', '剧情类型', '制作公司'])
      data[id] = {
        id,
        cn,
        ep,
        type,
        jp,
        begin,
        status,
        tags,
        official,
        area: 'jp'
      }
    })

    fs.writeFileSync(
      './data/agefans/raw.json',
      JSON.stringify(data)
    )

    config._page = page
    fs.writeFileSync(
      './data/agefans/config.json',
      JSON.stringify(config)
    )
  }
}

run()

      // 查找bgmId
      // let bgmId = 0
      // const bangumiDataItem = bangumiData.items.find(item => {
      //   let bool = item.title === jp
      //   if (!bool) {
      //     bool = !!(item.titleTranslate
      //       && item.titleTranslate['zh-Hans']
      //       && item.titleTranslate['zh-Hans'].find(zh => zh === cn || zh === jp))
      //   }
      //   if (!bool) {

      //   }

      //   return bool
      // })
      // if (bangumiDataItem) {
      //   const site = bangumiDataItem.sites.find(site => site.site === 'bangumi')
      //   if (site) bgmId = parseInt(site.id)
      // }
