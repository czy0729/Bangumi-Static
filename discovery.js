/*
 * @Author: czy0729
 * @Date: 2020-04-05 03:20:34
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-04-30 17:27:30
 */
const fs = require('fs')
const path = require('path')
const join = require('path').join
const http = require('http')
const utils = require('./utils/utils')
const fetch = require('./utils/old-fetch')

async function downloadImage(cover, subjectId) {
  return new Promise((resolve, reject) => {
    const filePath = `./data/discovery/lain/${subjectId}.jpg`
    if (fs.existsSync(filePath)) {
      console.log(`- skip ${filePath}`)
      return resolve(true)
    }

    const src = `http:${cover}`
    http.get(src, (req, res) => {
      let imgData = ''
      req.setEncoding('binary')
      req.on('data', (chunk) => (imgData += chunk))
      req.on('end', () => {
        const dirPath = path.dirname(filePath)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath)
        }

        console.log(`- write ${cover}`)
        fs.writeFileSync(filePath, imgData, 'binary', (err) => {
          if (err) console.log('- error ${avatar}')
        })

        resolve(true)
      })
    })
  })
}

/**
 * 图片地址 https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Static@master/data/discovery/cover/${subjectId}.jpg
 */
async function fetchHome() {
  const data = await fetch.fetchHome()
  const filePath = './data/discovery/index.json'

  const covers = []
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item) => {
        covers.push({
          subjectId: item.subjectId,
          cover: utils.getCoverLarge(item.cover),
        })
        item.cover = `https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Static@master/data/discovery/cover/${item.subjectId}.jpg`
      })
    }
  })
  const fetchs = covers.map((item) => () =>
    downloadImage(item.cover, item.subjectId)
  )
  utils.queue(fetchs, 2)

  fs.writeFileSync(filePath, JSON.stringify(data))
}

fetchHome()
