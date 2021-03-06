/*
 * 标记18x条目
 *  - 不登陆遍历索引, 把空封面和地址等于/img/no_icon_subject.png的条目标记起来
 *  - 使用按日期排序https://bgm.tv/anime/browser/?sort=date&page=2, 可以减少以后更新的遍历次数
 *  - 通常只有动画, 书籍, 游戏有18x内容
 *  - 动画18x索引完整, 书籍和游戏因为超过1000页, 只索引到2种排序的范围
 *
 * @Author: czy0729
 * @Date: 2020-05-18 12:13:16
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-02-01 18:07:54
 */
const axios = require('axios')
const fs = require('fs')
const cheerio = require('./utils/cheerio')
const utils = require('./utils/utils')

axios.defaults.timeout = 8000

run()

/**
 * 其实最多只能查到前999页
 * anime 737
 * book 7479
 *  - comic 111
 * game 1370
 */
async function run() {
  const type = 'game'
  const sort = 'rank'

  const filePath = `./data/18x/${type}.json`
  const data = JSON.parse(fs.readFileSync(filePath))
  let titles = []
  for (let page = data.page || 0; page < 216; page++) {
    const url =
      type === 'comic'
        ? `https://bgm.tv/book/browser/comic/?sort=rank&page=${page}`
        : `https://bgm.tv/${type}/browser/?sort=${sort}&page=${page}`

    let html
    try {
      const { data } = await axios({
        url
      })
      html = data
    } catch (error) {
      const { data } = await axios({
        url
      })
      html = data
    }

    const $ = utils.cheerio(html)
    $('li.item').map((index, element) => {
      const $row = utils.cheerio(element)
      const src = $row.find('img').attr('src')
      if (src === '/img/no_icon_subject.png') {
        const id = $row.attr('id').replace('item_', '')
        titles.push(`[${id}] ${$row.find('h3 a.l').text()}`)
        data[id] = ''
      }
    })

    data.page = page - 1
    fs.writeFileSync(filePath, JSON.stringify(data))

    console.log(
      `- fetching ${url}`,
      Object.keys(data).length,
      titles.join('\n')
    )
    titles = []
  }
}
