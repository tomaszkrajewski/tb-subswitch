import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/subswitch_utils.mjs"
import * as items from "../modules/subswitch_items.js"

i18n.localizeDocument();

const PREFIX_ROW_LOCALISED = i18n.updateString(PREFIX_ROW);
const PREFIX_EDIT_LOCALISED = i18n.updateString(PREFIX_EDIT_TEMPLATE);
const ALERT_TEMPLATE_LOCALISED = i18n.updateString(ALERT_TEMPLATE);

const INVALID_DESCRIPTION_LOCALISED = i18n.updateString("__MSG_setRD.invalidDescription__");
const INVALID_PATH_LOCALISED = i18n.updateString("__MSG_setRD.invalidPath__");

const INVALID_ALIAS_LOCALISED = i18n.updateString( "__MSG_setRD.invalidAlias__");
const DUPLICATE_ALIAS_LOCALISED = i18n.updateString("__MSG_setRD.duplicateAlias__");
const INVALID_ADDRESS_LOCALISED  = i18n.updateString("__MSG_options.invalidAddress__");
const DUPLICATE_ADDRESS_LOCALISED = i18n.updateString( "__MSG_options.duplicateAddress__");


let linkElements = document.querySelectorAll('[data-link]');
linkElements.forEach(linkElement => {
    linkElement.addEventListener("click", (e) => {
        let link = e.target.dataset.link;
        if (link) {
            utils.openURL(link);
        }
    })
})

let toElements = document.querySelectorAll('[data-to]');
toElements.forEach(toElement => {
    toElement.addEventListener("click", (e) => {
        let to = e.target.dataset.to;
        if (to) {
            utils.openMailWindow(to);
        }
    })
})

// load preferences
let prefElements = document.querySelectorAll('[data-preference]');
for (let prefElement of prefElements) {
    let value = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.${prefElement.dataset.preference}`);
    utils.dumpStr(prefElement.tagName);

    // handle checkboxes
    if (prefElement.tagName == "INPUT" && prefElement.type == "checkbox") {
        if (value == true) {
            prefElement.setAttribute("checked", "checked");
        } else {
            prefElement.removeAttribute("checked");
        }
        // enable auto save
        prefElement.addEventListener("change", () => {
            browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.${prefElement.dataset.preference}`, prefElement.checked);
        })
    // handle checkboxes
    } else if (prefElement.tagName == "INPUT" && prefElement.type == "text") {
        try {
            prefElement.setAttribute("value", value);
        } catch (e) {
            prefElement.setAttribute("value", element.getAttribute("defaultpref"));
        }
        // enable auto save
        prefElement.addEventListener("change", () => {
            browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.${prefElement.dataset.preference}`, prefElement.value);
        })
    // handle richlistbox / select
    } else if (prefElement.tagName == "SELECT") {
        try {
            fillListboxFromArray(prefElement, value.split(";"));
        } catch (e) {
            fillListboxFromArray(prefElement, element.getAttribute("defaultpref").split(";"));
        }
        // enable auto save
        //FIXME: SAVING this way is not working, so saving directly in addAutoSwitch and removeAutoswitch
        prefElement.addEventListener("change", () => {
            utils.dumpStr("change "+prefElement);
            browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.${prefElement.dataset.preference}`, getStringFromListbox(prefElement));
        })
    }
}

async function initPrefixesTable() {
    utils.dumpStr("initPrefixesTable START");

    await items.loadPrefixesDataString();

    let addPrefixRow = function (prefix, index) {
        let tableRow = document.createElement("tr");
        // tableRow.setAttribute("data-prefix-id", prefix.id);
        tableRow.innerHTML = Mustache.render(PREFIX_ROW_LOCALISED, {
            id: index,
            prefix: prefix.prefix,
            description: prefix.description,
            showInNewMsgPopup: prefix.showInNewMsgPopup
        });

        document.getElementById("subjects_prefix_switchTable").appendChild(tableRow);
    };

    let list = items.getPrefixesData();
    let defaultRD = list.defaultPrefixIndex;

    for (let [index, prefix] of list.entries()) {
        addPrefixRow(prefix, index);
    }

    utils.dumpStr("initPrefixesTable getPrefixesData " + list);

    //FIXME APPLY ICON FOR default instead of regular checkbox
    utils.dumpStr("initPrefixesTable defaultRD " + defaultRD);

    let prefixDefaultElement = document.getElementById("prefixDefault-" + defaultRD)
    if (prefixDefaultElement) {
        prefixDefaultElement.setAttribute("checked", "true");
    }

    registerPrefixTableEventListeners();

    utils.dumpStr("initPrefixesTable END");
};


