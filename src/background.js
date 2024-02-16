async function main() {
    console.log("Init of subswitch - START");
    await messenger.WindowListener.registerDefaultPrefs("defaults/preferences/subjects_prefix_switch.js");
//FIXME: maybe someday. handle different skins
    messenger.WindowListener.registerChromeUrl([
            ["content",  "subjects_prefix_switch",           "chrome/content/"],
            ["resource", "subjects_prefix_switch",           "chrome/"],
            ["resource", "subjects_prefix_switch",           "chrome/skin/classic/"],
            ["locale",   "subjects_prefix_switch", "en-US", "chrome/locale/en-US/"],
            ["locale",   "subjects_prefix_switch", "de-DE", "chrome/locale/de-DE/"],
            ["locale",   "subjects_prefix_switch", "pl-PL", "chrome/locale/pl-PL/"],
            ["locale",   "subjects_prefix_switch", "es-ES", "chrome/locale/es-ES/"],
            ["locale",   "subjects_prefix_switch", "sv-SE", "chrome/locale/sv-SE/"],
            ["locale",   "subjects_prefix_switch", "fr-FR", "chrome/locale/fr-FR/"],
            ["locale",   "subjects_prefix_switch", "zh-TW", "chrome/locale/zh-TW/"]
        ]
    );

    messenger.WindowListener.registerOptionsPage("chrome://subjects_prefix_switch/content/addonoptions.xhtml")

    messenger.WindowListener.registerWindow(
        "chrome://messenger/content/messengercompose/messengercompose.xhtml",
        "chrome://subjects_prefix_switch/content/messengercompose.js");

    messenger.WindowListener.registerWindow(
        "chrome://messenger/content/messenger.xhtml",
        "chrome://subjects_prefix_switch/content/messenger.js");

/* FIXME */
    messenger.WindowListener.registerWindow(
        "chrome://messenger/content/customizeToolbar.xhtml",
        "chrome://subjects_prefix_switch/content/customizetoolbar.js");
/*
    messenger.WindowListener.registerWindow(
        "chrome://calendar/content/calendar-item-iframe.xhtml",
        "chrome://subjects_prefix_switch/content/calendar-item-iframe.js");


    browser.composeAction.onClicked.addListener(tab => { messenger.WindowListener.openOptionsDialog(tab.windowId); });

*/
 /*   browser.browserAction.onClicked.addListener(() => {
        console.log("Init of subswitch - browser.browserAction.onClicked - START");

// Import any needed modules.
        var Services = globalThis.Services ||
            ChromeUtils.import("resource://gre/modules/Services.jsm").Services;

// Load an additional JavaScript file.
        Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/const.js", window, "UTF-8");
        Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/utils.js", window, "UTF-8");
        Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/date_utils.js", window, "UTF-8");
        Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/items.js", window, "UTF-8");
        Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/subjects_prefix_switch.js", window, "UTF-8");
        Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/messenger-overlay-toolbar.js", window, "UTF-8");

        com.ktsystems.subswitch.SubSwitchMOToolbar.MsgNewSubSwitchMessage(1);

        //goOpenNewMessage();
/*
        let buttonItem = window.document.querySelector(
            `#unifiedToolbar [extension="{appid}"]`
        )

        let button = window.document.getElementsByAttribute("extension", "{appid}");
        button.setAttribute("command", "cmd_newMessage");

        let toolbar = button?.closest("toolbar");
        button = button && !toolbar?.collapsed ? button : null;
*/
    /*         console.log("Init of subswitch - browser.browserAction.onClicked - END");
       });
   */
    messenger.WindowListener.startListening();
/*
    let button = window.document.getElementsByAttribute("extension", "{appid}");
    button.setAttribute("command", "cmd_newMessage");
*/
    console.log("Init of subswitch - END");
}

main();