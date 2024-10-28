import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/utils.mjs"
import * as items from "../options/items_migrated.js"

i18n.localizeDocument();

const PREFIX_ROW = `
        <input type="button" style="font-weight: bold;" class="w3-button w3-small w3-block w3-padding-small w3-round-large w3-pale-green" value="{{description}} / {{prefix}}" id="prefix-{{id}}" " />
`;

const SELECTED_PREFIX_ROW = `
        <input type="button" style="font-weight: bold;" class="w3-button w3-small w3-block w3-padding-small w3-round-large w3-cyan" value="{{description}} / {{prefix}}" id="prefix-{{id}}" " />
`;

let currentPrefix;

async function openOptions() {
    utils.dumpStr("messenger -> openOptions START");

    try {
        let selff = await browser.management.getSelf();
        let url = selff.optionsUrl;
        utils.dumpStr("messenger -> openOptions  selff " + selff);
        utils.dumpStr("messenger -> openOptions  url " + url);

        let value = await browser.tabs.query({url: url});

        utils.dumpStr("messenger -> openOptions  value " + value);

        if (value && value.length > 0) {
            //activate existing options tab

            let tabId = value[0].id;
            let windowId = value[0].windowId;

            browser.tabs.update(tabId, {active: true});
            window.update(windowId, {focused: true});

        } else {
            //launch new options tab
            browser.tabs.create({url: url}).then(optionsTab => {
                utils.dumpStr("optionsButton -> optionsTitle " + optionsTab.title);
                utils.dumpStr("optionsButton -> optionsTab.url " + optionsTab.url);
            })
        }
        window.close();
    } catch (error) {
        utils.dumpStr("messenger -> openOptions error " + error);
    }
    utils.dumpStr("messenger -> openOptions END");

};


function searchSubject(composeDetails) {
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

async function alterSubject(tabId, selectedOption) {
    try {
        let composeDetails = await browser.compose.getComposeDetails(tabId);
        if (composeDetails) {
            currentPrefix = await getPrefixForTabId(tabId);

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
}

async function init() {
    utils.dumpStr("messenger -> init START");

    await items.loadPrefixesDataString();

    let addPrefixRow = function (prefix, index) {
        let tableRow = document.createElement("li");
        // tableRow.setAttribute("data-prefix-id", prefix.id);
        tableRow.innerHTML = Mustache.render(PREFIX_ROW, {
            id: index,
            prefix: prefix.prefix,
            description: prefix.description,
            showInNewMsgPopup: prefix.showInNewMsgPopup
        });

        document.getElementById("subjects_prefix_switchList").appendChild(tableRow);
    };

    let list = items.getPrefixesData();
    let defaultRD = list.defaultPrefixIndex;

    for (let [index, prefix] of list.entries()) {
        addPrefixRow(prefix, index);
    }

    document.getElementById("optionsButton").addEventListener("click", (event) => {
        openOptions();
    });

    document.querySelectorAll('input[id^="prefix-"]').forEach((elem) => {
        elem.addEventListener("click", async function(event) {
            let item = event.target;
            let index = item.id.substring(7) // prefix-

            let list = items.getPrefixesData();
            let listItem = list[index];

            let tabs = await messenger.tabs.query({ active: true, currentWindow: true });
            let tabId = tabs[0].id;

            utils.dumpStr("messenger -> newMessage " + listItem.prefixCode);

            await alterSubject(tabId, listItem);
        });
    });

    utils.dumpStr("messenger -> init END");
}



async function getPrefixForTabId(tabid) {
    const value = await utils.getFromSession(`currentPrefix-${tabid}`);
    let list = items.getPrefixesData();

    var item = items.createNewPrefix(value, value);
    let idx = list.indexOf(item);

    return list[idx];
}

async function updatePrefixForTabId(tabid, currentPrefix) {
    await utils.saveToSession(`currentPrefix-${tabid}`, currentPrefix.prefixCode);
}

//TODO initWithDefault
//TODO initMenuPopup
//TODO on_off_prefix
//TODO loadOriginalMsgSSHeader / isAddressOnIgnoreList / findSubSwitchHeader / displayConfirm
//TODO onSend
// --> WIP

init();

