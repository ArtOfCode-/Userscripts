// ==UserScript==
// @name        Move SE Mod Info
// @description Moves the mod quick-peek info box to somewhere that doesn't require a wider viewport.
// @author      ArtOfCode
// @version     0.2.12
// @namespace   http://artofcode.co.uk/
// @grant       none
// @match       *://*.stackexchange.com/*
// @match       *://*.stackoverflow.com/*
// @match       *://*.superuser.com/*
// @match       *://*.serverfault.com/*
// @match       *://*.askubuntu.com/*
// @match       *://*.stackapps.com/*
// @match       *://*.mathoverflow.net/*
// @run-at      document-idle
// ==/UserScript==

var userscript = function($) {
    if(StackExchange.options.user.userType === 4) {

        window.modinfo = {};

        modinfo.createIndicator = function(text, href, targetBlank, background) {
            var $link = $("<a></a>");
            $link.attr("href", href);
            $link.attr("target", (targetBlank ? "_blank" : ""));
            $link.text(text);
            $link.css("color", "white");
            
            $link.html($("<div></div>")
                .addClass(background + (background == "supernova" || background == "hot" ? "bg" : ""))
                .css("padding", "6px")
                .css("border-radius", "2px")
                .css("margin", "5px")
                .text(text));
            
            return $link;
        }

        modinfo.getFlagCount = function(postId, callback) {
            if(!modinfo.postIssues) {
                $.ajax({
                    type: 'GET',
                    url: '/admin/posts/issues/' + postId,
                    data: {
                        fkey: StackExchange.options.user.fkey
                    }
                }).done(function(data) {
                    modinfo.postIssues = data;
                    
                    var matches = $("a[href='/admin/posts/" + postId + "/show-flags']", data).text().match(/(\d+)/g);
                    if(matches) {
                        callback(matches[0]);
                    }
                    else {
                        callback(null);
                    }
                }).error(function() {
                    callback(null);
                });
            }
            else {
                var matches = $("a[href='/admin/posts/" + postId + "/show-flags']", modinfo.postIssues).text().match(/(\d+)/g);
                if(matches) {
                    callback(matches[0]);
                }
                else {
                    callback(null);
                }
            }
        }

        modinfo.getCommentCount = function(postId, callback) {
            if(!modinfo.postIssues) {
                $.ajax({
                    type: 'GET',
                    url: '/admin/posts/issues/' + postId,
                    data: {
                        fkey: StackExchange.options.user.fkey
                    }
                }).done(function(data) {
                    var matches = $("a.fetch-deleted-comments", data).text().match(/(\d+)/g);
                    if(matches) {
                        callback(matches[0]);
                    }
                    else {
                        callback(null);
                    }
                }).error(function() {
                    callback(null);
                });
            }
            else {
                var matches = $("a.fetch-deleted-comments", modinfo.postIssues).text().match(/(\d+)/g);
                if(matches) {
                    callback(matches[0]);
                }
                else {
                    callback(null);
                }
            }
        }
        
        modinfo.getTimelineLink = function(postId, callback) {
            if(!modinfo.postIssues) {
                $.ajax({
                    type: 'GET',
                    url: '/admin/posts/issues/' + postId,
                    data: {
                        fkey: StackExchange.options.user.fkey
                    }
                }).done(function(data) {
                    var matches = $("a[href='/admin/posts/timeline/" + postId + "']", data);
                    if(matches) {
                        callback(matches);
                    }
                    else {
                        callback(null);
                    }
                }).error(function() {
                    callback(null);
                });
            }
            else {
                var matches = $("a[href='/admin/posts/timeline/" + postId + "']", modinfo.postIssues);
                if(matches) {
                    callback(matches);
                }
                else {
                    callback(null);
                }
            }
        }

        modinfo.showDeletedComments = function(onPost) {
            StackExchange.comments.loadAll(onPost, '?includeDeleted=true').done(function() {
                modinfo.bindUndeleteComment(onPost);
                
                var commentDiv = StackExchange.comments.uiForPost(onPost).jDiv;
                
                if (!modinfo.isElementInViewport(commentDiv[0])) {
                    $('html, body').animate({
                        scrollTop: commentDiv.offset().top
                    }, 200);
                }
            });
        }

        // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
        modinfo.isElementInViewport = function(el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
            );
        }

        modinfo.bindUndeleteComment = function(onPost) {
            var commentUi = StackExchange.comments.uiForPost(onPost);

            commentUi.jDiv.find('.undelete-comment').click(function () {
                var undelete = $(this),
                    row = undelete.closest('.comment'),
                    commentId = row.attr('id').replace('comment-','');
                
                if (undelete.is(':working')) return;
                undelete.working(true).addSpinnerAfter({ 'padding':'0 3px' });

                $.ajax({
                    type: 'POST',
                    url: '/admin/posts/{postId}/comments/{commentId}/undelete'
                        .replace("{postId}", commentUi.postId)
                        .replace("{commentId}", commentId),
                    dataType: 'html',
                    data: {
                        fkey: StackExchange.options.user.fkey
                    }
                })
                .done(function (singleCommentRow) {
                    row.replaceWith(singleCommentRow);
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    undelete.parent().showErrorMessage(textStatus || 'An error occurred while trying to undelete');
                })
                .always(function () {
                    StackExchange.helpers.removeSpinner();
                    undelete.working(false);
                });

            });
        }

        var $posts = $(".question, .answer");

        $posts.each(function() {
            var postType = $(this).hasClass("question") ? "question" : "answer";
            var postId = $(this).data(postType + "id");

            var postDiv = $("div." + postType + "[data-" + postType + "id='" + postId + "']");

            modinfo.getFlagCount(postId, function(flags) {
                modinfo.getCommentCount(postId, function(comments) {
                    modinfo.getTimelineLink(postId, function(timeline) {
                        if(flags !== null) {
                            var $indicator = modinfo.createIndicator(flags, "/admin/posts/" + postId + "/show-flags", true, "supernova");
                            $indicator.attr("title", flags + " flags have been cast on this post");
                            $indicator.appendTo(postDiv.find("div.vote"));
                        }
                        
                        if(comments !== null) {
                            var $indicator = modinfo.createIndicator(comments, "#", false, "hot");
                            $indicator.attr("title", "there are " + comments + " deleted comments on this post");
                            $indicator.click(function(e) {
                                e.preventDefault();
                                modinfo.showDeletedComments(postDiv);
                            });
                            $indicator.appendTo(postDiv.find("div.vote"));
                        }
                        
                        if(timeline !== null) {
                            var $indicator = modinfo.createIndicator("T", timeline.attr("href"), true, "");
                            $indicator.children("div").css("background", "#1B7ECE");
                            $indicator.attr("title", "mod timeline");
                            $indicator.children("a").first().attr("href", "/admin/posts/timeline/" + postId);
                            $indicator.appendTo(postDiv.find("div.vote"));
                        }
                    });
                });
            });
        });

        $(document).on("DOMNodeInserted", function(e) {
            if($(e.target).hasClass("post-issue")) {
                $(e.target).remove();
            }
        });
        
    }
}

var el = document.createElement("script");
el.type = "application/javascript";
el.text = "(" + userscript + ")(jQuery);";
document.head.appendChild(el);
