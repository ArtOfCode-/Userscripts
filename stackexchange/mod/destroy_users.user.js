// ==UserScript==
// @name         User Destruction Streamliner
// @namespace    https://artofcode.co.uk/
// @version      0.2.2
// @description  Adds a destruction button to user cards.
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
// @updateURL   https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/destroy_users.user.js
// @downloadURL https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/destroy_users.user.js
// ==/UserScript==

(function() {
    'use strict';

    if (!StackExchange.options.user.isModerator) {
        return;
    }

    const addLinks = () => {
        $('.user-info .-flair').each((i, el) => {
            const userLink = $(el).parent().find('a').first();
            if (!userLink || !userLink.attr('href')) {
                return;
            }

            const id = userLink.attr('href').match(/\/(\d+)\//)[1];
            const trigger = $('<a/>');
            trigger.text('destroy').attr('href', '#').addClass('custom-user-destroy').css('float', 'right').data('uid', id);
            trigger.appendTo(el);
        });
    };

    $(document).ready(() => {
        addLinks();

        $(document).on('DOMNodeInserted', (ev) => {
            if ($(ev.target).attr('id') === 'user-browser') {
                addLinks();
            }
        });

        $(document).on('click', '.custom-user-destroy', (ev) => {
            ev.preventDefault();
            const id = $(ev.target).data('uid');
            if (confirm('Are you REALLY REALLY sure?')) {
                $.ajax({
                    type: 'POST',
                    url: `/admin/users/${id}/destroy`,
                    data: {
                        annotation: null,
                        deleteReasonDetails: null,
                        'mod-actions': 'destroy',
                        destroyReason: 'This user was created to post spam or nonsense and has no other positive participation',
                        destroyReasonDetails: null,
                        fkey: StackExchange.options.user.fkey
                    }
                }).done((data) => {
                    $(ev.target).parents('td').first().remove();
                }).fail((xhr) => {
                    console.log(`Failed with ${xhr.status}.`);
                });
            }
        });
    });
})();
