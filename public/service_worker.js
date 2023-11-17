/* global chrome */

// Function to query the local storage by domain name and send the data to the content script
function queryLocalStorageByDomainAndSendMessageToContentScript(tab) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['WarningControl'], function (result) {
            const warningControlData = result.WarningControl;
            // Get the hostname of the current tab
            const hostname = new URL(tab.url).hostname;

            // Check if there is data for the current hostname
            if (warningControlData.hasOwnProperty(hostname)
                && warningControlData[hostname].isActive) {

                if (warningControlData[hostname].suspendStart) {
                    const suspendStart = warningControlData[hostname].suspendStart;
                    const suspendEnd = warningControlData[hostname].suspendEnd;
                    const currentTime = Date.now();
                    if (currentTime >= suspendStart && currentTime <= suspendEnd) {
                        resolve([]);
                        return;
                    }
                }

                const filteredData = warningControlData[hostname];
                // Send the filtered data back to the content script
                chrome.tabs.sendMessage(tab.id, {
                    action: 'ShowAlert',
                    data: filteredData,
                });
                resolve(filteredData);
            } else {
                resolve([]);
            }
        });
    });
}

// Event listener for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
    // Get the current active tab
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        // Send a message to the content script of the active tab if the URL matches
        queryLocalStorageByDomainAndSendMessageToContentScript(tab)
            .then((data) => {
                // Handle the data received from the content script
                console.log(data);
            })
            .catch((error) => {
                // Handle any errors that occurred during the process
                console.error(error);
            });
    });

    // Return true to indicate that the response will be sent asynchronously
    return true;
});

// Event listener for page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Send a message to the content script when the page finishes loading
    if (changeInfo.status === 'complete' && tab.active) {
        // Send a message to the content script of the active tab if the URL matches
        queryLocalStorageByDomainAndSendMessageToContentScript(tab)
            .then((data) => {
                // Handle the data received from the content script
                console.log(data);
            })
            .catch((error) => {
                // Handle any errors that occurred during the process
                console.error(error);
            });
    }
});

// Event listener for messages from the settings page
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'GetAllData') {

        // Query the local storage by the domain name using chrome.storage.local.get
        chrome.storage.local.get(["WarningControl"], function (result) {
            const data = result.WarningControl || '';

            // Prepare the response
            const response = {
                action: request.responseType,
                data: data
            };

            // Send the response back to the popup
            chrome.runtime.sendMessage(response);
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
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
                action: responseType,
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
    if (request.action === 'SaveData' || request.action === 'SuspendWarning') {
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

                if (request.action === 'SaveData') {
                    // Send the response indicating success or failure
                    chrome.runtime.sendMessage({ action: 'SaveDataResponse', success: success });
                }
            });
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});