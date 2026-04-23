import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@ionic/react/css/core.css'; // ← Ionic Core CSS (must be imported)

// Design System & Theme Imports (Order matters!)
import './theme/tokens.css'; // Design tokens (base)
import './theme/themes.css'; // Theme presets
import './theme/variables.css'; // Base styles and utilities

const container = document.getElementById('root');
const root = createRoot(container!);

// Log theme information
console.log('🎨 Design System Loaded - Modern Theme Active');
console.log('📱 Responsive Layout: Mobile-First Approach');
console.log('🎯 Available Themes: modern, vibrant, ocean, sunset, forest');
console.log('💡 Tip: Use data-theme="vibrant" to switch themes');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);