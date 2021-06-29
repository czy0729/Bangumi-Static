/*
 * @Author: czy0729
 * @Date: 2021-06-29 09:57:16
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-29 09:58:17
 */
const utils = require('../utils')

const __manga = utils.root('data/manhuadb/manga.json')
const manga = utils.read(__manga)

async function run() {
  const idsManga = Object.keys(manga)
  for (let indexManga = 0; indexManga <= idsManga.length; indexManga++) {
    const itemManga = manga[indexManga] || {}
    if (itemManga) {
      // 从bgm条目页获取实时数据
      const idBgm = Number(itemManga.id)
      const url = `https://api.bgm.tv/subject/${idBgm}?responseGroup=large`
      const data = await utils.fetch(url)

      if (data && manga[indexManga]) {
        manga[indexManga].score = data.rating && data.rating.score
        manga[indexManga].rank = data.rank
        console.log(
          `[${indexManga} | ${idsManga.length}]`,
          itemManga.cn,
          manga[indexManga].score,
          manga[indexManga].rank
        )
      }

      if (indexManga % 20 === 0) {
        console.log('save', indexManga)
        utils.write(__manga, manga)
      }
    }
  }

  utils.write(__manga, manga)
  process.exit()
}
run()
