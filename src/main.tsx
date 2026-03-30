import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';
import { Web3Provider } from './components/Web3Provider.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>
);
