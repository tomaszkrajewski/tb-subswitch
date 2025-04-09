const DEFAULTS = {
    "addRDtoEmail": true,
    "beforeMsgSubject": true,
    "contextmenu": true,
    "defaultrd": "1",
    "discoveryIgnoreList": "bugzilla?@?.com",
    "discoveryIgnoreSigns": "[]/ ",
    "discoveryItemPattern": "\\[.+\\]",
    "entries_split_sign": "##",
    "entry_split_sign": "~~",
    "loadRDfromEmail": true,
    "offbydefault": false,
    "rds": "Organizational mail~~[ORG]~~false##Project ABCD~~[ABCD/{number:NN}][{date:yyyy/mm/dd}]~~true##Private mail~~[PRV]~~true~~[PRIV]",
    "rds_addresses": "",
    "rds_sequences": "",
}

export async function getPref(name) {
    if (!DEFAULTS.hasOwnProperty(name)) {
        throw new Error (`Unknown preference: ${name}`)
    }
    return browser.storage.local
        .get({[`preference.${name}`]: DEFAULTS[name]})
        .then(rv => rv[`preference.${name}`])
}

export async function setPref(name, value) {
    return browser.storage.local.set({[`preference.${name}`]: value});
}

export async function migrateToLocalStorage() {
    for (let name of Object.keys(DEFAULTS)) {
        let value = await browser.LegacyPrefs.getUserPref(`extensions.subjects_prefix_switch.${name}`);
        if (value !== null) {
            await setPref(name, value);
            await browser.LegacyPrefs.clearUserPref(`extensions.subjects_prefix_switch.${name}`)
        }
    }
}