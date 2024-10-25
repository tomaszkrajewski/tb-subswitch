import * as utils from "../modules/utils.mjs";

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

    incSeqValue () {
        if (utils.isTemplateWithSequence(this.prefix)) {
            this.currentSeqValue++;
            if (this.currentSeqValue > utils.SEQ_MAX_VALUE) {
                this.currentSeqValue = 0;
            }
        }
    }

    toString()   { return ('[' + this.description + " ## " + this.prefixCode + ']'); }

    equals(otherItem, deep) {
        if (this.compare(this.prefixCode, otherItem.prefixCode))
            return true;

        for (var i = 0; i < this.aliases.length; i++) {
            if (this.compare(this.aliases[i], otherItem.prefixCode)) {
                return true;
            }
            for (var j = 0; j < otherItem.aliases.length; j++) {
                if (this.compare(this.prefixCode, otherItem.aliases[j])) {
                    return true;
                }
                if (this.compare(this.aliases[i], otherItem.aliases[j])) {
                    return true;
                }
            }
        }

        if (deep) {
            let cleanThis = this.removeIgnoredSigns(this.prefixCode);
            let rex = new RegExp(otherItem.removeIgnoredSigns(otherItem.patternPrefixString), "gi")

            utils.dumpStr('-> equals; cleanThis:'+cleanThis+'; rex:'+rex);
            if (cleanThis.match(rex)) {
                utils.dumpStr('-> equals; matched');
                return true
            }

            let cleanThat = otherItem.removeIgnoredSigns(otherItem.prefixCode);
            let rexThis = new RegExp(this.removeIgnoredSigns(this.patternPrefixString), "gi")

            utils.dumpStr('-> equals; cleanThat:'+cleanThat+'; rex:'+rexThis);
            if (cleanThat.match(rexThis)) {
                utils.dumpStr('-> equals; matched');
                return true
            }
        }
        return false;
    }

    compare(sb1, sb2) {
        var sbi1 = this.removeIgnoredSigns(sb1);
        var sbi2 = this.removeIgnoredSigns(sb2);

        sbi1 = (sbi1 ? sbi1.toLowerCase().trim() : null);
        sbi2 = (sbi2 ? sbi2.toLowerCase().trim() : null);

        return (sbi1 == sbi2);
    }

    removeIgnoredSigns(sb) {
        if (sb) {
            let ignoreSigns = IGNORE_SIGNS;
            for (var i = 0; i < ignoreSigns.length; i++) {
                sb = sb.split(ignoreSigns.charAt(i)).join('');
            }
            sb = sb.split(' ').join('');
        }
        return sb;
    }

    get lastFormattedPrefixValue() { return this.lastPrefixValue; }
    get formattedPrefixValue(){
        var d1 = new Date();
        var numberRE = new RegExp(utils.PATTERN_NUMBER);
        var tmpPrefix = this.prefixCode;

        utils.dumpStr('-> getFormattedPrefixValue; numberRE:'+numberRE+ '; tmpPrefix=' + tmpPrefix);

        if (tmpPrefix.match(numberRE)) {
            var numnerMatchArr = numberRE.exec(tmpPrefix);
            var currnumber = this.currentSeqValue;

            if (numnerMatchArr.length == 2) {
                var numberFormat = numnerMatchArr[1];

                var currNumberForm = utils.padNumber(currnumber, numberFormat.toString().length);

                tmpPrefix = tmpPrefix.replace(numnerMatchArr[0], currNumberForm);
            }
        }

    /*
    TODO: DATE_UTILS
            var dateRE       = new RegExp(utils.PATTERN_DATE);

            var dtMatchArr = tmpPrefix.match(dateRE);
            var dateValue = new Date();

            if (dtMatchArr != null) {
                for (var i=0; i<dtMatchArr.length; i++) {
                    var dateFormatRE = new RegExp(/{(date|time|datetime):([\w\\\/\-: ]+)}/gi);
                    var dateFormat = dateFormatRE.exec(dtMatchArr[i])[2];

                    tmpPrefix = tmpPrefix.replace(dtMatchArr[i], com.ktsystems.subswitch.Utils.dateFormat(dateValue, dateFormat));
                }
            }
     */

        this.lastPrefixValue = tmpPrefix;

        return tmpPrefix;
    }

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
    ENTRIES_SPLIT_SIGN = entriesSplitSign;

    let entrySplitSign = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.entry_split_sign`);
    // com.ktsystems.subswitch.Const.ENTRY_SPLIT_SIGN
    ENTRY_SPLIT_SIGN = entrySplitSign;

    let ignoreSigns = await browser.LegacyPrefs.getPref(`extensions.subjects_prefix_switch.discoveryIgnoreSigns`);
    IGNORE_SIGNS = ignoreSigns;

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

                var item;

                utils.dumpStr('>>>>> ' + itemData[2] + ' ' + 2);
                item = new SubswitchPrefixItem(itemData.shift(), itemData.shift());
                item.showInNewMsgPopup = (itemData.shift() === 'true');
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

export function savePrefixes() {
    utils.dumpStr('-> savePrefixes START');

    const entriesSplitSign = ENTRIES_SPLIT_SIGN;
    const entrySplitSign = ENTRY_SPLIT_SIGN;

    var writer = {
        sb:         [],
        sb_address: [],
        sb_seq: [],
        writeItem:    function (s) {
            var entry;
            var entry_address;
            entry = s.description + entrySplitSign
                + s.prefix + entrySplitSign
                + s.showInNewMsgPopup;
            if (s.aliases && s.aliases.length > 0) {
                entry += entrySplitSign + s.aliases.join(entrySplitSign);
            }
            if (s.addresses && s.addresses.length > 0) {
                entry_address = s.addresses.join(entrySplitSign);
            }
            this.sb.push(entry);
            this.sb_address.push(entry_address);
            this.sb_seq.push(s.currentSeqValue);
        },
        toString: function () {  return this.sb.join(entriesSplitSign); },
        toAddressesString: function () {  return this.sb_address.join(entriesSplitSign); },
        toSeqString: function () {  return this.sb_seq.join(entriesSplitSign); }
    };

    PREFIXES_LIST.forEach(writer.writeItem, writer);

    browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.rds`, writer.toString());
    browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.rds_addresses`, writer.toAddressesString());
    browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.rds_sequences`, writer.toSeqString());

    if (PREFIXES_LIST.defaultPrefixIndex != undefined) {
        browser.LegacyPrefs.setPref(`extensions.subjects_prefix_switch.defaultrd`, PREFIXES_LIST.defaultPrefixIndex);
    }

    utils.dumpStr('-> savePrefixes END');
};


let PREFIXES_LIST;
let ENTRIES_SPLIT_SIGN;
let ENTRY_SPLIT_SIGN;
let IGNORE_SIGNS;

export function loadPrefixesDataString() {
    if (PREFIXES_LIST != null) {
        return;
    }
    return loadPrefixes();
};

export function getPrefixesData() {
    return PREFIXES_LIST;
};

export function createNewPrefix(aLabel, aPrefix) {
    return new SubswitchPrefixItem(aLabel, aPrefix);
}

