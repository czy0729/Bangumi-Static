/*
 * @Author: czy0729
 * @Date: 2020-09-03 14:14:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-27 08:36:44
 */
const fs = require('fs')

function fixed(time) {
  if (String(time).includes('日')) {
    return String(time)
      .replace(/年|月/g, '-')
      .replace(/[^\d|-]/g, '')
      .split('-')
      .map(item => (Number(item) < 10 ? `0${Number(item)}` : item))
      .join('-')
  }

  return String(time)
    .replace(/年/g, '-')
    .replace(/[^\d|-]/g, '')
    .split('-')
    .map(item => (Number(item) < 10 ? `0${Number(item)}` : item))
    .join('-')
}

;(function () {
  const notFindIds = []
  const finallyNotFindIds = []

  const data = JSON.parse(fs.readFileSync('./data/wenku8/deprecated/data.json'))
  Object.keys(data).forEach(id => {
    const filePath = `../Bangumi-Subject/data/${Math.floor(
      id / 100
    )}/${id}.json`

    if (!fs.existsSync(filePath)) {
      notFindIds.push(id)
      return
    }

    let subject = {}
    try {
      subject = JSON.parse(fs.readFileSync(filePath))
    } catch (error) {}
    if (!subject.info) {
      notFindIds.push(id)
      return
    }

    const match = subject.info.match(
      /<li><span>(发售日|开始|开始时间|发行日期): <\/span>(.+?)<\/li>/
    )
    if (!(match && match[2])) {
      notFindIds.push(id)
      return
    }

    const match2 = String(match[2]).match(/\d{4}/)
    if (!(match2 && match2[0])) {
      notFindIds.push(id)
      return
    }

    data[id].begin = fixed(match[2])
  })

  // 从单行本1中获取begin
  notFindIds.forEach(id => {
    let filePath = `../Bangumi-Subject/data/${Math.floor(id / 100)}/${id}.json`

    if (!fs.existsSync(filePath)) {
      finallyNotFindIds.push(id)
      return
    }

    let subject = {}
    try {
      subject = JSON.parse(fs.readFileSync(filePath))
    } catch (error) {}
    if (
      !(Array.isArray(subject.comic) && subject.comic[0] && subject.comic[0].id)
    ) {
      finallyNotFindIds.push(id)
      return
    }

    filePath = `../Bangumi-Subject/data/${Math.floor(
      subject.comic[0].id / 100
    )}/${subject.comic[0].id}.json`
    if (!fs.existsSync(filePath)) {
      finallyNotFindIds.push(id)
      return
    }

    try {
      subject = JSON.parse(fs.readFileSync(filePath))
    } catch (error) {}
    if (!subject.info) {
      finallyNotFindIds.push(id)
      return
    }

    const match = subject.info.match(
      /<li><span>(发售日|开始|开始时间|发行日期): <\/span>(.+?)<\/li>/
    )
    if (!(match && match[2])) {
      finallyNotFindIds.push(id)
      return
    }

    const match2 = String(match[2]).match(/\d{4}/)
    if (!(match2 && match2[0])) {
      finallyNotFindIds.push(id)
      return
    }

    data[id].begin = fixed(match[2])
  })

  const wenku = Object.keys(data).map(id => {
    const item = data[id]
    return {
      cn: item.w || '',
      jp: (item.title === item.w ? '' : item.title) || '',
      ep: item.ep || '',
      update: item.time || 0,
      begin: item.begin || 0,
      status: item.status || 0,
      anime: item.anime || 0,
      cate: item.cate || '',
      author: item.author || '',
      score: item.score || 0,
      rank: item.rank || 0,
      image: item.cover || '',
      id: parseInt(item.id),
      wid: parseInt(item.wid),
      len: Number(((item.len || 0) / 10000).toFixed(1)),
      hot:
        item.hot === 'D'
          ? 1
          : item.hot === 'C'
          ? 2
          : item.hot === 'B'
          ? 3
          : item.hot === 'A'
          ? 4
          : item.hot === 'S'
          ? 5
          : 0,
      up:
        item.up === 'D'
          ? 1
          : item.up === 'C'
          ? 2
          : item.up === 'B'
          ? 3
          : item.up === 'A'
          ? 4
          : item.up === 'S'
          ? 5
          : 0
    }
  })

  fs.writeFileSync(
    './data/wenku8/deprecated/wenku.json',
    JSON.stringify(wenku, null, 2)
  )

  console.log(
    'finallyNotFindCount',
    finallyNotFindIds.length,
    finallyNotFindIds
  )
})()
