/**
 * @function parseForums 从源代码解析可能存在的全部主题
 * @param {Element} code
 * @param {String} title
 */
function parseForums(code, title) {
  var $root = $(code)
  var forums = []

  if (!$root.hasClass('wiki-forum')) {
    $root = $root.find('.wiki-forum')
  }
  $root.each((index, forum) => {
    forums.push({
      id: String(index + 1),
      title: $(forum).data('title') || title + (index + 1),
      depthMax: $(forum).data('depthMax') || 3,
      threads: parseThreads(forum),
    })
  })
  return forums
}

/**
 * @function parseThreads 递归全部的帖子
 * @param {Element} forum
 * @param {String} prefix
 */
function parseThreads(forum, prefix = '') {
  var $forum = $(forum)
  if (prefix) prefix += '-'
  var threads = []
  $threads = getThreads($forum)
  $.each($threads, (index, thread) => {
    var thread = {
      id: String(prefix + (index + 1)),
      content: getContent(thread),
      meta: getMeta(thread),
    }
    if (getThreads(thread).length > 0) {
      thread.threads = parseThreads(thread, thread.id)
    }
    threads.push(thread)
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
  var $content = $thread.find('> .forum-content') || ''
  return $content
}

/**
 * @function getMeta 获取帖子的源信息
 * @param {Element} thread
 */
function getMeta(thread) {
  return {
    user: getUser(thread),
    time: getTime(thread),
  }
}

/**
 * @function getUser 获取帖子发帖者信息
 * @param {Element} thread
 */
function getUser(thread) {
  var $thread = $(thread)
  var author = $thread.data('userAuthor') || ''
  var last = $thread.data('userLast') || author
  return { author, last }
}

/**
 * @function getTime 获取帖子发帖时间信息
 * @param {Element} thread
 */
function getTime(thread) {
  var $thread = $(thread)
  var publish = $thread.data('timePublish') || ''
  var modify = $thread.data('timeModify') || publish
  return { publish, modify }
}

/**
 * @module fromApi 解析 MediaWiki API 返回的信息
 * @param {Object} data 来自 API 的结果：api.php?action=parse&prop=wikitext|text&page=<pageName>
 */
function fromApi(data) {
  var { title } = data
  var wikitext = data.parse.wikitext['*']
  var html = data.parse.text['*']

  // 防止输出没有根元素
  var $wikitext = $('<div>' + wikitext + '</div>')
  var $html = $('<div>' + html + '</div>')

  // 高版本输出自带根元素，低版本没有
  if ($html.find('> .mw-parser-output').length > 0) {
    $html = $html.find('> .mw-parser-output')
  }

  // 缓存全部forum
  window.cache.pages[title] = {
    wikitext: parseForums($wikitext, title),
    html: parseForums($html, title),
  }
}

/**
 * @module fromHtml 从 HTML 源代码解析
 * @param {String|Element} code
 */
function fromHtml(code, title = '') {
  var $code = $(code)
  return parseForums($code)
}

module.exports = {
  fromApi,
  fromHtml,
}
