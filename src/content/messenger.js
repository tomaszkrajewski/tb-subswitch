// Import any needed modules.
const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

// Load an additional JavaScript file.
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/const.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/utils.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/date_utils.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/items.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/subjects_prefix_switch.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://subjects_prefix_switch/content/messenger-overlay-toolbar.js", window, "UTF-8");

function onLoad(activatedWhileWindowOpen) {
    console.log("Init of subswitch - onLoad - START");

    WL.injectCSS("resource://subjects_prefix_switch/subjects_prefix_switch.css");
    WL.injectElements(`
        <menupopup id="taskPopup">
          <menuitem id="subjects_prefix_switch-settings" label="&subjects_prefix_switch.label.toolbar;" 
            oncommand="subswitchOptionsHandler.openSettings();" insertbefore="prefSep" class="menu-iconic subjects_prefix_switch-icon menuitem-iconic" />
        </menupopup>`,
        ["chrome://subjects_prefix_switch/locale/subjects_prefix_switch.dtd"]);

    //FIXME: It doesn't work in 78 :/ Somehow the newMsg button is 'protected'
    //   <toolbarbutton id="button-newmsg"
    //                    class="toolbarbutton-1"
    //                    label="&newMsgButton.label;"
    //                    tooltiptext="&newMsgButton.tooltip;"
    //                    command="cmd_newMessage"/>
    WL.injectCSS("resource://subjects_prefix_switch/messenger-overlay-toolbar.css");
    WL.injectElements(`
        <toolbarbutton id="button-newmsg" type="menu" class="inline-toolbar chromeclass-toolbar themeable-full">
            <menupopup id="button-newMsgPopup" onpopupshowing="com.ktsystems.subswitch.SubSwitchMOToolbar.initMsgWindowToolbar()">
              <menuitem id="newMsgButton-mail-menuitem"
                        label="&newMsgButton.label;"
                        class="menuitem-iconic"
                        command="cmd_newMessage"/>
              <menuseparator id="subjects_prefix_switchContextSeparator" insertbefore="subjects_prefix_switch_RD_0" />
            </menupopup>
            <toolbarbutton class="box-inherit toolbarbutton-menubutton-button" flex="1" allowevents="true" label="&newMsgButton.label;" tooltiptext="&newMsgButton.tooltip;" />
            <dropmarker type="menu-button" class="toolbarbutton-menubutton-dropmarker"></dropmarker>
        </toolbarbutton>`,
        ["chrome://messenger/locale/messenger.dtd"]);


    window.com.ktsystems.subswitch.SubSwitchMOToolbar.initMsgWindowToolbar();

    console.log("Init of subswitch - onLoad - END");
}

function onUnload(deactivatedWhileWindowOpen) {
}