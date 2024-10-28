import * as i18n from "../modules/i18n.mjs"
import * as utils from "../modules/utils.mjs"
import * as items from "../options/items_migrated.js"

i18n.localizeDocument();

const PREFIX_ROW = `
        <input type="button" style="font-weight: bold;" class="w3-button w3-small w3-padding-small" value="{{description}} / {{prefix}}" id="newMessage-{{id}}" " />
`;

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
        if (prefix.showInNewMsgPopup) {
            addPrefixRow(prefix, index);
        }
    }

    document.querySelectorAll('input[id^="newMessage-"]').forEach((elem) => {
        elem.addEventListener("click",  function(event) {
            let item = event.target;
            let index = item.id.substring(11) // newMessage-

            let list = items.getPrefixesData();
            let listItem = list[index];

            utils.dumpStr("messenger -> newMessage " + listItem.prefixCode);

            let composeDetails = {
                subject: listItem.prefix
                //,
                //currentPrefix: listItem.prefix
            };

            utils.insertAddress(composeDetails, listItem);

            browser.compose.beginNew(composeDetails);
        });
    });

    utils.dumpStr("messenger -> init END");
}

init();

