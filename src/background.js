import * as utils from "./modules/subswitch_utils.mjs";
import * as menus from "./modules/menus.mjs";
import * as popups from "./modules/popups.mjs"
import * as items from "./modules/subswitch_items.js";
import * as message_subject_util from "./modules/message_subject_util.js";
import * as preferences from "./modules/preferences.js"

//FIXME const file
const SUBSWITCH_MIME_HEADER = 'X-SubSwitch';

async function initMenu() {
    const contextmenu = await preferences.getPref("contextmenu");

    if (!contextmenu) {
        return
    }

    await items.loadPrefixesDataString();

    let list = items.getPrefixesData();
    let defaultRD = list.defaultPrefixIndex;

    for (let [index, prefix] of list.entries()) {
        await menus.addMenuEntry({
            id: `prefix-menu-${index}`,
            contexts: ["compose_body"],
            type: "radio",
            title: prefix.description
        });
    }
}

async function settingsChangeAction(changes, area) {
    // Ignore changes in the session storage.
    if (area != "local") {
        return;
    }

    let relevantChanges = false;
    for (let name of Object.keys(changes)) {
        let value = changes[name].newValue;
        utils.dumpStr(`Changed value in "subswitch.": ${name} = ${value}`);

        // Only react to changed preferences (which have a preference. prefix),
        // storage could later include other data.
        if (!name.startsWith("preference.")) {
            continue;
        }

        // Knowing there are 3 items saved together - rds + rds_addresses + rds_sequences.
        if (name === 'preference.rds_addresses' || name === 'preference.rds_sequences') {
            continue;
        }
        
        relevantChanges = true;
        break;
    }

    if (relevantChanges) {
        await items.reloadPrefixesDataString();
        //TODO TO TEST removeAll
        await browser.menus.removeAll();
        await initMenu();
    }
}

async function main() {
    utils.dumpStr("Init of subswitch - main - START");

    // The very last conversion step will migrate these to WebExtension storage.
    // After a few month, this can be removed together with the LegacyPrefs API.
    await preferences.migrateToLocalStorage();

    utils.dumpStr("Init of subswitch - main - END");
}

async function getPrefixForTabId(tabid) {
    const value = await utils.getFromSession(`currentPrefix-${tabid}`);

    const prefixes = items.getPrefixesData();

    var item = items.createNewPrefix(value, value);
    let idx = prefixes.indexOf(item);

    if (idx >= 0) {
        return prefixes[idx];
    } else {
        return null;
    }
}

async function customSendAction(tab, composeDetails) {
    // Perform any modifications or logging
    utils.dumpStr("SubSwitch -> Sending email START");
    utils.dumpStr(`SubSwitch -> Sending email composeDetails ${JSON.stringify(tab)} ${JSON.stringify(composeDetails)}`);

    items.loadPrefixesDataString();

    const addRDtoEmail = await preferences.getPref("addRDtoEmail");

    utils.dumpStr(`SubSwitch -> Sending email addRDtoEmail ${addRDtoEmail}`);

    if (addRDtoEmail) {
        const selectedPrefix = await getPrefixForTabId(tab.id);

        utils.dumpStr(`SubSwitch -> Sending email selectedPrefix ${selectedPrefix}`);

        if (selectedPrefix) {
            if (!composeDetails.customHeaders) {
                composeDetails.customHeaders = [];
            }

            let ch = {
                name: SUBSWITCH_MIME_HEADER,
                value: (selectedPrefix.description + "; " + selectedPrefix.prefixCode)
            };

            composeDetails.customHeaders.push(ch);
            browser.compose.setComposeDetails(tab.id, composeDetails);
        }
    }

    utils.dumpStr(`SubSwitch -> Sending email composeDetails ${JSON.stringify(composeDetails)}`);
    utils.dumpStr("SubSwitch -> Sending email END");
    // Continue with sending the email
    return true;
}


async function customAfterSendAction(tab, composeDetails) {
    // Perform any modifications or logging
    utils.dumpStr("SubSwitch -> After sending email START");
    utils.dumpStr(`SubSwitch -> After sending email composeDetails ${JSON.stringify(tab)} ${JSON.stringify(composeDetails)}`);

    if (composeDetails.messages.length > 0) {
        utils.dumpStr(`SubSwitch -> After sending email POSITIVE PATH`);

        items.loadPrefixesDataString();

        const selectedPrefix = await getPrefixForTabId(tab.id);
        const dontIncreaseSeq = await utils.getFromSession(`dontIncreaseSeq-${tab.id}`);

        utils.dumpStr(`SubSwitch -> After sending email selectedPrefix ${selectedPrefix} - should NOT increse the sequence ${dontIncreaseSeq}`);

        //dodac if czy zapisac bo był increase
        if ((dontIncreaseSeq === undefined || !dontIncreaseSeq) &&
            selectedPrefix && selectedPrefix.isTemplateWithSequence()) {
                utils.dumpStr(`SubSwitch -> After sending email selectedPrefix ${selectedPrefix} - increasing the sequence`);

                selectedPrefix.incSeqValue();

                items.savePrefixesSequences();
        }
   }

    utils.dumpStr("SubSwitch -> After sending email END");

    return true;
}


