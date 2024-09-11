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
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/messenger-overlay-toolbar.js", window, "UTF-8");

function onLoad(activatedWhileWindowOpen) {
    console.log("Init of subswitch messenger - onLoad - START");

    WL.injectCSS("resource://subjects_prefix_switch/subjects_prefix_switch.css");
    WL.injectCSS("resource://subjects_prefix_switch/messenger-overlay-toolbar.css");

    WL.injectElements(`
        <menupopup id="messageMenu">
          <menuseparator id="subjects_prefix_switchContextSeparator" insertbefore="messageMenuAfterCompositionCommandsSeparator" />
          <menu id="subjects_prefix_switch-newMsg" label="${extension.localeData.localizeMessage("subjects_prefix_switch.label.toolbar")}" 
             insertafter="subjects_prefix_switchContextSeparator" class="menu-iconic subjects_prefix_switch-icon menuitem-iconic" >
                <menupopup id="subjects_prefix_switchMenuPopup-menu" onpopupshowing="window.com.ktsystems.subswitch.SubSwitchMOToolbar.initMsgWindowToolbar();" />
          </menu>
        </menupopup>`);

    //FIXME: It doesn't work in 78 :/ Somehow the newMsg button is 'protected'
    //   <toolbarbutton id="button-newmsg"
    //                    class="toolbarbutton-1"
    //                    label="&newMsgButton.label;"
    //                    tooltiptext="&newMsgButton.tooltip;"
    //                    command="cmd_newMessage"/>
    //WL.injectElements(`
    //    <div id="spacesToolbarAddonsContainer" class="spaces-toolbar-container">
    //    <toolbarbutton id="button-newmsg" type="menu" class="spaces-toolbar-button">
    //        <menupopup id="button-newMsgPopup" >
    //          <menuitem id="newMsgButton-mail-menuitem"
    //                    label="&newMsgButton.label;"
    //                    class="menuitem-iconic"
    //                    command="cmd_newMessage"/>
    //          <menuseparator id="subjects_prefix_switchContextSeparator" insertbefore="subjects_prefix_switch_RD_0" />
    //        </menupopup>
    //    </toolbarbutton>
    //    <toolbarbutton class="box-inherit toolbarbutton-menubutton-button" flex="1" allowevents="true" label="&newMsgButton.label;" tooltiptext="&newMsgButton.tooltip;" />
    //    <dropmarker type="menu-button" class="toolbarbutton-menubutton-dropmarker"></dropmarker>
    //   </div>`,
    //    ["chrome://messenger/locale/messenger.dtd"]);

    window.com.ktsystems.subswitch.SubSwitchMOToolbar.initMsgWindowToolbar();

    console.log("Init of subswitch messenger - onLoad - END");
}

function onUnload(deactivatedWhileWindowOpen) {
}