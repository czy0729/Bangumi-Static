/*
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-11 02:23:55
 */
const utils = require('../utils')

const __anime = utils.root('data/agefans/anime.json')
const anime = utils.read(__anime)

async function run() {
  const idsAnime = Object.keys(anime)
  for (let indexAnime = 0; indexAnime <= idsAnime.length; indexAnime++) {
    const itemAnime = anime[indexAnime] || {}
    if (itemAnime) {
      // 从bgm条目页获取实时数据
      const idBgm = Number(itemAnime.id)
      const url = `https://api.bgm.tv/subject/${idBgm}?responseGroup=large`
      const data = await utils.fetch(url)

      if (data && anime[indexAnime]) {
        anime[indexAnime].score = data.rating && data.rating.score
        anime[indexAnime].rank = data.rank
        console.log(
          `[${indexAnime} | ${idsAnime.length}]`,
          itemAnime.cn,
          anime[indexAnime].score,
          anime[indexAnime].rank
        )
      }

      if (indexAnime % 20 === 0) {
        console.log('save', indexAnime)
        utils.write(__anime, anime)
      }
    }
  }

  utils.write(__anime, anime)
  process.exit()
}
run()
