/**
 * @function parseForums 从源代码解析可能存在的全部主题
 * @param {Element|string} code
 * @param {string} title
 */
function parseForums(code, title) {
  var $root = $(code)
  var forums = []

  if (!$root.hasClass('wiki-forum')) {
    $root = $root.find('.wiki-forum')
  }

  $root.each((index, forum) => {
    forums.push({
      forumid: String(index + 1),
      meta: $.extend({}, $(forum).data(), { pageName: title }),
      threads: parseThreads(forum),
    })
  })
  return forums
}

/**
 * @function parseThreads 递归全部的帖子
 * @param {Element} forum
 * @param {string} prefix
 */
function parseThreads(forum, prefix = '') {
  var $forum = $(forum)
  if (prefix) prefix += '-'
  let threads = []
  let $threads = getThreads($forum)
  $.each($threads, (index, thread) => {
    var threadObj = {
      threadid: String(prefix + (index + 1)),
      content: getContent(thread),
      meta: getMeta(thread),
    }
    if (getThreads(thread).length > 0) {
      threadObj.threads = parseThreads(thread, threadObj.threadid)
    }
    threads.push(threadObj)
  })
  return threads
}

/**
 * @function getContent 获取帖子可能存在的回复的结构
 * @param {Element} thread
 */
function getThreads(thread) {
  var $thread = $(thread)
  return $thread.find('> .forum-thread')
}

/**
 * @function getContent 获取帖子内容
 * @param {Element} thread
 */
function getContent(thread) {
  var $thread = $(thread)
  var content = $thread.find('> .forum-content').html() || ''
  content = content
    .trim()
    .replace(/^<!--\s*?start\s+?content\s*?-->/, '')
    .replace(/<!--\s*?end\s+?content\s*?-->$/, '')
    .replace(/^\n/, '')
    .replace(/\n$/, '')

  return content
}

/**
 * @function getMeta 获取帖子的源信息
 * @param {Element} thread
 */
function getMeta(thread) {
  var $thread = $(thread)
  var $data = $thread.data()

  return $data
}

/**
 * @module fromApi 解析 MediaWiki API 返回的信息
 * @param {Object} data 来自 API 的结果：api.php?action=parse&prop=wikitext|text&page=<pageName>
 */
function fromApi(data) {
  var title = data.parse.title
  var wikitext = data.parse.wikitext['*']
  var html = data.parse.text['*']

  // 防止输出没有根元素
  var $wikitext = $('<div>' + wikitext + '</div>')
  var $html = $('<div>' + html + '</div>')

  // 高版本输出自带根元素，低版本没有
  if ($html.find('> .mw-parser-output').length > 0) {
    $html = $html.find('> .mw-parser-output')
  }

  var Obj = {
    wikitext: parseForums($wikitext, title),
    html: parseForums($html, title),
  }

  // 缓存全部forum
  window.WikiForum = window.WikiForum || {}
  window.WikiForum.cache = window.WikiForum.cache || {}
  window.WikiForum.cache.pages = window.WikiForum.cache.pages || {}
  window.WikiForum.cache.pages[title] = Obj

  return Obj
}

/**
 * @module fromHtml 从 HTML 源代码解析
 * @param {String|Element} code
 */
function fromHtml(code) {
  var $code = $(code)
  var forumEl = parseForums($code)
  return forumEl
}

module.exports = {
  fromApi,
  fromHtml,
}
