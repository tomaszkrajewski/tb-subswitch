
export async function popupPrompt(popupId, defaultResponse, xxxFun) {
    try {
        await messenger.windows.get(popupId);
    } catch (e) {
        // Window does not exist, assume closed.
        return defaultResponse;
    }
    return new Promise(resolve => {
        let response = defaultResponse;
        function windowRemoveListener(closedId) {
            if (popupId == closedId) {
                messenger.windows.onRemoved.removeListener(windowRemoveListener);
                messenger.runtime.onMessage.removeListener(messageListener);
                resolve(response);
            }
        }
        function messageListener(request, sender, sendResponse) {

            xxxFun(request, sender, sendResponse)

            if (sender.tab.windowId != popupId || !request) {
                return;
            }

            if (request.popupResponse) {
                response = request.popupResponse;
            }
        }
        messenger.runtime.onMessage.addListener(messageListener);
        messenger.windows.onRemoved.addListener(windowRemoveListener);
    });
}


// Function to open a popup and await user feedback
export async function awaitPopup(popupUrl, height, width, xxxFun) {
    let window = await messenger.windows.create({
        url: popupUrl,
        type: "popup",
        height: height,
        width: width,
        allowScriptsToClose: false,
    });
    // Wait for the popup to be closed and define a default return value if the
    // window is closed without clicking a button.
    let rv = await popupPrompt(window.id, "cancel", xxxFun);

    browser.windows.remove(window.id);
}