/*
 * @Author: czy0729
 * @Date: 2021-06-24 12:16:12
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-25 02:07:31
 */
const utils = require('../utils')

const host = 'https://hanime1.me'

async function run() {
  console.log('running...')

  while (1) {
    const command = String(await utils.getLine()).trim()
    if (!command || command === 'undefined') {
      continue
    }

    switch (command) {
      default:
        if (/^(\d| ){1,}$/.test(command)) {
          const url = `${host}/watch?v=${command}`
          const data = await utils.fetch(url)
          const $ = utils.cheerio(data)
          const q = $('title').text().trim().replace('OVA ', '').split(' ')[0].slice(0, 10)
          utils.open(`https://bgm.tv/subject_search/${encodeURIComponent(q)}?cat=2`)
        }
        break
    }
  }
}
run()
