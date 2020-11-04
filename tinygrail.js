/*
 * @Author: czy0729
 * @Date: 2020-10-28 17:40:10
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-10-29 17:14:14
 */
const fs = require('fs')

// https://tinygrail.com/api/chara/msrc/1/8000
const msrc = JSON.parse(
  fs.readFileSync('./data/tinygrail/msrc-raw.json')
).Value.map((item) => {
  const data = {
    id: item.Id,
    name: item.Name,

    // //lain.bgm.tv/pic/crt/g/72/8c/36404_crt_qHQHM.jpg
    // https://tinygrail.oss-cn-hangzhou.aliyuncs.com/avatar/f55a23a1f796e3ef961ebb792b550cd3.jpg
    icon: item.Icon.replace(
      /\/\/lain.bgm.tv\/pic\/crt\/g\/|https:\/\/tinygrail.oss-cn-hangzhou.aliyuncs.com\/avatar\/|\.jpg/g,
      ''
    ),
  }

  if (item.Level > 1) {
    data.level = item.Level
  }

  return data
})

fs.writeFileSync('./data/tinygrail/msrc.json', JSON.stringify(msrc, null, 2))
fs.writeFileSync(
  './data/tinygrail/ids-msrc.json',
  JSON.stringify(
    Array.from(new Set(msrc.map((item) => item.id).sort((a, b) => a - b)))
  )
)
