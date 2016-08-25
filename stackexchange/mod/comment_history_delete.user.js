// ==UserScript==
// @name 		Comment history tools
// @namespace 	artofcode.co.uk
// @description Delete and edit comments from comment history.
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
// @version 	0.0.1
// @grant none
// @attribute   ThiefMaster <adrian@planetcoding.net>
// ==/UserScript==

var userscript = function($) {
    function deleteComment(id) {
        return $.ajax({
            url: '/posts/comments/' + id + '/vote/10',
            type: 'POST',
            data: {
                fkey: StackExchange.options.user.fkey
            },
            dataType: 'text'
        });
    }

    $('.meta-row:not(.deleted-row) > td > a').after(' <a href="#" class="delete-comment">(delete)</a>');
    $('.delete-comment').on('click', function(e) {
        e.preventDefault();
        var $this = $(this);
        var row = $this.closest('.meta-row');
        var id = row.data('id');
        deleteComment(id).then(function(data) {
            row.addClass('deleted-row');
            row.next('.text-row').addClass('deleted-row');
            $this.remove();
        }, function(xhr, textStatus) {
            alert('Failed ' + id + ': ' + textStatus);
        });
    });
	
	$('.text-row:not(.deleted-row) > td').on('click', function(ev) {
		var commentText = $(this).text();
		$(this).html("<textarea style='width:100%;margin:5px;' rows='4'>" + commentText + "</textbox>");
		$(this).append("<br/><button class='comment-edit-submit'>Save</button>");
	});
	
	$('.comment-edit-submit').on('click', function(ev) {
		var $this = $(this);
		var commentId = $(this).parent().data("id");
		var postId = $(this).parent().data("postid");
		var comment = $(this).siblings("textarea").first().text();
		$(this).attr("disabled", "disabled");
		$.ajax({
			'type': 'POST',
			'url': '/posts/comments/' + commentId + 'edit',
			'data': {
				'comment': comment,
				'fkey': StackExchange.options.user.fkey
			}
		})
		.done(function(data) {
			$this.text(comment);
		})
		.error(function(jqXHR, textStatus, errorThrown) {
			StackExchange.helpers.showErrorMessage($('.topbar'), "An error occurred while editing.", {
				'position': 'toast',
				'transient': true,
				'transientTimeout': 10000
			});
		});
	});
});

var el = document.createElement("script");
el.type = "application/javascript";
el.text = "(" + userscript + ")(jQuery);";
document.head.appendChild(el);
