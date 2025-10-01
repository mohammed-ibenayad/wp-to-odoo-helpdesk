// Notification System - Chrome Extension Compatible
// No imports/exports - using global window object

(function() {
  'use strict';
  
  class NotificationManager {
    static showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `odoo-notification ${type}`;
      
      const title = type === 'success' ? 'Success!' : 'Error';
      const icon = window.ModernIcons ? window.ModernIcons[type === 'success' ? 'success' : 'error'] : '';
      
      notification.innerHTML = `
        <div class="odoo-notification-title">${icon} ${title}</div>
        <div class="odoo-notification-message">${message}</div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }, 4000);
    }
    
    static showSuccess(message) {
      this.showNotification(message, 'success');
    }
    
    static showError(message) {
      this.showNotification(message, 'error');
    }
  }
  
  // Make available globally
  window.NotificationManager = NotificationManager;
  
  console.log('✅ NotificationManager loaded');
})();