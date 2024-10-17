// ==UserScript==
// @name         CMS Web Skill Changer
// @namespace    https://172.31.39.50:8443/
// @version      2024-10-16.02
// @author       You
// @description  Make skill changes easier
// @match        https://172.31.39.50:8443/CMSWeb/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=39.50
// @grant        none
// @updateURL    https://github.com/ArtOfCode-/Userscripts/raw/master/cms-web-skill-changer.user.js
// @downloadURL  https://github.com/ArtOfCode-/Userscripts/raw/master/cms-web-skill-changer.user.js
// ==/UserScript==

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
    //"agentList": ["310192"]
};

const skillProfiles = {
    '999': [
        { level: 3, percent: 0, skill: 2995, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 5000, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    'dds': [
        { level: 1, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5004, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5019, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5021, interruptibleAux: 0 },
        { level: 1, percent: 0, skill: 5029, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    'metdg': [
        { level: 1, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    'erdne': [
        { level: 2, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 5029, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    'erdnc': [
        { level: 2, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 5019, interruptibleAux: 0 },
        { level: 3, percent: 0, skill: 8000, interruptibleAux: 0 }
    ],
    'erdnw': [
        { level: 2, percent: 0, skill: 5028, interruptibleAux: 0 },
        { level: 2, percent: 0, skill: 5021, interruptibleAux: 0 },
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

const config = { attributes: true, childList: true, subtree: true };
const observer = new MutationObserver((mutationList, observer) => {
    if (location.hash === '#/admin/agent/multiAgentSkillChange' && !buttonsAdded) {
        const buttonList = document.querySelectorAll('.form-group.col-11.button-group');
        if (buttonList.length > 0) {
            buttonList[0].append(createButton('999', '999'));
            buttonList[0].append(createButton('DDS', 'dds'));
            buttonList[0].append(createButton('METDG/PD09', 'metdg'));
            buttonList[0].append(createButton('ERD NE', 'erdne'));
            buttonList[0].append(createButton('ERD NC', 'erdnc'));
            buttonList[0].append(createButton('ERD NW', 'erdnw'));
            buttonsAdded = true;
        }
    }
    else if (location.hash !== '#/admin/agent/multiAgentSkillChange') {
        buttonsAdded = false;
    }
});

const feedbackNotice = (type, text) => {
    const notice = document.createElement('div');
    notice.classList.add('alert', type);
    notice.innerText = text;
    document.querySelector('.form-group.col-11.button-group').closest('.row').prepend(notice);
    setTimeout(() => {
        notice.remove();
    }, 2000);
    return notice;
};

document.addEventListener('DOMContentLoaded', ev => {
    observer.observe(document.documentElement, config);

    document.addEventListener('click', async ev => {
        if (ev.target.classList.contains('js__userscript-button')) {
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
                console.log(feedbackNotice('alert-success', 'Skills successfully changed.'));
            }
            else {
                console.log(feedbackNotice('alert-danger', `Failed to change skills (${req.status})`));
            }
        }
    });
});
