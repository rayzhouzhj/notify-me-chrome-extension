/* global chrome */

// Function to check if the URL is valid
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

// Function to query the local storage by domain name
function queryLocalStorageByDomain(tab) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['WarningControl'], function (result) {
            const warningControlData = result.WarningControl;
            if (isValidURL(tab.url) === false) {
                resolve({});
                return;
            }
            const hostname = new URL(tab.url).hostname;
            if (warningControlData.hasOwnProperty(hostname) && warningControlData[hostname].isActive) {
                const filteredData = warningControlData[hostname];
                resolve(filteredData);
            } else {
                resolve({});
            }
        });
    });
}

// Function to handle content script injection
function handleContentScriptInjection(tabId) {
    chrome.tabs.get(tabId, (tab) => {
        queryLocalStorageByDomain(tab)
            .then((filteredData) => {
                if (Object.keys(filteredData).length > 0) {
                    // Inject the content script
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ["static/js/content.js"],
                    })
                        .then(() => {
                            console.log("Script injected");
                            // Send a message to the injected content script
                            chrome.tabs.sendMessage(tabId, {
                                action: 'ShowAlert',
                                data: filteredData,
                            });
                        })
                        .catch((err) => console.warn("Unexpected error", err));
                }
            })
            .catch((error) => {
                console.error(error);
            });
    });
}

// Event listener for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
    handleContentScriptInjection(activeInfo.tabId);
});

// Event listener for page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        handleContentScriptInjection(tabId);
    }
});

// Event listener for messages from the settings page
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'GET_ALL_SETTINGS') {

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
    } else if (request.action === 'DELETE_SETTINGS') {
        // Delete the data for the specified domain
        const websiteDomain = request.domain;

        chrome.storage.local.get(["WarningControl"], function (result) {
            const data = result.WarningControl || {};
            delete data[websiteDomain];

            // Update the storage with the modified data
            chrome.storage.local.set({ "WarningControl": data }, function () {
                // Check if the data exists for the specific site domain
                const success = !data.hasOwnProperty(websiteDomain);
                // Prepare the response
                const response = {
                    action: 'DeleteDataResponse',
                    websiteDomain: websiteDomain,
                    message: `Settings for ${websiteDomain} deleted successfully.`,
                    success: success
                };

                // Send the response back to the settings page
                chrome.runtime.sendMessage(response);
            });
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
    } else if (request.action === 'REGISTER_CONTENT_SCRIPT') {

        // Create a content script object
        const contentScript = {
            matches: [`https://${request.domain}/*`],
            js: ['static/js/content.js'],
            id: "notify-me-content-script",
        };

        // Check if content script is already registered
        chrome.scripting.getRegisteredContentScripts((registeredScripts) => {
            if (chrome.runtime.lastError) {
                // Error occurred while retrieving registered content scripts
                console.error('Error occurred while retrieving registered content scripts:', chrome.runtime.lastError);

                // Send error response back to the popup
                chrome.runtime.sendMessage({ action: 'REGISTER_CONTENT_SCRIPT_RESPONSE', success: false });
                return;
            }

            const isRegistered = registeredScripts.some((script) => script.id === contentScript.id);
            if (isRegistered) {
                // Content script is already registered
                console.log('Content script is already registered:', contentScript.id);

                // Send success response back to the popup
                chrome.runtime.sendMessage({ action: 'REGISTER_CONTENT_SCRIPT_RESPONSE', success: true });
            } else {
                // Register the content script
                chrome.scripting.registerContentScripts([contentScript], (result) => {
                    if (chrome.runtime.lastError) {
                        // Content script registration failed
                        console.error('Content script registration failed:', chrome.runtime.lastError);

                        // Send error response back to the popup
                        chrome.runtime.sendMessage({ action: 'REGISTER_CONTENT_SCRIPT_RESPONSE', success: false });
                    } else {
                        // Content script registered successfully
                        console.log('Content script registered!');

                        // Send success response back to the popup
                        chrome.runtime.sendMessage({ action: 'REGISTER_CONTENT_SCRIPT_RESPONSE', success: true });
                    }
                });
            }
        });
    }
});

// Event listener for messages from the popup script to save data
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'SAVE_SETTINGS' || request.action === 'SuspendWarning') {
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

                if (request.action === 'SAVE_SETTINGS') {
                    // Send the response indicating success or failure
                    chrome.runtime.sendMessage({ action: 'SaveDataResponse', success: success, message: `Settings for ${domain} saved successfully.` });
                }
            });
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});