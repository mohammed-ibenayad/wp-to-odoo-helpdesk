// SVG Icons Module - Chrome Extension Compatible
// No imports/exports - using global window object

(function() {
  'use strict';
  
  const ModernIcons = {
    ticket: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
      <polyline points="8,9 16,9"/>
      <polyline points="8,13 12,13"/>
    </svg>`,
    
    task: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3 8-8"/>
      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"/>
    </svg>`,
    
    lead: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
    
    multiSelect: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="9,11 12,14 22,4"/>
      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"/>
      <rect x="2" y="3" width="6" height="6" rx="1"/>
      <path d="M4 6l2 2 4-4"/>
    </svg>`,
    
    success: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20,6 9,17 4,12"/>
    </svg>`,
    
    error: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    
    close: `<svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`
  };
  
  // Make available globally for Chrome extension
  window.ModernIcons = ModernIcons;
  
  console.log('✅ ModernIcons loaded');
})();