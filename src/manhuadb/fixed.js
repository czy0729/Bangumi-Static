/*
 * @Author: czy0729
 * @Date: 2021-01-10 04:25:17
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-10 04:40:13
 */
const utils = require('../utils')

const __detail = utils.root('data/manhuadb/detail.json')
const __matched = utils.root('data/manhuadb/matched.json')
const __unmatched = utils.root('data/manhuadb/unmatched.json')
const detail = utils.read(__detail)
const matched = utils.read(__matched)
const unmatched = utils.read(__unmatched)

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

utils.write(__detail, detail)
utils.write(__matched, matched)
utils.write(__unmatched, unmatched)
process.exit()
