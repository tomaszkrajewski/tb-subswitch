import * as utils from "../modules/utils.mjs"

class SubswitchPrefixItem {
    constructor(aLabel, aPrefix) {
        this.label = aLabel;
        this.prefixCode = aPrefix;
        this.inNewMsgPopup = false;
        this.aliasesList = [];
        this.addressesList = [];
        this.currentSeqValue = 1;
        this.lastPrefixValue = aPrefix;
    }

    isValid() {
        return (this.prefixCode != "" && this.label != "");
    }

    /*
     incSeqValue : function()     {
        if (com.ktsystems.subswitch.Utils.isTemplateWithSequence(this.prefix)) {
            this.currentSeqValue++;
            if (this.currentSeqValue > com.ktsystems.subswitch.Const.SEQ_MAX_VALUE) {
                this.currentSeqValue = 0;
            }
        }
    }
    */

    toString()   { return ('[' + this.description + " ## " + this.prefixCode + ']'); }

    get description()       { return this.label;  }
    get prefix()                { return this.prefixCode; }
    get showInNewMsgPopup() { return this.inNewMsgPopup; }
    get aliases()           { return this.aliasesList; }
    get addresses()         { return this.addressesList; }

    set description(aLabel) { this.label  = aLabel;  }
    set prefix(aPrefix)         { this.prefixCode = aPrefix; }
    set aliases(aAliases)   { this.aliasesList = aAliases; }
    set addresses(aAddresses)   { this.addressesList = aAddresses; }
    set showInNewMsgPopup(aShowInNewMsgPopup) { this.inNewMsgPopup = aShowInNewMsgPopup; }

}

async function loadPrefixes() {
    utils.dumpStr('-> loadPrefixes START');

    let entriesSplitSign = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.entries_split_sign`);
    // com.ktsystems.subswitch.Const.ENTRIES_SPLIT_SIGN

    let entrySplitSign = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.entry_split_sign`);
    // com.ktsystems.subswitch.Const.ENTRY_SPLIT_SIGN

    let prefixesDataString = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.rds`);
    let prefixesAddressesString = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.rds_addresses`);
    let prefixesSequencesString = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.rds_sequences`);

    let defaultRD = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.defaultrd`);

    utils.dumpStr('-> initPrefixesArray prefixesDataString ' + prefixesDataString);
    utils.dumpStr('-> initPrefixesArray prefixesAddressesString ' + prefixesAddressesString);
    utils.dumpStr('-> initPrefixesArray prefixesSequencesString ' + prefixesSequencesString);
    utils.dumpStr('-> initPrefixesArray defaultRD ' + defaultRD);

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

            for (var i = 0; i < itemStrings.length; i++) {
                var itemData = itemStrings[i].split(entrySplitSign);
                // pre 0.9.16 upgrade
                var item;
                if (itemData[2] == null || itemData[2] == '' || (itemData[2] != 'true' && itemData[2] != 'false')) {
                    utils.dumpStr('>>>>> ' + itemData[2] + ' ' + 1);
                    item = new SubswitchPrefixItem(itemData.shift(), itemData.shift());
                    tem.showInNewMsgPopup = 'true';
                } else {
                    utils.dumpStr('>>>>> ' + itemData[2] + ' ' + 2);
                    item = new SubswitchPrefixItem(itemData.shift(), itemData.shift());
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

        items.defaultPrefixIndex = defaultRD;

    } catch (e) {
        utils.dumpStr('-> loadPrefixes EXCEPTION');
        utils.dumpStr(e);
    }

    items.indexOfComplex = function (elt) {
        return items.indexOfInternal(elt, true);
    };

    items.indexOf = function (elt) {
        return items.indexOfInternal(elt, false);
    };

    items.indexOfInternal = function (elt, deep) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].equals(elt, deep)) {
                return i;
            }
        }
        return -1;
    };

    items.removeAll = function () {
        for (var i = this.length - 1; i >= 0; i--) {
            this.pop();
        }
    };

    items.remove = function(index) {
        var selIdx = index;

        if (selIdx < 0)
            return;

        var removedItems = this.splice(selIdx, 1);

        if (selIdx == this.defaultPrefixIndex) {
            this.defaultPrefixIndex = -1;
        } else if (selIdx < this.defaultPrefixIndex) {
            this.defaultPrefixIndex = this.defaultPrefixIndex - 1;
        }
    };

    items.swap = function(idx1, idx2) {
        if ((idx1 == idx2) || (idx1 < 0) || (idx2 < 0))
            return;

        var temp = this[idx1];

        this[idx1] = this[idx2];
        this[idx2] = temp;

        if (this.defaultPrefixIndex == idx1) {
            this.defaultPrefixIndex = idx2;
        }
        else if (this.defaultPrefixIndex == idx2) {
            this.defaultPrefixIndex = idx1;
        }
    };

    utils.dumpStr('-> loadPrefixes END');

    PREFIXES_LIST = items;

    return items;
};

let PREFIXES_LIST;

export function loadPrefixesDataString() {
    if (PREFIXES_LIST != null) {
        return;
    }
    return loadPrefixes();
};

export function getPrefixesData() {
    return PREFIXES_LIST;
};