function openTab(evt, tabName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-light-blue", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " w3-light-blue";
}


function registerGeneralEventListeners() {
    document.getElementById("addAddress").addEventListener("click", (event) => {
        addAutoSwitch();
    });
    document.getElementById("removeAddress").addEventListener("click", (event) => {
        removeAutoswitch();
    });

    //tabs
    document.getElementById("main-button").addEventListener("click", (event) => {
        openTab(event, "main");
    });
    document.getElementById("other-button").addEventListener("click", (event) => {
        openTab(event, "other");
    });
    document.getElementById("help-button").addEventListener("click", (event) => {
        openTab(event, "help");
    });
};


function registerPrefixTableEventListeners() {
   document.querySelectorAll('input[name="defaultRD"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
            let item = event.target;
            let prefixDefault = item.id.substring(14) // prefixDefault-
            let list = items.getPrefixesData();

            list.defaultPrefix = prefixDefault;

            saveDefaultPrefix(prefixDefault);
        });
    });

    document.querySelectorAll('input[id^="showInNewMsgPopup-"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
            let item = event.target;
            let index = item.id.substring(18) // showInNewMsgPopup-

            let list = items.getPrefixesData();
            let listItem = list[index];

            listItem.showInNewMsgPopup = !listItem.showInNewMsgPopup;

            items.savePrefixes();
        });
    });

    document.querySelectorAll('input[id^="up-"]').forEach((elem) => {
        elem.addEventListener("click", function(event) {
            var item = event.target;
            let index = item.id.substring(3) // up-
            movePrefixUp(index);
        });
    });

    document.querySelectorAll('input[id^="down-"]').forEach((elem) => {
        elem.addEventListener("click", function(event) {
            var item = event.target;
            let index = item.id.substring(5) // down-
            movePrefixDown(index);
        });
    });

    document.querySelectorAll('input[id^="delete-"]').forEach((elem) => {
        elem.addEventListener("click", function(event) {
            var item = event.target;
            let index = item.id.substring(7) // delete-
            deletePrefix(index);
        });
    });

    document.querySelectorAll('input[id^="edit-"]').forEach((elem) => {
        elem.addEventListener("click", function(event) {
            var item = event.target;
            let index = item.id.substring(5) // edit-
            editPrefix(index);
        });
    });

    document.querySelectorAll('input[id^="duplicate-"]').forEach((elem) => {
        elem.addEventListener("click", function(event) {
            var item = event.target;
            let index = item.id.substring(10) // duplicate-
            duplicatePrefix(index);
        });
    });

    document.getElementById("new").addEventListener("click", (event) => {
        addPrefix();
    });
};

function addAutoSwitch() {
    let input = document.getElementById("addressDiscovery");
    let listbox = document.getElementById("discoveryIgnoreList");

    let msgInvalid = messenger.i18n.getMessage("options.invalidAddress");
    let msgDuplicate = messenger.i18n.getMessage("options.duplicateAddress");

    if (!validateAutoswitch(input.value)) {
        optionsModalAlertShow(msgInvalid);
        return;
    }

    for (var i = 0; i < listbox.querySelectorAll('option').length; i++) {
        if (listbox.querySelectorAll('option')[i].value == input.value) {
            optionsModalAlertShow(msgDuplicate);
            return;
        }
    }

    let newNode = document.createElement("option");
    newNode.value = input.value;
    newNode.innerText = input.value

    listbox.appendChild(newNode);

    input.innerText = "";
    input.value = "";

    browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.discoveryIgnoreList`, getStringFromListbox(listbox));
};

function removeAutoswitch() {
    let listbox = document.getElementById("discoveryIgnoreList");
    let selected = listbox.selectedIndex;

    if (selected >= 0) {
        listbox.remove(selected);

        browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.discoveryIgnoreList`, getStringFromListbox(listbox));
    }
};

