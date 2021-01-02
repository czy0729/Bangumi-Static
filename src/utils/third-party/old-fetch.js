/*
 * @Author: czy0729
 * @Date: 2020-04-05 03:28:59
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-01-02 16:38:16
 */
const HTMLParser = require('./html-parser')
const utils = require('../index')

/**
 * 分析今日收看记录
 * @param {*} html
 */
function cheerioToday(html) {
  return String(utils.cheerio(html)('li').text())
    .replace('部。', '部，')
    .replace(/今日番组|。/g, '')
}

/**
 * 首页信息聚合
 */
fetchHome = async () => {
  const html = HTMLTrim(await utils.fetch('https://bgm.tv'))
  const data = {
    anime: [],
    game: [],
    book: [],
    music: [],
    real: [],
    today: '今日上映 - 部。共 - 人收看今日番组。',
  }
  const itemsHTML = html.match(/<ul id="featuredItems" class="featuredItems">(.+?)<\/ul>/)
  if (itemsHTML) {
    const type = ['anime', 'game', 'book', 'music', 'real']

    let node
    const tree = HTMLToTree(itemsHTML[1])
    tree.children.forEach((item, index) => {
      const list = []

      item.children.forEach(({ children }, idx) => {
        // 第一个是标签栏, 排除掉
        if (idx === 0) {
          return
        }

        node = findTreeNode(children, 'a > div|style~background') || findTreeNode(children, 'a|style~background')
        const cover = node
          ? node[0].attrs.style.replace(/background:#000 url\(|\) 50%|background-image:url\('|'\);/g, '')
          : ''

        node = findTreeNode(children, 'a|href&title')
        const title = node ? node[0].attrs.title : ''
        const subjectId = node ? node[0].attrs.href.replace('/subject/', '') : ''

        node = findTreeNode(children, 'p > small') || findTreeNode(children, 'div > small')
        const info = node ? node[0].text[0] : ''

        list.push({
          cover,
          title,
          subjectId,
          info,
        })
      })

      data[type[index]] = list
    })
  }

  const todayHTML = html.match('<li class="tip">(.+?)</li>')
  if (todayHTML) {
    data.today = cheerioToday(`<li>${todayHTML[1]}</li>`)
  }

  return data
}

function removeCF(html = '') {
  return html.replace(
    /<script[^>]*>([\s\S](?!<script))*?<\/script>|<noscript[^>]*>([\s\S](?!<script))*?<\/noscript>|style="display:none;visibility:hidden;"/g,
    ''
  ).replace(/data-cfsrc/g, 'src')
}

function HTMLTrim(str = '') {
  if (typeof str !== 'string') return str
  return (
    removeCF(str)
      // .replace(/<!--.*?-->/gi, '')
      // .replace(/\/\*.*?\*\//gi, '')
      // .replace(/[ ]+</gi, '<')
      .replace(/\n+|\s\s\s*|\t/g, '')
      .replace(/"class="/g, '" class="')

      // 补充 190829
      .replace(/> </g, '><')
  )
}

function HTMLToTree(html, cmd = true) {
  const tree = {
    tag: 'root',
    attrs: {},
    text: [],
    children: [],
  }
  if (cmd) {
    tree.cmd = 'root'
  }
  let ref = tree

  HTMLParser.HTMLParser(html, {
    start: (tag, attrs, unary) => {
      const attrsMap = {}
      attrs.forEach(({ name, value, escaped }) => {
        // @issue 190507
        // 带有cookie的请求经过cloudflare返回的html部分attr的属性被加上了data-cf前缀??? 醉了
        const _name = name.replace('data-cf', '')
        return (attrsMap[_name] = escaped || value)
      })
      const item = {
        tag,
        attrs: attrsMap,
      }
      if (cmd) {
        item.cmd = `${ref.cmd} > ${tag}`
      }
      if (!unary) {
        item.parent = ref
        item.text = []
        item.children = []
      }
      ref.children.push(item)

      if (!unary) {
        ref = item
      }
    },
    chars: (text) => {
      ref.text.push(text)
    },
    end: () => {
      const _ref = ref.parent
      delete ref.parent
      ref = _ref
    },
  })

  return tree
}

function findTreeNode(children, cmd = '', defaultValue) {
  if (!cmd) {
    return children
  }

  const split = ' > '
  const tags = cmd.split(split)
  const tag = tags.shift()
  const find = children.filter((item) => {
    let temp = tag.split('|')
    const _tag = temp[0]
    const attr = temp[1] || ''

    if (attr) {
      const attrs = attr.split('&')
      let match = true
      attrs.forEach((attr) => {
        if (attr.indexOf('~') !== -1) {
          // ~
          temp = attr.split('~')
          const _attr = temp[0]
          const _value = temp[1]
          if (_value) {
            match = match && item.tag === _tag && item.attrs[_attr] && item.attrs[_attr].indexOf(_value) !== -1
          } else if (_attr) {
            match = match && item.tag === _tag && item.attrs[_attr] !== undefined
          }
        } else {
          // =
          temp = attr.split('=')
          const _attr = temp[0]
          const _value = temp[1]
          if (_value) {
            match = match && item.tag === _tag && item.attrs[_attr] == _value
          } else if (_attr) {
            if (_attr === 'text') {
              match = match && item.tag === _tag && item.text.length !== 0
            } else {
              match = match && item.tag === _tag && item.attrs[_attr] !== undefined
            }
          }
        }
      })
      return match
    }
    return item.tag === _tag
  })
  if (!find.length) {
    return undefined || defaultValue
  }
  if (!tags.length) {
    return find
  }

  const _find = []
  find.forEach((item) => {
    _find.push(...(findTreeNode(item.children, tags.join(split)) || []))
  })
  if (!_find.length) {
    return undefined || defaultValue
  }
  return _find
}

function HTMLDecode(str = '') {
  if (str.length === 0) return ''
  return (
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')

      // eslint-disable-next-line quotes
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
  )
}

module.exports = {
  fetchHome,
}
