/* global chrome */

import React, { useState } from "react";
import {
    Container, Card, TextField, CardContent, Typography, Divider, Switch, FormControlLabel, FormGroup,
    Button, Box, Stack
} from "@mui/material";
import { styled } from '@mui/material/styles';

const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
    },
}));

function Settings() {
    
    const [allWebsiteData, setAllWebsiteData] = useState({});

    React.useEffect(() => {
        chrome.runtime.sendMessage({
            action: 'GetAllData',
            responseType: 'SettingGetAllDataResp'
        });

        // Listener for the response from the background script
        const messageListener = (message, sender, sendResponse) => {
            console.log('Received message:', message);
            if (message.action === 'SettingGetAllDataResp') {
                // Update the state with the received data
                if (message.data) {
                    setAllWebsiteData(message.data);
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

    const handleSave = (websiteDomain) => {
        // Save logic for the specific website domain
        console.log(`Save settings for ${websiteDomain}`);
    };

    const handleDelete = (websiteDomain) => {
        // Delete logic for the specific website domain
        console.log(`Delete settings for ${websiteDomain}`);
    };

    return (
        <Container style={{maxWidth: '600px'}}>
            {Object.keys(allWebsiteData).map((websiteDomain) => (
                <Card key={websiteDomain} sx={{ my: 2 }}>
                    <CardContent>
                        <Typography variant="h5">General Settings for {websiteDomain}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="column" spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography>OFF</Typography>
                                <AntSwitch checked={allWebsiteData[websiteDomain]?.isActive || false}
                                    inputProps={{ 'aria-label': 'ant design' }} />
                                <Typography>ON</Typography>
                            </Stack>
                            <TextField
                                id={`bannerImageUrl-${websiteDomain}`}
                                label="Banner Image URL"
                                variant="outlined"
                                fullWidth
                                value={allWebsiteData[websiteDomain]?.bannerImageUrl || ''}
                                onChange={(e) => {
                                    setAllWebsiteData((prevData) => ({
                                        ...prevData,
                                        [websiteDomain]: {
                                            ...prevData[websiteDomain],
                                            bannerImageUrl: e.target.value
                                        }
                                    }));
                                }}
                            />
                            <TextField
                                id={`warningMessage-${websiteDomain}`}
                                label="Warning Message"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={allWebsiteData[websiteDomain]?.warningMessage || ''}
                                onChange={(e) => {
                                    setAllWebsiteData((prevData) => ({
                                        ...prevData,
                                        [websiteDomain]: {
                                            ...prevData[websiteDomain],
                                            warningMessage: e.target.value
                                        }
                                    }));
                                }}
                            />
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="primary" onClick={() => handleSave(websiteDomain)}>
                                    Save
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDelete(websiteDomain)}>
                                    Delete
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
}

export default Settings;