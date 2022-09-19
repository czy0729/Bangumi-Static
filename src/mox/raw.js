/*
 * @Author: czy0729
 * @Date: 2022-09-16 16:27:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-19 03:23:41
 */
const utils = require('../utils')

const __raw = utils.root('data/mox/raw.json')
const raw = utils.read(__raw)

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
  Cookie:
    '__stripe_mid=1ced561a-0278-4207-8b42-59c34cd0aa1be5f111; VOLSKEY=c0dcfec175bb09247dadd5c1af0524f8166334601610631172; Hm_lvt_032bfff3c38eeefc9db7c70d96d9cae4=1663316506,1663340832,1663362494,1663504910; VLIBSID=4rfa635k0hma7bm6rh154ni7ur; VOLSESS=1663528414; Hm_lpvt_032bfff3c38eeefc9db7c70d96d9cae4=1663528415'
}

async function run() {
  for (let i = 0; i <= 581; i += 1) {
    // 評價排名
    const url = `https://mox.moe/l/all,%E6%97%A5%E6%9C%AC,all,score,chn,all,BL,0,0/${i}.htm`

    // 最近收錄
    // const url = `https://mox.moe/l/all,%E6%97%A5%E6%9C%AC,all,newadd,chn,all,BL,0,0/${i}.htm`

    const html = await utils.fetch(url, headers)
    console.log(url)

    const $ = utils.cheerio(html)
    $('tr.listbg > td').each((index, element) => {
      const $item = utils.cheerio(element)
      const $a = $item.find('a').eq(1)
      const mid = $a.attr('href').split('/c/')[1].split('.htm')[0]

      if (!raw.find(item => item.mid == mid)) {
        raw.push({
          mid: $a.attr('href').split('/c/')[1].split('.htm')[0],
          title: $a.text().trim(),
          score: $item.find('b').text().trim(),
          author: $item.html().match(/\[(.+?)\]/)?.[1],
          ep: $item.find('.pagefoot').text().trim(),
          update: $item.find('.filesize').text().trim()
        })
        console.log(`push ${i}`)
      } else {
        // console.log(`skip ${i}`)
      }
    })

    if (i % 4 === 0) {
      utils.write(__raw, raw)
      console.log('write')
    }

    await sleep(2000)
  }

  utils.write(__raw, raw)
  process.exit()
}
run()

function sleep(ms = 800) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
