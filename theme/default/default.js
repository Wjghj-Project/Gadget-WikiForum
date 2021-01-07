/**
 * @function theme.default 标准的官方主题
 * @param {Object} ctx
 * @param {Object} ctx.meta Metadata
 *
 * @param {Function} next
 */
mw.hook('WikiForum.theme').add(next => {
  // 全论坛容器
  var allForumsContainer = ctx => {
    return $('<div>', { class: 'wiki-forum-all-container' })
  }

  // 单论坛容器
  var forumContainer = ctx => {
    return $('<div>', {
      class: 'wiki-forum',
      'data-forumid': ctx.meta.id,
    })
  }

  // 帖子容器
  var threadContainer = ctx => {
    // 处理 meta
    const id = String(ctx.id)
    const content = ctx.content
    const timePublish =
      ctx.meta.timePublish || ctx.meta.timeRelease || ctx.meta.release || ''
    const timeModify = ctx.meta.timeModify || timePublish
    const userAuthor = ctx.meta.userAuthor || ctx.meta.user || 'unsigned'
    const userLast = ctx.meta.userLast || userAuthor

    // 缓存组件
    var $idLink = $('<span>', { class: 'forum-id-link', text: '#' + id })
    var $userLink = $('<div>', { class: 'forum-user' }).append(
      $('<span>', { class: 'forum-user-link' }).append(
        $('<a>', {
          class: 'mw-userlink userAuthor',
          text: userAuthor,
          href: mw.util.getUrl('User:' + userAuthor),
        }),
        userLast === userAuthor
          ? ''
          : $('<i>', { text: '（修改者：' + userLast + '）' })
      )
    )
    var $content = $('<div>', { class: 'forum-content', html: content })
    var $timeArea = $('<div>', { class: 'post-time' }).append(
      $('<i>', {
        class: 'post-date timePublish',
        text: dateFormat('yyyy年M月d日 hh:mm:ss', new Date(timePublish)),
      })
    )

    // 判断是否为楼主，并返回帖子容器
    if (id === '1') {
      // 楼主
      return $('<div>', {
        class: 'forum-thread forum-first',
      }).append(
        $('<div>', { class: 'forum-before' }).append(
          $('<h3>', {
            class: 'forum-title',
            text: ctx.forumMeta.title || '[UNTITLED] Forum Topic #' + forumid,
          }),
          $idLink,
          $userLink
        ),
        $content,
        $('<div>', { class: 'forum-after' }).append($timeArea)
      )
    } else {
      // 普通帖子
      var $replyArea = newReplyArea()

      return $('<div>', { class: 'forum-thread' }).append(
        $('<div>', { class: 'forum-before' }).append($idLink, $userLink),
        $content,
        $('<div>', { class: 'forum-after' }).append(
          $timeArea,
          $('<div>', { class: 'new-reply-container' }).append(
            $('<div>', { class: 'modify-buttons-group' }).append(
              $('<a>', {
                class: 'reply-btn',
                href: 'javascript:;',
                text: '回复',
              }).click(function(e) {
                $replyArea.show()
                $(this).hide()
              })
            ),
            $replyArea
          )
        )
      )
    }
  }

  // 新回复容器
  var newReplyArea = ctx => {
    var $textArea = $('<textarea>', { class: 'forum-textarea' })
    var $submitBtn = $('<button>', {
      text: '回复',
      class: 'forum-submit-btn',
    }).click(function() {
      var content = $textArea.val()
      if (!content) return
      console.info('New reply', content)
    })

    var $container = $('<div>', {
      class: 'forum-new-reply-area',
    }).append(
      $('<label>', { class: 'forum-input-container' }).append(
        $('<div>').append($textArea),
        $('<div>').append($submitBtn)
      )
    )

    return $container
  }

  // 新帖子容器
  var newThreadArea = ctx => {
    var $textArea = $('<textarea>', { class: 'forum-textarea' })
    var $submitBtn = $('<button>', {
      text: '发送',
      class: 'forum-submit-btn',
    }).click(function() {
      var content = $textArea.val()
      if (!content) return
      console.info('New thread', content)
    })

    var $container = $('<div>', {
      class: 'forum-new-thread-area',
    }).append(
      $('<label>', { class: 'forum-input-container' }).append(
        $('<div>').append($textArea),
        $('<div>').append($submitBtn)
      )
    )

    return $container
  }

  // 新论坛容器
  var newForumContainer = ctx => {
    return $('<div>').append($('<p>', { text: 'newForumContainer' }))
  }

  // 无论坛容器
  var noForumContainer = ctx => {}

  var afterForum = ctx => {
    return $('<div>', { class: 'forum-thread forum-add-thread' }).append(
      newThreadArea(ctx)
    )
  }

  var afterAllForums = ctx => {
    return newForumContainer(ctx)
  }

  // @function dateFormat
  function dateFormat(fmt, date) {
    date = date || new Date()
    var o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + '').substr(4 - RegExp.$1.length)
      )
    }
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ('00' + o[k]).substr(('' + o[k]).length)
        )
      }
    return fmt
  }

  next &&
    next({
      allForumsContainer,
      forumContainer,
      threadContainer,
      afterAllForums,
      afterForum,
      noForumContainer,
    })
})
