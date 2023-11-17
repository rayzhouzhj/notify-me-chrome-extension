/* global chrome */

import { useState } from "react";
import { 
    Box,
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

    // Event listener for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Received message:', message);
        if (message.action === 'ShowAlert') {
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

    return (
        
        <Box style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: 999999999,
        }}>
            <Box style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                borderRadius: 10
            }}>
                <Card sx={{ maxWidth: 345 }}>
                    <CardMedia
                        component="img"
                        sx={{ height: 140 }}
                        src={bannerImageUrl}
                        title="Danger"
                        width={345}
                    />
                    <CardContent style={{ paddingLeft: '16px' }}>
                        <Typography variant="body2" color="text.secondary" style={{
                            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                            letterSpacing: "0.01071em",
                            fontWeight: 400,
                            color: "rgba(0, 0, 0, 0.6)"
                        }}>
                            {warningMessage}
                        </Typography>
                    </CardContent>
                    <CardActions style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        paddingRight: '16px',
                        paddingBottom: '16px'
                    }}>
                        <Button size="small" onClick={() => setOpen(false)}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "rgb(25, 118, 210)",
                            cursor: "pointer",
                            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                            fontWeight: 500,
                            fontSize: "13px",
                            textDecoration: "none",
                            letterSpacing: "0.02857em"
                            }}>CLOSE</Button>
                    </CardActions>
                </Card>
            </Box>
        </Box>
    );
}

export default ContentScript;