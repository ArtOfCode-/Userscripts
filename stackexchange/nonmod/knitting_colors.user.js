// ==UserScript==
// @name        Knitting Editor Colors
// @description Add more colors to the SE Winter Bash Knitting Editor.
// @namespace   https://charcoal-se.org/
// @author      ArtOfCode
// @match       https://winterbash2018.stackexchange.com/
// @grant       none
// @run-at      document-start
// @version     0.1.2
// @updateURL   https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/nonmod/knitting_colors.user.js
// @downloadURL https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/nonmod/knitting_colors.user.js
// ==/UserScript==

const isFF = (function f() {return 1;}).toSource().indexOf("JSON") === -1;

const customJQuery = function (f) {
  if (arguments.length === 1 && typeof(f) === "function") {
    let source = isFF ? f.toSource() : f.toString();
    source = source.replace('["#272727","#90d7f4","#18459e","#346db4","#5353b2","#ed1c24","#ec93e7","#e68d20","#c69c6d","#fece05","#8cc63f","#ffffff"]',
                            '["#272727","#757575","#c3c3c3","#ffffff","#90d7f4","#18459e","#346db4","#5353b2","#ec93e7","#9a0a10","#ed1c24","#ff5949","#e68d20","#c69c6d","#81501a","#fece05","#3a990f","#8cc63f","#aae09a"]');
    arguments[0] = eval(source);
  }

  return jQuery.apply(jQuery, arguments);
};

Object.defineProperty(window, "$", {
  get: function () {
    return customJQuery;
  },

  set: function (jq) {
    Object.keys(jq).forEach(key => {
      window.$[key] = jq[key];
    });
  }
});
