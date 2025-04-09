import * as utils from "./subswitch_utils.mjs";
import * as preferences from "./preferences.js"

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

    isTemplateWithSequence() {
        return utils.isTemplateWithSequence(this.prefix);
    }

    incSeqValue () {
        if (this.isTemplateWithSequence()) {
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

    //FIXME keep persistence of formated value?
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


        var dateRE = new RegExp(utils.PATTERN_DATE);

        var dtMatchArr = tmpPrefix.match(dateRE);
        var dateValue = new Date();

        if (dtMatchArr != null) {
            for (var i=0; i<dtMatchArr.length; i++) {
                var dateFormatRE = new RegExp(/{(date|time|datetime):([\w\\\/\-: ]+)}/gi);
                var dateFormat = dateFormatRE.exec(dtMatchArr[i])[2];

                tmpPrefix = tmpPrefix.replace(dtMatchArr[i], utils.dateFormatExt(dateValue, dateFormat));
            }
        }

        this.lastPrefixValue = tmpPrefix;

        return tmpPrefix;
    }

    get patternPrefixString() {
        var numberRE = new RegExp(utils.PATTERN_NUMBER);
        var numberReplacement = "\\d+"
        var dateRE   = new RegExp(utils.PATTERN_DATE);
        var dateReplacement = ".+"
        var tmpPrefix = this.prefixCode;

        utils.dumpStr('-> patternPrefixString START');

        utils.dumpStr(`patternPrefixString; numberRE= ${numberRE} ; dateRE= ${dateRE} ; tmpPrefix= ${tmpPrefix}`);

        if (tmpPrefix.match(numberRE)) {
            var numnerMatchArr = numberRE.exec(tmpPrefix);

            if (numnerMatchArr.length == 2) {
                tmpPrefix = tmpPrefix.replace(numnerMatchArr[0], numberReplacement);
            }
        }
        /*
                var dtMatchArr = tmpPrefix.match(dateRE);

                if (dtMatchArr != null) {
                    for (var i=0; i<dtMatchArr.length; i++) {
                        var dateFormatRE = new RegExp(/{(date|time|datetime):([\w\\\/\-: ]+)}/gi);
                        var dateFormat = dateFormatRE.exec(dtMatchArr[i])[2];

                        tmpPrefix = tmpPrefix.replace(dtMatchArr[i], com.ktsystems.subswitch.Utils.dateFormat(dateValue, dateFormat));
                    }
                }
        */
        utils.dumpStr(`-> patternPrefixString END RESULT: ${tmpPrefix}`);

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

    let entriesSplitSign = await preferences.getPref(`entries_split_sign`);
    // com.ktsystems.subswitch.Const.ENTRIES_SPLIT_SIGN
    ENTRIES_SPLIT_SIGN = entriesSplitSign;

    let entrySplitSign = await preferences.getPref(`entry_split_sign`);
    // com.ktsystems.subswitch.Const.ENTRY_SPLIT_SIGN
    ENTRY_SPLIT_SIGN = entrySplitSign;

    let ignoreSigns = await preferences.getPref(`discoveryIgnoreSigns`);
    IGNORE_SIGNS = ignoreSigns;

    let prefixesDataString = await preferences.getPref(`rds`);
    let prefixesAddressesString = await preferences.getPref(`rds_addresses`);
    let prefixesSequencesString = await preferences.getPref(`rds_sequences`);

    let offbydefault = await preferences.getPref(`offbydefault`);
    let defaultRD = await preferences.getPref(`defaultrd`);

    utils.dumpStr('-> initPrefixesArray prefixesDataString ' + prefixesDataString);
    utils.dumpStr('-> initPrefixesArray prefixesAddressesString ' + prefixesAddressesString);
    utils.dumpStr('-> initPrefixesArray prefixesSequencesString ' + prefixesSequencesString);
    utils.dumpStr('-> initPrefixesArray defaultRD ' + defaultRD);
    utils.dumpStr('-> initPrefixesArray defaultPrefixOff ' + offbydefault);

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
        items.defaultPrefixOff = offbydefault;

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

    preferences.setPref(`rds`, writer.toString());
    preferences.setPref(`rds_addresses`, writer.toAddressesString());
    preferences.setPref(`rds_sequences`, writer.toSeqString());

    if (PREFIXES_LIST.defaultPrefixIndex != undefined) {
        preferences.setPref(`defaultrd`, PREFIXES_LIST.defaultPrefixIndex);
    }

    utils.dumpStr('-> savePrefixes END');
};

export function savePrefixesSequences() {
    utils.dumpStr('-> savePrefixesSequences');

    const entriesSplitSign = ENTRIES_SPLIT_SIGN;
    const entrySplitSign = ENTRY_SPLIT_SIGN;

    var writer = {
        sb_seq: [],
        writeItem:    function (s) {
            this.sb_seq.push(s.currentSeqValue);
        },
        toSeqString: function () {  return this.sb_seq.join(entriesSplitSign); }
    };

    PREFIXES_LIST.forEach(writer.writeItem, writer);

    preferences.setPref(`rds_sequences`, writer.toSeqString());

    utils.dumpStr('<- savePrefixesSequences; ');
};

let PREFIXES_LIST;
let ENTRIES_SPLIT_SIGN;
let ENTRY_SPLIT_SIGN;
let IGNORE_SIGNS;

export async function reloadPrefixesDataString() {
    return await loadPrefixes();
};

export async function loadPrefixesDataString() {
    if (PREFIXES_LIST != null) {
        return;
    }
    await loadPrefixes();
    return PREFIXES_LIST;
};

export function getPrefixesData() {
    return PREFIXES_LIST;
};

export function createNewPrefix(aLabel, aPrefix) {
    return new SubswitchPrefixItem(aLabel, aPrefix);
}

