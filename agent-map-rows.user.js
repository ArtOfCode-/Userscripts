// ==UserScript==
// @name         Agent Map Row Letters
// @namespace    http://192.168.222.165/
// @version      2025-01-19.01
// @author       You
// @description  Make skill changes easier
// @match        http://192.168.222.165/wallboardcm10/frmAgentMap.aspx*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=222.165
// @grant        none
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/agent-map-rows.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/agent-map-rows.user.js
// ==/UserScript==

/* eslint-disable no-multi-spaces */

const createContainer = (letter, left, width) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '10px';
    div.style.left = left;
    div.style.width = `${width}px`;
    div.style.textAlign = 'center';
    div.style.color = 'red';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '16px';
    div.style.background = 'white';
    div.classList.add('js__letter-marker');
    div.innerText = letter;
    return div;
};

const runDetector = () => {
    const desks = Array.from(document.querySelectorAll('.extension_container'));
    if (desks.length === 46) {
        const container = document.querySelector('#divContainer');
        const containerLeft = container.getBoundingClientRect().left;
        const offsets = desks.map(d => d.style.left).filter((v, i, a) => a.indexOf(v) === i);
        const width = desks[0].getBoundingClientRect().width;
        const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
        const letters = offsets.map((l, i) => {
            l = `calc(${l} + ${containerLeft}px)`;
            return createContainer(alpha[i], l, width);
        });

        Array.from(document.querySelectorAll('.js__letter-marker')).forEach(el => el.remove());
        letters.forEach(el => document.body.appendChild(el));
    }
};

const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver((mutationList, observer) => {
    runDetector();
});

document.addEventListener('DOMContentLoaded', ev => {
    const container = document.querySelector('#divExtensions');
    observer.observe(container, config);

    runDetector();
});
