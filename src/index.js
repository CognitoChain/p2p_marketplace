import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import registerServiceWorker from "./registerServiceWorker";

import App from "./App";

// Context providers
import DharmaProvider from "./contexts/Dharma/DharmaProvider";

import './styles.scss';   


ReactDOM.render(
    <BrowserRouter>
        <DharmaProvider>
            <App />
        </DharmaProvider>
    </BrowserRouter>,

    document.getElementById("root"),
);
registerServiceWorker();