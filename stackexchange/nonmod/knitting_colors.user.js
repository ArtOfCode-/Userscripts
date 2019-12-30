// ==UserScript==
// @name        Knitting Editor Colors
// @description Add more colors to the SE Winter Bash Knitting Editor.
// @namespace   https://charcoal-se.org/
// @author      ArtOfCode
// @match       https://winterbash2019.stackexchange.com/
// @grant       none
// @run-at      document-start
// @version     0.4.1
// @updateURL   https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/nonmod/knitting_colors.user.js
// @downloadURL https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/nonmod/knitting_colors.user.js
// ==/UserScript==

/**
 * Colors config - you can edit this bit to add any extra colors you want.
 */

const newColors = ["#272727", "#757575", "#c3c3c3", "#ffffff", "#90d7f4", "#18459e", "#346db4", "#5353b2", "#ec93e7", "#9a0a10", "#ed1c24", "#ff5949", "#e68d20", "#c69c6d", "#81501a",
                   "#fece05","#3a990f","#8cc63f","#aae09a"];

/**
 * DO NOT EDIT THE FOLLOWING UNLESS YOU KNOW WHAT YOU'RE DOING
 */

const isFF = (function f() {return 1;}).toSource().indexOf("JSON") === -1;

const customJQuery = function (f) {
  if (arguments.length === 1 && typeof(f) === "function") {
    let source = isFF ? f.toSource() : f.toString();
    source = source.replace('["#272727","#6a737c","#bbc0c4","#18459e","#346db4","#5353b2","#addafc","#90d7f4","#942121","#ed1c24","#e87c87","#4d004d","#800080","#ec93e7","#f48024","#e68d20","#c69c6d","#fece05","#b89516","#29603b","#2f6f44","#48a868","#8cc63f","#a6d9b7","#ffffff"]',
                            `[${newColors.join(',')}]`);
    source = isFF ? source : `(${source})`;
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
