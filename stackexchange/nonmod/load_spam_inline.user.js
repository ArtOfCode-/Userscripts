// ==UserScript==
// @name         Inline Spam-Deletion Loader
// @namespace    http://artofcode.co.uk
// @version      0.0.9
// @description  Loads spam/offensive-deleted posts inline, rather than making you visit revisions.
// @author       ArtOfCode
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @match        *://*.askubuntu.com/*
// @updateURL    http://artofcode.co.uk/res/dl/load_spam_inline.user.js
// @downloadURL  http://artofcode.co.uk/res/dl/load_spam_inline.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

'use strict';

window.spamLoader = {
    /**
     * Detects whether or not a given post was deleted as spam/offensive.
     * @param {Object} post - A selector or jQuery object representing the post parent <div>.
     * @return {Boolean}
     */
    isSpamPost: function(post) {
        return $(post).hasClass("deleted-answer") && $(post).find(".hidden-deleted-question").length >= 1;
    },
    
    /**
     * Starts an AJAX call to fetch the revisions page of the given post.
     * @param {Number} postId - The ID of the post you want the revisions page for.
     * @return {Object} - A jQuery promise object, on which you should implement callbacks to get the data.
     */
    requestRevisionsPage: function(postId) {
        return $.get("/posts/" + postId + "/revisions");
    },
    
    /**
     * Extracts the post data from the revisions page. Returned body is the most recent owner revision.
     * @param {string} revisionsPage - A string of HTML, representing the revisions page.
     * @return {Object} - An object, with fields for title, body, and tags.
     */
    extractPost: function(revisionsPage) {
        var postElement = $(".owner-revision", revisionsPage).first().next();
        return {
            "title": postElement.find("h1").text(),
            "body": postElement.find(".post-text").html(),
            "tags": postElement.find(".tags-diff").html()
        };
    }
}

$(".question, .answer").each(function() {
    console.log("LSI: looping");
    var post = $(this);
    if(spamLoader.isSpamPost(post)) {
        var postType = post.hasClass("question") ? "question" : "answer";
        var id = post.data(postType + "id");
        var revisions = spamLoader.requestRevisionsPage(id)
        revisions.done(function(data) {
            var postData = spamLoader.extractPost(data);
            var postCell = post.find(".post-text");
            postCell.html("")
                .append('<p style="color:#A50000;font-weight:bold;">This post was deleted as spam/offensive. It would not normally '
                    + 'be shown, but you\'re running a userscript that loads these posts inline.</p>')
                .append(postData["body"]);
        });
    }
});
