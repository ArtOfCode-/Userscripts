// ==UserScript==
// @name        Stack Mod Style Mod
// @description 'Mod'[0] == 'Moderator' && 'Mod'[1] == 'Modification';
// @author      ArtOfCode
// @version     0.1.1
// @namespace   http://artofcode.co.uk/
// @grant       none
// @match       *://*.stackexchange.com/*
// @match       *://*.stackoverflow.com/*
// @match       *://*.superuser.com/*
// @match       *://*.serverfault.com/*
// @match       *://*.askubuntu.com/*
// @match       *://*.stackapps.com/*
// @match       *://*.mathoverflow.net/*
// @updateURL   https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/style_mod.user.js
// @downloadURL https://github.com/ArtOfCode-/Userscripts/raw/master/stackexchange/mod/style_mod.user.js
// @run-at      document-idle
// ==/UserScript==

'use strict';

window.styleMod = {};

styleMod.NotSupportedException = function(message) {
    return {
        'type': 'NotSupportedException',
        'message': message
    }
}

styleMod.createStyleSheet = function() {
    var el = document.createElement("style");
    
    // WebKit hack
    el.appendChild(document.createTextNode(""));
    
    document.head.appendChild(el);
    
    return el.sheet;
}

styleMod.addCSS = function(sheet, selector, rules) {
    var ruleString = "";
    var keys = Object.keys(rules);
    
    for(var i = 0; i < keys.length; i++) {
        ruleString += keys[i] + ": " + rules[keys[i]] + "; ";
    }
    
    console.log("[StyleMod] Rules: " + ruleString);
    
    if(sheet.insertRule) {
        sheet.insertRule(selector + "{" + ruleString + "}", 0);
    }
    else if(sheet.addRule) {
        sheet.addRule(selector, ruleString, 0);
    }
    else {
        throw new styleMod.NotSupportedException("Adding CSS rules directly to stylesheets is not supported on this platform.");
    }
}

var modSheet = styleMod.createStyleSheet();

styleMod.addCSS(modSheet, ".supernovabg", {
    'background': 'yellow',
    'color': 'black !important'
});

// These next two are required to apply the styles to the annotations indicator on the mod user view.
styleMod.addCSS(modSheet, ".user-page .subheader.reloaded .mod-links .supernovabg", {
    'background': 'yellow',
    'color': 'black !important'
});
styleMod.addCSS(modSheet, ".user-page .subheader.reloaded .mod-links .supernovabg:hover", {
    'background': 'yellow',
    'color': 'black !important'
});

styleMod.addCSS(modSheet, ".hotbg", {
    'background': 'purple',
    'color': 'white !important'
});

styleMod.addCSS(modSheet, ".supernovabg a", {
    'color': 'black !important'
});

styleMod.addCSS(modSheet, ".msemi-timeline-div", {
    'background': '#BEC1ED'
});