function registerListeners() {

    // Monitor the preferences
    browser.storage.onChanged.addListener(settingsChangeAction);

    // Attach the custom send action
    browser.compose.onBeforeSend.addListener(customSendAction);
    // Attach the custom after send action
    browser.compose.onAfterSend.addListener(customAfterSendAction);

    messenger.menus.onClicked.addListener(async (info, tab) => {
        const index = info.menuItemId.substring(12);

        let list = items.getPrefixesData();
        let listItem = list[index];

        utils.dumpStr("messenger XXXX -> onClicked " + listItem.prefixCode);

        await message_subject_util.alterSubject(tab.id, listItem, list);
    })

    //listener for new message & setting the subject;
    messenger.compose.onComposeStateChanged.addListener( async (tab, state) => {
        utils.dumpStr(`messenger XXXX -> onComposeStateChanged ${JSON.stringify(tab)}`);
        utils.dumpStr(`messenger XXXX -> onComposeStateChanged ${JSON.stringify(state)}`);

        if (state.canSendNow) {
            utils.dumpStr(`messenger XXXX -> onComposeStateChanged CAN SEND NOW EXIT`);
            return;
        }

        const value = await utils.getFromSession(`initiatedWithPrefix-${tab.id}`);
        utils.dumpStr(`messenger XXXX -> onComposeStateChanged ${value}`);

        if (!value) {
            let composeDetails = await browser.compose.getComposeDetails(tab.id);
            utils.dumpDir(composeDetails);

            switch (composeDetails.type) {
                case "new":
                    return doHandleNew(tab, composeDetails);

                case "reply":
                    return doHandleReply(tab, composeDetails);
            }
        }
    });

    browser.menus.onShown.addListener(async (info, tab) => {
        utils.dumpStr(`messenger XXXX -> onShown ${JSON.stringify(info)}`);
        utils.dumpStr(`messenger XXXX -> onShown ${JSON.stringify(tab)}`);

        await items.loadPrefixesDataString();

        let list = items.getPrefixesData();
        let index = await message_subject_util.getPrefixIndexForTabId(tab.id, list);

        utils.dumpStr(`messenger XXXX -> onShown0 ${index}`);

        for (let [indexMenu, prefix] of info.menuIds.entries()) {
            browser.menus.update(`prefix-menu-${indexMenu}`, {checked: indexMenu===index});
            browser.menus.refresh();
        }
    });

    // handle
    // 1/ the opening the new message with subject
    browser.runtime.onMessage.addListener((message, sender) => {
        utils.log(`background -> browser.runtime.onMessage START ${sender} `);
        if (message && message.hasOwnProperty("command") ) {
            return doHandleCommand(message, sender);
        }
    });
}

main();
initMenu();
registerListeners();

/**
 * Handles commands received from the compose script, to send make the
 * ComposeDetails available to the compose script.
 */
function doHandleCommand (message, sender) {
    const { command } = message;
    const { prefix } = message;

    utils.log(`background -> doHandleCommand START ${command} `);

    switch(command) {
        case "composeWithPrefix":

            let list = items.getPrefixesData();
            let listItem = list[prefix];

            let composeDetails = {
                subject: listItem.formattedPrefixValue
            };

            utils.insertAddress(composeDetails, listItem);
            utils.log(`background -> doHandleCommand composeWithPrefix for the prefix ${listItem.prefixCode} composeDetails: ${JSON.stringify(composeDetails)}`);

            try {
               browser.compose.beginNew(
                    composeDetails
                ).then(async (composeWindow) => {
                   utils.log(`background -> doHandleCommand composeWithPrefix inside beginNew START`);
                   utils.dumpDir(composeWindow);
                   await utils.saveToSession(`initiatedWithPrefix-${composeWindow.id}`, prefix);
                   message_subject_util.updatePrefixForTabId(composeWindow.id, listItem);

                   utils.log(`background -> doHandleCommand composeWithPrefix inside beginNew END`);
               });

                utils.log(`background -> doHandleCommand composeWithPrefix after beginNew `);
            } catch (e) {
                utils.dumpError("background -> doHandleCommand composeWithPrefix exception:" + e);
            }

            break;
    }

    utils.log(`background -> doHandleCommand END ${command} `);
    return true;
}

async function doHandleNew(tab, composeDetails) {
    utils.dumpStr(`messenger XXXX -> doHandleNew ${composeDetails.type}`);

    let list = items.getPrefixesData();

    if (!list.defaultPrefixOff && list.defaultPrefixIndex >= 0) {
        let listItem = list[list.defaultPrefixIndex];
        utils.dumpStr(`messenger XXXX -> doHandleNew setting the ${listItem}`);

        await message_subject_util.alterSubject(tab.id, listItem, list);
    }

    await utils.saveToSession(`initiatedWithPrefix-${tab.id}`, list.defaultPrefixIndex);
    utils.dumpStr(`messenger XXXX -> doHandleNew saving the ${list.defaultPrefixIndex} ${composeDetails.type}`);
}

