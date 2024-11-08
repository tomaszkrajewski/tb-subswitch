import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/subswitch_utils.mjs"
import * as items from "../modules/subswitch_items.js"

i18n.localizeDocument();

const PREFIX_ROW = `
        <input type="button" style="font-weight: bold;" class="w3-button w3-small w3-padding-small w3-round-large w3-block" value="{{description}} / {{prefix}}" id="newMessage-{{id}}" " />
`;

async function init() {
    utils.dumpStr("messenger -> init START");

    await items.loadPrefixesDataString();

    let addPrefixRow = function (prefix, index) {
        let tableRow = document.createElement("li");

        tableRow.innerHTML = Mustache.render(PREFIX_ROW, {
            id: index,
            prefix: prefix.prefix,
            description: prefix.description,
            showInNewMsgPopup: prefix.showInNewMsgPopup
        });

        document.getElementById("subjects_prefix_switchList").appendChild(tableRow);
    };

    let list = items.getPrefixesData();

    for (let [index, prefix] of list.entries()) {
        if (prefix.showInNewMsgPopup) {
            addPrefixRow(prefix, index);
        }
    }

    registerListeners();

    utils.dumpStr("messenger -> init END");
}

function registerListeners(){
    utils.dumpStr("messenger -> registerListeners START");

    document.querySelectorAll('input[id^="newMessage-"]').forEach((elem) => {
        elem.addEventListener("click",  async function(event) {
            let item = event.target;
            let index = item.id.substring(11) // newMessage-

            let to = await browser.runtime.sendMessage({ command: "composeWithPrefix", prefix: index });
        });
    });

    utils.dumpStr("messenger -> registerListeners END");
}

init();
