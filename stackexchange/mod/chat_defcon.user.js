// ==UserScript==
// @name        Chatroom DEFCON
// @namespace   https://charcoal-se.org/
// @description Gives you an indication of the number of problems caused by users in this room.
// @author      ArtOfCode
// @version     0.0.2
// @updateURL   https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/chat_defcon.user.js
// @downloadURL https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/chat_defcon.user.js
// @supportURL  https://github.com/ArtOfCode-/Userscripts/issues
// @match       *://chat.stackexchange.com/rooms/*
// @grant       none
// ==/UserScript==

$(document).ready(function() {
  $("#roomname").after($("<span></span>").css({
    'text-shadow': 'none',
    'font-size': '12px',
    'background': '#ff6100',
    'color': 'white',
    'padding': '5px 8px',
    'border-radius': '3px',
    'margin-left': '10px'
  }).addClass('defcon'));

  var total = 0;
  var users = 0;
  CHAT.RoomUsers.all().forEach(function(u) {
    $.get('/admin/annotations/' + u.id).done(function(data) {
      var annos = $('#annotlist li', data).length;
      total += annos;
      if (annos > 0) {
        users += 1;
      }
      $('.defcon').text(total + ' (' + users + ')');
    });
  });
});
