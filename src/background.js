async function main() {
    console.log("Init of subswitch - START");
    await messenger.WindowListener.registerDefaultPrefs("defaults/preferences/subjects_prefix_switch.js");
//FIXME: maybe someday. handle different skins
    messenger.WindowListener.registerChromeUrl([
            ["content",  "subjects_prefix_switch",           "content/"],
            ["resource", "subjects_prefix_switch",           "/"],
            ["resource", "subjects_prefix_switch",           "skin/classic/"],
            ["locale",   "subjects_prefix_switch", "en-US", "locale/en-US/"],
            ["locale",   "subjects_prefix_switch", "de-DE", "locale/de-DE/"],
            ["locale",   "subjects_prefix_switch", "pl-PL", "locale/pl-PL/"],
            ["locale",   "subjects_prefix_switch", "es-ES", "locale/es-ES/"],
            ["locale",   "subjects_prefix_switch", "sv-SE", "locale/sv-SE/"],
            ["locale",   "subjects_prefix_switch", "fr-FR", "locale/fr-FR/"],
            ["locale",   "subjects_prefix_switch", "zh-TW", "locale/zh-TW/"]
        ]
    );

    messenger.WindowListener.registerOptionsPage("content/addonoptions.xhtml")

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