/*
 * @Doc: https://github.com/RobinQu/simplebig/blob/master/index.js
 * @Author: czy0729
 * @Date: 2021-04-12 15:29:03
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-25 13:57:58
 */
const sc = require('./sc.json')
const tc = require('./tc.json')

const s2tMemo = {}

function s2t(str) {
  var ret = '',
    i,
    len,
    idx
  str = str || this
  for (i = 0, len = str.length; i < len; i++) {
    var s = str.charAt(i)
    var t = s2tMemo[s]
    if (t) {
      ret += t
    } else {
      idx = sc.indexOf(s)
      s2tMemo[s] = idx === -1 ? s : tc.charAt(idx)
      ret += s2tMemo[s]
    }
  }
  return ret
}

function t2s(str) {
  var ret = '',
    i,
    len,
    idx
  str = str || this
  for (i = 0, len = str.length; i < len; i++) {
    idx = tc.indexOf(str.charAt(i))
    ret += idx === -1 ? str.charAt(i) : sc.charAt(idx)
  }
  return ret
}

module.exports = {
  s2t,
  t2s
}
