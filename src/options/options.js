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
    
    // handle checkboxes
    if (prefElement.tagName == "INPUT" && prefElement.type == "checkbox") {
        if (value == true) {
            prefElement.setAttribute("checked", "true");
        }
        // enable auto save
        prefElement.addEventListener("change", () => {
            browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.${prefElement.dataset.preference}`, prefElement.checked);
        })
    }
}

