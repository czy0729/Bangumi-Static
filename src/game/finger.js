/*
 * @Author: czy0729
 * @Date: 2022-09-23 18:40:25
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-23 19:17:52
 */
const utils = require('../utils')
const { getPinYinFirstCharacter } = require('../utils/third-party/pinyin')

const __game = utils.root('data/game/game.base.json')
const __tags = utils.root('data/game/tags.json')
const __dev = utils.root('data/game/dev.json')
const __pub = utils.root('data/game/pub.json')
const __platform = utils.root('data/game/platform.json')
const __finger = utils.root('data/game/finger.json')

const game = utils.read(__game).data

const tags = {
  data: [],
  nums: {}
}
const dev = {
  data: [],
  nums: {}
}
const pub = {
  data: [],
  nums: {}
}
const platform = {
  data: [
    'PC',
    'NS',
    'PS5',
    'PS4',
    'XSX|S',
    'XB1',
    'PS3',
    'PS2',
    'PSV',
    'PSP',
    '3DS',
    'NDS',
    'X360',
    'iOS',
    'Android',
    'GBA',
    'Wii',
    'WiiU',
    'PS',
    'Xbox',
    'Stadia',
    'SFC',
    'FC',
    'GBC',
    'GB',
    'DC',
    'NGC',
    'Saturn',
    'N64',
    'MD',
    'Arcade'
  ],
  nums: {}
}
let finger = []

game.forEach(item => {
  if (item.ta?.length) {
    item.ta.forEach(i => {
      if (!i) return

      i = i.trim()
      if (!tags.nums[i]) {
        tags.nums[i] = 1
      } else {
        tags.nums[i] += 1
      }
    })
  }

  if (item.d?.length) {
    item.d.forEach(i => {
      if (!i) return

      i = i.trim()
      if (!dev.nums[i]) {
        dev.nums[i] = 1
      } else {
        dev.nums[i] += 1
      }
    })
  }

  if (item.p?.length) {
    item.p.forEach(i => {
      if (!i) return

      i = i.trim()
      if (!pub.nums[i]) {
        pub.nums[i] = 1
      } else {
        pub.nums[i] += 1
      }
    })
  }

  if (item.pl?.length) {
    item.pl.forEach(i => {
      if (!i) return

      i = i.trim()
      if (!platform.nums[i]) {
        platform.nums[i] = 1
      } else {
        platform.nums[i] += 1
      }
    })
  }
})
tags.data = Object.keys(tags.nums).sort((a, b) => tags.nums[b] - tags.nums[a])
dev.data = Object.keys(dev.nums).filter(a => dev.nums[a] >= 10).sort((a, b) => dev.nums[b] - dev.nums[a])
pub.data = Object.keys(pub.nums).filter(a => dev.nums[a] >= 10).sort((a, b) => pub.nums[b] - pub.nums[a])


game.forEach(item => {
  const i = {
    i: item.id,
    f: getPinYinFirstCharacter(item.t)
  }
  if (item.en) i.en = item.en
  if (item.sc) i.s = item.sc
  if (item.r) i.r = item.r
  if (item.o) i.l = item.o

  if (item.ta?.length) {
    const data = []
    item.ta.forEach(d => {
      const index = tags.data.findIndex(i => i === d)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.ta = data
  }
  if (item.d?.length) {
    const data = []
    item.d.forEach(d => {
      const index = dev.data.findIndex(i => i === d)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.d = data
  }
  if (item.p?.length) {
    const data = []
    item.p.forEach(d => {
      const index = pub.data.findIndex(i => i === d)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.p = data
  }
  if (item.pl?.length) {
    const data = []
    item.pl.forEach(d => {
      const index = platform.data.findIndex(i => i === d)
      if (index !== -1) data.push(index)
    })
    if (data.length) i.pl = data
  }

  if (item.vs) i.vs = item.vs
  if (item.vc) i.vc = item.vc

  finger.push(i)
})

utils.write(__tags, tags)
utils.write(__dev, dev)
utils.write(__pub, pub)
utils.write(__platform, platform)
utils.write(__finger, finger, true)
process.exit()
