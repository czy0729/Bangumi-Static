/*
 * @Author: czy0729
 * @Date: 2022-09-24 13:28:45
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-24 21:52:10
 */
const utils = require('../utils')
const { getPinYinFirstCharacter } = require('../utils/third-party/pinyin')

const __hentai = utils.root('data/h/hentai.min.json')
const __finger = utils.root('data/h/finger.json')

const hentai = utils.read(__hentai).data

hentai.forEach(item => {
  const f = getPinYinFirstCharacter(item.c)
  if(f) item.f = f
  delete item.h
  delete item.c
  delete item.i
  delete item.e
})

utils.write(__finger, hentai, true)
process.exit()
