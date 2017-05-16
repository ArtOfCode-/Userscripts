// ==UserScript==
// @name         Show Comment Flagger
// @namespace    https://artofcode.co.uk/
// @version      0.0.1
// @description  Shows the user who flagged a comment
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
// ==/UserScript==

(function() {
    let getCommentFlaggerLink = function(link, user, callback) {
        let userRegex = /users\/(\d+)\/\w*/;
        let userID = userRegex.exec(user)[1];

        let commentRegex = /#comment(\d+)_\d+/;
        let commentID = commentRegex.exec(link)[1];

        let flaggedCommentsUrl = "/admin/users/" + userID + "/post-comments?state=flagged";
        $.ajax({
            'type': 'GET',
            'url': flaggedCommentsUrl
        })
        .done(function(data) {
            let comment = $(".text-row[data-id=" + commentID + "]", data);
            let flagger = $(".deleted-info", comment).first().children("a").first();
            callback(flagger.outerHTML());
        });
    };

    $(document).ready(function() {
        $(".js-flagged-comments .comment-link").each(function() {
            let comment = $(this);
            let user = comment.siblings("a").first().attr("href");
            let row = $(this).parent();
            let flagComment = $(".revision-comment", row);
            getCommentFlaggerLink(comment.attr("href"), user, function(flaggerLink) {
                let flagger = $("<em></em>").html("(by " + flaggerLink + ")");
                flagComment.after(flagger);
            });
        });
    });
})();
