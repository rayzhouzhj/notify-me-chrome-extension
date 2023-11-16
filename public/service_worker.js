/* global chrome */

// Function to send a message to the content script
function sendMessageToContentScript(tabId, message) {
    chrome.tabs.sendMessage(tabId, message);
}

// Event listener for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
    // Get the current active tab
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        // Send a message to the content script of the active tab if the URL matches
        if (tab.url.includes('developer.chrome.com') || tab.url.includes('cms.scmp.com')) {
            sendMessageToContentScript(tab.id, { action: 'ShowAlert', data: 'Hello from background script!' });
        }
    });
});

// Event listener for page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Send a message to the content script when the page finishes loading
    if (changeInfo.status === 'complete' && tab.active) {
        // Send a message to the content script of the active tab if the URL matches
        if (tab.url.includes('developer.chrome.com') || tab.url.includes('cms.scmp.com')) {
            sendMessageToContentScript(tab.id, { action: 'ShowAlert', data: 'Hello from background script!' });
        }
    }
});

// Event listener for messages from the popup script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'GetWarningStatus') {
        const { domain, responseType } = request;

        // Query the local storage by the domain name using chrome.storage.local.get
        chrome.storage.local.get(["WarningControl"], function (result) {
            const data = result.WarningControl && result.WarningControl[domain];

            // Prepare the response
            const response = {
                responseType,
                data: data || ''
            };

            // Send the response back to the popup
            chrome.runtime.sendMessage(response);
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});

// Event listener for messages from the popup script to save data
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'SaveData') {
        const { domain, data } = request;

        // Retrieve existing data from storage
        chrome.storage.local.get('WarningControl', function (result) {
            const warningControl = result.WarningControl || {};

            // Update or add the data for the site domain
            warningControl[domain] = data;

            // Save the updated data to storage
            chrome.storage.local.set({ WarningControl: warningControl }, function () {
                // Check if the data exists for the specific site domain
                const success = warningControl[domain] === data;

                // Send the response indicating success or failure
                chrome.runtime.sendMessage({ SaveDataResp: success });
            });
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});