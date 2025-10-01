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
        margin-bottom: 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        line-height: 1.4;
        transition: background-color 0.1s;
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
        <p style="text-align: center; color: #666; font-size: 13px; margin: 20px 0;">
          Click messages to select them, then choose an action below
        </p>
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
    // UPDATED selector to use new marker class
    const messageContainers = document.querySelectorAll('div[role="row"]:not(.odoo-processed)');
    
    let processedCount = 0;
    
    messageContainers.forEach((container) => {
      if (this.isMessageContainer(container)) {
        this.addMessageActions(container); // Now just adds marker
        container.classList.add('odoo-processed');
        processedCount++;
        
        container.addEventListener('click', (e) => {
          // REMOVED: if (this.selectionMode) check
          e.stopPropagation();
          this.toggleMessageSelection(container);
        });
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
      this.selectedMessages.delete(messageId);
      messageContainer.classList.remove('odoo-message-selected');
    } else {
      const messageData = window.MessageExtractor.extractMessageData(messageContainer);
      this.selectedMessages.set(messageId, {
        container: messageContainer,
        data: messageData
      });
      messageContainer.classList.add('odoo-message-selected');
    }
    
    this.updateSelectionPanel();
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
    
    // UPDATED: Count display text
    countElement.textContent = count === 0 ? 'No messages selected' : 
                               count === 1 ? '1 message selected' :
                               `${count} messages selected`;

    createTicketBtn.disabled = count === 0;
    createTaskBtn.disabled = count === 0;
    createLeadBtn.disabled = count === 0;
    
    if (count === 0) {
      messagesContainer.innerHTML = `
        <p style="text-align: center; color: #666; font-size: 13px; margin: 20px 0;">
          Click messages to select them, then choose an action below
        </p>
      `;
    } else {
      const messagesHtml = Array.from(this.selectedMessages.values())
        .map(item => {
          const truncatedContent = item.data.content.length > 80 
            ? item.data.content.substring(0, 80) + '...' 
            : item.data.content;
          
          return `
            <div class="odoo-selection-message">
              ${truncatedContent}
              <div class="odoo-selection-message-time">
                ${item.data.timestamp.toLocaleTimeString()}
              </div>
            </div>
          `;
        }).join('');
      
      messagesContainer.innerHTML = messagesHtml;
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
    
    let displayMessage, messageStart, modalTitle;
    
    if (messageData.type === 'multi') {
      modalTitle = `Create Multi-Message ${type.charAt(0).toUpperCase() + type.slice(1)} Title`;
      displayMessage = messageData.content.length > 200 
        ? messageData.content.substring(0, 200) + '...' 
        : messageData.content;
      messageStart = messageData.firstMessageContent 
        ? messageData.firstMessageContent.substring(0, 30)
        : messageData.content.substring(0, 30);
    } else {
      modalTitle = `Create ${type.charAt(0).toUpperCase() + type.slice(1)} Title`;
      displayMessage = messageData.content.length > 100 
        ? messageData.content.substring(0, 100) + '...' 
        : messageData.content;
      messageStart = messageData.content.substring(0, 30);
    }
    
    let titleOptions = `
      <div class="odoo-title-option">
        <input type="radio" id="title-option-1" name="titleOption" value="custom" checked>
        <label for="title-option-1">Write custom title</label>
      </div>
      <div class="odoo-title-option">
        <input type="radio" id="title-option-2" name="titleOption" value="message-start">
        <label for="title-option-2">Use message start: "${messageStart}..."</label>
      </div>
    `;
    
    modalContent.innerHTML = `
      <h3>${modalTitle}</h3>
      
      <div class="odoo-title-modal-message">
        <strong>${messageData.type === 'multi' ? 'Selected Messages:' : 'Message:'}</strong> "${displayMessage}"
      </div>
      
      <div class="odoo-title-options">
        ${titleOptions}
      </div>
      
      <input type="text" 
             class="odoo-title-input" 
             placeholder="Enter custom ${type} title..." 
             maxlength="100"
             value="">
      
      <div class="odoo-priority-section">
        <label class="odoo-priority-label">Priority Level</label>
        <div class="odoo-priority-stars" id="priority-stars">
          <button type="button" class="priority-star" data-priority="1" title="Low Priority">★</button>
          <button type="button" class="priority-star" data-priority="2" title="Medium Priority">★</button>
          <button type="button" class="priority-star" data-priority="3" title="High Priority">★</button>
        </div>
        <div class="odoo-priority-description" id="priority-description">Click stars to set priority level</div>
      </div>

      <div class="odoo-contact-section">
        <label class="odoo-contact-label">Assign to Contact (Optional)</label>
        
        <div class="odoo-contact-search-wrapper">
          <input type="text" 
                 class="odoo-contact-search" 
                 id="contact-search-input"
                 placeholder="Search contacts by name, phone, or email..."
                 autocomplete="off">
          <div class="odoo-contact-search-spinner" id="contact-search-spinner" style="display: none;">⏳</div>
        </div>
        
        <div class="odoo-contact-suggestions" id="contact-suggestions">
          <div class="odoo-contact-loading">Loading suggestions...</div>
        </div>
        
        <div class="odoo-contact-results" id="contact-results" style="display: none;"></div>
        
        <div class="odoo-contact-selected" id="contact-selected" style="display: none;">
          <div class="odoo-contact-selected-info">
            <span class="odoo-contact-selected-icon">👤</span>
            <div>
              <div class="odoo-contact-selected-name" id="selected-contact-name"></div>
              <div class="odoo-contact-selected-details" id="selected-contact-details"></div>
            </div>
          </div>
          <button class="odoo-contact-clear-btn" id="clear-contact-btn">Clear</button>
        </div>
        
        <div class="odoo-contact-quick-create" id="contact-quick-create" style="display: none;">
          <div class="odoo-contact-quick-create-title">Create New Contact</div>
          <input type="text" class="odoo-contact-quick-input" id="new-contact-name" placeholder="Contact Name" value="">
          <input type="text" class="odoo-contact-quick-input" id="new-contact-phone" placeholder="Phone (optional)" value="">
          <input type="email" class="odoo-contact-quick-input" id="new-contact-email" placeholder="Email (optional)">
          <div class="odoo-contact-quick-actions">
            <button class="odoo-contact-quick-cancel" id="cancel-create-contact">Cancel</button>
            <button class="odoo-contact-quick-save" id="save-new-contact">Create Contact</button>
          </div>
        </div>
        
        <div class="odoo-contact-skip">
          <label>
            <input type="checkbox" id="skip-contact-checkbox">
            Skip contact assignment
          </label>
        </div>
      </div>

      <div class="odoo-title-buttons">
        <button class="odoo-title-btn secondary" data-action="cancel">Cancel</button>
        <button class="odoo-title-btn primary" data-action="create">Create ${type.charAt(0).toUpperCase() + type.slice(1)}</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Contact management
    const contactSearchInput = modalContent.querySelector('#contact-search-input');
    const contactSuggestions = modalContent.querySelector('#contact-suggestions');
    const contactResults = modalContent.querySelector('#contact-results');
    const contactSelected = modalContent.querySelector('#contact-selected');
    const clearContactBtn = modalContent.querySelector('#clear-contact-btn');
    const quickCreateSection = modalContent.querySelector('#contact-quick-create');
    const skipContactCheckbox = modalContent.querySelector('#skip-contact-checkbox');
    
    let selectedContact = null;
    let searchTimeout = null;

    // Load contact suggestions
    const loadContactSuggestions = async () => {
      try {
        const result = await window.BackgroundMessenger.suggestContacts(
          conversationData.contactName,
          conversationData.contactNumber
        );
        
        if (result.success && result.contacts && result.contacts.length > 0) {
          displayContactSuggestions(result.contacts);
        } else {
          contactSuggestions.innerHTML = `
            <div class="odoo-contact-no-results">
              No matching contacts found.
              <button class="odoo-contact-create-new-btn" id="show-create-contact">+ Create New Contact</button>
            </div>
          `;
          modalContent.querySelector('#show-create-contact')?.addEventListener('click', showQuickCreateForm);
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
        contactSuggestions.innerHTML = `<div class="odoo-contact-loading">Error loading suggestions</div>`;
      }
    };

    const displayContactSuggestions = (contacts) => {
      let html = '<div class="odoo-contact-suggestion-title">Suggested from WhatsApp:</div>';
      
      contacts.forEach(contact => {
        const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const details = [contact.phone, contact.email].filter(Boolean).join(' • ');
        
        html += `
          <div class="odoo-contact-item" data-contact-id="${contact.id}">
            <div class="odoo-contact-avatar">${initials}</div>
            <div class="odoo-contact-info">
              <div class="odoo-contact-name">${contact.name}</div>
              ${details ? `<div class="odoo-contact-details">${details}</div>` : ''}
            </div>
          </div>
        `;
      });
      
      html += `<button class="odoo-contact-create-new-btn" id="show-create-contact">+ Create New Contact</button>`;
      contactSuggestions.innerHTML = html;
      
      contactSuggestions.querySelectorAll('.odoo-contact-item').forEach(item => {
        item.addEventListener('click', () => {
          const contactId = parseInt(item.dataset.contactId);
          const contact = contacts.find(c => c.id === contactId);
          selectContact(contact);
        });
      });
      
      modalContent.querySelector('#show-create-contact')?.addEventListener('click', showQuickCreateForm);
    };

    const searchContacts = async (query) => {
      try {
        modalContent.querySelector('#contact-search-spinner').style.display = 'block';
        
        const result = await window.BackgroundMessenger.searchContacts(query);
        
        modalContent.querySelector('#contact-search-spinner').style.display = 'none';
        
        if (result.success && result.contacts && result.contacts.length > 0) {
          displaySearchResults(result.contacts);
        } else {
          contactResults.innerHTML = `
            <div class="odoo-contact-no-results">
              No contacts found for "${query}"
              <button class="odoo-contact-create-new-btn" id="show-create-contact-search">+ Create New Contact</button>
            </div>
          `;
          contactResults.style.display = 'block';
          contactSuggestions.style.display = 'none';
          modalContent.querySelector('#show-create-contact-search')?.addEventListener('click', showQuickCreateForm);
        }
      } catch (error) {
        console.error('Error searching contacts:', error);
        modalContent.querySelector('#contact-search-spinner').style.display = 'none';
      }
    };

    const displaySearchResults = (contacts) => {
      let html = '';
      contacts.forEach(contact => {
        const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const details = [contact.phone, contact.email].filter(Boolean).join(' • ');
        html += `
          <div class="odoo-contact-item" data-contact-id="${contact.id}">
            <div class="odoo-contact-avatar">${initials}</div>
            <div class="odoo-contact-info">
              <div class="odoo-contact-name">${contact.name}</div>
              ${details ? `<div class="odoo-contact-details">${details}</div>` : ''}
            </div>
          </div>
        `;
      });
      
      contactResults.innerHTML = html;
      contactResults.style.display = 'block';
      contactSuggestions.style.display = 'none';
      
      contactResults.querySelectorAll('.odoo-contact-item').forEach(item => {
        item.addEventListener('click', () => {
          const contactId = parseInt(item.dataset.contactId);
          const contact = contacts.find(c => c.id === contactId);
          selectContact(contact);
        });
      });
    };

    const selectContact = (contact) => {
      selectedContact = contact;
      const details = [contact.phone, contact.email].filter(Boolean).join(' • ');
      modalContent.querySelector('#selected-contact-name').textContent = contact.name;
      modalContent.querySelector('#selected-contact-details').textContent = details;
      contactSelected.style.display = 'flex';
      contactSearchInput.disabled = true;
      contactSuggestions.style.display = 'none';
      contactResults.style.display = 'none';
      contactSearchInput.value = '';
      skipContactCheckbox.checked = false;
    };

    const showQuickCreateForm = () => {
      modalContent.querySelector('#new-contact-name').value = conversationData.contactName || '';
      modalContent.querySelector('#new-contact-phone').value = conversationData.contactNumber || '';
      quickCreateSection.style.display = 'block';
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
        
        saveBtn.textContent = 'Create Contact';
        saveBtn.disabled = false;
      } catch (error) {
        console.error('Error creating contact:', error);
        alert('Error creating contact: ' + error.message);
      }
    };

    // Load suggestions on open
    loadContactSuggestions();

    // Contact search
    contactSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      if (query.length < 2) {
        contactResults.style.display = 'none';
        contactSuggestions.style.display = 'block';
        return;
      }
      modalContent.querySelector('#contact-search-spinner').style.display = 'block';
      searchTimeout = setTimeout(() => searchContacts(query), 300);
    });

    clearContactBtn.addEventListener('click', () => {
      selectedContact = null;
      contactSelected.style.display = 'none';
      contactSearchInput.value = '';
      contactSearchInput.disabled = false;
      skipContactCheckbox.checked = false;
    });

    skipContactCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedContact = null;
        contactSelected.style.display = 'none';
        contactSearchInput.disabled = true;
        contactSuggestions.style.display = 'none';
        contactResults.style.display = 'none';
      } else {
        contactSearchInput.disabled = false;
        contactSuggestions.style.display = 'block';
      }
    });

    modalContent.querySelector('#cancel-create-contact').addEventListener('click', () => {
      quickCreateSection.style.display = 'none';
      contactSuggestions.style.display = 'block';
    });

    modalContent.querySelector('#save-new-contact').addEventListener('click', createNewContact);
    
    // Priority selection (same as before)
    let selectedPriority = '0';
    const priorityStars = modalContent.querySelectorAll('.priority-star');
    const priorityDescription = modalContent.querySelector('#priority-description');
    const updatePriorityDisplay = (priority) => {
      selectedPriority = priority;
      priorityStars.forEach((star) => {
        star.style.color = parseInt(star.dataset.priority) <= parseInt(priority) ? '#FFC107' : '#ccc';
      });
      const descriptions = {
        '0': 'No priority set',
        '1': 'Low priority - Normal handling (1 Star)',
        '2': 'Medium priority - Elevated attention (2 Stars)',
        '3': 'High priority - Urgent handling required (3 Stars)'
      };
      priorityDescription.textContent = descriptions[priority];
    };
    updatePriorityDisplay('0');
    priorityStars.forEach((star) => {
      star.addEventListener('click', (e) => {
        e.preventDefault();
        updatePriorityDisplay(star.dataset.priority === selectedPriority ? '0' : star.dataset.priority);
      });
    });
    
    // Title input handling (same as before)
    const titleInput = modalContent.querySelector('.odoo-title-input');
    const radioButtons = modalContent.querySelectorAll('input[name="titleOption"]');
    const createBtn = modalContent.querySelector('[data-action="create"]');
    const cancelBtn = modalContent.querySelector('[data-action="cancel"]');
    
    const updateTitleInput = () => {
      const selectedOption = modalContent.querySelector('input[name="titleOption"]:checked').value;
      if (selectedOption === 'custom') {
        titleInput.value = '';
        titleInput.disabled = false;
        titleInput.focus();
      } else {
        titleInput.value = `${messageStart}...`;
        titleInput.disabled = true;
      }
    };
    updateTitleInput();
    radioButtons.forEach(radio => radio.addEventListener('change', updateTitleInput));
    
    const validateTitle = () => {
      createBtn.disabled = !titleInput.value.trim() || titleInput.value.trim().length < 3;
    };
    titleInput.addEventListener('input', validateTitle);
    radioButtons.forEach(radio => radio.addEventListener('change', validateTitle));
    validateTitle();
    
    createBtn.addEventListener('click', () => {
      const title = titleInput.value.trim();
      if (title && title.length >= 3) {
        modal.remove();
        resolve({
          title: title,
          option: modalContent.querySelector('input[name="titleOption"]:checked').value,
          priority: selectedPriority,
          partner_id: selectedContact ? selectedContact.id : null,
          skipContact: skipContactCheckbox.checked
        });
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(null);
      }
    });
    
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