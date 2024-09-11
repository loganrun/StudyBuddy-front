import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import './global.jsx';
import store from './store';
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <AgoraRTCProvider client={client}>
        <App />
      </AgoraRTCProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
