export function openURL(link) {
    if (link) {
        browser.windows.openDefaultBrowser(link)
    }
}

export function openMailWindow(to) {
    if (to) {
        browser.compose.beginNew({to})
    }
}