async function doHandleReply(tab, composeDetails) {
    utils.log(`background -> doHandleReply START`);

    const orginalMessage = await browser.messages.get(composeDetails.relatedMessageId);
    const fullOrginalMessage = await browser.messages.getFull(composeDetails.relatedMessageId);

    utils.dumpDir(orginalMessage);
    utils.dumpDir(fullOrginalMessage);

    const subject = orginalMessage.subject;
    const author = orginalMessage.author;
    const authorEmails = await browser.messengerUtilities.parseMailboxString(author);
    const authorEmailClean = authorEmails[0].email;

    try {
        const ignoreString = await preferences.getPref(`discoveryIgnoreList`);

        const ignoreList = ignoreString.split(";");

        utils.log(`background -> doHandleReply ${subject} ${authorEmailClean}` );

        if (!message_subject_util.isAddressOnIgnoreList(authorEmailClean, ignoreList)) {
            const discoveryItemPattern = await preferences.getPref(`discoveryItemPattern`);

            await items.reloadPrefixesDataString();

            let list = items.getPrefixesData();

            let {remotePrefixItemIndex, remotePrefix} = message_subject_util.findSubSwitchHeader(fullOrginalMessage, SUBSWITCH_MIME_HEADER, discoveryItemPattern, list);

            utils.log(`background -> doHandleReply ${remotePrefixItemIndex} ${remotePrefix}` );

            if (remotePrefixItemIndex >= 0) {
                //found existing prefix
                message_subject_util.updatePrefixForTabId(tab.id, list[remotePrefixItemIndex]);

                await utils.saveToSession(`initiatedWithPrefix-${tab.id}`, remotePrefixItemIndex);
                await utils.saveToSession(`dontIncreaseSeq-${tab.id}`, true);

            } else if (remotePrefix) {
                //found prefix in subject but not exactly the same -> show popup, ask for user guidance

                let listInt = items.getPrefixesData();
                let remotePrefixItemIndexInt = -1;

                var prefixFoundListener = function (message, sender, sendResponse) {
                    if (message.action === "getData") {
                        // Send the data to the popup immediately
                        sendResponse(  {
                            description: remotePrefix.description,
                            prefix: remotePrefix.prefix});
                    } else if (message.action === "savePrefix") {
                        utils.log(`background -> doHandleReply savePrefix START` );

                        let newPrfix = items.createNewPrefix(message.description, message.prefix);

                        utils.log(`background -> doHandleReply START ${newPrfix}` );

                        remotePrefixItemIndexInt = listInt.length;
                        listInt.push(newPrfix);

                        items.savePrefixes();

                        utils.log(`background -> doHandleReply savePrefix END` );

                    } else if (message.action === "saveAlias") {
                        utils.log(`background -> doHandleReply saveAlias START` );

                        let prefixIndex = message.index;
                        utils.log(`background -> doHandleReply saveAlias ${prefixIndex}` );

                        if (listInt[prefixIndex]) {
                            listInt[prefixIndex].aliases.push(remotePrefix.prefix)
                        }

                        remotePrefixItemIndexInt = prefixIndex;

                        items.savePrefixes();

                        utils.log(`background -> doHandleReply saveAlias END` );
                    }
                };

                browser.runtime.onMessage.addListener(prefixFoundListener);

                let result = await popups.awaitPopup("messenger/prefix_found.html", 600, 480);

                browser.runtime.onMessage.removeListener(prefixFoundListener);

                utils.log(`background -> doHandleReply with support ${remotePrefixItemIndexInt}` );
                await utils.saveToSession(`initiatedWithPrefix-${tab.id}`, remotePrefixItemIndexInt);
                await utils.saveToSession(`dontIncreaseSeq-${tab.id}`, true);

                if (remotePrefixItemIndexInt>=0) {
                    message_subject_util.updatePrefixForTabId(tab.id, listInt[remotePrefixItemIndexInt]);
                }

            } else {
                //no prefix -> default prefix application

                if (!list.defaultPrefixOff && list.defaultPrefixIndex >= 0) {
                    let listItem = list[list.defaultPrefixIndex];
                    utils.dumpStr(`messenger XXXX -> doHandleNew setting the ${listItem}`);

                    await message_subject_util.alterSubject(tab.id, listItem, list);
                }

                await utils.saveToSession(`initiatedWithPrefix-${tab.id}`, list.defaultPrefixIndex);
             }

        }
    } catch (e) {
        utils.dumpError(`background -> doHandleReply Error ${e}` );
        utils.dumpDir(e);
    }

    utils.log(`background -> doHandleReply END`);
    return true;
}

//TODO WONT DO on_off_prefix button

//TODO localize

//DONE loadOriginalMsgSSHeader / isAddressOnIgnoreList / findSubSwitchHeader / displayConfirm
//DONE FORMAT DATE
//DONE checkbox
//DONE prefixModalAlertShow(msgDuplicate);
//DONE  initWithDefault / on_off_prefix
//DONE  initMenuPopup
//DONE onSend

