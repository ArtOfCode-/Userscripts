// ==UserScript==
// @name         CADO Improvements
// @namespace    https://cadonline.londonambulance.nhs.uk/
// @version      2026-09-06.01
// @author       You
// @description  Make skill changes easier
// @match        https://cadonline.londonambulance.nhs.uk/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cadonline.londonambulance.nhs.uk
// @grant        none
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/cado-improvements.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/cado-improvements.user.js
// ==/UserScript==

/* eslint-disable no-multi-spaces */

const copyClickHandler = (ev) => {
    navigator.clipboard.writeText(ev.target.dataset.telNumber);
    ev.target.innerText = 'Copied!';
    setTimeout(() => {
        ev.target.innerText = 'Copy';
    }, 2000);
};

const addCopyLinks = (cells) => {
    cells.forEach(c => {
        const telNumber = c.innerText.trim();
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'cds-secondary-bg cds-lessradius ui-state-default ui-button-text-only ui-button ui-corner-all ui-widget waves-effect';
        link.dataset.telNumber = telNumber;
        link.innerText = 'Copy';
        link.addEventListener('click', copyClickHandler);
        link.style.marginLeft = '1em';
        c.appendChild(link);
    });
};

const cadClickHandler = async (ev) => {
    const resp = await fetch('/cadonline/frmCallEnquiry.aspx/SearchData', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
            objData: {
                CallTypeEMR: 1,
                DailyCallID: ev.target.dataset.cadNumber,
                DateRangeTypeID: "1",
                IgnoreDeskSel: 1
            }
        }),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });
    const data = await resp.json();
    const callID = data[0]?.CallID;
    if (!!callID) {
        location.href = `/cadonline/frmCall.aspx?id=${callID}`;
    }
};

const linkifyCADNumbers = (cells) => {
    cells.forEach(c => {
        const cadNumber = c.innerText.trim();
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'cds-secondary-bg cds-lessradius ui-state-default ui-button-text-only ui-button ui-corner-all ui-widget waves-effect';
        link.dataset.cadNumber = cadNumber;
        link.innerText = 'View';
        link.addEventListener('click', cadClickHandler);
        link.style.marginLeft = '1em';
        c.appendChild(link);
    });
};

const config = { attributes: false, childList: true, subtree: true };
const phoneObserver = new MutationObserver((mutationList, observer) => {
    const rows = document.querySelectorAll('#tblMain tbody tr:not(.js-us-processed)');
    rows.forEach(r => {
        const telCell = r.querySelectorAll(':nth-child(3)');
        addCopyLinks(telCell);
        const cadCell = r.querySelectorAll(':nth-child(2)');
        linkifyCADNumbers(cadCell);
        r.classList.add('js-us-processed');
    });
});

if (location.pathname === '/cadonline/frmPhoneQ.aspx') {
    phoneObserver.observe(document.querySelector('#tblMain'), config);
}
