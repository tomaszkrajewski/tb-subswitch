import * as utils from "../modules/utils.mjs"

let entriesSplitSign = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.entries_split_sign`);
// com.ktsystems.subswitch.Const.ENTRIES_SPLIT_SIGN

let entrySplitSign = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.entry_split_sign`);
// com.ktsystems.subswitch.Const.ENTRY_SPLIT_SIGN

class SubswitchPrefixItem {
    constructor(aLabel, aPrefix) {
        this.label = aLabel;
        this.prefix = aPrefix;
        this.inNewMsgPopup = false;
        this.aliasesList = [];
        this.addressesList = [];
        this.currentSeqValue = 1;
        this.lastPrefixValue = aPrefix;
    }

    isValid() {
        return (this.prefix != "" && this.label != "");
    }

    /*
     incSeqValue : function()     {
        if (com.ktsystems.subswitch.Utils.isTemplateWithSequence(this.rd)) {
            this.currentSeqValue++;
            if (this.currentSeqValue > com.ktsystems.subswitch.Const.SEQ_MAX_VALUE) {
                this.currentSeqValue = 0;
            }
        }
    }
    */

    toString()   { return ('[' + this.description + entrySplitSign + this.rd + ']'); }

    get description()       { return this.label;  }
    get rd()                { return this.prefix; }
    get showInNewMsgPopup() { return this.inNewMsgPopup; }
    get aliases()           { return this.aliasesList; }
    get addresses()         { return this.addressesList; }

    set description(aLabel) { this.label  = aLabel;  }
    set rd(aPrefix)         { this.prefix = aPrefix; }
    set aliases(aAliases)   { this.aliasesList = aAliases; }
    set addresses(aAddresses)   { this.addressesList = aAddresses; }
    set showInNewMsgPopup(aShowInNewMsgPopup) { this.inNewMsgPopup = aShowInNewMsgPopup; }

}

utils.dumpStr('-> initPrefixesArray');

let prefixesDataString = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.rds`);
let prefixesAddressesString = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.rds_addresses`);
let prefixesSequencesString = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.rds_sequences`);

let prefixesList;

utils.dumpStr('-> initPrefixesArray '+prefixesDataString);
utils.dumpStr('-> initPrefixesArray '+prefixesAddressesString);
utils.dumpStr('-> initPrefixesArray '+prefixesSequencesString);

let items = new Array();

try {
    if (prefixesDataString != "") {
        let itemStrings = prefixesDataString.split(entriesSplitSign);

        let addressesStrings;
        if (prefixesAddressesString != null && prefixesAddressesString != "") {
            addressesStrings = prefixesAddressesString.split(entriesSplitSign);
        }

        let sequencesStrings;
        if (prefixesSequencesString != null && prefixesSequencesString != "") {
            sequencesStrings = prefixesSequencesString.split(entriesSplitSign);
        }

        for (var i = 0; i < itemStrings.length; i ++) {
            var itemData = itemStrings[i].split(entrySplitSign);
            // pre 0.9.16 upgrade
            var item;
            if (itemData[2] == null || itemData[2] == '' || (itemData[2] != 'true' && itemData[2] != 'false')) {
                utils.dumpStr('>>>>> ' +itemData[2]+ ' ' + 1    );
                item = new SubswitchPrefixItem(itemData.shift(), itemData.shift());
                tem.showInNewMsgPopup = 'true';
            } else {
                utils.dumpStr('>>>>> ' +itemData[2]+ ' ' + 2);
                item = new SubswitchPrefixItem(itemData.shift(), itemData.shift(), );
                item.showInNewMsgPopup = itemData.shift();
            }
            item.aliases = itemData;
            items.push(item);

            if (addressesStrings != null && addressesStrings[i] != null) {
                var addressData = addressesStrings[i].split(entrySplitSign);
                item.addresses = addressData;
            }

            if (sequencesStrings != null && sequencesStrings[i] != null) {
                var sequenceData = sequencesStrings[i];
                item.currentSeqValue = sequenceData;
            }
        }
    }
} catch (e) {
    utils.dumpStr(e);
}

items.indexOfComplex = function(elt) {
    return items.indexOfInternal(elt, true);
};

items.indexOf = function(elt) {
    return items.indexOfInternal(elt, false);
};

items.indexOfInternal = function(elt, deep) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].equals(elt, deep)) {
            return i;
        }
    }
    return -1;
};

items.removeAll = function() {
    for (var i = this.length - 1; i >= 0; i--) {
        this.pop();
    }
};