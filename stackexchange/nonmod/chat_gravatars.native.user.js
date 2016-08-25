// ==UserScript==
// @name        Chat Gravatars
// @description Changes chat gravatars to use s=128 images instead of s=16.
// @author      ArtOfCode
// @version     0.0.3
// @namespace   http://artofcode.co.uk/
// @grant       none
// @match       *://chat.stackexchange.com/rooms/*
// @match       *://chat.stackoverflow.com/rooms/*
// @match       *://chat.meta.stackexchange.com/rooms/*
// @run-at      document-idle
// ==/UserScript==

var userscript = function($) {
    
    'use strict';

    function replaceImages() {
        $("div.avatar").each(function() {
            var $image = $(this).children("img").first();
            var src = $image.attr("src");
            
            if(src.indexOf("gravatar.com") > -1) {
                src = src.replace("s=16", "s=128");
                $image.attr("src", src);
            }
        });
    }

    replaceImages();

    $(document).bind("DOMNodeInserted", function() {
        replaceImages();
    });
    
}

var el = document.createELement("script");
el.type = "application/javascript";
el.text = "(" + userscript + ")(jQuery);";
document.body.appendChild(el);
