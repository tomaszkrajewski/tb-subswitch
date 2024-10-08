if(!com) var com={};
if(!com.ktsystems) com.ktsystems={};
if(!com.ktsystems.subswitch) com.ktsystems.subswitch={};
if(!com.ktsystems.subswitch.SubSwitchMOToolbar) com.ktsystems.subswitch.SubSwitchMOToolbar={};

com.ktsystems.subswitch.SubSwitchMOToolbar = {
    rdi_prefix: 'subjects_prefix_switch_RD-',

    initMsgWindowToolbar : function() {
         try {
             console.log("Init of subswitch toolbar messenger - onLoad - START");

             var subMain = com.ktsystems.subswitch.SubSwitchMOToolbar;
             var separator = document.getElementById("subjects_prefix_switchMenuPopup-menu");
             //var menuPopup = separator.parentNode;
             var menuPopup = separator;
             var item;

             for (var i = menuPopup.childNodes.length - 1; i >= 0; i--) {
                 item = menuPopup.childNodes[i];
                 com.ktsystems.subswitch.Utils.dumpStr('initMsgWindowToolbar 1 -> '+item.id);
                 if (item.id.substring(0, subMain.rdi_prefix.length) == subMain.rdi_prefix) {
                     menuPopup.removeChild(item);
                 }
             }
             //separator.hidden = true;
             var rdData = subMain.loadRDProperty();

             for (var j = 0; j < rdData.length; j++) {
                 com.ktsystems.subswitch.Utils.dumpStr('initMsgWindowToolbar 2 -> '+rdData[j]+' '+rdData[j].showInNewMsgPopup);
                 if (rdData[j].showInNewMsgPopup) {
                     separator.hidden = false;
                     subMain.insertMenuItem(menuPopup, rdData[j].description, rdData[j].rd, j, rdData[j].addresses);
                     com.ktsystems.subswitch.Utils.dumpStr('initMsgWindowToolbar 22 -> '+rdData[j]+' '+rdData[j].showInNewMsgPopup);
                 }
             }
/*
              var buttonNewMsg = document.getElementById("button-newmsg");
              buttonNewMsg.setAttribute("type", "menu-button")

              for (var i = buttonNewMsg.childNodes.length - 1; i >= 0; i--) {
                  item = buttonNewMsg.childNodes[i];
                  com.ktsystems.subswitch.Utils.dumpStr('initMsgWindowToolbar 3 -> '+item.nodeName);
                  if ((item.nodeName == "image")||(item.nodeName == "label")) {
                      buttonNewMsg.removeChild(item);
                  }
              }
*/
             console.log("Init of subswitch toolbar messenger - onLoad - END");

         } catch(e) {
            com.ktsystems.subswitch.Utils.dumpStr('SubSwitchMOToolbar.initMsgWindowToolbar E-> '+e);
        }
    },

    MsgNewSubSwitchMessage : function(aIdx) {
        var subMain = com.ktsystems.subswitch.SubSwitchMOToolbar;
        var rdData = subMain.loadRDProperty();

        var msgComposeService = Components.classes["@mozilla.org/messengercompose;1"]
                                .getService(Components.interfaces.nsIMsgComposeService);
        var msgParams = Components.classes["@mozilla.org/messengercompose/composeparams;1"]
                        .createInstance(Components.interfaces.nsIMsgComposeParams);
        var composeFields = Components.classes["@mozilla.org/messengercompose/composefields;1"]
                            .createInstance(Components.interfaces.nsIMsgCompFields);

        if (rdData[aIdx] != null) {
            let vTo = "";
            let vCC = "";
            let vBCC = "";
            composeFields.subject = rdData[aIdx].formattedPrefixValue;

            if (rdData[aIdx].addresses != null) {
                for (var i = 0; i < rdData[aIdx].addresses.length; i++) {
                    var address = rdData[aIdx].addresses[i].split(':');
                    switch (address[0].toLowerCase()) {
                        case "to":
                            vTo = vTo + (vTo.length > 0 ? ",":"") + address[1];
                            break;
                        case "cc":
                            vCC = vCC + (vCC.length > 0 ? ",":"") + address[1];
                            break;
                        case "bcc":
                            vBCC = vBCC + (vBCC.length > 0 ? ",":"") + address[1];
                            break;
                    }
                }
            }
            if (vTo.length > 0)
                composeFields.to = vTo;
            if (vCC.length > 0)
                composeFields.cc = vCC;
            if (vBCC.length > 0)
                composeFields.bcc = vBCC;
        }

        msgParams.type = Components.interfaces.nsIMsgCompType.New;
        msgParams.format = Components.interfaces.nsIMsgCompFormat.Default;
        msgParams.composeFields = composeFields;

        msgComposeService.OpenComposeWindowWithParams(null, msgParams);
    },

    loadRDProperty : function() {
        return com.ktsystems.subswitch.PrefixesListSingleton.getInstance().getPrefixesList();
    },

    insertMenuItem : function(menu, label, tooltip, idx) {
        com.ktsystems.subswitch.Utils.dumpStr("Init of insertMenuItem - START");
        var item = com.ktsystems.subswitch.Utils.createMenuItem(
            this.rdi_prefix + idx, label, tooltip,
            "event.stopPropagation(); com.ktsystems.subswitch.SubSwitchMOToolbar.MsgNewSubSwitchMessage(" + idx + ");");
        item.setAttribute("class", "menuitem-iconic");

        com.ktsystems.subswitch.Utils.dumpStr('Init of insertMenuItem - 1'+item);
        com.ktsystems.subswitch.Utils.dumpStr('Init of insertMenuItem - 2'+menu);

        menu.appendChild(item);
        com.ktsystems.subswitch.Utils.dumpStr("Init of insertMenuItem - END");
    }
};
