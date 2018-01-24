// ==UserScript==
// @name        Move SE Mod Info
// @description Moves the mod quick-peek info box to somewhere that doesn't require a wider viewport.
// @author      ArtOfCode
// @version     0.5.2
// @namespace   https://artofcode.co.uk/
// @grant       none
// @match       *://*.stackexchange.com/*
// @match       *://*.stackoverflow.com/*
// @match       *://*.superuser.com/*
// @match       *://*.serverfault.com/*
// @match       *://*.askubuntu.com/*
// @match       *://*.stackapps.com/*
// @match       *://*.mathoverflow.net/*
// @run-at      document-idle
// @updateURL   https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/move_mod_info.user.js
// @downloadURL https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/move_mod_info.user.js
// ==/UserScript==


// this serves only to avoid embarassing mistakes caused by inadvertently loading this script onto a page that isn't a Stack Exchange page
var isSEsite = false;
for (var s of document.querySelectorAll("script")) isSEsite = isSEsite||/StackExchange\.ready\(/.test(s.textContent);

// don't bother running this if the user isn't a moderator on the current site
if (!isSEsite || typeof StackExchange === "undefined" || !StackExchange.options.user.isModerator || StackExchange.options.user.userType !== 4)
    return;

/* globals $, StackExchange, modinfo */
window.modinfo = {};

modinfo.createIndicator = function(text, href, targetBlank, background) {
    let $link = $("<a></a>");
    $link.attr("href", href);
    $link.attr("target", (targetBlank ? "_blank" : ""));
    $link.css("color", "white");
    
    $link.html($("<div></div>")
        .addClass(background + (background === "supernova" || background === "hot" ? "bg" : ""))
        .css("padding", "6px")
        .css("border-radius", "2px")
        .css("margin", "5px")
        .text(text));
    
    return $link;
};

// ok, there's two possibilities here: 
// 1. this is running BEFORE the marginal mod indicators have loaded (probably true but not guaranteed)
// 2. this is running AFTER the mraginal mod indicators have loaded and they've already been inserted into the page DOM
//
// To make this robust AND avoid having to load them twice... design the logic such that it expects them marginal indicators to already exist, 
// and just wait for them to load before running.

function WaitForMMI()
{
    var loaded = $.Deferred();
    if ( $(".post-issue-display").length )
      loaded.resolve();
    
   $(document)
      .ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions)
      {
         if (ajaxOptions.url.indexOf("/admin/posts/issues/") == 0)
         {
            setTimeout(() =>loaded.resolve(), 1);
         }
      });

    return loaded.promise();
}

WaitForMMI().then(function()
{
    // hide marginal mod indicators
    $(".post-issue").hide();
    
    $(".question, .answer").each(function() 
    {
        let postType = $(this).hasClass("question") ? "question" : "answer";
        let postId = $(this).data(postType + "id");

        let postDiv = $("div." + postType + "[data-" + postType + "id='" + postId + "']");
        
        let issues = $(this).find(".post-issue-display"),
            flags = issues.find("a[href='/admin/posts/" + postId + "/show-flags']"),
            deletedComments = issues.find("a[href='/admin/posts/" + postId + "/comments']"),
            timeline = issues.find("a[href='/admin/posts/timeline/" + postId + "']"),
            flagCount = (flags.text().match(/(\d+)/g)||[null])[0],
            deletedCommentCount = (deletedComments.text().match(/(\d+)/g)||[null])[0];
        

        if(flagCount !== null) {
            let $flags = modinfo.createIndicator(flagCount, "/admin/posts/" + postId + "/show-flags", true, "supernova");
            $flags.attr("title", flagCount + " flags have been cast on this post");
            $flags.appendTo(postDiv.find("div.vote"));
        }
        
        if(deletedCommentCount !== null) {
            let $comments = modinfo.createIndicator(deletedCommentCount, "#", false, "hot");
            $comments.attr("title", "there are " + deletedCommentCount + " deleted comments on this post");
            $comments.click(function(e) {
                e.preventDefault();
                deletedComments.click();
            });
            $comments.appendTo(postDiv.find("div.vote"));
        }
        
        // this makes no sense to me; every post has a timeline and it's always at the same URL so we don't even need to bother using the one in the marginal indicator --Shog9
        if(timeline.length) {
            let $timeline = modinfo.createIndicator("T", timeline.attr("href"), true, "");
            $timeline.children("div").css("background", "#1B7ECE").addClass('msemi-timeline-div');
            $timeline.attr("title", "mod timeline");
            $timeline.children("a").first().attr("href", "/admin/posts/timeline/" + postId);
            $timeline.appendTo(postDiv.find("div.vote"));
        }
    });
});
