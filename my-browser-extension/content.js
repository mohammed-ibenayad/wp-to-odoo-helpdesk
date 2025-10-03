// Complete Working content.js - Uses Global Window Objects
// No imports needed - modules loaded via manifest.json

class WhatsAppMessageTracker {
  constructor() {
    console.log('WhatsApp Multi-Message Creator Initialized - Modular Version');
    this.selectedMessages = new Map();
    // this.selectionMode = false; // REMOVED

    // Use globally loaded ModernIcons
    this.modernIcons = window.ModernIcons;

    this.init();
  }

  init() {
    this.addCustomStyles();
    this.startMonitoring();
    this.addSelectionPanel();
  }

  addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
    /* ===== IMPROVED MODAL STYLES ===== */

/* Better modal structure */
.odoo-title-modal-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 520px;
  max-height: 85vh;
  overflow: hidden;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.odoo-modal-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.odoo-modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #212529;
}

.odoo-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.odoo-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Section styling */
.odoo-modal-section {
  margin-bottom: 28px;
}

.odoo-modal-section:last-child {
  margin-bottom: 0;
}

.odoo-section-label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.odoo-section-label-icon {
  font-size: 14px;
}

/* Title input with tabs */
.odoo-title-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f1f3f5;
  padding: 4px;
}

.odoo-title-tab {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s ease;
}

.odoo-title-tab:hover {
  background: rgba(255, 255, 255, 0.5);
}

.odoo-title-tab.active {
  background: white;
  color: #25D366;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.odoo-title-input-wrapper {
  position: relative;
}

.odoo-title-input {
  width: 100%;
  padding: 12px 50px 12px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.odoo-title-input:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.odoo-title-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.odoo-char-counter {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #adb5bd;
  font-weight: 500;
}

.odoo-char-counter.warning {
  color: #fd7e14;
}

.odoo-char-counter.danger {
  color: #dc3545;
}

/* Priority stars - professional version */
.odoo-priority-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.odoo-priority-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6c757d;
}

