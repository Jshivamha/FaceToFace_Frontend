// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import './index.css';
import SocketProvider from './Context/SocketProvider.jsx'; // or { SocketProvider } if you exported named

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SocketProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </SocketProvider>
  </React.StrictMode>
);
