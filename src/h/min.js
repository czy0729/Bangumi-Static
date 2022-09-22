/*
 * @Author: czy0729
 * @Date: 2021-06-25 13:51:11
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-22 04:55:51
 */
const utils = require('../utils')

const __detail = utils.root('data/h/detail.json')
const detail = utils.read(__detail)
const __min = utils.root('data/h/hentai.min.json')

const allTags = [
  // 人物設定
  '姐',
  '妹',
  '母',
  '人妻',
  '青梅竹馬',
  '處女',
  '御姐',
  '熟女',

  // 職業設定
  'JK',
  '運動少女',
  '大小姐',
  '老師',
  '女醫護士',
  '女僕',
  '巫女',
  '修女',
  '偶像',
  'OL',
  '風俗娘',
  '公主',
  '女騎士',
  '魔法少女',
  '妖精',
  '魔物娘',
  '獸娘',

  // 外貌身材
  '巨乳',
  '貧乳',
  '黑皮膚',
  '眼鏡娘',
  '泳裝',
  '圍裙',
  '黑絲襪',
  '和服',
  '獸耳',
  '碧池',
  '不良少女',
  '傲嬌',
  '病嬌',
  '偽娘',
  '扶他',

  // 劇情內容
  '自慰',
  '口交',
  '乳交',
  '肛交',
  '腳交',
  '腋下',
  '玩具',
  '觸手',
  '內射',
  '顏射',
  '3P',
  '群交',
  '肉便器',
  '後宮',
  '公眾場合',
  '近親',
  '師生',
  'NTR',
  '懷孕',
  '噴奶',
  '放尿',
  '精神控制',
  '藥物',
  '痴漢',
  '阿嘿顏',
  '精神崩潰',
  '鬼畜',
  'BDSM',
  '調教',
  '強制',
  '逆強制',
  '痴女',
  '女王樣',
  '百合',
  '耽美',
  '性轉換',
  '異世界',
  '異種族',
  '純愛',
  '戀愛喜劇',
  '世界末日'
  // '1080p',
  // '無碼'
]

const min = Object.keys(detail)
  .map(key => {
    const item = detail[key]
    const temp = {
      id: Number(item.id),
      h: Number(item.h)
    }
    if (item.title) temp.c = utils.t2s(item.title)
    if (item.images) temp.i = item.images
    if (item.score) temp.s = item.score
    if (item.rank) temp.r = item.rank
    if (item.total) temp.n = item.total
    if (item.air && item.air !== '0000-00-00') temp.a = item.air
    if (item.ep) temp.e = item.ep

    const tags = Array.from(
      new Set(
        item.tags
          .filter(i => allTags.indexOf(i) !== -1)
          .map(i => allTags.indexOf(i))
      )
    )
    if (tags.length) temp.t = tags

    return temp
  })
  .sort((a, b) => b.s - a.s)

utils.write(
  __min,
  {
    tags: allTags.map(item => utils.t2s(item)),
    data: min
  },
  true
)

console.log('length', min.length)
process.exit()
