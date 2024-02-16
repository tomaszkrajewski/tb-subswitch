// Import any needed modules.
var Services = globalThis.Services ||
    ChromeUtils.import("resource://gre/modules/Services.jsm").Services;

// Load an additional JavaScript file.
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/const.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/utils.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/date_utils.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/items.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/subjects_prefix_switch.js", window, "UTF-8");


function onLoad(activatedWhileWindowOpen) {
    console.log("Init of subswitchCalendarItemIframe - onLoad - START");

    WL.injectCSS("resource://subjects_prefix_switch/subjects_prefix_switch.css");
    WL.injectElements(`
         <stringbundleset id="stringbundleset">
            <stringbundle id="subjects_prefix_switch.locale" src="chrome://subjects_prefix_switch/locale/subjects_prefix_switch.properties"/>
         </stringbundleset>
        
         <menulist id="subjects_prefix_switchMenuPopup-subtoolbarButton" 
                    align="stretch" 
                    class="addressingWidget-separator"
                    crop="right" 
                    is="menulist-editable"
                    disableonsend="true" 
                    style="/*!-moz-box-flex: 1;*/" insertBefore="item-title">
            <menupopup id="subjects_prefix_switchMenuPopup-subtoolbar" onpopupshowing="com.ktsystems.subswitch.SubSwitchMain.initMenuPopup('subtoolbar');" flex="1" />
         </menulist>
         `,
        ["chrome://subjects_prefix_switch/locale/subjects_prefix_switch.dtd"]);

    window.com.ktsystems.subswitch.SubSwitchMain.onLoad();
/*
    window.addEventListener("compose-send-message", window.com.ktsystems.subswitch.SubSwitchMain.onSend, true)
    window.addEventListener("compose-window-close", window.com.ktsystems.subswitch.SubSwitchMain.sanitize, true);
    window.addEventListener("compose-window-reopen", window.com.ktsystems.subswitch.SubSwitchMain.init, true);
    window.addEventListener("compose-window-reopen", window.com.ktsystems.subswitch.SubSwitchMain.initMsgWindowToolbar, true);
*/
    console.log("Init of subswitchCalendarItemIframe - onLoad - END");
}

function onUnload(deactivatedWhileWindowOpen) {
}