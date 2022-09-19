/*
 * @Author: czy0729
 * @Date: 2022-09-19 15:33:42
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-19 16:49:03
 */
const utils = require('../utils')

const __detail = utils.root('data/mox/detail.json')
const __map = utils.root('data/mox/map.json')
const __mox = utils.root('data/mox/mox.json')
const __min = utils.root('data/mox/mox.min.json')
const __minHasRank = utils.root('data/mox/mox.min.rank.json')

const detail = utils.read(__detail)
const map = utils.read(__map)

const mox = []
Object.keys(detail).forEach(mid => {
  if (!map[mid]?.id) return

  const itemDetail = detail[mid]
  const itemMap = map[mid]
  const _item = {
    // bgm.tv
    id: Number(itemMap.id),
    mid: Number(mid),
    title: utils.toSimplifiedChar(itemMap.title || itemMap._title || ''),
    image: itemMap._cover,
    score: Number(itemMap._score || 0),
    rank: Number(itemMap._rank || 0),
    total: Number(itemMap._total.replace(' votes', '') || 0),

    // mox.moe
    sub: utils.toSimplifiedChar(itemMap.sub || '').replace('   ', ' '),
    ep: utils.toSimplifiedChar(itemDetail.ep || ''),
    author: utils.toSimplifiedChar(itemDetail.author || ''),
    status: utils.toSimplifiedChar(itemDetail.status || ''),
    cates: utils.toSimplifiedChar(itemDetail.cates || ''),
    publish: itemDetail.publish || '',
    update: itemDetail.update || '',
    // desc: utils.toSimplifiedChar(itemDetail.desc || ''),
    mScore: Number(itemDetail.score || 0),
    mTotal: Number(itemDetail.total.replace('人評價', '') || 0),
    subscribe: Number(itemDetail.subscribe || 0),
    favor: Number(itemDetail.favor || 0),
    read: Number(itemDetail.read || 0),
    hot: Number(itemDetail.hot || 0)
  }
  mox.push(_item)
})

const min = []
const minHasRank = []
mox.forEach(item => {
  // i m t c s r q e a u b p d z x v h
  const i = {
    i: item.id,
    m: item.mid,
    t: item.title
  }

  if (item.image) i.c = item.image
  if (item.score) i.s = item.score
  if (item.rank) i.r = item.rank
  if (item.o) i.q = item.o
  if (item.ep) {
    const num = item.ep.match(/\d+/g)?.[0]
    if (!Number.isNaN(Number(num))) i.e = Number(num)
  }

  if (item.author) i.a = item.author
  if (item.status === '连载') i.u = 1
  if (item.cates) i.b = item.cates
  if (item.publish && !Number.isNaN(Number(item.publish))) {
    i.p = Number(item.publish)
  }

  if (item.update) i.d = item.update

  // if (item.mScore) i.z = item.mScore
  // if (item.mTotal) i.x = item.mTotal
  // if (item.favor) i.v = item.favor
  if (item.hot) i.h = item.hot

  if (i.r) {
    minHasRank.push(i)
  } else {
    min.push(i)
  }
})

utils.write(__mox, mox)
utils.write(__min, min, true)
utils.write(
  __minHasRank,
  minHasRank.sort((a, b) => a.r - b.r),
  true
)
process.exit()
