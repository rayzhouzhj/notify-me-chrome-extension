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

const logoUrl = chrome.runtime.getURL('notifyme.png');

function openSettingsPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
}

function Popup() {
    const [siteUrl, setSiteUrl] = React.useState('');
    const [bannerImageUrl, setBannerImageUrl] = React.useState('');
    const [warningMessage, setWarningMessage] = React.useState('');
    const [saveStatus, setSaveStatus] = React.useState('idle');


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
            console.log('Received message:', message);
            if (message.action === 'PopupGetWarningStatusResp') {
                // Update the state with the received data when the block status is true
                if (message.data) {
                    setBannerImageUrl(message.data.bannerImageUrl);
                    setWarningMessage(message.data.warningMessage);
                }
            } else if (message.action === 'SaveDataResponse') {
                // Handle the response from the background script
                if (message.success) {
                    setSaveStatus('success');
                } else {
                    setSaveStatus('failure');
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
        setSaveStatus('loading');

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
        });
    };

    const handleBannerImageUrlChange = (event) => {
        setSaveStatus('idle');
        setBannerImageUrl(event.target.value);
    };

    const handleWarningMessageChange = (event) => {
        setSaveStatus('idle');
        setWarningMessage(event.target.value);
    };

    return (
        <Box width={300}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={10} style={{ textAlign: 'center' }}>
                    <Typography variant="h6" style={{ marginLeft: 50}}>
                        <img
                            src={logoUrl}
                            alt="Notify Me!"
                            style={{ width: 150, marginTop: 10 }}
                        />
                    </Typography>
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
                        helperText="Enter the URL of the banner image, or use default image: warning-sign-banner.jpeg"
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
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={saveData} 
                        disabled={saveStatus === 'loading'}
                        style={{ width: 168 }}
                        >
                        {saveStatus === 'loading' ? 'Updating' : saveStatus === 'success' ? 'Saved!' : 'Save'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}

export default Popup;