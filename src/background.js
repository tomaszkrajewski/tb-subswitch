import * as utils from "./modules/utils.mjs";
import * as menus from "./modules/menus.mjs";
import * as items from "./options/items_migrated.js";
import * as message_subject_util from "./modules/message_subject_util.js";

const SUBSWITCH_MIME_HEADER = 'X-SubSwitch';

async function initMenu() {
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

async function settingsChangeAction(name, value) {
    console.log(`Changed value in "subswitch.": ${name} = ${value}`);

    await items.reloadPrefixesDataString();
    //TODO TO TEST removeAll
    await browser.menus.removeAll();
    await initMenu();
}

async function main() {
    // Prepare legacy prefs. The very last conversion step will migrate these to
    // WebExtension storage.
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.addRDtoEmail", true);
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.beforeMsgSubject", true);
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.contextmenu", true);
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.defaultrd", "1");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.discoveryIgnoreList", "bugzilla?@?.com");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.discoveryIgnoreSigns", "[]/ ");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.discoveryItemPattern", "\\[.+\\]");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.entries_split_sign", "##");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.entry_split_sign", "~~");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.loadRDfromEmail", true);
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.offbydefault", false);
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.rds", "Organizational mail~~[ORG]~~false##Project ABCD~~[ABCD/{number:NN}][{date:yyyy/mm/dd}]~~true##Private mail~~[PRV]~~true~~[PRIV]");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.rds_addresses", "");
    await browser.LegacyPrefs.setDefaultPref("extensions.subjects_prefix_switch.rds_sequences", "");

    // replaced by
    //    () => browser.runtime.openOptionsPage()
    // to open the new WebExtension options page. However, this is actually bad
    // practice. Users are now used to find options in the add-on manager and the
    // old pattern of adding stuff to the tools menu should no longer be used.
    browser.menus.create({
        id: "oldOptions",
        contexts: ["tools_menu"],
        title: browser.i18n.getMessage("subjects_prefix_switch.label.toolbar"),
        onclick: () => browser.runtime.openOptionsPage()
    })

    console.log("Init of subswitch - START");
    messenger.WindowListener.registerChromeUrl([
            ["content",  "subjects_prefix_switch",  "content/"],
            ["resource", "subjects_prefix_switch",  "assets/"],
        ]
    );

    console.log("Init of subswitch - END");
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
    utils.dumpStr(`SubSwitch -> Sending email composeDetails ${JSON.stringify(composeDetails)}${JSON.stringify(composeDetails)}`);

    items.loadPrefixesDataString();

    const addRDtoEmail = await browser.LegacyPrefs.getPref("extensions.subjects_prefix_switch.addRDtoEmail");

    utils.dumpStr(`SubSwitch -> Sending email addRDtoEmail ${addRDtoEmail}`);

    if (addRDtoEmail) {
        const selectedPrefix = await getPrefixForTabId(tab.id);

        utils.dumpStr(`SubSwitch -> Sending email selectedPrefix ${selectedPrefix}`);

        if (selectedPrefix) {
            selectedPrefix.incSeqValue();

           //savePrefixes
           //com.ktsystems.subswitch.PrefixesListSingleton.getInstance().savePrefixesSequences();

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


main();
initMenu();
registerListeners();

function registerListeners() {

    // Monitor the preferences
    browser.LegacyPrefs.onChanged.addListener(
        settingsChangeAction,
        "extensions.subjects_prefix_switch."
    );

    // Attach the custom send action
    browser.compose.onBeforeSend.addListener(customSendAction);

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

            const value = await utils.getFromSession(`initiatedWithPrefix-${tab.id}`);
            if (!value) {
                let list = items.getPrefixesData();

                if (!list.defaultPrefixOff && list.defaultPrefixIndex > 0) {
                    let listItem = list[list.defaultPrefixIndex];

                    await message_subject_util.alterSubject(tab.id, listItem, list);
                }

                await utils.saveToSession(`initiatedWithPrefix-${tab.id}`, items.defaultPrefixIndex);
            }
        }
    );


}

//TODO on_off_prefix
//TODO loadOriginalMsgSSHeader / isAddressOnIgnoreList / findSubSwitchHeader / displayConfirm
//TODO utils.prefixModalAlertShow(msgDuplicate);

//TODO initWithDefault
//TODO WIP initMenuPopup
//TODO WIP onSend

//
// browser.menus.onShown.addListener((...args) => {
//     console.log("onShown",...args)
// });