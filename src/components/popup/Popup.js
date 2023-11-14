/* global chrome */

import {
    Button
} from "@mui/material";

function openSettingsPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
}

function Popup() {
    return (
        <div>
            <Button onClick={openSettingsPage}>Open Settings</Button>
        </div>
    );
}

export default Popup;