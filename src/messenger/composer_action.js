import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/subswitch_utils.mjs"
import * as items from "../modules/subswitch_items.js"
import * as message_subject_util from "../modules/message_subject_util.js"


i18n.localizeDocument();


//FIXME MOVE TEMPLATES TO ONE script
const PREFIX_ROW = `
        <input type="button" style="font-weight: bold; text-align: left" class="w3-button w3-small w3-block w3-padding-small w3-round-large w3-pale-green" value="{{description}} / {{prefix}}" id="prefix-{{id}}" " />
`;

const SELECTED_PREFIX_ROW = `
        <input type="button" style="font-weight: bold; text-align: left" class="w3-button w3-small w3-block w3-padding-small w3-round-large w3-cyan" value="{{description}} / {{prefix}}" id="prefix-{{id}}" " />
`;

async function openOptions() {
    utils.dumpStr("composeAction -> openOptions START");

    try {
        let selff = await browser.management.getSelf();
        let url = selff.optionsUrl;

        utils.dumpStr("composeAction -> openOptions  url " + url);

        let value = await browser.tabs.query({url: url});

        utils.dumpStr("messenger -> openOptions  value " + value);

        if (value && value.length > 0) {
            //activate existing options tab

            let tabId = value[0].id;
            let windowId = value[0].windowId;

            browser.tabs.update(tabId, {active: true});
            browser.windows.update(windowId, {focused: true});
        } else {
            //launch new options tab
            browser.tabs.create({url: url}).then(optionsTab => {
                utils.dumpStr("composeAction -> optionsTitle " + optionsTab.title);
                utils.dumpStr("composeAction -> optionsTab.url " + optionsTab.url);
            })
        }
        window.close();
    } catch (error) {
        utils.dumpError("composeAction -> openOptions error " + error);
    }
    utils.dumpStr("composeAction -> openOptions END");

};

async function init() {
    utils.dumpStr("composeAction -> init START");

    await items.loadPrefixesDataString();

    // we need tabid to find out what is the current prefix in the window
    let tabs = await messenger.tabs.query({ active: true, currentWindow: true });
    let tabId = tabs[0].id;

    let list = items.getPrefixesData();

    let selectedPrefix = await message_subject_util.getPreselectedPrefix(tabId, list);

    let addPrefixRow = function (prefix, index) {
        let tableRow = document.createElement("li");

        tableRow.innerHTML = Mustache.render(
            (selectedPrefix === prefix ? SELECTED_PREFIX_ROW : PREFIX_ROW), {
            id: index,
            prefix: prefix.prefix,
            description: prefix.description,
            showInNewMsgPopup: prefix.showInNewMsgPopup
        });

        document.getElementById("subjects_prefix_switchList").appendChild(tableRow);
    };

    for (let [index, prefix] of list.entries()) {
        addPrefixRow(prefix, index);
    }

    registerListeners(tabId);

    utils.dumpStr("composeAction -> init END");
}

function registerListeners(tabId) {
    utils.dumpStr("composeAction -> registerListeners START");
    document.getElementById("optionsButton").addEventListener("click", (event) => {
        openOptions();
    });

    document.querySelectorAll('input[id^="prefix-"]').forEach((elem) => {
        elem.addEventListener("click", async function(event) {
            let item = event.target;
            let index = item.id.substring(7) // prefix-

            let list = items.getPrefixesData();
            let listItem = list[index];

            utils.dumpStr("composeAction -> newMessage " + listItem.prefixCode);

            await message_subject_util.alterSubject(tabId, listItem, list);

            window.close();
        });
    });

    utils.dumpStr("composeAction -> registerListeners END");
}

init();

