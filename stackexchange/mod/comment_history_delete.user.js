// ==UserScript==
// @name        Comment history tools
// @namespace   artofcode.co.uk
// @description Delete and edit comments from comment history.
// @match       *://*.stackexchange.com/admin/users/*/post-comments*
// @match       *://*.stackoverflow.com/admin/users/*/post-comments*
// @match       *://*.superuser.com/admin/users/*/post-comments*
// @match       *://*.serverfault.com/admin/users/*/post-comments*
// @match       *://*.askubuntu.com/admin/users/*/post-comments*
// @match       *://*.stackapps.com/admin/users/*/post-comments*
// @match       *://*.mathoverflow.net/admin/users/*/post-comments*
// @exclude     *://chat.stackexchange.com/*
// @exclude     *://chat.meta.stackexchange.com/*
// @exclude     *://chat.stackoverflow.com/*
// @version     0.4.1
// @grant       none
// @attribute   ThiefMaster <adrian@planetcoding.net>
// @updateURL   https://raw.githubusercontent.com/ArtOfCode-/Userscripts/master/stackexchange/mod/comment_history_delete.user.js
// @downloadURL https://raw.githubusercontent.com/ArtOfCode-/Userscripts/master/stackexchange/mod/comment_history_delete.user.js
// @supportURL  https://github.com/ArtOfCode-/Userscripts/issues
// ==/UserScript==

var userscript = function($) {
    function deleteComment(id) {
        return $.ajax({
            url: '/posts/comments/' + id + '/vote/10',
            type: 'POST',
            data: {
                fkey: StackExchange.options.user.fkey
            }
        });
    }
	
	function getTextNodesIn(el) {
		return $(el).find(":not(iframe)").andSelf().contents().filter(function() {
			return this.nodeType == 3;
		});
	};

    $('.meta-row:not(.deleted-row) > td > a').after(' <a href="#" class="delete-comment">(delete)</a>');
    $('.delete-comment').on('click', function(e) {
        e.preventDefault();
        var $this = $(this);
        var row = $this.closest('.meta-row');
        var id = row.data('id');
        deleteComment(id).then(function(data) {
            row.addClass('deleted-row').removeClass("meta-row");
            row.next('.text-row').addClass('deleted-row').removeClass("text-row");
            $this.remove();
        }, function(xhr, textStatus) {
            alert('Failed ' + id + ': ' + textStatus);
        });
    });
    
    $('.text-row:not(.deleted-row) > td').on('click', function(ev) {
		if ($(this).data("editing") != 'editing') {
			var commentText = $.trim(getTextNodesIn($(this))[0].data);
			$(this).html("<textarea class='edit-comment' style='width:90%;margin:5px;' rows='4'>" + commentText + "</textarea>");
			$(this).append("<br/><button class='comment-edit-submit'>Save</button>");
			$(this).data('editing', 'editing');
		}
    });
    
    $(document).on('DOMNodeInserted', function(insertEvent) {
        if ($(insertEvent.target).hasClass("comment-edit-submit")) {
            $(insertEvent.target).bind('click', function(ev) {
                var $this = $(this);
                var commentId = $(this).parent().parent().data("id");
                var postId = $(this).parent().parent().data("postid");
                var comment = $(this).siblings("textarea").first().val();
                $(this).attr("disabled", "disabled");
                $.ajax({
                    'type': 'POST',
                    'url': '/posts/comments/' + commentId + '/edit',
                    'data': {
                        'comment': comment,
                        'fkey': StackExchange.options.user.fkey
                    }
                })
                    .done(function(data) {
                    $this.parent().text(comment);
                    $this.parent().data('editing', 'false');
                })
                    .error(function(jqXHR, textStatus, errorThrown) {
                    StackExchange.helpers.showErrorMessage($('.topbar'), "An error occurred while editing.", {
                        'position': 'toast',
                        'transient': true,
                        'transientTimeout': 10000
                    });
                });
            });
        }
    });
}

var el = document.createElement("script");
el.type = "application/javascript";
el.text = "(" + userscript + ")(jQuery);";
document.head.appendChild(el);
