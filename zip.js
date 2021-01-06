/*
 * @Author: czy0729
 * @Date: 2021-01-03 05:48:28
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-03 05:50:03
 */
const fs = require('fs')

const wenku = JSON.parse(fs.readFileSync('./data/wenku8/wenku.json'))
fs.writeFileSync('./data/wenku8/wenku.json', JSON.stringify(wenku))
