// ==UserScript==
// @name         Stack Exchange List Browser
// @namespace    http://artofcode.co.uk
// @version      0.2.22
// @description  Saves lists and lets you go prev/next from item pages.
// @author       ArtOfCode
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @match        *://*.askubuntu.com/*
// @updateURL    http://artofcode.co.uk/res/dl/list_browser.user.js
// @downloadURL  http://artofcode.co.uk/res/dl/list_browser.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

'use strict';

window.listBrowser = {
    listPages: [
        /^\/$/g,                    // /
        /^\/questions$/g,           // /questions
        /^\/search$/g,              // /search?q=string
    ],
    
    postPages: [
        /^\/questions\/(.)+$/g      // /questions/*
    ],
    
    isValidPage: function(validPages) {
        for(var i = 0; i < validPages.length; i++) {
            var validPageExpr = validPages[i];
            if(location.pathname.match(validPageExpr)) {
                return true;
            }
        }
        return false;
    },
    
    onValidListPage: function() {
        if(this.isValidPage(listBrowser.listPages)) {
            return true;
        }
        else if($(".question-summary").length > 0) {
            return true;
        }
        return false;
    },
    
    onPostPage: function() {
        return this.isValidPage(listBrowser.postPages);
    },
    
    saveListToStore: function(list) {
        sessionStorage.setItem('lb_savedList', JSON.stringify(list));
    },
    
    getListFromStore: function() {
        return JSON.parse(sessionStorage.getItem('lb_savedList'));
    },
    
    getPathnameFromURI: function(uri) {
        return uri.split(/[?#]/)[0];
    },
    
    formListFromDOM: function() {
        var posts = $(".question-summary");
        var postLinks = posts.find(".summary a");
        
        var list = {};
        for(var i = 0; i < postLinks.length; i++) {
            var elem = $(postLinks[i]);
            var href = elem.attr("href");
            if(!href.contains("users") && !href.contains("tagged") && !elem.hasClass("started-link")) {
                var nextIndex = Object.keys(list).length;
                list[nextIndex] = listBrowser.getPathnameFromURI(href);
            }
        }
        
        return list;
    },
    
    getItemListIndex: function(item, list) {
        for(var i = 0; i < Object.keys(list).length; i++) {
            if(item == list[i]) {
                return i;
            }
        }
        return false;
    },
    
    applyStyles: function(toElement, elementType) {
        toElement.css("height", "70px")
            .css("width", "30px")
            .css("position", "fixed")
            .css("top", "calc(50% - 35px)")
            .css("cursor", "pointer");
        if(elementType == "prev") {
            toElement.css("border-left", "0")
                .css("left", "0")
                .css("background-image", "url('https://i.stack.imgur.com/ZAXYP.png')");
        }
        else {
            toElement.css("border-right", "0")
                .css("right", "0")
                .css("background-image", "url('https://i.stack.imgur.com/wYRpn.png')");
        }
        toElement.attr("title", "go to the " + (elementType == "prev" ? "previous" : "next") + " question from the last "
            + "list you browsed");
        return toElement;
    },
    
    getFullPostUri: function(pathname) {
        return location.protocol + "//" + location.hostname + pathname;
    },
    
    handleButtonClick: function(e) {
        var uri = $(e.target).data("action-uri");
        if(uri) {
            var postUri = listBrowser.getFullPostUri(uri);
            console.log(postUri);
            location.href = postUri;
        }
        else {
            alert("you've reached the end of the list");
        }
    }
}

$(document).ready(function() {
    
    if(listBrowser.onValidListPage()) {
        var list = listBrowser.formListFromDOM();
        listBrowser.saveListToStore(list);
    }
    else if(listBrowser.onPostPage()) {
        var list = listBrowser.getListFromStore();
        
        var listIndex = listBrowser.getItemListIndex(location.pathname, list);
        if(typeof(listIndex) === "number") {
            var prevIndex = listIndex - 1, nextIndex = listIndex + 1;
            
            var prevButton = listBrowser.applyStyles($("<div></div>"), "prev"),
                nextButton = listBrowser.applyStyles($("<div></div>"), "next");
                
            prevButton.data("action-uri", list[prevIndex]);
            nextButton.data("action-uri", list[nextIndex]);
            
            prevButton.click(listBrowser.handleButtonClick);
            nextButton.click(listBrowser.handleButtonClick);
            
            prevButton.appendTo("body");
            nextButton.appendTo("body");
            
            console.log(prevButton, nextButton);
        }
    }
    
});
