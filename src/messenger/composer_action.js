import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/utils.mjs"
import * as message_subject_util from "../modules/message_subject_util.js"
import * as items from "../options/items_migrated.js"

i18n.localizeDocument();

const PREFIX_ROW = `
        <input type="button" style="font-weight: bold;" class="w3-button w3-small w3-block w3-padding-small w3-round-large w3-pale-green" value="{{description}} / {{prefix}}" id="prefix-{{id}}" " />
`;

const SELECTED_PREFIX_ROW = `
        <input type="button" style="font-weight: bold;" class="w3-button w3-small w3-block w3-padding-small w3-round-large w3-cyan" value="{{description}} / {{prefix}}" id="prefix-{{id}}" " />
`;

async function openOptions() {
    utils.dumpStr("messenger -> openOptions START");

    try {
        let selff = await browser.management.getSelf();
        let url = selff.optionsUrl;
        utils.dumpStr("messenger -> openOptions  selff " + selff);
        utils.dumpStr("messenger -> openOptions  url " + url);

        let value = await browser.tabs.query({url: url});

        utils.dumpStr("messenger -> openOptions  value " + value);

        if (value && value.length > 0) {
            //activate existing options tab

            let tabId = value[0].id;
            let windowId = value[0].windowId;

            browser.tabs.update(tabId, {active: true});
            window.update(windowId, {focused: true});

        } else {
            //launch new options tab
            browser.tabs.create({url: url}).then(optionsTab => {
                utils.dumpStr("optionsButton -> optionsTitle " + optionsTab.title);
                utils.dumpStr("optionsButton -> optionsTab.url " + optionsTab.url);
            })
        }
        window.close();
    } catch (error) {
        utils.dumpStr("messenger -> openOptions error " + error);
    }
    utils.dumpStr("messenger -> openOptions END");

};

async function init() {
    utils.dumpStr("messenger -> init START");

    await items.loadPrefixesDataString();

    let addPrefixRow = function (prefix, index) {
        let tableRow = document.createElement("li");
        // tableRow.setAttribute("data-prefix-id", prefix.id);
        tableRow.innerHTML = Mustache.render(PREFIX_ROW, {
            id: index,
            prefix: prefix.prefix,
            description: prefix.description,
            showInNewMsgPopup: prefix.showInNewMsgPopup
        });

        document.getElementById("subjects_prefix_switchList").appendChild(tableRow);
    };

    let list = items.getPrefixesData();
    let defaultRD = list.defaultPrefixIndex;

    for (let [index, prefix] of list.entries()) {
        addPrefixRow(prefix, index);
    }

    document.getElementById("optionsButton").addEventListener("click", (event) => {
        openOptions();
    });

    document.querySelectorAll('input[id^="prefix-"]').forEach((elem) => {
        elem.addEventListener("click", async function(event) {
            let item = event.target;
            let index = item.id.substring(7) // prefix-

            let list = items.getPrefixesData();
            let listItem = list[index];

            let tabs = await messenger.tabs.query({ active: true, currentWindow: true });
            let tabId = tabs[0].id;

            utils.dumpStr("messenger -> newMessage " + listItem.prefixCode);

            await message_subject_util.alterSubject(tabId, listItem, list);
        });
    });

    utils.dumpStr("messenger -> init END");
}


init();

