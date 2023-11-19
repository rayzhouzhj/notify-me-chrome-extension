/* global chrome */

import { useState } from "react";
import { 
    Modal,
    Button,
    Card, 
    CardActions, 
    CardContent, 
    CardMedia, 
    Typography
} from "@mui/material";

function ContentScript() {
    const defaultImageUrl = chrome.runtime.getURL('warning-sign-banner.jpeg');
    const [bannerImageUrl, setBannerImageUrl] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({});

    // Event listener for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Received message:', message);
        if (message.action === 'ShowAlert') {
            setData(message.data);
            if (message.data.bannerImageUrl === 'warning-sign-banner.jpeg') {
                setBannerImageUrl(defaultImageUrl);
            } else {
                setBannerImageUrl(message.data.bannerImageUrl);
            }
            
            setWarningMessage(message.data.warningMessage);
            // Handle the message and show an alert in the content script
            setOpen(true);
        }
    });

    if (!open) return null;

    const dismissAlert = () => {
        setOpen(false);

        const currentUrl = window.location.href;
        const hostname = new URL(currentUrl).hostname;

        // Send a message to the background script
        chrome.runtime.sendMessage({
            action: 'SuspendWarning',
            domain: hostname,
            data: {...data, 
                suspendStart: Date.now(),
                suspendEnd: Date.now() + 5 * 60 * 1000
            }
        });
    }

    const handleCloseModal = () => {
        setOpen(false);
    };

    return (
        
        <Modal
            open={open}
            onClose={handleCloseModal}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Card sx={{ width: '360px', outline: 'none' }}>
                {
                    bannerImageUrl && 
                    <CardMedia
                            component="img"
                            sx={{ height: 140 }}
                            src={bannerImageUrl}
                            title="Warning"
                            alt="Warning"
                            width={360}
                />}
                <CardContent style={{ paddingLeft: '16px' }}>
                    <Typography variant="body2" color="text.secondary">
                        {warningMessage}
                    </Typography>
                </CardContent>
                <CardActions style={{
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <Button size="small" onClick={dismissAlert}>DISMISS FOR 5 MINUTES</Button>
                </CardActions>
            </Card>
        </Modal>
    );
}

export default ContentScript;