function saveDefaultPrefix(prefixDefault) {
    utils.dumpStr("saveDefaultPrefix START prefixDefault" + prefixDefault);

    browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.defaultrd`, prefixDefault);

    utils.dumpStr("saveDefaultPrefix END");
};


function checkDescription(){
    var description = document.getElementById("description");
    var isValid = checkElem(description, INVALID_DESCRIPTION_LOCALISED);

    return isValid;
};

function checkPrefix() {
    var prefix = document.getElementById("prefix");
    var isValid = checkElem(prefix, INVALID_PATH_LOCALISED);

    return isValid;
};

function addAlias() {
    var input = document.getElementById("alias");

    if (!checkElem(input)) {
        prefixModalAlertShow(INVALID_ALIAS_LOCALISED);
        return;
    } else {
        prefixModalAlertHide();
    }

    var newValue = input.value;

    addItemToListBox(input, "aliasesList", newValue, DUPLICATE_ALIAS_LOCALISED);
};

function addAddress() {
    var addressType = document.getElementById("addressType");
    var input = document.getElementById("address");

    var validate = EMAIL_REGEX;

    if (!checkElem(input) || !EMAIL_REGEX.test(input.value)) {
        //FIXME: checking the validity of input
        // if (!checkElem(input) || !input.value.match(validate)) {
        prefixModalAlertShow(INVALID_ADDRESS_LOCALISED);
        return;
    } else {
        prefixModalAlertHide();
    }

    var newValue = addressType.selectedOptions[0].value + ' ' + input.value;

    addItemToListBox(input, "addressList", newValue, DUPLICATE_ADDRESS_LOCALISED);
};


function removeAlias() {
    removeItemFromListBox("aliasesList");
    prefixModalAlertHide();
};

function removeAddress() {
    removeItemFromListBox("addressList");
    prefixModalAlertHide();
};


function editPrefix(index) {
    utils.dumpStr("editPrefix ->  START");

    let list = items.getPrefixesData();
    let item = list[index];

    editPrefixInternal(item, false);

    utils.dumpStr("editPrefix ->  END");
};

function duplicatePrefix(index) {
    utils.dumpStr("duplicatePrefix ->  START");
    var selIdx = index;
    if (selIdx < 0)
        return;

    let list = items.getPrefixesData();
    let oldItem = list[selIdx];

    var item = items.createNewPrefix(oldItem.description +  ' ('
        + i18n.updateString("__MSG_options.prefixCopy__")
            +')', oldItem.prefix);

    item.aliasesList = oldItem.aliasesList;
    item.addressesList = oldItem.addressesList;

    editPrefixInternal(item, true);

    utils.dumpStr("duplicatePrefix ->  END");
};


function addPrefix() {
    utils.dumpStr("addPrefix ->  START");

    var item = items.createNewPrefix('', '');

   editPrefixInternal(item, true);

    utils.dumpStr("addPrefix ->  END");
};

function editPrefixInternal(item, isNewPrefix) {
    utils.dumpStr("editPrefixInternal ->  START");

    utils.dumpStr("editPrefixInternal item ->  "+item);

    const popover = document.getElementById("mypopover");
    popover.innerHTML = Mustache.render(PREFIX_EDIT_LOCALISED, {
        message: "CREATE/EDIT/DUPLICATE",
        item: item,
        button1Label: "Save",
        button2Label: "Cancel"
    });
    prefixModalAlertHide();

    document.getElementById("addAlias").addEventListener("click", (event) => {
        utils.dumpStr("editPrefixInternal addAlias click->  START");

        addAlias();

        utils.dumpStr("editPrefixInternal addAlias click->  END");
    });

    document.getElementById("removeAlias").addEventListener("click", (event) => {
        utils.dumpStr("editPrefixInternal removeAlias click->  START");

        removeAlias();

        utils.dumpStr("editPrefixInternal removeAlias click->  END");
    });


    document.getElementById("addAddress").addEventListener("click", (event) => {
        utils.dumpStr("editPrefixInternal addAddress click->  START");

        addAddress();

        utils.dumpStr("editPrefixInternal addAddress click->  END");
    });

    document.getElementById("removeAddress").addEventListener("click", (event) => {
        utils.dumpStr("editPrefixInternal removeAddress click->  START");

        removeAddress();

        utils.dumpStr("editPrefixInternal removeAddress click->  END");
    });

    // save
    document.getElementById("button1").addEventListener("click", (event) => {
        utils.dumpStr("editPrefixInternal button1 click->  START");

        let isValid = checkDescription() && checkPrefix();
        utils.dumpStr("editPrefixInternal button1 click->  validation " + isValid);

        if (isValid) {
            item.description = document.getElementById("description").value.trim();
            item.prefix = document.getElementById("prefix").value.trim();

            item.aliases = getArrayFromListbox(document.getElementById("aliasesList"));
            item.addresses = getArrayFromListbox(document.getElementById("addressList"));
            item.currentSeqValue = document.getElementById("rdSequenceValue").value;

            utils.dumpStr("editPrefixInternal item to save ->  "+item);

            if (isNewPrefix) {
                let list = items.getPrefixesData();
                list.push(item);
            }

            items.savePrefixes();

            document.getElementById("subjects_prefix_switchTable").textContent = '';

            initPrefixesTable();

            popover.hidePopover();
        }

        utils.dumpStr("editPrefixInternal button1 click->  END");
    });

    // cancel
    document.getElementById("button2").addEventListener("click", (event) => {
        utils.dumpStr("editPrefixInternal button2 click->  START");

        popover.hidePopover();
        utils.dumpStr("editPrefixInternal button2 click->  END");
    });

    popover.showPopover();

    utils.dumpStr("editPrefixInternal ->  END");
};


function optionsModalAlertShow(message)  {
    utils.dumpStr("optionsModalAlertShow ->  START");

    const popover = document.getElementById("mypopover");

    //TODO: LOCALISE
    popover.innerHTML = Mustache.render(ALERT_TEMPLATE_LOCALISED, {
        message: message,
        button1Label: "OK"
    });

    document.getElementById("button1").addEventListener("click", (event) => {
        utils.dumpStr("optionsModalAlertShow button1 click->  START");

        popover.hidePopover();
        utils.dumpStr("optionsModalAlertShow button1 click->  END");
    });

    popover.showPopover();

    utils.dumpStr("optionsModalAlertShow ->  END");
};


function deletePrefix(index) {
    utils.dumpStr("deletePrefix ->  START");

    let list = items.getPrefixesData();
    let item = list[index];

    const popover = document.getElementById("mypopover");

    //TODO: LOCALISE
    popover.innerHTML = Mustache.render(ALERT_TEMPLATE_LOCALISED, {
        message: "Do you want to remove selected prefix?",
        item: item,
        button1Label: "Yes, Remove",
        button2Label: "No, Cancel"
    });

    document.getElementById("button1").addEventListener("click", (event) => {
        utils.dumpStr("deletePrefix button1 click->  START");

        list.remove(index);

        items.savePrefixes();
        document.getElementById("subjects_prefix_switchTable").textContent = '';
        initPrefixesTable();

        popover.hidePopover();
        utils.dumpStr("deletePrefix button1 click->  END");
    });
    document.getElementById("button2").addEventListener("click", (event) => {
        utils.dumpStr("deletePrefix button2 click->  START");

        popover.hidePopover();
        utils.dumpStr("deletePrefix button2 click->  END");
    });

    popover.showPopover();

    utils.dumpStr("deletePrefix ->  END");
};

function movePrefixUp(index) {
    moveItem(index,true);
};

function movePrefixDown(index) {
    moveItem(index,false);
};

function moveItem(index, moveUp) {
    let fromIdx = Number(index);
    let toIdx;
    let list = items.getPrefixesData();

    if (moveUp) {
        if (fromIdx <= 0)
            return;

        toIdx = fromIdx - 1;
    } else {
        if (fromIdx >= list.length - 1)
            return;

        toIdx = fromIdx + 1;
    }

    list.swap(fromIdx, toIdx);
    items.savePrefixes();

    document.getElementById("subjects_prefix_switchTable").textContent = '';

    initPrefixesTable();
};

function validateAutoswitch(input) {
    if (input.indexOf("?") > -1) {
        if (input.charAt(0) == "?")
            input = "X" + input;

        if (input.charAt(input.length - 2) == "." &&
            input.charAt(input.length - 1) == "?" )
            input += "X";

        input = input.split("?").join("X");
        utils.dumpStr(input);
    }

    return EMAIL_REGEX.test(input);

    /*
    TODO: complicate a little validation some day
    rx_user: "([a-zA-Z0-9][a-zA-Z0-9._-]*|\"([^\\\\\x80-\xff\015\012\"]|\\\\[^\x80-\xff])+\")",
    rx_domain: "([a-zA-Z0-9][a-zA-Z0-9._-]*\\.)*[a-zA-Z0-9][a-zA-Z0-9._-]*\\.[a-zA-Z]{2,5}",
    rx_wildcard: "[a-zA-Z0-9._-]*",

    let rxuser = rx_user;
    let rxdomain = rx_domain;

    const rx = "^" + rxuser + "\@" + rxdomain + "$";

    var validate = new RegExp(rx);
     */

};

function fillListboxFromArray(listbox, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] != "-") {
            let newNode = document.createElement("option");

            // Store the value in the list item as before.
            newNode.value = array[i];
            newNode.innerText = array[i];

            listbox.appendChild(newNode);
        }
    }
};

function getStringFromListbox(listbox){
    var result = "-";

    if (listbox.querySelectorAll('option').length > 0) {
        var array = new Array();

        for (var i = 0; i < listbox.querySelectorAll('option').length; i++) {
            array.push(listbox.querySelectorAll('option')[i].value);
            utils.dumpStr(listbox.querySelectorAll('option')[i].value);
        }

        result = array.join(";");
    }

    return result;
};



async function init() {
    utils.dumpStr("options -> init START");

    initPrefixesTable();
    registerGeneralEventListeners();

    utils.dumpStr("options -> init END");
}

init();

