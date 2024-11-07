import * as utils from "./subswitch_utils.mjs";
import * as items from "./subswitch_items.js";


let currentPrefix;


export function searchSubject(composeDetails) {
    if (!currentPrefix)
        return false;

    var indexOf = composeDetails.subject.indexOf(currentPrefix.formattedPrefixValue);
    return (indexOf > -1);
};

function insertSubject(tabId, composeDetails, prefixItem) {
    let manipulatedSubject = `${prefixItem.formattedPrefixValue} ${composeDetails.subject}`;

    composeDetails.subject = manipulatedSubject;

    //subMain.setPrefix(rd, true);
    //subMain.rdi_isRD = true;
};


function removeSubject(composeDetails, prefixItem) {
    var start = composeDetails.subject.indexOf(prefixItem.formattedPrefixValue);
    var len = prefixItem.formattedPrefixValue.length

    composeDetails.subject =
        // 0 - RD
        composeDetails.subject.substring(0, start)
        // RD - koniec z usuniecie spacji po RD
        + (composeDetails.subject.substring(start+len).charAt(0) == ' '
        ? composeDetails.subject.substring(start + len + 1)
        : composeDetails.subject.substring(start + len));
};


function insertAddress(tabId, composeDetails, prefixItem) {
    utils.insertAddress(composeDetails, prefixItem);
};

function removeAddress(composeDetails, prefixItem) {
    utils.dumpStr("message_subject_util.js -> removeAddress START");

    utils.dumpStr(`message_subject_util.js -> removeAddress ${JSON.stringify(composeDetails)}`);

    if (prefixItem != null && prefixItem.addresses != null) {
        for (var i = 0; i < prefixItem.addresses.length; i++) {
            var address = prefixItem.addresses[i].split(':');
            var addressType = address[0].toLowerCase();
            if (addressType && address[1] != null) {
                composeDetails[addressType] = composeDetails[addressType].filter(item =>  item !== (address[1].trim()));
            }
        }
    }

    utils.dumpStr(`message_subject_util.js -> removeAddress ${JSON.stringify(composeDetails)}`);

    utils.dumpStr("message_subject_util.js -> removeAddress END");
};

export async function updatePrefixForTabId(tabid, currentPrefix) {
    await utils.saveToSession(`currentPrefix-${tabid}`, currentPrefix.prefixCode);
};

export async function getPrefixForTabId(tabid, itemsList) {
    utils.dumpStr(`message_subject_util.js -> getPrefixForTabId START`);
    const value = await utils.getFromSession(`currentPrefix-${tabid}`);

    var item = items.createNewPrefix(value, value);
    let idx = itemsList.indexOf(item);

    utils.dumpStr(`message_subject_util.js -> getPrefixForTabId END`);
    return itemsList[idx];
};


export async function getPrefixIndexForTabId(tabid, itemsList) {
    utils.dumpStr(`message_subject_util.js -> getPrefixIndexForTabId START`);
    const value = await utils.getFromSession(`currentPrefix-${tabid}`);

    var item = items.createNewPrefix(value, value);
    let idx = itemsList.indexOf(item);

    utils.dumpStr(`message_subject_util.js -> getPrefixIndexForTabId END`);
    return idx;
};

export async function alterSubject(tabId, selectedOption, itemsList) {
    try {
        let composeDetails = await browser.compose.getComposeDetails(tabId);
        if (composeDetails) {
            currentPrefix = await getPrefixForTabId(tabId, itemsList);

            var hasRD = searchSubject(composeDetails);

            if (hasRD /*&& del */) {
                removeSubject(composeDetails, currentPrefix);
                removeAddress(composeDetails, currentPrefix);

                currentPrefix = null;
            }

            insertSubject(tabId, composeDetails, selectedOption);
            insertAddress(tabId, composeDetails, selectedOption);

            currentPrefix = selectedOption;
            await updatePrefixForTabId(tabId, currentPrefix);

            // Update the subject
            await browser.compose.setComposeDetails(tabId, composeDetails);

        } else {
            console.error("message_subject_util.js -> No message found to manipulate.");
        }

    } catch (error) {
        utils.error("message_subject_util.js -> newMessage error " + error);
    }
};

export async function getPreselectedPrefix(tabId, prefixesList) {
    utils.dumpStr(`message_subject_util.js  -> getPreselectedPrefix START`);
    let selectedPrefix = await getPrefixForTabId(tabId, prefixesList);
    let defaultRD = prefixesList.defaultPrefixIndex;
    let offbydefault = prefixesList.defaultPrefixOff;

    if (selectedPrefix) {
        return selectedPrefix;
    }

    var hasDefaultRD = defaultRD > -1;

    utils.dumpStr(`message_subject_util.js  -> getPreselectedPrefix END`);
    if (!offbydefault && hasDefaultRD) {
        return prefixesList[defaultRD];
    } else {
        return null;
    }
}