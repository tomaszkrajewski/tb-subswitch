import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/utils.mjs"

i18n.localizeDocument();

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
            prefElement.setAttribute("checked", "true");
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

    utils.dumpStr("initPrefixesTable " + prefixesDataString);

/*
    let list = com.ktsystems.subswitch.PrefixesListSingleton.getInstance();
    let treeData = list.prefixesList;

    let defaultRD = -1;

    try {
        defaultRD = parseInt(com.ktsystems.subswitch.Const.subswitch_prefs.getCharPref("defaultrd"));
    } catch(e) {}

    utils.dumpStr("initPrefixesTable Populate table");

    let rdTable = document.getElementById("subjects_prefix_switchTable");
    let rdTableView = new com.ktsystems.subswitch.OptionsTreeView(treeData, defaultRD);

        this.rdTree.view = this.rdTreeView;this.dumpStr('initTree5');
        this.rdTreeView.invalidate();this.dumpStr('initTree6');
        this.onSelectItem();this.dumpStr('initTree7');
*/
    utils.dumpStr("initPrefixesTable END");
};

function registerEventListeners() {
    document.getElementById("addAddress").addEventListener("click", (event) => {
        addAutoSwitch();
    });
    document.getElementById("removeAddress").addEventListener("click", (event) => {
        removeAutoswitch();
    });
};

function addAutoSwitch() {
    let input = document.getElementById("address");
    let listbox = document.getElementById("discoveryIgnoreList");

    let msgInvalid = messenger.i18n.getMessage("options.invalidAddress");
    let msgDuplicate = messenger.i18n.getMessage("options.duplicateAddress");

    if (!validateAutoswitch(input.value)) {
        utils.alert(msgInvalid);
        return;
    }

    for (var i = 0; i < listbox.querySelectorAll('option').length; i++) {
        if (listbox.querySelectorAll('option')[i].value == input.value) {
            utils.alert(msgDuplicate);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(input);

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
    initPrefixesTable();
    registerEventListeners();
}

init();

