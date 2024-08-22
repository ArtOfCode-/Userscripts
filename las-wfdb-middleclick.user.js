// ==UserScript==
// @name         WFDB: Make links middle-clickable
// @namespace    http://data/*
// @version      2024-08-22.01
// @description  Modify links in the WFDB to enable opening in a new tab.
// @author       You
// @match        http://data/*
// @match        https://portal.londonambulance.nhs.uk/Data/*
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/las-wfdb-middleclick.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/las-wfdb-middleclick.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const body = document.querySelector('body');
    const mutationConfig = { childList: true, subtree: true };

    const observer = new MutationObserver(async (mutationList, observer) => {
        setTimeout(async () => {
            const links = document.querySelectorAll('a');
            Array.from(links).forEach(link => {
                // If link is a JS redirect, rewrite href to an actual new-tab link.
                if (link.href.startsWith('javascript:location.href')) {
                    // Remove JS including URL-encoded end quote.
                    let plainURI = link.href.replace("javascript:location.href='", '');
                    plainURI = plainURI.substr(0, plainURI.length - 3);
                    link.href = plainURI;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
            });
        }, 100);
    });

    observer.observe(body, mutationConfig);
})();
