// ==UserScript==
// @name SE Flagger Privileges
// @grant none
// @match *://*.stackexchange.com/*
// @match *://*.stackoverflow.com/*
// @match *://*.superuser.com/*
// @match *://*.serverfault.com/*
// @match *://*.askubuntu.com/*
// @match *://*.stackapps.com/*
// @match *://*.mathoverflow.net/*
// ==/UserScript==

var userscript = function($) {

    $('.flag-row a').each(function() {
        var user = $(this);
        var userId = user.attr('href').match(/\d+/)[0];
        
        console.log("[FlaggerPrivs] UserId: " + userId);
        
        $.get('/help/privileges/user/' + userId, function(data) {
            var earnedPrivileges = $("div.privilege-table-row.earned", data);
            
            var getPrivilegeName = function(slug) {
                var privs = {
                    "trusted user": "delete A",
                    "moderator tools": "delete Q",
                    "close questions": "close",
                    "edit": "edit",
                    "vote down": "downvote",
                    "comment": "comment"
                }
                return (slug in privs ? privs[slug] : null);
            }
            
            var privileges = [];
            
            earnedPrivileges.each(function() {
                var privLink = $(this).parent().attr("href"),
                    split = privLink.split("/"),
                    privName = getPrivilegeName(split[split.length - 1].replace("-", " ").trim());
                
                if(privName !== null) {
                    privileges.push(privName);
                }
            });
            
            user.text(user.text() + " [" + (privileges.length > 0 ? privileges[0] : "none") + "]");
        });
    });

};

var el = document.createElement('script');
el.type = 'text/javascript';
el.text = '(' + userscript + ')(jQuery);';
document.head.appendChild(el);
