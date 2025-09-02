import React from "react";
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import "@webcomponents/custom-elements";
import ContentScript from "./contentScript";

// Create a theme for consistent styling
const theme = createTheme();

class ReactExtensionContainer extends HTMLElement {
    connectedCallback() {
        try {
            // Check if already initialized
            if (this.shadowRoot && this.shadowRoot.getElementById('reactExtensionPoint')) {
                return;
            }

            const mountPoint = document.createElement("div");
            mountPoint.id = "reactExtensionPoint";
        
        // Set essential styles for the mount point
        mountPoint.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            pointer-events: none !important;
            z-index: 2147483647 !important;
            overflow: hidden !important;
        `;

        const shadowRoot = this.attachShadow({ mode: "open" });
        
        // Create a style element for Material-UI and custom styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Reset and base styles for shadow DOM */
            * {
                box-sizing: border-box;
            }
            
            /* Modal without backdrop - clean overlay */
            .MuiModal-root {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                pointer-events: auto !important;
                z-index: 1 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: transparent !important;
            }
            
            /* Show a subtle backdrop for clicking to dismiss */
            .MuiBackdrop-root {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background-color: rgba(0, 0, 0, 0.1) !important;
                opacity: 1 !important;
                z-index: -1 !important;
                transition: opacity 0.2s ease-in-out !important;
            }
            
            /* Custom styles to prevent layout issues */
            #reactExtensionPoint {
                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                position: relative !important;
            }
            
            /* Enhanced card styling - clean modern look */
            .MuiCard-root {
                position: relative !important;
                z-index: 1000 !important;
                pointer-events: auto !important;
                background-color: white !important;
                border-radius: 12px !important;
                box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12), 0px 4px 16px rgba(0, 0, 0, 0.08) !important;
                border: 1px solid rgba(0, 0, 0, 0.08) !important;
                overflow: hidden !important;
                max-width: 380px !important;
                width: 380px !important;
                animation: slideInFromTop 0.3s ease-out !important;
            }
            
            /* Slide-in animation */
            @keyframes slideInFromTop {
                from {
                    transform: translateY(-20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            /* Card content styling */
            .MuiCardContent-root {
                padding: 0px 20px 0px 20px !important;
            }
            
            /* Card actions styling */
            .MuiCardActions-root {
                padding: 0px 20px 20px 20px !important;
                background-color: #fafafa !important;
            }
            
            /* Button styling */
            .MuiButton-root {
                border-radius: 8px !important;
                text-transform: none !important;
                font-weight: 600 !important;
                padding: 8px 16px !important;
            }
            
            /* Typography styling */
            .MuiTypography-root {
                color: #333 !important;
                line-height: 1.5 !important;
            }
            
            /* Card media styling */
            .MuiCardMedia-root {
                border-radius: 0 !important;
                width: 100% !important;
                height: 140px !important;
                object-fit: cover !important;
                display: block !important;
                max-width: 100% !important;
            }
            
            /* Ensure images don't overflow */
            .MuiCardMedia-img {
                width: 100% !important;
                height: 140px !important;
                object-fit: cover !important;
                display: block !important;
            }
        `;
        
        shadowRoot.appendChild(styleElement);
        shadowRoot.appendChild(mountPoint);

        const root = createRoot(mountPoint);
        root.render(
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <ContentScript />
                </ThemeProvider>
            </StyledEngineProvider>
        );
        } catch (error) {
            console.error('Error initializing ReactExtensionContainer:', error);
        }
    }
}

const initWebComponent = function () {
    try {
        // Check if the custom element is already defined
        if (!customElements.get("react-extension-container")) {
            customElements.define("react-extension-container", ReactExtensionContainer);
        }

        // Check if the component is already added to the page
        if (!document.querySelector("react-extension-container")) {
            const app = document.createElement("react-extension-container");
            document.documentElement.appendChild(app);
        }
    } catch (error) {
        console.error('Error initializing web component:', error);
    }
};

// Only initialize if not already done
if (!window.__NOTIFY_ME_EXTENSION_INJECTED__) {
    window.__NOTIFY_ME_EXTENSION_INJECTED__ = true;
    initWebComponent();
    console.log("Content script injected.");
}
