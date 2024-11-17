


export const     SEQ_PAD_MASK = '0000000000';
export const     SEQ_MAX_VALUE = 9999999999;
export const     PATTERN_NUMBER = /{number:(N+)}/gi;
export const     PATTERN_DATE = /{(date|time|datetime):[\w\\\/\-: ]+}/gi;
//export const     RX_USER = "([a-zA-Z0-9][a-zA-Z0-9._-]*|\"([^\\\\\x80-\xff\015\012\"]|\\\\[^\x80-\xff])+\")";
//export const     RX_DOMAIN = "([a-zA-Z0-9][a-zA-Z0-9._-]*\\.)*[a-zA-Z0-9][a-zA-Z0-9._-]*\\.[a-zA-Z]{2,5}";
//export const     RX = "^" + RX_USER + "\@" + RX_DOMAIN + "$";
export const     RX_WILDCARD = "[a-zA-Z0-9._-]*";
export const     EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


//FIXME RE-ORGANIZE
const PUBLIC_DIST = false;

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
    if (PUBLIC_DIST)
        return;
    console.log((new Date()).getTime() + ": " + str);
};

export function log(str) {
    if (PUBLIC_DIST)
        return;
    console.log((new Date()).getTime() + ": " + str);
};

export function dumpDir(object) {
    if (PUBLIC_DIST)
        return;
    console.dir(object);
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


export function dateFormatExt(p_date, mask) {
    return dateFormat(p_date, mask)
}


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

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZQ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (p_date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        //if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        //	mask = date;
        //	date = undefined;
        //}

        // Passing date through Date applies Date.parse, if necessary
        p_date = p_date ? new Date(p_date) : new Date;
        if (isNaN(p_date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);
//alert(p_date+ " " + mask);
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }
//alert(p_date+ " " + mask);
        var	_ = utc ? "getUTC" : "get",
            d = p_date[_ + "Date"](),
            D = p_date[_ + "Day"](),
            m = p_date[_ + "Month"](),
            y = p_date[_ + "FullYear"](),
            H = p_date[_ + "Hours"](),
            M = p_date[_ + "Minutes"](),
            s = p_date[_ + "Seconds"](),
            L = p_date[_ + "Milliseconds"](),
            o = utc ? 0 : p_date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(p_date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
                Q:    Math.ceil((m + 1) / 3)
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};
