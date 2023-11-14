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