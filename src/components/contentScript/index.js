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