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

    // Helper function to safely send messages to background script
    const safeSendMessage = (message) => {
        return new Promise((resolve, reject) => {
            try {
                if (chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage(message, (response) => {
                        if (chrome.runtime.lastError) {
                            console.warn('Chrome runtime error:', chrome.runtime.lastError.message);
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(response);
                        }
                    });
                } else {
                    reject(new Error('Chrome runtime not available'));
                }
            } catch (error) {
                console.warn('Error sending message:', error);
                reject(error);
            }
        });
    };

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

        // Send a message to the background script with error handling
        safeSendMessage({
            action: 'SuspendWarning',
            domain: hostname,
            data: {...data, 
                suspendStart: Date.now(),
                suspendEnd: Date.now() + 5 * 60 * 1000
            }
        }).catch((error) => {
            console.warn('Failed to send suspend warning to background script:', error);
            // The dismiss action still works even if message sending fails
        });
    }

    const handleCloseModal = () => {
        setOpen(false);
    };

    return (
        <Modal
            open={open}
            onClose={handleCloseModal}
            container={() => document.querySelector('react-extension-container')?.shadowRoot?.getElementById('reactExtensionPoint') || document.body}
            disableScrollLock={true}
            disableEnforceFocus={true}
            disableAutoFocus={true}
            hideBackdrop={false}
        >
            <Card sx={{ 
                width: 380,
                maxWidth: 380,
                minWidth: 340,
                outline: 'none',
                '&:focus': {
                    outline: 'none'
                }
            }}>
                {bannerImageUrl && 
                    <CardMedia
                        component="img"
                        sx={{ 
                            height: 140,
                            width: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                        src={bannerImageUrl}
                        title="Warning"
                        alt="Warning"
                    />
                }
                <CardContent sx={{ 
                    padding: '0px 20px 0px 20px !important'
                }}>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: '#333',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            margin: 0
                        }}
                    >
                        {warningMessage}
                    </Typography>
                </CardContent>
                <CardActions sx={{
                    padding: '0px 20px 0px 20px',
                    backgroundColor: '#fafafa',
                    justifyContent: 'flex-end'
                }}>
                    <Button 
                        variant="contained"
                        size="small" 
                        onClick={dismissAlert}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '12px',
                            padding: '8px 16px',
                            backgroundColor: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
                    >
                        DISMISS FOR 5 MINUTES
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
}

export default ContentScript;