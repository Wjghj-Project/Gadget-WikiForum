/**
 * @name WikiForum.loader.default
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @description Provide a front-end structured discussion page with JavaScript.
 *              Similar to Community Feed and support wikitext.
 *
 * @license MIT
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */

/******/ (function() { // webpackBootstrap
/*!***************************!*\
  !*** ./loader/default.js ***!
  \***************************/
mw.hook('WikiForum').add(function (Core) {
  var conf = mw.config.get();
  var settings = window.WikiForumLoaderDefault || {};
  var loadNS = settings.loadNS || window.WikiForumNS || [];

  if (typeof loadNS === 'string') {
    loadNS = Number(loadNS);

    if (isNaN(loadNS)) {
      loadNS = [];
    } else {
      loadNS = [loadNS];
    }
  }

  if (typeof loadNS === 'number') loadNS = [loadNS];
  if (loadNS.length < 1 && conf.wgNamespaceIds.forum) loadNS = [conf.wgNamespaceIds.forum];

  if (loadNS.includes(conf.wgNamespaceNumber) && $('.wiki-forum').length > 0 && conf.wgArticleId !== 0) {
    Core.renderer.fromPage(conf.wgPageName);
  }
});
/******/ })()
;
//# sourceMappingURL=WikiForum.loader.default.js.map