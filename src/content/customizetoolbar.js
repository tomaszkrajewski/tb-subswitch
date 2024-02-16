// Import any needed modules.
var Services = globalThis.Services ||
    ChromeUtils.import("resource://gre/modules/Services.jsm").Services;

function onLoad(activatedWhileWindowOpen) {
    console.log("Init of customizeToolbar - onLoad - START");

    WL.injectCSS("resource://subjects_prefix_switch/subjects_prefix_switch.css");

    console.log("Init of customizeToolbar - onLoad - END");
}

function onUnload(deactivatedWhileWindowOpen) {
}