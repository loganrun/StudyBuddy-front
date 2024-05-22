import React from 'react'
import ReactDOM from 'react-dom/client'
import AppProvider from './contexts/app_context.jsx'
import { Provider } from 'react-redux';
import store from './store';
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </AppProvider>
    </Provider>
  </React.StrictMode>,
)
