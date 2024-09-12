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

main();