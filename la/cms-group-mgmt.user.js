// ==UserScript==
// @name         CMS Web: Group Management
// @namespace    https://172.31.39.50:8443/
// @version      2025-12-11.01
// @author       You
// @description  Automate group management in CMS
// @match        https://172.31.39.50:8443/CMSWeb/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=39.50
// @grant        none
// @run-at       document-start
// ==/UserScript==

/* eslint-disable no-multi-spaces */

const apiReq = async (path, { method = 'POST', credentials = 'include', headers = {}, body = null }) => {
    const req = await fetch(path, {
        method,
        credentials,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers
        },
        body: JSON.stringify(body)
    });
    return await req.json();
};

const handleButton = async ev => {
    const groupName = prompt('Enter exactly the name of the group you want to manage:');
    if (!groupName) return;

    const agents = prompt('Paste from Excel a list of agents you want to add to this group:');
    if (!agents) return;

    const gemReq = await apiReq('/CMSWeb/rest/gem', { body: { acd: 1, gemFile: 'dict/d_grps', taskId: 2000 } });
    const gemId = gemReq.scrId;
    await apiReq(`/CMSWeb/rest/gem/${gemId}/action`, { body: [{action: 'Get Contents', inputs: [groupName, '', '']}] });
    const addReq = await apiReq(`/CMSWeb/rest/gem/${gemId}/action`, { body: [{action: 'ADD', inputs: [agents.split(/\r?\n/g).join(';'), '', '']}] });
    await apiReq(`/CMSWeb/rest/gem/${gemId}`, { method: 'DELETE' });
    return addReq;
};

let buttonAdded = false;

const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver((mutationList, observer) => {
    if (location.hash === '#/admin/dictionary/agentGroups' && !buttonAdded) {
        const fieldset = document.querySelector('#content > cms-dictionary > cms-dictionary-agentgroups > div > cms-dictionary-grid > form > div:nth-child(2) > fieldset.col-12.form-group.button-group');
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-sm', 'btn-outline-default');
        const icon = document.createElement('i');
        icon.classList.add('fa', 'fa-plus-circle');
        button.appendChild(icon);
        const span = document.createElement('span');
        span.innerText = 'Auto-Manage Agent Group';
        button.appendChild(span);
        fieldset?.appendChild(button);
        button.addEventListener('click', handleButton);
        buttonAdded = true;
    }
    else if (location.hash !== '#/admin/dictionary/agentGroups') {
        buttonAdded = false;
    }
});

document.addEventListener('DOMContentLoaded', _ev => {
    observer.observe(document.documentElement, config);
});
