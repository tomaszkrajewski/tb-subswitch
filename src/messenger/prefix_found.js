import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/subswitch_utils.mjs"
import * as items from "../modules/subswitch_items.js"

i18n.localizeDocument();

window.addEventListener("load", onLoad);

async function notifyMode(event) {
    await messenger.runtime.sendMessage({
        popupResponse: event.target.getAttribute("data")
    });
    try {
        utils.dumpDir(window);
        window.close();

    } catch (e) {
        utils.dumpDir(e);
        utils.dumpError(e);
    }
}

function updateAliasButton() {
    var checkbox = document.getElementById("aliasCheckbox");
    var button = document.getElementById("aliasButton");

    button.disabled = !checkbox.checked;

    document.getElementById("prefix").disabled = checkbox.checked;
    document.getElementById("description").disabled = checkbox.checked;
}

function getFoundPrefix() {
    browser.runtime.sendMessage({ action: "getData" }, (response) => {
        // Update the popup UI with the received data
        document.getElementById('description').value = response.description;
        document.getElementById('prefix').value = response.prefix;
    });
}

function registerListeners() {
    utils.dumpStr("prefix_found.js -> registerListeners START");

    document.getElementById("aliasCheckbox").addEventListener("click", updateAliasButton);

    document.getElementById("button_ok").addEventListener("click", (event) => {
        utils.dumpStr("prefix_found.js -> button_ok START");

        var checkbox = document.getElementById("aliasCheckbox");

        if (!checkbox.checked) {
            browser.runtime.sendMessage( {
                    action: "savePrefix",
                    description:  document.getElementById('description').value,
                    prefix: document.getElementById('prefix').value
            });
        } else {
            browser.runtime.sendMessage( {
                action: "saveAlias",
                prefix: document.getElementById('prefix').value,
                index: document.getElementById('aliasButton').value
            });
        }

        notifyMode(event);

        utils.dumpStr("prefix_found.js -> button_ok END");
    });
    document.getElementById("button_cancel").addEventListener("click", notifyMode);

    utils.dumpStr("prefix_found.js -> registerListeners END");
}

async function onLoad() {
    utils.dumpStr("prefix_found.js -> onLoad START");

    getFoundPrefix();

    await items.loadPrefixesDataString();

    let list = items.getPrefixesData();

    let addPrefixRow = function (prefix, index) {
        let tableRow = document.createElement("option");

        tableRow.value = index;
        tableRow.innerText = `${prefix.description} / ${prefix.prefix}`;

        document.getElementById("aliasButton").appendChild(tableRow);
    };

    for (let [index, prefix] of list.entries()) {
        addPrefixRow(prefix, index);
    }

    registerListeners();

    utils.dumpStr("prefix_found.js -> onLoad END");
}
