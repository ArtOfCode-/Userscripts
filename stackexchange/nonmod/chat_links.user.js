// ==UserScript==
// @name         Chat Links
// @namespace    https://artofcode.co.uk
// @version      0.0.3
// @description  Links a user's chat profile from their main-site profile.
// @author       ArtOfCode
// @match        *://*.stackexchange.com/users/*
// @match        *://*.superuser.com/users/*
// @match        *://*.serverfault.com/users/*
// @match        *://*.stackapps.com/users/*
// @match        *://*.mathoverflow.net/users/*
// @match        *://*.askubuntu.com/users/*
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/nonmod/chat_links.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/nonmod/chat_links.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    "use strict";

    $(document).ready(function() {
        if (location.pathname.match(/\/users\/\d+\/\w+/)) {
            let networkLink = $(".additional-links a").last();
            let networkLinkRegex = /https?:\/\/stackexchange\.com\/users\/(\d+)\/\w+/;
            let match = networkLink.attr("href").match(networkLinkRegex);
            if (match && match.length >= 2) {
                let networkID = match[1];
                let chatUrl = "https://chat.stackexchange.com/accounts/" + networkID;
                let chatLink = $("<a></a>").attr("href", chatUrl).text("Chat Profile");
                networkLink.after(chatLink);
            }
        }
    });
})();
