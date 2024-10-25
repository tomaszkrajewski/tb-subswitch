import * as utils from "./modules/utils.mjs";

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
    

    // Add entry to the tools menu to open old XUL options. The actual onclick
    // function can later be replaced by 
    //    () => browser.runtime.openOptionsPage()
    // to open the new WebExtension options page. However, this is actually bad
    // practice. Users are now used to find options in the add-on manager and the
    // old pattern of adding stuff to the tools menu should no longer be used.
    browser.menus.create({
        id: "oldOptions",
        contexts: ["tools_menu"],
        title: browser.i18n.getMessage("subjects_prefix_switch.label.toolbar"),
        onclick: () => browser.WindowListener.openDialog("chrome://subjects_prefix_switch/content/options.xhtml")
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

    messenger.WindowListener.registerWindow(
        "chrome://messenger/content/messenger.xhtml",
        "content/messenger.js");

    messenger.WindowListener.registerWindow(
        "chrome://messenger/content/customizeToolbar.xhtml",
        "content/customizetoolbar.js");

    messenger.WindowListener.startListening();

    console.log("Init of subswitch - END");
}

// Wrapper for handling errors during creation of menu items.
async function addMenuEntry(createData) {
    let { promise, resolve, reject } = Promise.withResolvers();
    let error;
    let id = browser.menus.create(createData, () => {
        error = browser.runtime.lastError; // Either null or an Error object.
        if (error) {
            reject(error)
        } else {
            resolve();
        }
    });

    try {
        await promise;
        console.info(`Successfully created menu entry <${id}>`);
    } catch (error) {
        if (error.message.includes("already exists")) {
            console.info(`The menu entry <${id}> exists already and was not added again.`);
        } else {
            console.error("Failed to create menu entry:", createData, error);
        }
    }

    return id;
}

browser.menus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "abcd":
            console.log("Clicked menu entry ABCD")
            break;
        case "private":
            console.log("Clicked menu entry PRIVATE")
            break;
        case "org":
            console.log("Clicked menu entry ORG")
            break;
    }
    console.log({tab, info});
})

await addMenuEntry({
    id: "abcd",
    contexts: ["compose_action_menu"],
    type: "radio",
    title: "Project ABCD"
})
await addMenuEntry({
    id: "private",
    contexts: ["compose_action_menu"],
    type: "radio",
    title: "Private mail"
});
await addMenuEntry({
    id: "org",
    contexts: ["compose_action_menu"],
    type: "radio",
    title: "Organizational mail"
});


main();