// ==UserScript==
// @name        Mod Dashboard
// @description An improved version of the mod dashboard. Also makes it narrower, for smaller viewports.
// @author      ArtOfCode
// @version     0.1.0
// @namespace   http://artofcode.co.uk/
// @grant       none
// @match       *://*.stackexchange.com/users/account-info/*
// @match       *://*.stackoverflow.com/users/account-info/*
// @match       *://*.superuser.com/users/account-info/*
// @match       *://*.serverfault.com/users/account-info/*
// @match       *://*.askubuntu.com/users/account-info/*
// @match       *://*.stackapps.com/users/account-info/*
// @match       *://*.mathoverflow.net/users/account-info/*
// @run-at      document-idle
// ==/UserScript==

window.modpage = {};

modpage.getUserId = function() {
    return location.pathname.match(/(\d+)/g)[0];
}

modpage.useNarrowPage = function() {
    if(localStorage.getItem("modpage_narrow") === "yes") {
        return true;
    }
    else if(localStorage.getItem("modpage_narrow") === "no") {
        return false;
    }
    else {
        return null;
    }
}

modpage.adjustWidth = function(width) {
    $(".topbar-wrapper, #header, #content").width(width);
}

modpage.getActivityContent = function(userPanels, callback) {
    $.ajax({
        type: 'GET',
        url: '/users/' + modpage.getUserId() + '?tab=topactivity'
    })
    .done(function(data) {
        callback($(userPanels.join(", "), data));
    })
    .error(function(jqXHR, textStatus, errorThrown) {
        callback(errorThrown);
    });
}

modpage.insertActivity = function() {
    modpage.getActivityContent(
        ['#user-panel-answers', '#user-panel-questions', '#user-panel-reputation', '#user-panel-votes'],
        function(data) {
            var $append = $("#allPII").parent();
            if(data.constructor === $) {
                $append.append(data);
            }
            else {
                $append.append("<div class='system-alert'>Couldn't fetch activity data because of an error: " + data + ".</div>");
            }
        }
    );
}

if(modpage.useNarrowPage()) {
    modpage.adjustWidth(900);
}
else if(modpage.useNarrowPage() === null) {
    var useNarrow = window.confirm("Use the narrower (900px) version of this page? (You will only be asked this once.)");
    if(useNarrow) {
        localStorage.setItem("modpage_narrow", "yes");
        modpage.adjustWidth(900);
    }
    else {
        localStorage.setItem("modpage_narrow", "no");
    }
}
modpage.insertActivity();
