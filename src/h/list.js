/*
 * @Author: czy0729
 * @Date: 2021-06-23 04:55:32
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-23 06:00:40
 */
const utils = require('../utils')

const __raw = utils.root('data/h/raw.json')
const raw = utils.read(__raw)
const __list = utils.root('data/h/list.json')
const list = utils.read(__list)

async function run() {
  Object.keys(raw).forEach(idRaw => {
    const itemRaw = raw[idRaw]
    const isIn = list.some(itemList => itemList.id == idRaw)
    if (isIn) return

    list.push({
      ...itemRaw,
      bgm: ''
    })
  })

  utils.write(
    __list,
    list.sort((a, b) => a.title.localeCompare(b.title))
  )
  process.exit()
}
run()
