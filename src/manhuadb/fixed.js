/*
 * @Author: czy0729
 * @Date: 2021-01-10 04:25:17
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-12 15:54:13
 */
const utils = require('../utils')
const __subject = subjectId =>
  `${utils.root()}../Bangumi-Subject/data/${Math.floor(
    subjectId / 100
  )}/${subjectId}.json`

const __detail = utils.root('data/manhuadb/detail.json')
const __matched = utils.root('data/manhuadb/matched.json')
const __unmatched = utils.root('data/manhuadb/unmatched.json')
const __manga = utils.root('data/manhuadb/manga.json')
const detail = utils.read(__detail)
const matched = utils.read(__matched)
const unmatched = utils.read(__unmatched)
const manga = utils.read(__manga)

Object.keys(matched).forEach(idMatched => {
  const itemDetail = detail[idMatched] || {}
  const itemMatched = matched[idMatched] || {}
  matched[idMatched] = {
    id: Number(itemMatched.id || itemDetail.id),
    title: itemDetail.title || itemMatched.title || '',
    status: itemDetail.status || itemMatched.status || '',
    author: itemDetail.author || itemMatched.author || '',
    tags: (itemDetail.tags || itemMatched.tags || '').trim(),
    year: Number(itemDetail.year || itemMatched.year || 0),
    ep: (itemDetail.ep || itemMatched.ep || '').trim(),
    cn: (itemDetail.cn || itemMatched.cn || '').trim(),
    jp: (itemDetail.jp || itemMatched.jp || '').trim()
  }
  delete detail[idMatched]
})

Object.keys(unmatched).forEach(idUnMatched => {
  const itemDetail = detail[idUnMatched] || {}
  const itemUnMatched = unmatched[idUnMatched] || {}
  unmatched[idUnMatched] = {
    id: Number(itemUnMatched.id || itemDetail.id),
    title: itemDetail.title || itemUnMatched.title || '',
    status: itemDetail.status || itemUnMatched.status || '',
    author: itemDetail.author || itemUnMatched.author || '',
    tags: (itemDetail.tags || itemUnMatched.tags || '').trim(),
    year: Number(itemDetail.year || itemUnMatched.year || 0),
    ep: (itemDetail.ep || itemUnMatched.ep || '').trim(),
    cn: (itemDetail.cn || itemUnMatched.cn || '').trim(),
    jp: (itemDetail.jp || itemUnMatched.jp || '').trim()
  }
  delete detail[idUnMatched]
})

manga.forEach(item => {
  if (!item.begin) {
    const subject = utils.read(__subject(item.id))
    const match = subject.info.match(
      /<li><span>(发售日|开始|开始时间|发行日期|连载时间|连载期间|连载日期|连载开始|発表期間|发表期间|発表号): <\/span>(.+?)<\/li>/
    )
    if (match && match[2]) {
      let year = match[2].split('年')[0]
      if (!isNaN(Number(year))) {
        item.begin = Number(year)
      } else {
        item.begin = year
      }
    } else {
      try {
        const { comic = [] } = subject
        if (comic[0]) {
          const subId = comic[0].id
          const subSubject = utils.read(__subject(subId))
          const match = subSubject.info.match(
            /<li><span>(发售日|开始|开始时间|发行日期|连载时间|连载期间|连载日期|连载开始|発表期間|发表期间|発表号): <\/span>(.+?)<\/li>/
          )
          if (match && match[2]) {
            let year = match[2].split('年')[0].split('-')[0]
            if (!isNaN(Number(year))) {
              item.begin = Number(year)
            } else {
              item.begin = year
            }
          }
        }
      } catch (error) {}
    }
  }
})

utils.write(__detail, detail)
utils.write(__matched, matched)
utils.write(__unmatched, unmatched)
utils.write(__manga, manga)
process.exit()
