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
        utils.dumpError("message_subject_util.js -> newMessage error " + error);
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

export function isAddressOnIgnoreList(author, ignoreList) {
    utils.dumpStr(`message_subject_util.js  -> isAddressOnIgnoreList START`);
    utils.dumpStr(`message_subject_util.js  -> isAddressOnIgnoreList author = ${author}`);
    var result = false;

    /*
    //FIXME removing starting & ending shit?
    if (author.charAt(0) == "\"" && author.charAt(author.length - 1) == "\"")
        author = author.substring(1, author.length - 1);
    if (author.indexOf(">") > -1) {
        let authorStripRegEx = new RegExp("(" + utils.RX_USER + "\@" + utils.RX_DOMAIN + ")");
        let m = authorStripRegEx.exec(author);
        if (m != null) {
            author = m[0];
        }
    }
    */

    if (ignoreList.length > 0) {
        var validate = new RegExp(utils.EMAIL_REGEX);
        var match;
        if (validate.test(author)) {
            for (var j = 0; j < ignoreList.length; j++) {
                if (ignoreList[j].indexOf("?") > -1) {
                    let ignoreTriggerRegEx = new RegExp(ignoreList[j].split("?").join(utils.RX_WILDCARD));
                    match = ignoreTriggerRegEx.test(author);
                } else {
                    match = (ignoreList[j].toLowerCase() == author.toLowerCase());
                }

                if (match) {
                    result = true;
                    break;
                }
            }
        }
    }

    utils.dumpStr(`message_subject_util.js  -> isAddressOnIgnoreList ; result = ${result}`);
    return result;
}

export function findSubSwitchHeader(fullOrginalMessage, headerName, discoveryItemPattern, prefixesList) {
    utils.dumpStr(`message_subject_util.js  -> findSubSwitchHeader START`);

    let ssKey, ssDesctiption;
    let remotePrefixItemIndex;
    let remotePrefixItem;

    let ssHeader = fullOrginalMessage.headers[headerName.toLowerCase()];

    utils.dumpStr('findSubSwitchHeader; ssHeader ->'+ssHeader);

    if (ssHeader) {
        let ssStrings = ssHeader[0].split(';');
        ssDesctiption = ssStrings[0].trim();
        ssKey = ssStrings[1].trim();
    } else {
        let discoveryPattern = discoveryItemPattern;
        let subject = fullOrginalMessage.headers["subject"][0];
        let re = new RegExp(discoveryPattern);
        let m = re.exec(subject);
        if (m != null) {
            ssKey = m[0];
            ssDesctiption = m[0];
        }
    }

    if (ssKey != null) {
        remotePrefixItem = items.createNewPrefix(ssDesctiption, ssKey);
        utils.dumpStr('findSubSwitchHeader; dopasowanie prefiksu remoteSP ->'+remotePrefixItem);

        let idx = prefixesList.indexOfComplex(remotePrefixItem);
        let found = (idx >= 0);
        utils.dumpStr('findSubSwitchHeader; found ->' + found);

        if (!found) {
            //TODO NEW PREFIX FOUND!
            /*if (!subMain.displayConfirm(remotePrefixItem)) {
                remotePrefixItem = null;
            }
            */
        } else {
            remotePrefixItem = prefixesList[idx];
            remotePrefixItemIndex = idx;
        }
    }

    utils.dumpStr('findSubSwitchHeader; remotePrefixItem = '+remotePrefixItem);

    return {
        remotePrefixItemIndex: remotePrefixItemIndex,
        remotePrefix: remotePrefixItem
    };
}