/*
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-07-14 23:37:36
 */
const fs = require('fs')
const bangumiData = require('bangumi-data')

const subjectCnFilePath = '../Bangumi-Subject/cn/data.json'
const dataFilePath = './data/agefans/data.json'
const rawFilePath = './data/agefans/raw-copy.json'

async function run() {
  // 对调key-value
  const temp = JSON.parse(fs.readFileSync(subjectCnFilePath))
  const cn = {}
  Object.keys(temp).forEach(bgmId => {
    cn[temp[bgmId]] = bgmId
  })

  const data = JSON.parse(fs.readFileSync(dataFilePath))
  const raw = JSON.parse(fs.readFileSync(rawFilePath))
  delete raw._page

  Object.keys(raw).forEach(ageId => {
    const ageItem = raw[ageId]

    // 处理手动匹配的数据
    if (ageItem.id !== ageId) {
      const subjectFilePath = `../Bangumi-Subject/data/${Math.floor(ageItem.id / 100)}/${ageItem.id}.json`

      if (fs.existsSync(subjectFilePath)) {
        // 查找封面
        const { image = '', rating = {} } = JSON.parse(fs.readFileSync(subjectFilePath))
        data[ageItem.id] = {
          ...ageItem,
          id: ageItem.id,
          ageId,
          image,
          score: rating.score || 0
        }

        delete raw[ageId]
        console.log(data[ageItem.id].cn)
      } else if ('image' in ageItem && 'score' in ageItem) {
        // 找不到封面, 手动
        data[ageItem.id] = {
          ...ageItem,
          id: ageItem.id,
          ageId,
        }

        delete raw[ageId]
        console.log('手动', data[ageItem.id].cn)
      }
      return
    }

    // cn中匹配
    if (cn[ageItem.cn]) {
      const id = parseInt(cn[ageItem.cn])
      const subjectFilePath = `../Bangumi-Subject/data/${Math.floor(id / 100)}/${id}.json`
      if (fs.existsSync(subjectFilePath)) {
        const { image = '', rating = {} } = JSON.parse(fs.readFileSync(subjectFilePath))
        data[id] = {
          ...ageItem,
          id,
          ageId,
          image,
          score: rating.score || 0
        }

        delete raw[ageId]
        console.log(data[id].cn)
      }
      return
    }

    // bangumi-data查找id
    const bangumiDataItem = bangumiData.items.find(item => {
      let bool = item.title === ageItem.jp
      if (!bool) {
        bool = !!(item.titleTranslate
          && item.titleTranslate['zh-Hans']
          && item.titleTranslate['zh-Hans'].find(zh => zh === ageItem.cn || zh === ageItem.jp))
      }
      return bool
    })

    if (bangumiDataItem) {
      const site = bangumiDataItem.sites.find(site => site.site === 'bangumi')
      if (site) {
        const id = parseInt(site.id)
        const subjectFilePath = `../Bangumi-Subject/data/${Math.floor(id / 100)}/${id}.json`
        if (fs.existsSync(subjectFilePath)) {
          const { image = '', rating = {} } = JSON.parse(fs.readFileSync(subjectFilePath))
          data[id] = {
            ...ageItem,
            id,
            ageId: ageItem.id,
            image,
            score: rating.score || 0
          }

          delete raw[ageItem.id]
        } else {
          console.log(ageItem)
        }
      }
    }
  })

  fs.writeFileSync(
    dataFilePath,
    JSON.stringify(data)
  )

  fs.writeFileSync(
    rawFilePath,
    JSON.stringify(raw)
  )
}

run()
