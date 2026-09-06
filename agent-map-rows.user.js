// ==UserScript==
// @name         Agent Map Row Letters
// @namespace    http://192.168.222.165/
// @version      2025-01-19.01
// @author       You
// @description  Add row letters to the agent map.
// @match        http://192.168.222.165/wallboardcm10/frmAgentMap.aspx*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=222.165
// @grant        none
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/agent-map-rows.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/agent-map-rows.user.js
// ==/UserScript==

(function () {
    'use strict';

    let redrawPending = false;
    let lastColumnSignature = '';

    function getColumnPositions(desks) {
        return [...new Set(
            desks
                .map(d => parseInt(getComputedStyle(d).left, 10))
                .filter(v => !isNaN(v))
        )].sort((a, b) => a - b);
    }

    function drawLetters() {

        const desks = Array.from(
            document.querySelectorAll('.extension_container')
        );

        if (!desks.length) {
            return;
        }

        const columns = getColumnPositions(desks);
        const signature = columns.join('|');

        // Skip redraw if nothing changed
        if (signature === lastColumnSignature) {
            return;
        }

        lastColumnSignature = signature;

        document
            .querySelectorAll('.tm-column-letter')
            .forEach(el => el.remove());

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        columns.forEach((left, index) => {

            const desksInColumn = desks.filter(
                d => parseInt(getComputedStyle(d).left, 10) === left
            );

            if (!desksInColumn.length) {
                return;
            }

            const lowestDesk = desksInColumn.reduce((lowest, current) => {

                const currentTop =
                    parseInt(getComputedStyle(current).top, 10);

                const lowestTop =
                    parseInt(getComputedStyle(lowest).top, 10);

                return currentTop > lowestTop
                    ? current
                    : lowest;

            });

            const rect = lowestDesk.getBoundingClientRect();

            const marker = document.createElement('div');

            marker.className = 'tm-column-letter';
            marker.textContent =
                letters[index] || `C${index + 1}`;

            marker.style.position = 'fixed';
            marker.style.left = `${rect.left}px`;
            marker.style.top = `${rect.bottom + 5}px`;
            marker.style.width = `${rect.width}px`;

            marker.style.textAlign = 'center';
            marker.style.fontWeight = 'bold';
            marker.style.fontSize = '18px';

            marker.style.color = '#d00000';
            marker.style.background = '#ffffff';

            marker.style.zIndex = '99999';
            marker.style.pointerEvents = 'none';

            document.body.appendChild(marker);
        });

        console.log(
            `Agent Map Letters: ${columns.length} columns rendered`
        );
    }

    function scheduleDraw() {

        if (redrawPending) {
            return;
        }

        redrawPending = true;

        setTimeout(() => {

            redrawPending = false;

            requestAnimationFrame(() => {
                drawLetters();
            });

        }, 500);
    }

    function initialise() {

        drawLetters();

        const target =
            document.querySelector('#divExtensions');

        if (!target) {
            console.warn(
                'Agent Map Letters: #divExtensions not found'
            );
            return;
        }

        const observer = new MutationObserver(() => {
            scheduleDraw();
        });

        observer.observe(target, {
            childList: true,
            subtree: true
        });

        console.log(
            'Agent Map Letters: observer attached'
        );
    }

    setTimeout(initialise, 1500);

})();
