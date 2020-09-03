/*
 * @Author: czy0729
 * @Date: 2020-07-14 14:08:29
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-09-02 15:36:15
 */
const fs = require('fs')
const bangumiData = require('bangumi-data')

const subjectCnFilePath = '../Bangumi-Subject/cn/mini.json'
const dataFilePath = './data/agefans/data.json'
const rawFilePath = './data/agefans/raw.json'

async function run() {
  // 对调key-value
  const temp = JSON.parse(fs.readFileSync(subjectCnFilePath))
  const cn = {}
  Object.keys(temp).forEach((bgmId) => {
    cn[temp[bgmId]] = bgmId
  })

  const data = JSON.parse(fs.readFileSync(dataFilePath))
  const raw = JSON.parse(fs.readFileSync(rawFilePath))
  delete raw._page

  // 对应ageId => bgmId, 用于更新
  const ageIdMap = {}
  Object.keys(data).forEach((bgmId) => {
    const bgmItem = data[bgmId]
    if (bgmItem.ageId != bgmId) {
      ageIdMap[bgmItem.ageId] = bgmId
    }
  })

  Object.keys(raw).forEach((ageId) => {
    const ageItem = raw[ageId]

    // 尝试更新旧匹配数据
    if (ageIdMap[ageId]) {
      const bgmId = ageIdMap[ageId]
      data[bgmId] = {
        ...data[bgmId],
        ...ageItem,
      }
      delete raw[ageId]
      console.log('更新旧数据', data[bgmId].cn)
      return
    }

    // 处理手动匹配的数据
    if (ageItem.id != ageId) {
      const bgmId = ageItem.id
      const subjectFilePath = `../Bangumi-Subject/data/${Math.floor(
        bgmId / 100
      )}/${bgmId}.json`

      if (fs.existsSync(subjectFilePath)) {
        // 查找封面
        const { image = '', rating = {} } = JSON.parse(
          fs.readFileSync(subjectFilePath)
        )
        data[bgmId] = {
          ...ageItem,
          id: bgmId,
          ageId,
          image,
          score: rating.score || 0,
        }

        delete raw[ageId]
        console.log('找到封面', data[bgmId].cn)
      } else if ('image' in ageItem && 'score' in ageItem) {
        // 找不到封面, 手动
        data[bgmId] = {
          ...ageItem,
          id: bgmId,
          ageId,
        }

        delete raw[ageId]
        console.log('找不到封面', data[bgmId].cn)
      }
      return
    }

    // cn中匹配
    if (cn[ageItem.cn]) {
      const id = parseInt(cn[ageItem.cn])
      const subjectFilePath = `../Bangumi-Subject/data/${Math.floor(
        id / 100
      )}/${id}.json`
      if (fs.existsSync(subjectFilePath)) {
        const { image = '', rating = {} } = JSON.parse(
          fs.readFileSync(subjectFilePath)
        )
        data[id] = {
          ...ageItem,
          id,
          ageId,
          image,
          score: rating.score || 0,
        }

        delete raw[ageId]
        console.log('cn中匹配', data[id].cn)
      }
      return
    }

    // bangumi-data查找id
    const bangumiDataItem = bangumiData.items.find((item) => {
      let bool = item.title === ageItem.jp
      if (!bool) {
        bool = !!(
          item.titleTranslate &&
          item.titleTranslate['zh-Hans'] &&
          item.titleTranslate['zh-Hans'].find(
            (zh) => zh === ageItem.cn || zh === ageItem.jp
          )
        )
      }
      return bool
    })

    if (bangumiDataItem) {
      const site = bangumiDataItem.sites.find((site) => site.site === 'bangumi')
      if (site) {
        const id = parseInt(site.id)
        const subjectFilePath = `../Bangumi-Subject/data/${Math.floor(
          id / 100
        )}/${id}.json`
        if (fs.existsSync(subjectFilePath)) {
          const { image = '', rating = {} } = JSON.parse(
            fs.readFileSync(subjectFilePath)
          )
          data[id] = {
            ...ageItem,
            id,
            ageId: ageItem.id,
            image,
            score: rating.score || 0,
          }

          delete raw[ageItem.id]
        } else {
          console.log('bangumi-data中匹配', ageItem)
        }
      }
    }
  })

  // 修复data.json历史格式
  Object.keys(data).forEach((bgmId) => {
    delete data[bgmId].id
    data[bgmId].ageId = parseInt(data[bgmId].ageId)

    // 当cn === jp, 清空jp节省空间
    if (data[bgmId].cn === data[bgmId].jp) {
      data[bgmId].jp = ''
    }

    if (data[bgmId].official === '暂无') {
      data[bgmId].official = ''
    }

    // 修复ageId与bgmId记录反了
    if (String(data[bgmId].ageId).length !== 8) {
      data[data[bgmId].ageId] = data[bgmId]
      data[data[bgmId].ageId].ageId = parseInt(bgmId)
      delete data[bgmId]
    }
  })

  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2))
  fs.writeFileSync(rawFilePath, JSON.stringify(raw, null, 2))
}

run()
