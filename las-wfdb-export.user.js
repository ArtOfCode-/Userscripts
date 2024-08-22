// ==UserScript==
// @name         WFDB: Export
// @namespace    http://data/*
// @version      2024-08-22
// @description  Make WFDB reports exportable - press Ctrl-Alt-C.
// @author       You
// @match        http://data/*
// @match        https://portal.londonambulance.nhs.uk/Data/*
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/las-wfdb-export.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/las-wfdb-export.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener('keydown', ev => {
        if (ev.keyCode === 67 && ev.ctrlKey && ev.altKey) {
            const reportRows = Array.from(document.querySelectorAll('table table table table table table tr'));
            const data = [];
            reportRows.slice(1).forEach(row => {
                const rowData = [];
                Array.from(row.children).slice(1).forEach(cell => {
                    rowData.push(`"${cell.innerText}"`);
                });
                data.push(rowData.join(','));
            });
            console.log(data.join('\n'));
        }
    });
})();
