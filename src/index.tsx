import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ElementsProvider } from './context/ElementsContext';
import { StylesProvider } from './context/StylesContext';
import { ConnectionProvider } from './context/ConnectionContext';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ConnectionProvider>
      <ElementsProvider>
        <StylesProvider>
          <App />
        </StylesProvider>
      </ElementsProvider>
    </ConnectionProvider>
  </React.StrictMode>
);