
export const     SEQ_PAD_MASK = '0000000000';
export const     SEQ_MAX_VALUE = 9999999999;
export const     PATTERN_NUMBER = /{number:(N+)}/gi;
export const     PATTERN_DATE = /{(date|time|datetime):[\w\\\/\-: ]+}/gi;


export function openURL(link) {
    if (link) {
        browser.windows.openDefaultBrowser(link)
    }
};

export function openMailWindow(to) {
    if (to) {
        browser.compose.beginNew({to})
    }
};

export function dumpStr(str) {
    // TODO: CONDITION FOR
    //  if (com.ktsystems.subswitch.Const.PUBLIC_DIST == 'true')
                 return;
    console.log((new Date()).getTime() + ": " + str);
};

export function dumpError(str) {
    console.error((new Date()).getTime() + ": " + str);
};


export function padNumber(n, len) {
    var s = n.toString();
    if (s.length < len) {
        s = (SEQ_PAD_MASK + s).slice(-len);
    }

    return s;
};

export function isTemplateWithSequence(prefix) {
    var numberRE = new RegExp(PATTERN_NUMBER);

    return (prefix.match(numberRE)!=null);
};


export async function saveToSession(key, value) {
    try {
        await browser.storage.session.set({ [key]: value });
        dumpStr(`Saved to session storage: ${key} = ${value}`);
    } catch (error) {
        dumpError("Error saving to session storage:", error);
    }
}

export async function getFromSession(key) {
    try {
        const result = await browser.storage.session.get(key);
        dumpStr(`Retrieved from session storage: ${key} = ${result[key]}`);
        return result[key];
    } catch (error) {
        dumpError("Error retrieving from session storage:", error);
    }
}


export function insertAddress(composeDetails, prefixItem) {
    dumpStr("utils -> insertAddress START");

    dumpStr(`utils -> insertAddress ${JSON.stringify(composeDetails)}`);

    if (prefixItem != null && prefixItem.addresses != null) {
        for (var i = 0; i < prefixItem.addresses.length; i++) {
            var address = prefixItem.addresses[i].split(':');
            var addressType = address[0].toLowerCase();
            if (addressType && address[1] != null) {

                if (!composeDetails[addressType]) {
                    composeDetails[addressType] = [];
                }

                composeDetails[addressType].push(address[1]);
            }
        }
    }

    dumpStr(`utils -> insertAddress ${JSON.stringify(composeDetails)}`);
    dumpStr("utils -> insertAddress END");
};

