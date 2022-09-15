/*
 * @Author: czy0729
 * @Date: 2021-06-23 06:06:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-15 01:47:54
 */
const utils = require('../utils')

async function run() {
  const data = await utils.fetch('https://hanime1.me/watch?v=27436')
  console.log(data)
  process.exit()
}
run()
