// ==UserScript==
// @name         CMS Web Skill Changer
// @namespace    https://172.31.39.50:8443/
// @version      2026-02-11.02
// @author       You
// @description  Make skill changes easier
// @match        https://172.31.39.50:8443/CMSWeb/
// @match        https://172.31.39.60:8443/CMSWeb/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=39.50
// @grant        none
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/cms-web-skill-changer.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/cms-web-skill-changer.user.js
// ==/UserScript==

/* eslint-disable no-multi-spaces */

const payload = {
    "acd": 1,
    "readPermission": true,
    "writePermission": true,
    "iauxSupported": true,
    "eas": true,
    "directAgentSkill": 0,
    "callHandlingPreference": 1,
    "useServiceObjective": false,
    "directAgentCallFirst": true
};

let skillProfiles = {
    "999 North": [
        { level: 3, percent: 0, skill: 2995, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 5000, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "999 South": [
        { level: 3, percent: 0, skill: 2995, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 2000, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "DDS North": [
        { level: 1, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5004, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5019, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5021, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5029, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "DDS South": [
        { level: 1, percent: 0, skill: 2028, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5004, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 2020, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 2068, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "METDG": [
        { level: 1, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "ERD NE": [
        { level: 2, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 5029, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "ERD NC": [
        { level: 2, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 5019, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "ERD NW": [
        { level: 2, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 5021, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "ERD SE": [
        { level: 2, percent: 0, skill: 2028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 2020, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    "ERD SW": [
        { level: 2, percent: 0, skill: 2028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 2068, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ]
};

const createButton = (text, skillProfile) => {
    const btn = document.createElement('button');
    btn.classList.add('btn-default', 'mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button', 'mat-unthemed', 'mat-mdc-button-base', 'mat-warn', 'js__userscript-button');
    btn.innerText = text;
    btn.dataset.skillProfile = skillProfile;
    return btn;
};

let buttonsAdded = false;

// Set up a MutationObserver to watch for any changes, and insert the skills buttons, once only, when we're on the
// multi-agent skill change page.
const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver((mutationList, observer) => {
    if (location.hash === '#/admin/agent/multiAgentSkillChange' && !buttonsAdded) {
        const buttonList = document.querySelectorAll('.form-group.col-11.button-group');
        if (buttonList.length > 0) {
            Object.keys(skillProfiles).forEach(key => {
                buttonList[0].append(createButton(key, key));
            });
            buttonsAdded = true;
        }
    }
    else if (location.hash !== '#/admin/agent/multiAgentSkillChange') {
        buttonsAdded = false;
    }
});

// Add some content in a new row above the skills buttons.
const addPreButton = content => {
    const row = document.createElement('div');
    row.classList.add('row');
    const col1 = document.createElement('div');
    col1.classList.add('col-1');
    row.appendChild(col1);
    const col11 = document.createElement('div');
    col11.classList.add('col-11');
    col11.appendChild(content);
    row.appendChild(col11);

    const buttonGroup = document.querySelector('.form-group.col-11.button-group');
    const form = buttonGroup.closest('form');
    const buttonRow = buttonGroup.closest('.row');

    buttonRow.parentElement.insertBefore(row, buttonRow);
    return row;
};

// Add a self-removing feedback notice.
const feedbackNotice = (type, text) => {
    const notice = document.createElement('div');
    notice.classList.add('alert', type);
    notice.innerText = text;
    addPreButton(notice);
    setTimeout(() => {
        notice.remove();
    }, 2000);
    return notice;
};

// Add a spinner.
const addSpinner = () => {
    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border');
    addPreButton(spinner);
    return spinner;
};

document.addEventListener('DOMContentLoaded', ev => {
    observer.observe(document.documentElement, config);

    document.addEventListener('click', async ev => {
        if (ev.target.classList.contains('js__userscript-button')) {
            const spinner = addSpinner();
            const agentList = Array.from(document.querySelectorAll('.agent-list')[1].querySelectorAll('li')).map(el => el.innerText.split(':')[0]);
            const skillList = skillProfiles[ev.target.dataset.skillProfile];
            const data = Object.assign(payload, { agentList, skillList });
            const req = await fetch('/CMSWeb/rest/admin/agent/skills', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (req.status === 200) {
                spinner.remove();
                feedbackNotice('alert-success', 'Skills successfully changed.');
            }
            else {
                spinner.remove();
                feedbackNotice('alert-danger', `Failed to change skills (${req.status})`);
            }
        }
    });
});
