/*
 * @Author: czy0729
 * @Date: 2020-05-20 16:05:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-02-01 18:21:25
 */
const fs = require('fs')

let data = {}
const filePath = './data/18x/18x.json'
const filePaths = [
  './data/18x/anime.json',
  './data/18x/book.json',
  './data/18x/comic.json',
  './data/18x/game.json',
]
filePaths.forEach((path) => {
  const d = JSON.parse(fs.readFileSync(path))
  data = {
    ...data,
    ...d,
  }
})

delete data.page

fs.writeFileSync(filePath, JSON.stringify(data))
