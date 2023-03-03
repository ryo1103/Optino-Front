import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import theme from './theme'
import { CustomFonts } from './customFonts';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from '@mantine/notifications';


import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}


 

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <MantineProvider withNormalizeCSS withGlobalStyles theme={theme} >
      <CustomFonts />
        <BrowserRouter>
        <Web3ReactProvider getLibrary={getLibrary}>
        <NotificationsProvider position="top-right">
         
            <App />
          </NotificationsProvider>
        </Web3ReactProvider>
          
        </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