.odoo-priority-btn:hover {
  border-color: #adb5bd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.odoo-priority-btn.active {
  border-width: 2px;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.odoo-priority-btn.priority-none.active {
  border-color: #adb5bd;
  background: #f8f9fa;
  color: #495057;
}

.odoo-priority-btn.priority-low.active {
  border-color: #28a745;
  background: #d4edda;
  color: #155724;
}

.odoo-priority-btn.priority-medium.active {
  border-color: #ffc107;
  background: #fff3cd;
  color: #856404;
}

.odoo-priority-btn.priority-high.active {
  border-color: #dc3545;
  background: #f8d7da;
  color: #721c24;
}

.odoo-priority-stars-display {
  font-size: 18px;
  color: #ffc107;
  letter-spacing: 2px;
}

.odoo-priority-label {
  font-size: 12px;
  font-weight: 600;
}

/* Contact section with progressive disclosure */
.odoo-contact-collapsed {
  display: flex;
  gap: 8px;
}

.odoo-add-contact-btn {
  flex: 1;
  padding: 10px 16px;
  background: white;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.odoo-add-contact-btn:hover {
  border-color: #25D366;
  color: #25D366;
  background: rgba(37, 211, 102, 0.05);
}

.odoo-skip-contact-btn {
  padding: 10px 16px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.odoo-skip-contact-btn:hover {
  background: #e9ecef;
}

.odoo-skip-contact-btn.active {
  background: #495057;
  border-color: #495057;
  color: white;
}

.odoo-contact-expanded {
  display: none;
}

.odoo-contact-expanded.show {
  display: block;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Contact search */
.odoo-contact-search-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.odoo-contact-search {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.odoo-contact-search:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.odoo-contact-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 16px;
}

.odoo-contact-search-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

/* Contact chips */
.odoo-contact-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.odoo-contact-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.odoo-contact-chip:hover {
  border-color: #25D366;
  background: rgba(37, 211, 102, 0.05);
  transform: translateY(-1px);
}

.odoo-contact-chip-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #25D366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 11px;
}

.odoo-contact-chip-name {
  font-weight: 500;
  color: #495057;
}

/* Selected contact card */
.odoo-contact-selected {
  padding: 12px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #25D366;
  border-radius: 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.odoo-contact-selected-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.odoo-contact-selected-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #25D366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.odoo-contact-selected-details {
  flex: 1;
}

.odoo-contact-selected-name {
  font-weight: 600;
  color: #1b5e20;
  font-size: 14px;
}

.odoo-contact-selected-meta {
  font-size: 12px;
  color: #2e7d32;
  margin-top: 2px;
}

.odoo-contact-clear-btn {
  background: white;
  border: 1px solid #25D366;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #25D366;
  transition: all 0.2s ease;
}

.odoo-contact-clear-btn:hover {
  background: #25D366;
  color: white;
}

/* Footer buttons */
.odoo-title-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.odoo-title-btn.secondary {
  background: white;
  color: #6c757d;
  border: 2px solid #dee2e6;
}

.odoo-title-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.odoo-title-btn.primary {
  background: linear-gradient(135deg, #25D366 0%, #1ea952 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.odoo-title-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
}

.odoo-title-btn.primary:active {
  transform: translateY(0);
}

.odoo-title-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Divider */
.odoo-modal-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e9ecef, transparent);
  margin: 24px 0;
}
      .odoo-icon-svg {
        width: 18px;
        height: 18px;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        display: inline-block;
        vertical-align: middle;
      }
      
      .odoo-selection-btn .odoo-icon-svg {
        width: 16px;
        height: 16px;
        margin-right: 6px;
      }
      
      .odoo-selection-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); 
        padding: 20px;
        z-index: 10001;
        max-width: 400px; 
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        border: none; 
        display: block; /* CHANGED: Always display the panel */
        animation: slideInRight 0.3s ease-out;
      }

      /* REMOVED: .odoo-selection-panel.active */
      
      @keyframes slideInRight {
        0% { transform: translateX(100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      
      .odoo-selection-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .odoo-selection-title {
        font-size: 18px;
        font-weight: 700;
        color: #333;
        margin: 0;
      }
      
      .odoo-selection-count {
        background: #25D366;
        color: white;
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 12px;
        font-weight: 500;
      }
      
  
      .odoo-selection-messages {
        max-height: 250px;
        overflow-y: auto;
        margin-bottom: 16px;
        border-radius: 8px;
        border: 1px solid #f8f9fa;
      }
      
      .odoo-selection-message {
        background: none;
        padding: 10px 12px;
        padding-right: 40px; /* CHANGED: Make room for X button */
        margin-bottom: 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        line-height: 1.4;
        transition: background-color 0.1s;
        position: relative; /* CHANGED: For absolute positioning of X button */
      }

      .odoo-message-remove-btn {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        transition: all 0.2s ease;
        opacity: 0.7;
      }

      .odoo-message-remove-btn:hover {
        opacity: 1;
        transform: translateY(-50%) scale(1.1);
        background: #c82333;
      }

      .odoo-message-remove-btn:active {
        transform: translateY(-50%) scale(0.95);
      }

      .odoo-message-deselecting {
        animation: deselectPulse 0.3s ease-out;
      }
      
      @keyframes deselectPulse {
        0% { transform: scale(1); }
        50% { transform: scale(0.98); background: rgba(220, 53, 69, 0.1) !important; }
        100% { transform: scale(1); }
      }
      
      .odoo-selection-empty {
        text-align: center;
        color: #666;
        font-size: 13px;
        margin: 20px 0;
        padding: 20px;
      }
      
      .odoo-selection-empty-icon {
        font-size: 48px;
        margin-bottom: 10px;
        opacity: 0.5;
      }

      .odoo-selection-message:nth-child(even) {
        background: #fcfcfc;
      }
      
      .odoo-selection-message:hover {
        background: #f0f0f0;
      }
      
      .odoo-selection-message:last-child {
        border-bottom: none;
      }
      
      .odoo-selection-message-time {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
      }
      
      .odoo-selection-actions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        margin-bottom: 0;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
      }
      
      .odoo-selection-utility-actions {
        grid-column: span 3;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-top: 10px;
      }

      .odoo-selection-btn {
        font-weight: 600;
        padding: 10px 8px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .odoo-selection-btn.ticket {
        background: #25D366;
        color: white;
      }
      
      .odoo-selection-btn.ticket:hover {
        background: #1ea952;
      }
      
      .odoo-selection-btn.task {
        background: #FF9500;
        color: white;
      }
      
      .odoo-selection-btn.task:hover {
        background: #e68600;
      }
      
      .odoo-selection-btn.lead {
        background: #007AFF;
        color: white;
      }
      
      .odoo-selection-btn.lead:hover {
        background: #0056b3;
      }
      
      .odoo-selection-btn.secondary {
        background: #e9ecef;
        color: #333;
        border: none;
        flex: 1;
      }

      .odoo-selection-btn.secondary:hover {
        background: #d3d6d9;
      }
      
      .odoo-selection-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .odoo-message-selected {
        background: rgba(37, 211, 102, 0.1) !important;
        border: 2px solid #25D366 !important;
        border-radius: 8px;
        position: relative;
      }
      
      .odoo-message-selected::after {
        content: '✓';
        position: absolute;
        top: 8px;
        right: 8px;
        background: #25D366;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        z-index: 1001;
      }
      
      
      
      .odoo-processed {
        position: relative;
        cursor: pointer !important; /* ADDED */
        transition: all 0.2s ease; /* ADDED */
      }
      
      .odoo-processed:hover { /* ADDED */
        background: rgba(37, 211, 102, 0.05) !important;
        transform: scale(1.01);
      }
      
      .odoo-notification {
        position: fixed;
        top: 20px;
        left: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        padding: 16px 20px;
        z-index: 10000;
        font-size: 14px;
        max-width: 350px;
        border-left: 4px solid #25D366;
        animation: slideInLeft 0.3s ease-out;
      }
      
      .odoo-notification.error {
        border-left-color: #F44336;
      }
      
      @keyframes slideInLeft {
        0% { transform: translateX(-100%); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      
      .odoo-notification-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #333;
      }
      
      .odoo-notification-message {
        color: #666;
        font-size: 13px;
      }
      
      
      
      /* Title Modal Styles */
.odoo-title-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.odoo-title-modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  0% { opacity: 0; transform: scale(0.9) translateY(-20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.odoo-title-modal h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.odoo-title-modal-message {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  border-left: 4px solid #25D366;
  font-size: 14px;
  color: #555;
  max-height: 100px;
  overflow-y: auto;
}

.odoo-title-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  margin-bottom: 16px;
  transition: border-color 0.2s ease;
}

.odoo-title-input:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.odoo-title-options {
  margin-bottom: 20px;
}

.odoo-title-option {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.odoo-title-option:hover {
  background: #f8f9fa;
}

.odoo-title-option input[type="radio"] {
  margin-right: 10px;
  cursor: pointer;
}

.odoo-title-option label {
  cursor: pointer;
  font-size: 14px;
  color: #333;
  flex: 1;
}

.odoo-priority-section {
  margin-bottom: 20px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.odoo-priority-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.odoo-priority-stars {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.odoo-priority-stars .priority-star {
  background: none;
  border: none;
  cursor: pointer;
  color: #ccc;
  padding: 0;
  font-size: 24px;
  transition: color 0.2s;
}

.odoo-priority-description {
  font-size: 12px;
  color: #6c757d;
  min-height: 18px;
}

.odoo-title-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.odoo-title-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.odoo-title-btn.primary {
  background: #25D366;
  color: white;
}

.odoo-title-btn.primary:hover {
  background: #1ea952;
  transform: translateY(-1px);
}

.odoo-title-btn.secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e0e0e0;
}

.odoo-title-btn.secondary:hover {
  background: #e9ecef;
}

.odoo-title-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
/* Contact Selector Styles */
.odoo-contact-section {
  margin: 20px 0;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.odoo-contact-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.odoo-contact-search-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.odoo-contact-search {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.odoo-contact-search:focus {
  outline: none;
  border-color: #25D366;
}

.odoo-contact-search-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.odoo-contact-suggestions,
.odoo-contact-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
  margin-bottom: 12px;
}

.odoo-contact-suggestion-title {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.odoo-contact-loading {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.odoo-contact-item {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.odoo-contact-item:hover {
  background: #fff;
}

.odoo-contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #25D366;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.odoo-contact-info {
  flex: 1;
}

.odoo-contact-name {
  font-weight: 600;
  color: #333;
}

.odoo-contact-details {
  font-size: 12px;
  color: #666;
}

.odoo-contact-selected {
  padding: 12px;
  background: #e8f5e9;
  border: 2px solid #25D366;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.odoo-contact-selected-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.odoo-contact-selected-icon {
  font-size: 24px;
}

.odoo-contact-clear-btn {
  background: none;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.odoo-contact-quick-create {
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.odoo-contact-quick-create-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.odoo-contact-quick-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.odoo-contact-quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.odoo-contact-quick-cancel,
.odoo-contact-quick-save {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.odoo-contact-quick-cancel {
  background: #e0e0e0;
  color: #333;
}

.odoo-contact-quick-save {
  background: #25D366;
  color: white;
}

.odoo-contact-skip {
  font-size: 13px;
  color: #666;
  padding: 8px 0;
}

.odoo-contact-skip label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.odoo-contact-create-new-btn {
  width: 100%;
  padding: 10px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
}

.odoo-contact-no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

    `;
    document.head.appendChild(style);
  }

  addSelectionPanel() {
    const panel = document.createElement('div');
    panel.className = 'odoo-selection-panel';
    panel.id = 'odoo-selection-panel';
    
    // UPDATED HTML
    panel.innerHTML = `
      <div class="odoo-selection-header">
        <h3 class="odoo-selection-title">Create from Messages</h3>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="odoo-selection-count">0 selected</span>
        </div>
        </div>
      
      <div class="odoo-selection-messages" id="odoo-selected-messages">
        <div class="odoo-selection-empty">
          <div class="odoo-selection-empty-icon">💬</div>
          <p>Click messages to select them, then choose an action below</p>
          <p style="font-size: 11px; color: #999; margin-top: 8px;">
            Tip: Click a selected message again to deselect it
          </p>
        </div>
      </div>
      
      <div class="odoo-selection-actions">
        <button class="odoo-selection-btn ticket" id="odoo-create-ticket" disabled>
          ${this.modernIcons.ticket} Ticket
        </button>
        <button class="odoo-selection-btn task" id="odoo-create-task" disabled>
          ${this.modernIcons.task} Task
        </button>
        <button class="odoo-selection-btn lead" id="odoo-create-lead" disabled>
          ${this.modernIcons.lead} Lead
        </button>
      </div>
      
      <div class="odoo-selection-utility-actions">
        <button class="odoo-selection-btn secondary" id="odoo-clear-selection">
          Clear All
        </button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    document.getElementById('odoo-create-ticket').addEventListener('click', () => {
      this.createTicketFromSelection();
    });
    
    document.getElementById('odoo-create-task').addEventListener('click', () => {
      this.createTaskFromSelection();
    });
    
    document.getElementById('odoo-create-lead').addEventListener('click', () => {
      this.createLeadFromSelection();
    });
    
    document.getElementById('odoo-clear-selection').addEventListener('click', () => {
      this.clearSelection();
    });
    
    // REMOVED: exit selection mode listener
  }

  startMonitoring() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          setTimeout(() => this.processNewMessages(), 500);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => this.processNewMessages(), 2000);
  }

  processNewMessages() {
  const messageContainers = document.querySelectorAll('div[role="row"]:not(.odoo-processed)');
  
  let processedCount = 0;
  
  messageContainers.forEach((container) => {
    if (this.isMessageContainer(container)) {
      this.addMessageActions(container);
      container.classList.add('odoo-processed');
      processedCount++;
      
      // FIXED: Only add listener if not already added
      if (!container.hasAttribute('data-odoo-listener')) {
        container.setAttribute('data-odoo-listener', 'true');
        container.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMessageSelection(container);
        });
      }
    }
  });
  
  if (processedCount > 0) {
    console.log(`Processed ${processedCount} message containers`);
  }
}

  isMessageContainer(container) {
  const hasMessageClass = container.querySelector('.message-in, .message-out');
  // More stable - doesn't rely on ._ao3e
  const hasCopyableText = container.querySelector('.copyable-text');
  
  return hasMessageClass && hasCopyableText;
}

  // REPLACED WITH SIMPLIFIED VERSION
  addMessageActions(messageContainer) {
    if (messageContainer.querySelector('.odoo-message-marker')) return;

    // Just add a marker so we know this message is processed
    const marker = document.createElement('span');
    marker.className = 'odoo-message-marker';
    marker.style.display = 'none';
    messageContainer.appendChild(marker);
    
    // The clickable style is now handled by the .odoo-processed CSS
  }

  

  toggleMessageSelection(messageContainer) {
    const messageId = window.MessageExtractor.getMessageId(messageContainer);
    
    if (this.selectedMessages.has(messageId)) {
      // DESELECTING: Add visual feedback
      messageContainer.classList.add('odoo-message-deselecting');
      setTimeout(() => {
        messageContainer.classList.remove('odoo-message-deselecting');
      }, 300);
      
      this.selectedMessages.delete(messageId);
      messageContainer.classList.remove('odoo-message-selected');
      
      console.log(`Message deselected. Total: ${this.selectedMessages.size}`);
    } else {
      // SELECTING
      const messageData = window.MessageExtractor.extractMessageData(messageContainer);
      this.selectedMessages.set(messageId, {
        container: messageContainer,
        data: messageData
      });
      messageContainer.classList.add('odoo-message-selected');
      
      console.log(`Message selected. Total: ${this.selectedMessages.size}`);
    }
    
    this.updateSelectionPanel();
  }



  // NEW: Remove individual message from selection
  removeMessageFromSelection(messageId) {
    const message = this.selectedMessages.get(messageId);
    if (message) {
      message.container.classList.remove('odoo-message-selected');
      this.selectedMessages.delete(messageId);
      this.updateSelectionPanel();
      
      console.log(`Message removed. Total: ${this.selectedMessages.size}`);
    }
  }



  clearSelection() {
    document.querySelectorAll('.odoo-message-selected').forEach(msg => {
      msg.classList.remove('odoo-message-selected');
    });
    this.selectedMessages.clear();
    this.updateSelectionPanel();
  }

 updateSelectionPanel() {
    const count = this.selectedMessages.size;
    const countElement = document.querySelector('.odoo-selection-count');
    const messagesContainer = document.getElementById('odoo-selected-messages');
    const createTicketBtn = document.getElementById('odoo-create-ticket');
    const createTaskBtn = document.getElementById('odoo-create-task');
    const createLeadBtn = document.getElementById('odoo-create-lead');
    
    countElement.textContent = count === 0 ? 'No messages selected' : 
                               count === 1 ? '1 message selected' :
                               `${count} messages selected`;

    createTicketBtn.disabled = count === 0;
    createTaskBtn.disabled = count === 0;
    createLeadBtn.disabled = count === 0;
    
    if (count === 0) {
      // UPDATED: Better empty state
      messagesContainer.innerHTML = `
        <div class="odoo-selection-empty">
          <div class="odoo-selection-empty-icon">💬</div>
          <p>Click messages to select them, then choose an action below</p>
          <p style="font-size: 11px; color: #999; margin-top: 8px;">
            Tip: Click a selected message again to deselect it
          </p>
        </div>
      `;
    } else {
      const messagesArray = Array.from(this.selectedMessages.entries());
      
      const messagesHtml = messagesArray
        .map(([messageId, item]) => {
          const truncatedContent = item.data.content.length > 80 
            ? item.data.content.substring(0, 80) + '...' 
            : item.data.content;
          
          return `
            <div class="odoo-selection-message" data-message-id="${messageId}">
              ${truncatedContent}
              <div class="odoo-selection-message-time">
                ${item.data.timestamp.toLocaleTimeString()}
              </div>
              <button class="odoo-message-remove-btn" 
                      data-message-id="${messageId}"
                      title="Remove this message">×</button>
            </div>
          `;
        }).join('');
      
      messagesContainer.innerHTML = messagesHtml;
      
      // NEW: Add click handlers for remove buttons
      messagesContainer.querySelectorAll('.odoo-message-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering parent click
          const messageId = btn.getAttribute('data-message-id');
          this.removeMessageFromSelection(messageId);
        });
      });
    }
  }


  async createTicketFromSelection() {
    return this.createFromSelection('ticket');
  }

  async createTaskFromSelection() {
    return this.createFromSelection('task');
  }

  async createLeadFromSelection() {
    return this.createFromSelection('lead');
  }

  async createFromSelection(type) {
  if (this.selectedMessages.size === 0) return;
  
  try {
    const conversationData = window.MessageExtractor.extractConversationData();
    
    const messages = Array.from(this.selectedMessages.values()).map(item => ({
      content: item.data.content,
      timestamp: item.data.timestamp,
      senderType: window.MessageExtractor.isIncomingMessage(item.container) ? 'customer' : 'agent'
    }));
    
    messages.sort((a, b) => a.timestamp - b.timestamp);
    const firstMessageContent = messages[0].content;

    const combinedPreview = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.content.substring(0, 100)}...`
    ).join('\n\n');

    // Show title modal for multi-message selection
    const titleData = await this.showTitleModal({
      content: combinedPreview,
      timestamp: messages[0].timestamp,
      type: 'multi',
      firstMessageContent: firstMessageContent
    }, conversationData, type);
    
    if (!titleData) {
      return; // User cancelled
    }
    
    const createBtn = document.getElementById(`odoo-create-${type}`);
    createBtn.disabled = true;
    createBtn.innerHTML = `Creating ${type}...`;
    
    let result;
    const priority = titleData.priority;

    if (type === 'ticket') {
      const ticketData = {
        contactName: conversationData.contactName,
        contactNumber: conversationData.contactNumber,
        summary: titleData.title,
        description: window.MessageExtractor.formatMultipleMessages(messages, conversationData, 'ticket'),
        messages: messages,
        source: 'whatsapp_multiselect',
        priority: priority,
        partner_id: titleData.partner_id
      };
      result = await window.BackgroundMessenger.createTicket(ticketData);
    } else if (type === 'task') {
      const taskData = {
        name: titleData.title,
        description: window.MessageExtractor.formatMultipleMessages(messages, conversationData, 'task'),
        partner_name: conversationData.contactName,
        messages: messages,
        date_deadline: window.MessageExtractor.calculateDeadline(combinedPreview),
        priority: priority,
        partner_id: titleData.partner_id
      };
      result = await window.BackgroundMessenger.createTask(taskData);
    } else if (type === 'lead') {
      const leadData = {
        name: titleData.title,
        contact_name: conversationData.contactName,
        phone: conversationData.contactNumber,
        description: window.MessageExtractor.formatMultipleMessages(messages, conversationData, 'lead'),
        messages: messages,
        source_id: 'whatsapp',
        priority: priority,
        partner_id: titleData.partner_id
      };
      result = await window.BackgroundMessenger.createLead(leadData);
    }
    
    if (result.success) {
      const itemId = result.ticketId || result.taskId || result.leadId;
      window.NotificationManager.showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully with ${messages.length} messages! ID: ${itemId}`);
      this.clearSelection(); // Use clearSelection instead of exitSelectionMode
    } else {
      window.NotificationManager.showError(`Error creating ${type}: ${result.error}`);
    }
    
  } catch (error) {
    window.NotificationManager.showError(`Error: ${error.message}`);
  } finally {
    const createBtn = document.getElementById(`odoo-create-${type}`);
    createBtn.disabled = this.selectedMessages.size === 0;
    const icon = this.modernIcons[type];
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    createBtn.innerHTML = `${icon} ${capitalizedType}`;
  }
}  

async showTitleModal(messageData, conversationData, type = 'ticket') {
  return new Promise(async (resolve) => {
    const modal = document.createElement('div');
    modal.className = 'odoo-title-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'odoo-title-modal-content';
    
    let messageStart;
    
    if (messageData.type === 'multi') {
      messageStart = messageData.firstMessageContent 
        ? messageData.firstMessageContent.substring(0, 30)
        : messageData.content.substring(0, 30);
    } else {
      messageStart = messageData.content.substring(0, 30);
    }
    
    // NEW HTML STRUCTURE FROM ARTIFACT 2
    modalContent.innerHTML = `
      <div class="odoo-modal-header">
        <h3>Create ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      </div>
      
      <div class="odoo-modal-body">
        <!-- TITLE SECTION -->
        <div class="odoo-modal-section">
          <label class="odoo-section-label">
            <span class="odoo-section-label-icon">📝</span>
            Title
          </label>
          
          <div class="odoo-title-tabs">
            <button type="button" class="odoo-title-tab active" data-tab="custom">Custom Title</button>
            <button type="button" class="odoo-title-tab" data-tab="auto">Auto-generate</button>
          </div>
          
          <div class="odoo-title-input-wrapper">
            <input type="text" 
                   class="odoo-title-input" 
                   id="title-input"
                   placeholder="Enter ${type} title..." 
                   maxlength="100"
                   value="">
            <span class="odoo-char-counter" id="char-counter">0/100</span>
          </div>
        </div>
        
        <div class="odoo-modal-divider"></div>
        
        <!-- PRIORITY SECTION -->
        <!-- PRIORITY SECTION -->
<div class="odoo-modal-section">
  <label class="odoo-section-label">
    Priority
  </label>
  
  <div class="odoo-priority-buttons">
    <button type="button" class="odoo-priority-btn priority-none active" data-priority="0">
      <span class="odoo-priority-stars-display">—</span>
      <span class="odoo-priority-label">None</span>
    </button>
    <button type="button" class="odoo-priority-btn priority-low" data-priority="1">
      <span class="odoo-priority-stars-display">★</span>
      <span class="odoo-priority-label">Low</span>
    </button>
    <button type="button" class="odoo-priority-btn priority-medium" data-priority="2">
      <span class="odoo-priority-stars-display">★★</span>
      <span class="odoo-priority-label">Medium</span>
    </button>
    <button type="button" class="odoo-priority-btn priority-high" data-priority="3">
      <span class="odoo-priority-stars-display">★★★</span>
      <span class="odoo-priority-label">High</span>
    </button>
  </div>
</div>
        <div class="odoo-modal-divider"></div>
        
        <!-- CONTACT SECTION -->
        <div class="odoo-modal-section">
          <label class="odoo-section-label">
            <span class="odoo-section-label-icon">👤</span>
            Contact
          </label>
          
          <div class="odoo-contact-collapsed" id="contact-collapsed">
            <button type="button" class="odoo-add-contact-btn" id="add-contact-btn">
              <span>➕</span> Add Contact
            </button>
            <button type="button" class="odoo-skip-contact-btn" id="skip-contact-btn">
              No Contact
            </button>
          </div>
          
          <div class="odoo-contact-expanded" id="contact-expanded">
            <div class="odoo-contact-search-wrapper">
              <input type="text" 
                     class="odoo-contact-search" 
                     id="contact-search-input"
                     placeholder="Search by name, phone, or email..."
                     autocomplete="off">
              <div class="odoo-contact-search-spinner" id="contact-search-spinner" style="display: none;">⏳</div>
            </div>
            
            <div id="contact-chips-container" style="display: none;">
              <div class="odoo-contact-chips" id="contact-chips"></div>
            </div>
            
            <div class="odoo-contact-suggestions" id="contact-suggestions" style="display: none;">
              <div class="odoo-contact-loading">Loading suggestions...</div>
            </div>
            
            <div class="odoo-contact-results" id="contact-results" style="display: none;"></div>
            
            <div class="odoo-contact-selected" id="contact-selected" style="display: none;">
              <div class="odoo-contact-selected-info">
                <div class="odoo-contact-selected-avatar" id="selected-contact-avatar"></div>
                <div class="odoo-contact-selected-details">
                  <div class="odoo-contact-selected-name" id="selected-contact-name"></div>
                  <div class="odoo-contact-selected-meta" id="selected-contact-details"></div>
                </div>
              </div>
              <button class="odoo-contact-clear-btn" id="clear-contact-btn">✕ Remove</button>
            </div>
            
            <div class="odoo-contact-quick-create" id="contact-quick-create" style="display: none;">
              <div class="odoo-contact-quick-create-title">Create New Contact</div>
              <input type="text" class="odoo-contact-quick-input" id="new-contact-name" placeholder="Contact Name *" value="">
              <input type="text" class="odoo-contact-quick-input" id="new-contact-phone" placeholder="Phone" value="">
              <input type="email" class="odoo-contact-quick-input" id="new-contact-email" placeholder="Email">
              <div class="odoo-contact-quick-actions">
                <button class="odoo-contact-quick-cancel" id="cancel-create-contact">Cancel</button>
                <button class="odoo-contact-quick-save" id="save-new-contact">Create</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="odoo-modal-footer">
        <button class="odoo-title-btn secondary" data-action="cancel">Cancel</button>
        <button class="odoo-title-btn primary" data-action="create" id="create-btn">
          Create ${type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // ===== NEW JAVASCRIPT HANDLERS =====
    
    // 1. Title Tabs Handler
    const titleTabs = modalContent.querySelectorAll('.odoo-title-tab');
    const titleInput = modalContent.querySelector('#title-input');
    const charCounter = modalContent.querySelector('#char-counter');
    
    let selectedTitleMode = 'custom';
    
    titleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        titleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedTitleMode = tab.dataset.tab;
        
        if (selectedTitleMode === 'custom') {
          titleInput.value = '';
          titleInput.disabled = false;
          titleInput.focus();
          titleInput.placeholder = `Enter ${type} title...`;
        } else {
          titleInput.value = `${messageStart}...`;
          titleInput.disabled = true;
          titleInput.placeholder = 'Auto-generated from message';
        }
        validateTitle();
      });
    });
    
    // Character counter
    titleInput.addEventListener('input', (e) => {
      const length = e.target.value.length;
      charCounter.textContent = `${length}/100`;
      
      charCounter.classList.remove('warning', 'danger');
      if (length > 80) charCounter.classList.add('warning');
      if (length > 95) charCounter.classList.add('danger');
      
      validateTitle();
    });
    
    // 2. Priority Buttons Handler
    let selectedPriority = '0';
    const priorityBtns = modalContent.querySelectorAll('.odoo-priority-btn');
    
    priorityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        priorityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPriority = btn.dataset.priority;
      });
    });
    
    // 3. Contact Progressive Disclosure
    const contactCollapsed = modalContent.querySelector('#contact-collapsed');
    const contactExpanded = modalContent.querySelector('#contact-expanded');
    const addContactBtn = modalContent.querySelector('#add-contact-btn');
    const skipContactBtn = modalContent.querySelector('#skip-contact-btn');
    const contactSearchInput = modalContent.querySelector('#contact-search-input');
    const contactSuggestions = modalContent.querySelector('#contact-suggestions');
    const contactResults = modalContent.querySelector('#contact-results');
    const quickCreateSection = modalContent.querySelector('#contact-quick-create');
    
    let selectedContact = null;
    let contactMode = 'none';
    let searchTimeout = null;
    
    addContactBtn.addEventListener('click', () => {
      contactMode = 'add';
      contactCollapsed.style.display = 'none';
      contactExpanded.classList.add('show');
      skipContactBtn.classList.remove('active');
      contactSearchInput.focus();
      loadContactSuggestions();
    });
    
    skipContactBtn.addEventListener('click', () => {
      if (contactMode === 'skip') {
        contactMode = 'none';
        skipContactBtn.classList.remove('active');
      } else {
        contactMode = 'skip';
        skipContactBtn.classList.add('active');
        selectedContact = null;
        
        // Hide contact expanded if shown
        if (contactExpanded.classList.contains('show')) {
          contactExpanded.classList.remove('show');
          contactCollapsed.style.display = 'flex';
        }
      }
    });
    
    // 4. Load contact suggestions
    // 4. Load contact suggestions
const loadContactSuggestions = async () => {
  try {
    contactSuggestions.style.display = 'block';
    contactSuggestions.innerHTML = '<div class="odoo-contact-loading">Loading suggestions...</div>';
    
    let result;
    
    if (conversationData.isGroup && conversationData.groupIdentifiers) {
      // OPTIMIZED: Use BATCH search - ONE API call instead of 8+
      const names = Array.isArray(conversationData.groupIdentifiers.names) 
        ? conversationData.groupIdentifiers.names 
        : [];
      
      const phones = Array.isArray(conversationData.groupIdentifiers.phones)
        ? conversationData.groupIdentifiers.phones
        : [];
      
      console.log('🚀 BATCH searching group members in ONE request:', { names, phones });
      
      // Single batch API call
      const batchResult = await window.BackgroundMessenger.batchSearchContacts(phones, names);
      
      console.log('🎯 Batch result:', batchResult);
      
      // Handle nested structure if needed
      let contacts = [];
      if (batchResult.success) {
        if (batchResult.contacts && Array.isArray(batchResult.contacts)) {
          contacts = batchResult.contacts;
        } else if (batchResult.contacts && batchResult.contacts.contacts && Array.isArray(batchResult.contacts.contacts)) {
          contacts = batchResult.contacts.contacts;
          console.log(`🔧 FIXED: Extracted from nested structure`);
        }
      }
      
      result = { success: true, contacts: contacts };
      console.log(`✅ TOTAL: Found ${contacts.length} contacts in ONE batch request!`);
      
    } else {
      // Single contact search
      console.log('🔍 Single contact search:', {
        name: conversationData.contactName,
        phone: conversationData.contactNumber
      });
      result = await window.BackgroundMessenger.suggestContacts(
        conversationData.contactName,
        conversationData.contactNumber
      );
      
      // FIXED: Handle nested contacts structure for single contact too
      if (result.success && result.contacts && result.contacts.contacts && Array.isArray(result.contacts.contacts)) {
        console.log(`🔧 FIXED: Extracted ${result.contacts.contacts.length} contacts from nested structure (single)`);
        result.contacts = result.contacts.contacts;
      }
    }
    
    console.log('📊 Final contact suggestions result:', result);
    
    if (result.success && result.contacts && result.contacts.length > 0) {
      displayContactSuggestions(result.contacts);
    } else {
      const chipsContainer = modalContent.querySelector('#contact-chips-container');
      if (chipsContainer) {
        chipsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">
            <p style="margin-bottom: 12px;">No matching contacts found</p>
            <button class="odoo-contact-create-new-btn" id="show-create-contact" style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
              + Create New Contact
            </button>
          </div>
        `;
        chipsContainer.style.display = 'block';
        contactSuggestions.style.display = 'none';
        
        modalContent.querySelector('#show-create-contact')?.addEventListener('click', showQuickCreateForm);
      }
    }
  } catch (error) {
    console.error('❌ Error loading suggestions:', error);
    const chipsContainer = modalContent.querySelector('#contact-chips-container');
    if (chipsContainer) {
      chipsContainer.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #dc3545; font-size: 13px;">
          <p style="margin-bottom: 12px;">Error loading contacts: ${error.message}</p>
          <button class="odoo-contact-create-new-btn" id="show-create-contact-error" style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
            + Create New Contact
          </button>
        </div>
      `;
      chipsContainer.style.display = 'block';
      contactSuggestions.style.display = 'none';
      
      modalContent.querySelector('#show-create-contact-error')?.addEventListener('click', showQuickCreateForm);
    }
  }
};
    
    // 5. Display suggestions as chips
    const displayContactSuggestions = (contacts) => {
      const chipsContainer = modalContent.querySelector('#contact-chips-container');
      const chips = modalContent.querySelector('#contact-chips');
      
      if (contacts.length === 0) {
        chipsContainer.style.display = 'none';
        return;
      }
      
      let html = '';
      contacts.forEach(contact => {
        const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        html += `
          <div class="odoo-contact-chip" data-contact-id="${contact.id}">
            <div class="odoo-contact-chip-avatar">${initials}</div>
            <span class="odoo-contact-chip-name">${contact.name}</span>
          </div>
        `;
      });
      
      chips.innerHTML = html;
      chipsContainer.style.display = 'block';
      contactSuggestions.style.display = 'none';
      
      chips.querySelectorAll('.odoo-contact-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const contactId = parseInt(chip.dataset.contactId);
          const contact = contacts.find(c => c.id === contactId);
          selectContact(contact);
        });
      });
    };
    
    // 6. Search contacts

    
 // 6. Search contacts - FIXED VERSION
const searchContacts = async (query) => {
  try {
    const spinner = modalContent.querySelector('#contact-search-spinner');
    if (spinner) spinner.style.display = 'block';
    
    const result = await window.BackgroundMessenger.searchContacts(query);
    
    if (spinner) spinner.style.display = 'none';
    
    console.log('Search result for query:', query, result);
    
    // Hide suggestions when searching
    if (contactSuggestions) contactSuggestions.style.display = 'none';
    
    if (result.success && result.contacts && result.contacts.length > 0) {
      displaySearchResults(result.contacts);
    } else {
      // No results found
      const chipsContainer = modalContent.querySelector('#contact-chips-container');
      if (chipsContainer) {
        chipsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">
            <p style="margin-bottom: 12px;">No contacts found for "${query}"</p>
            <button class="odoo-contact-create-new-btn" id="show-create-contact-search" style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
              + Create New Contact
            </button>
          </div>
        `;
        chipsContainer.style.display = 'block';
        
        modalContent.querySelector('#show-create-contact-search')?.addEventListener('click', showQuickCreateForm);
      }
    }
  } catch (error) {
    console.error('Error searching contacts:', error);
    const spinner = modalContent.querySelector('#contact-search-spinner');
    if (spinner) spinner.style.display = 'none';
  }
};

