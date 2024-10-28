import * as utils from "./modules/utils.mjs";
import * as items from "./options/items_migrated.js";

const SUBSWITCH_MIME_HEADER = 'X-SubSwitch';

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

    messenger.WindowListener.registerWindow(
        "chrome://messenger/content/messengercompose/messengercompose.xhtml",
        "content/messengercompose.js");

    messenger.WindowListener.startListening();

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
    utils.dumpStr(`SubSwitch -> Sending email composeDetails ${JSON.stringify(composeDetails)}`);

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
        }
    }

    utils.dumpStr(`SubSwitch -> Sending email composeDetails ${JSON.stringify(composeDetails)}`);
    utils.dumpStr("SubSwitch -> Sending email END");
    // Continue with sending the email
    return true;
}

// Attach the custom send action
browser.compose.onBeforeSend.addListener(customSendAction);

main();