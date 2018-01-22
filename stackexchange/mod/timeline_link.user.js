// ==UserScript==
// @name         Timeline & Revisions Links
// @namespace    https://artofcode.co.uk/
// @version      0.0.1
// @description  Adds links to a post's user timeline and revisions so you don't have to dig around for them.
// @author       ArtOfCode
// @match       *://*.stackexchange.com/*
// @match       *://*.stackoverflow.com/*
// @match       *://*.superuser.com/*
// @match       *://*.serverfault.com/*
// @match       *://*.askubuntu.com/*
// @match       *://*.stackapps.com/*
// @match       *://*.mathoverflow.net/*
// @exclude     *://chat.stackexchange.com/*
// @exclude     *://chat.meta.stackexchange.com/*
// @exclude     *://chat.stackoverflow.com/*
// @exclude     *://blog.stackoverflow.com/*
// @exclude     *://*.area51.stackexchange.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/timeline_link.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/timeline_link.user.js
// ==/UserScript==

(function() {
    'use strict';

    const addLink = (el, href, text) => {
        const menu = $(el).find('.post-menu');
        if (menu.find('div').length < 1) {
            menu.append('<div></div>');
        }
        menu.append('<span class="lsep">|</span>');
        menu.append(`<a href="${href}">${text}</a>`);
    };

    $('.question, .answer').each((i, el) => {
        const id = $(el).data('questionid') || $(el).data('answerid');
        addLink(el, `${location.protocol}//${location.host}/posts/${id}/timeline`, 'timeline');
        addLink(el, `${location.protocol}//${location.host}/posts/${id}/revisions`, 'revisions');
    });
})();