const displaySearchResults = (contacts) => {
  // First, try to get the containers
  let chipsContainer = modalContent.querySelector('#contact-chips-container');
  let chips = modalContent.querySelector('#contact-chips');
  
  // If they don't exist, log and try an alternative approach
  if (!chipsContainer || !chips) {
    console.error('Chips container missing, using alternative display');
    
    // Use the contact-expanded div directly
    const expandedDiv = modalContent.querySelector('#contact-expanded');
    if (!expandedDiv) {
      console.error('Contact expanded div also missing!');
      return;
    }
    
    // Create the container if it doesn't exist
    let tempContainer = expandedDiv.querySelector('#temp-results');
    if (!tempContainer) {
      tempContainer = document.createElement('div');
      tempContainer.id = 'temp-results';
      tempContainer.style.marginTop = '12px';
      expandedDiv.appendChild(tempContainer);
    }
    
    // Display results in temp container
    let html = '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';
    contacts.forEach(contact => {
      const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      html += `
        <div class="odoo-contact-chip" data-contact-id="${contact.id}" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: white; border: 2px solid #e0e0e0; border-radius: 20px; cursor: pointer; font-size: 13px;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #25D366; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 11px;">${initials}</div>
          <span style="font-weight: 500; color: #495057;">${contact.name}</span>
        </div>
      `;
    });
    html += '</div>';
    
    tempContainer.innerHTML = html;
    
    // Add click handlers
    tempContainer.querySelectorAll('.odoo-contact-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const contactId = parseInt(chip.dataset.contactId);
        const contact = contacts.find(c => c.id === contactId);
        if (contact) selectContact(contact);
      });
    });
    
    return;
  }
  
  // Normal flow if containers exist
  if (contacts.length === 0) {
    chipsContainer.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 13px;">
        <p style="margin-bottom: 12px;">No contacts found</p>
        <button class="odoo-contact-create-new-btn" id="show-create-contact-search" style="background: #007AFF; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500;">
          + Create New Contact
        </button>
      </div>
    `;
    chipsContainer.style.display = 'block';
    
    modalContent.querySelector('#show-create-contact-search')?.addEventListener('click', showQuickCreateForm);
    return;
  }
  
  let html = '';
  contacts.forEach(contact => {
    const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    html += `
      <div class="odoo-contact-chip" data-contact-id="${contact.id}">
        <div class="odoo-contact-chip-avatar">${initials}</div>
        <span class="odoo-contact-chip-name">${contact.name}</span>
      </div>
    `;
  });
  
  chips.innerHTML = html;
  chipsContainer.style.display = 'block';
  
  // Hide other containers
  if (contactSuggestions) contactSuggestions.style.display = 'none';
  if (contactResults) contactResults.style.display = 'none';
  
  chips.querySelectorAll('.odoo-contact-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const contactId = parseInt(chip.dataset.contactId);
      const contact = contacts.find(c => c.id === contactId);
      if (contact) selectContact(contact);
    });
  });
};
    // 7. Select contact
    const selectContact = (contact) => {
      selectedContact = contact;
      const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      const details = [contact.phone, contact.email].filter(Boolean).join(' • ');
      
      modalContent.querySelector('#selected-contact-avatar').textContent = initials;
      modalContent.querySelector('#selected-contact-name').textContent = contact.name;
      modalContent.querySelector('#selected-contact-details').textContent = details;
      modalContent.querySelector('#contact-selected').style.display = 'flex';
      modalContent.querySelector('#contact-chips-container').style.display = 'none';
      contactSuggestions.style.display = 'none';
      contactResults.style.display = 'none';
      contactSearchInput.value = '';
      contactSearchInput.disabled = true;
      skipContactBtn.classList.remove('active');
      contactMode = 'add';
    };
    
    // 8. Quick create form
    const showQuickCreateForm = () => {
      modalContent.querySelector('#new-contact-name').value = conversationData.contactName || '';
      modalContent.querySelector('#new-contact-phone').value = conversationData.contactNumber || '';
      quickCreateSection.style.display = 'block';
      modalContent.querySelector('#contact-chips-container').style.display = 'none';
      contactSuggestions.style.display = 'none';
      contactResults.style.display = 'none';
    };
    
    const createNewContact = async () => {
      const name = modalContent.querySelector('#new-contact-name').value.trim();
      const phone = modalContent.querySelector('#new-contact-phone').value.trim();
      const email = modalContent.querySelector('#new-contact-email').value.trim();
      
      if (!name) {
        alert('Contact name is required');
        return;
      }
      
      try {
        const saveBtn = modalContent.querySelector('#save-new-contact');
        saveBtn.textContent = 'Creating...';
        saveBtn.disabled = true;
        
        const result = await window.BackgroundMessenger.createContact({
          name: name,
          phone: phone,
          email: email,
          comment: `Created from WhatsApp: ${conversationData.contactName}`
        });
        
        if (result.success) {
          selectContact(result.contact);
          quickCreateSection.style.display = 'none';
        } else {
          alert('Error creating contact: ' + result.error);
        }
        
        saveBtn.textContent = 'Create';
        saveBtn.disabled = false;
      } catch (error) {
        console.error('Error creating contact:', error);
        alert('Error creating contact: ' + error.message);
      }
    };
    
    // Contact search input handler
    contactSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      if (query.length < 2) {
        contactResults.style.display = 'none';
        modalContent.querySelector('#contact-chips-container').style.display = 'block';
        return;
      }
      modalContent.querySelector('#contact-search-spinner').style.display = 'block';
      searchTimeout = setTimeout(() => searchContacts(query), 300);
    });
    
    // Clear contact button
    const clearContactBtn = modalContent.querySelector('#clear-contact-btn');
    clearContactBtn.addEventListener('click', () => {
      selectedContact = null;
      modalContent.querySelector('#contact-selected').style.display = 'none';
      contactSearchInput.value = '';
      contactSearchInput.disabled = false;
      modalContent.querySelector('#contact-chips-container').style.display = 'block';
      contactMode = 'add';
    });
    
    // Quick create buttons
    modalContent.querySelector('#cancel-create-contact').addEventListener('click', () => {
      quickCreateSection.style.display = 'none';
      modalContent.querySelector('#contact-chips-container').style.display = 'block';
    });
    
    modalContent.querySelector('#save-new-contact').addEventListener('click', createNewContact);
    
    // 9. Validation
    const validateTitle = () => {
      const createBtn = modalContent.querySelector('#create-btn');
      const title = titleInput.value.trim();
      createBtn.disabled = !title || title.length < 3;
    };
    
    validateTitle();
    
    // 10. Create and Cancel buttons
    const createBtn = modalContent.querySelector('[data-action="create"]');
    const cancelBtn = modalContent.querySelector('[data-action="cancel"]');
    
    createBtn.addEventListener('click', () => {
      const title = titleInput.value.trim();
      if (title && title.length >= 3) {
        modal.remove();
        resolve({
          title: title,
          option: selectedTitleMode,
          priority: selectedPriority,
          partner_id: selectedContact ? selectedContact.id : null,
          skipContact: contactMode === 'skip'
        });
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(null);
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
        resolve(null);
      }
    });
  });
}
}

// Initialize the tracker
const messageTracker = new WhatsAppMessageTracker();