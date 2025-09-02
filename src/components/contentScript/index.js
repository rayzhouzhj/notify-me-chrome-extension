import React from "react";
import { createRoot } from 'react-dom/client';
import "@webcomponents/custom-elements";
import ContentScript from "./contentScript";

class ReactExtensionContainer extends HTMLElement {
    connectedCallback() {
        const mountPoint = document.createElement("div");
        mountPoint.id = "reactExtensionPoint";

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(mountPoint);

        const root = createRoot(mountPoint);
        root.render(<ContentScript />);
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
