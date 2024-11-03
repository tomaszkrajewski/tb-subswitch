import * as utils from "./utils.mjs";
import * as items from "../options/items_migrated.js";

let currentPrefix;


export function searchSubject(composeDetails) {
    if (!currentPrefix)
        return false;

    var indexOf = composeDetails.subject.indexOf(currentPrefix.lastFormattedPrefixValue);
    return (indexOf > -1);
};

function insertSubject(tabId, composeDetails, prefixItem) {
    let manipulatedSubject = `${prefixItem.formattedPrefixValue} ${composeDetails.subject}`;

    composeDetails.subject = manipulatedSubject;

    //subMain.setPrefix(rd, true);
    //subMain.rdi_isRD = true;
};


function removeSubject(composeDetails, prefixItem) {
    var start = composeDetails.subject.indexOf(prefixItem.lastFormattedPrefixValue);
    var len = prefixItem.lastFormattedPrefixValue.length

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
    utils.dumpStr("messenger -> removeAddress START");

    utils.dumpStr(`messenger -> removeAddress ${JSON.stringify(composeDetails)}`);

    if (prefixItem != null && prefixItem.addresses != null) {
        for (var i = 0; i < prefixItem.addresses.length; i++) {
            var address = prefixItem.addresses[i].split(':');
            var addressType = address[0].toLowerCase();
            if (addressType && address[1] != null) {
                composeDetails[addressType] = composeDetails[addressType].filter(item =>  item !== (address[1].trim()));
            }
        }
    }

    utils.dumpStr(`messenger -> removeAddress ${JSON.stringify(composeDetails)}`);

    utils.dumpStr("messenger -> removeAddress END");
};

export async function updatePrefixForTabId(tabid, currentPrefix) {
    await utils.saveToSession(`currentPrefix-${tabid}`, currentPrefix.prefixCode);
};

export async function getPrefixForTabId(tabid, itemsList) {
    const value = await utils.getFromSession(`currentPrefix-${tabid}`);

    var item = items.createNewPrefix(value, value);
    let idx = itemsList.indexOf(item);

    return itemsList[idx];
};


export async function getPrefixIndexForTabId(tabid, itemsList) {
    const value = await utils.getFromSession(`currentPrefix-${tabid}`);

    var item = items.createNewPrefix(value, value);
    let idx = itemsList.indexOf(item);

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
            console.error("No message found to manipulate.");
        }

    } catch (error) {
        utils.dumpStr("messenger -> newMessage error " + error);
    }
};

export async function getPreselectedPrefix(tabId, prefixesList) {
    let selectedPrefix = await getPrefixForTabId(tabId, prefixesList);
    let defaultRD = prefixesList.defaultPrefixIndex;
    let offbydefault = prefixesList.defaultPrefixOff;

    if (selectedPrefix) {
        return selectedPrefix;
    }

    var hasDefaultRD = defaultRD > -1;

    if (!offbydefault && hasDefaultRD) {
        return prefixesList[defaultRD];
    } else {
        return null;
    }
}