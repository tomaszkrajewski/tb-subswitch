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
    console.log((new Date()).getTime() + ": " + str);
};

export function alert(str) {
    console.log((new Date()).getTime() + ": " + str);
};
