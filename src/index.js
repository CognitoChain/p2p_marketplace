import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import ReactGA from 'react-ga';
import createHistory from 'history/createBrowserHistory';
import registerServiceWorker from "./registerServiceWorker";

import App from "./App";

// Context providers
import DharmaProvider from "./contexts/Dharma/DharmaProvider";

import './styles.scss';   
import './styles.scss';   

//  Google Analytics
let gatid = process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID;
let history = null;

if (gatid === undefined) {
    console.log("no google analytics");
} else {

    console.log("gatid: ", gatid);
    ReactGA.initialize(gatid);
    history = createHistory();
    console.log("path: ", history.location.pathname);
    ReactGA.pageview(history.location.pathname);
    
    // track pageviews when history changes
    const unlisten = history.listen((location, action) => {
        console.log("path: ", action, location.pathname, location.state);
        ReactGA.pageview(location.pathname);
    });
}


ReactDOM.render(
    <BrowserRouter>
        <DharmaProvider>
            <App />
        </DharmaProvider>
    </BrowserRouter>,

    document.getElementById("root"),
);
registerServiceWorker();