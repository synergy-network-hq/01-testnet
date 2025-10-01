import React from "react";
import ReactDOM from "react-dom/client";
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter} from "react-router-dom";
import {WalletProvider} from "./services/walletContext";
import theme from "./theme";
import App from "./App";
import "./styles/index.css";
import "./styles/parallax.css";
import "./styles/glassmorphism.css";
import "./styles/button.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <BrowserRouter>
                <WalletProvider>
                    <App />
                </WalletProvider>
            </BrowserRouter>
        </ChakraProvider>
    </React.StrictMode>
);
