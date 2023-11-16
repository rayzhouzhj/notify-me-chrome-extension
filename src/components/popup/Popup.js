/* global chrome */
import React from 'react';
import {
    Button, Grid, TextField, Box, Typography, Divider, Chip
} from "@mui/material";
import { styled } from '@mui/system';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const StyledSettingsIcon = styled(SettingsOutlinedIcon)`
    &:hover {
        cursor: pointer;
    }
`;

function openSettingsPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
}

function Popup() {
    const [siteUrl, setSiteUrl] = React.useState('');
    const [bannerImageUrl, setBannerImageUrl] = React.useState('warning-sign-banner.jpeg');
    const [warningMessage, setWarningMessage] = React.useState('');

    React.useEffect(() => {
        console.log('Popup mounted');
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const url = tabs[0].url;
            const hostname = new URL(url).hostname;
            setSiteUrl(hostname);
            
            // Send a message to the background script
            const messageSentFlag = '__message_sent_flag__'; // Unique flag to track whether the message has been sent
            const messageSent = sessionStorage.getItem(messageSentFlag);
            if (!messageSent) {
                chrome.runtime.sendMessage({
                    action: 'GetWarningStatus',
                    domain: hostname,
                    responseType: 'PopupGetWarningStatusResp'
                });
                sessionStorage.setItem(messageSentFlag, 'true'); // Set the flag to indicate that the message has been sent
            }
        });

        // Listener for the response from the background script
        const messageListener = (message, sender, sendResponse) => {
            if (message.action === 'PopupGetWarningStatusResp') {
                console.log('Received message:', message);
                // Update the state with the received data when the block status is true
                if (message) {
                    setBannerImageUrl(message.bannerImageUrl);
                    setWarningMessage(message.warningMessage);
                }
            }
        };

        // Register the listener
        chrome.runtime.onMessage.addListener(messageListener);

        // Cleanup: Remove the listener when the component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const saveData = () => {
        // Create an object containing the updated data
        const data = {
            bannerImageUrl: bannerImageUrl,
            warningMessage: warningMessage
        };

        // Send a message to the background script
        chrome.runtime.sendMessage({
            action: 'SaveData',
            domain: siteUrl,
            data: data
        }, function (response) {
            // Handle the response from the background script (if needed)
            console.log('SaveData response:', response);
        });
    };

    const handleBannerImageUrlChange = (event) => {
        setBannerImageUrl(event.target.value);
    };

    const handleWarningMessageChange = (event) => {
        setWarningMessage(event.target.value);
    };

    return (
        <Box width={300}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={10} style={{ textAlign: 'center' }}>
                    <Typography variant="h6">Notify Me!</Typography>
                </Grid>
                <Grid item xs={2} style={{ textAlign: 'right' }}>
                    <StyledSettingsIcon onClick={openSettingsPage} />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="outlined-read-only-input"
                        label="Website Domain"
                        fullWidth
                        value={siteUrl}
                        variant="standard"
                        disabled
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider>
                        <Chip label="WITH" />
                    </Divider>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Banner Image URL"
                        fullWidth
                        value={bannerImageUrl}
                        helperText="Enter the URL of the banner image"
                        onChange={handleBannerImageUrlChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Message"
                        multiline
                        maxRows={4}
                        fullWidth
                        value={warningMessage}
                        helperText="Leave blank to use default message"
                        onChange={handleWarningMessageChange}
                    />
                </Grid>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <Button variant="contained" onClick={saveData}>Save</Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Popup;