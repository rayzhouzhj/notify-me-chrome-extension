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
        const mountPoint = document.createElement("div");
        mountPoint.id = "reactExtensionPoint";
        
        // Set styles for the mount point
        mountPoint.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 2147483647;
        `;

        const shadowRoot = this.attachShadow({ mode: "open" });
        
        // Create a style element for Material-UI and custom styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            /* Reset and base styles for shadow DOM */
            * {
                box-sizing: border-box;
            }
            
            /* Ensure modal can receive pointer events */
            .MuiModal-root {
                pointer-events: auto !important;
            }
            
            /* Ensure backdrop works properly */
            .MuiBackdrop-root {
                pointer-events: auto !important;
            }
            
            /* Custom styles to prevent layout issues */
            #reactExtensionPoint {
                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
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
    }
}

const initWebComponent = function () {
    customElements.define("react-extension-container", ReactExtensionContainer);

    const app = document.createElement("react-extension-container");
    document.documentElement.appendChild(app);
};

initWebComponent();

// Add a unique identifier to the page
if (!window.__NOTIFY_ME_EXTENSION_INJECTED__) {
    window.__NOTIFY_ME_EXTENSION_INJECTED__ = true;
    console.log("Content script injected.");
}
