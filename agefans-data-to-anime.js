/*
 * @Author: czy0729
 * @Date: 2020-09-27 12:13:23
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-09-27 12:16:53
 */
const fs = require('fs')

const dataFilePath = './data/agefans/data.json'
const data = JSON.parse(fs.readFileSync(dataFilePath))

const array = Object.keys(data).map((key) => {
  const item = data[key]
  item.id = parseInt(key)
  return item
})

const animeFilePath = './data/agefans/anime.json'
fs.writeFileSync(animeFilePath, JSON.stringify(array, null, 2))
