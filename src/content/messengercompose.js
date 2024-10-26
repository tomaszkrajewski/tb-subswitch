// Import any needed modules.
var Services = globalThis.Services ||
    ChromeUtils.import("resource://gre/modules/Services.jsm").Services;

var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
var extension = ExtensionParent.GlobalManager.getExtension("{957509b1-217a-46c7-b08b-f67d08d53883}");

// Load an additional JavaScript file.
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/const.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/utils.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/date_utils.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/items.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/subjects_prefix_switch.js", window, "UTF-8");


function onLoad(activatedWhileWindowOpen) {
    console.log("Init of subswitchMessengerCompose - onLoad - START");

    WL.injectCSS("resource://subjects_prefix_switch/subjects_prefix_switch.css");
    WL.injectElements(`
         <toolbarpalette id="MsgComposeToolbarPalette">
            <toolbarbutton
                is="toolbarbutton-menu-button"
                id="subjects_prefix_switchButton"
                type="menu-button"
                class="toolbarbutton-1"
                label="${extension.localeData.localizeMessage("subjects_prefix_switch.label.toolbar")}"
                tooltiptext="${extension.localeData.localizeMessage("subjects_prefix_switch.tooltip.toolbar")}"
                oncommand="com.ktsystems.subswitch.SubSwitchMain.subjects_prefix_switch();">
                <menupopup id="subjects_prefix_switchMenuPopup-toolbar" onpopupshowing="com.ktsystems.subswitch.SubSwitchMain.initMenuPopup('toolbar');"/>
            </toolbarbutton>
         </toolbarpalette>
        
         <menulist id="subjects_prefix_switchMenuPopup-subtoolbarButton" 
                    align="stretch" 
                    class="addressingWidget-separator"
                    crop="right" 
                    is="menulist-editable"
                    disableonsend="true" 
                    style="/*!-moz-box-flex: 1;*/" insertBefore="msgSubject">
            <menupopup id="subjects_prefix_switchMenuPopup-subtoolbar" onpopupshowing="com.ktsystems.subswitch.SubSwitchMain.initMenuPopup('subtoolbar');" flex="1" />
         </menulist>
         
         <popup id="msgComposeContext">
            <menu   id="subjects_prefix_switchContext"
                    label="${extension.localeData.localizeMessage("subjects_prefix_switch.label.context")}"
                    insertbefore="context-cut"
                    insertafter="spellCheckSuggestionsSeparator">
                        <menupopup id="subjects_prefix_switchMenuPopup-context" onpopupshowing="com.ktsystems.subswitch.SubSwitchMain.initMenuPopup('context');"/>
            </menu>
            <menuseparator id="subjects_prefix_switchContextSeparator" insertbefore="context-cut,spellCheckSuggestionsSeparator" insertafter="subjects_prefix_switchContext" />
         </popup>`);

    window.com.ktsystems.subswitch.SubSwitchMain.onLoad();

    window.addEventListener("compose-send-message", window.com.ktsystems.subswitch.SubSwitchMain.onSend, true)
    window.addEventListener("compose-window-close", window.com.ktsystems.subswitch.SubSwitchMain.sanitize, true);
    window.addEventListener("compose-window-reopen", window.com.ktsystems.subswitch.SubSwitchMain.init, true);
    window.addEventListener("compose-window-reopen", window.com.ktsystems.subswitch.SubSwitchMain.initMsgWindowToolbar, true);

    console.log("Init of subswitchMessengerCompose - onLoad - END");
}

function onUnload(deactivatedWhileWindowOpen) {
}