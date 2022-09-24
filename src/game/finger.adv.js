/*
 * @Author: czy0729
 * @Date: 2022-09-23 18:40:25
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-24 02:46:35
 */
const utils = require('../utils')
const { getPinYinFirstCharacter } = require('../utils/third-party/pinyin')

const __game = utils.root('data/game/game.adv.json')
const __dev = utils.root('data/game/dev.adv.json')
const __finger = utils.root('data/game/finger.adv.json')

const game = utils.read(__game).data

const dev = {
  data: [],
  nums: {}
}
let finger = []

game.forEach(item => {
  if (item.d) {
    const d = item.d.trim()
    if (!dev.nums[d]) {
      dev.nums[d] = 1
    } else {
      dev.nums[d] += 1
    }
  }
})
dev.data = Object.keys(dev.nums)
  .filter(a => dev.nums[a] >= 5)
  .sort((a, b) => dev.nums[b] - dev.nums[a])

game.forEach(item => {
  const i = {
    i: item.id
  }
  const f = getPinYinFirstCharacter(item.t)
  if (f) i.f = f
  if (item.en) i.en = item.en
  if (item.sc) i.s = item.sc
  if (item.r) i.r = item.r
  if (item.o) i.l = item.o

  if (item.d) {
    const d = dev.data.findIndex(i => i === item.d)
    if (d !== -1) i.d = d
  }

  finger.push(i)
})

utils.write(__dev, dev)
utils.write(__finger, finger, true)
process.exit()
