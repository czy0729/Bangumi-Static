/*
 * @Author: czy0729
 * @Date: 2020-04-05 03:20:34
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-02 16:38:21
 */
const utils = require('../utils')
const { fetchHome } = require('../utils/third-party/old-fetch')

const __discovery = utils.root('data/discovery/home.json')
const __cover = subjectId => utils.root(`data/discovery/lain/${subjectId}.jpg`)
const __cdn = subjectId =>
  `https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Static@master/data/discovery/cover/${subjectId}.jpg`

async function run() {
  const discovery = await fetchHome()
  utils.write(__discovery, discovery)

  const covers = []
  Object.keys(discovery).forEach(key => {
    if (Array.isArray(discovery[key])) {
      discovery[key].forEach(item => {
        const { subjectId, cover } = item
        covers.push({
          subjectId,
          cover: utils.large(cover)
        })
        item.cover = __cdn(subjectId)
      })
    }
  })

  await utils.queue(
    covers.map(item => () =>
      utils.download(item.cover, __cover(item.subjectId))
    ),
    2
  )
  process.exit()
}
run()
