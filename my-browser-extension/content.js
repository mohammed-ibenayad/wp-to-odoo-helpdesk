// Enhanced content.js with multi-message selection and custom title selection
class WhatsAppMessageTracker {
  constructor() {
    console.log('WhatsApp Multi-Message Ticket Creator Initialized');
    this.selectedMessages = new Map(); // Changed from Set to Map
    this.selectionMode = false;
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
      .odoo-message-actions {
        position: absolute;
        right: -50px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 5px;
        z-index: 1000;
        display: none !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0,0,0,0.1);
      }
      
      .odoo-selection-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        padding: 20px;
        z-index: 10001;
        min-width: 300px;
        max-width: 400px;
        border: 2px solid #25D366;
        display: none;
        animation: slideInRight 0.3s ease-out;
      }
      
      .odoo-selection-panel.active {
        display: block;
      }
      
      @keyframes slideInRight {
        0% { 
          transform: translateX(100%); 
          opacity: 0; 
        }
        100% { 
          transform: translateX(0); 
          opacity: 1; 
        }
      }
      
      .odoo-selection-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      }
      
      .odoo-selection-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }
      
      .odoo-selection-count {
        background: #25D366;
        color: white;
        border-radius: 12px;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .odoo-selection-messages {
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: 16px;
      }
      
      .odoo-selection-message {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 8px 12px;
        margin-bottom: 8px;
        border-left: 3px solid #25D366;
        font-size: 13px;
        line-height: 1.4;
      }
      
      .odoo-selection-message-time {
        font-size: 11px;
        color: #666;
        margin-top: 4px;
      }
      
      .odoo-selection-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .odoo-selection-btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 80px;
      }
      
      .odoo-selection-btn.primary {
        background: #25D366;
        color: white;
      }
      
      .odoo-selection-btn.primary:hover {
        background: #1ea952;
      }
      
      .odoo-selection-btn.secondary {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #e0e0e0;
      }
      
      .odoo-selection-btn.secondary:hover {
        background: #e9ecef;
      }
      
      .odoo-selection-btn.danger {
        background: #dc3545;
        color: white;
      }
      
      .odoo-selection-btn.danger:hover {
        background: #c82333;
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
      
      .odoo-selection-mode-active .odoo-message-actions {
        display: none !important;
      }
      
      .odoo-selection-mode-active .odoo-processed {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .odoo-selection-mode-active .odoo-processed:hover {
        background: rgba(37, 211, 102, 0.05);
        transform: scale(1.02);
      }
      
      .odoo-multiselect-btn {
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin: 0 2px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .odoo-multiselect-btn:hover {
        background: #0056b3;
        transform: translateY(-1px);
      }
      
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
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: modalSlideIn 0.3s ease-out;
      }
      
      @keyframes modalSlideIn {
        0% { 
          opacity: 0; 
          transform: scale(0.9) translateY(-20px); 
        }
        100% { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
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
      
      .odoo-action-btn {
        background: none;
        border: none;
        padding: 8px;
        margin: 0 2px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
      }
      
      .odoo-action-btn:hover {
        background: rgba(240, 240, 240, 0.8);
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      .odoo-action-btn.ticket {
        color: #25D366;
      }
      
      .odoo-action-btn.ticket:hover {
        background: rgba(37, 211, 102, 0.1);
      }
      
      .odoo-action-btn.task {
        color: #FF9500;
      }
      
      .odoo-action-btn.task:hover {
        background: rgba(255, 149, 0, 0.1);
      }
      
      .odoo-action-btn.lead {
        color: #007AFF;
      }
      
      .odoo-action-btn.lead:hover {
        background: rgba(0, 122, 255, 0.1);
      }
      
      .odoo-action-btn.creating {
        animation: pulse 1s infinite;
        pointer-events: none;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      /* Show buttons on hover of message containers */
      div[role="row"]:hover .odoo-message-actions,
      .copyable-text:hover .odoo-message-actions,
      ._ao3e.selectable-text.copyable-text:hover .odoo-message-actions {
        display: flex !important;
        animation: fadeInScale 0.2s ease-out;
      }
      
      @keyframes fadeInScale {
        0% { 
          opacity: 0; 
          transform: translateY(-50%) scale(0.8); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(-50%) scale(1); 
        }
      }
      
      .odoo-tooltip {
        position: absolute;
        bottom: 120%;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .odoo-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: #333;
      }
      
      .odoo-action-btn:hover .odoo-tooltip {
        opacity: 1;
      }

      /* Subtle debug styles - much less intrusive */
      .odoo-processed {
        position: relative;
      }
      
      .odoo-processed::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px solid rgba(37, 211, 102, 0.3);
        border-radius: 8px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .odoo-processed:hover::before {
        opacity: 1;
      }
      
      /* Mobile responsive adjustments */
      @media (max-width: 768px) {
        .odoo-message-actions {
          right: -40px;
          padding: 3px;
        }
        
        .odoo-action-btn {
          width: 32px;
          height: 32px;
          font-size: 14px;
          padding: 6px;
        }
        
        .odoo-selection-panel {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
      
      /* Success and error states */
      .odoo-action-btn.success {
        background: rgba(76, 175, 80, 0.2) !important;
        color: #4CAF50 !important;
      }
      
      .odoo-action-btn.error {
        background: rgba(244, 67, 54, 0.2) !important;
        color: #F44336 !important;
      }
      
      /* Notification styles */
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
        0% { 
          transform: translateX(-100%); 
          opacity: 0; 
        }
        100% { 
          transform: translateX(0); 
          opacity: 1; 
        }
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
    `;
    document.head.appendChild(style);
  }

  addSelectionPanel() {
    const panel = document.createElement('div');
    panel.className = 'odoo-selection-panel';
    panel.id = 'odoo-selection-panel';
    
    panel.innerHTML = `
      <div class="odoo-selection-header">
        <h3 class="odoo-selection-title">Selected Messages</h3>
        <span class="odoo-selection-count">0</span>
      </div>
      
      <div class="odoo-selection-messages" id="odoo-selected-messages">
        <p style="text-align: center; color: #666; font-size: 13px; margin: 20px 0;">
          Click messages to select them for the ticket
        </p>
      </div>
      
      <div class="odoo-selection-actions">
        <button class="odoo-selection-btn primary" id="odoo-create-ticket" disabled>
          🎫 Create Ticket
        </button>
        <button class="odoo-selection-btn secondary" id="odoo-clear-selection">
          Clear All
        </button>
        <button class="odoo-selection-btn danger" id="odoo-exit-selection">
          Exit Selection
        </button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Bind panel events
    document.getElementById('odoo-create-ticket').addEventListener('click', () => {
      this.createTicketFromSelection();
    });
    
    document.getElementById('odoo-clear-selection').addEventListener('click', () => {
      this.clearSelection();
    });
    
    document.getElementById('odoo-exit-selection').addEventListener('click', () => {
      this.exitSelectionMode();
    });
  }

  startMonitoring() {
    // Monitor for new messages and conversation changes
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

    // Initial processing
    setTimeout(() => this.processNewMessages(), 2000);
  }

  processNewMessages() {
    // Look specifically for WhatsApp message containers based on the actual structure
    const messageContainers = document.querySelectorAll('div[role="row"]:not(.odoo-processed)');
    
    let processedCount = 0;
    
    messageContainers.forEach((container) => {
      // Check if this container actually contains a message
      if (this.isMessageContainer(container)) {
        this.addMessageActions(container);
        container.classList.add('odoo-processed');
        processedCount++;
        
        // Add selection click handler
        container.addEventListener('click', (e) => {
          if (this.selectionMode) {
            e.stopPropagation();
            this.toggleMessageSelection(container);
          }
        });
      }
    });
    
    console.log(`Processed ${processedCount} message containers`);
  }

  isMessageContainer(container) {
    // Check for the specific message structure we see in WhatsApp
    const hasMessageClass = container.querySelector('.message-in, .message-out');
    const hasCopyableText = container.querySelector('.copyable-text');
    const hasMessageContent = container.querySelector('._ao3e.selectable-text.copyable-text');
    
    // Must have both message class and copyable text to be a real message
    return hasMessageClass && (hasCopyableText || hasMessageContent);
  }

  addMessageActions(messageContainer) {
    // Skip if already has actions
    if (messageContainer.querySelector('.odoo-message-actions')) return;

    // Determine if this is an incoming message (customer) or outgoing (agent)
    const isOutgoing = messageContainer.querySelector('.message-out');
    const isIncoming = messageContainer.querySelector('.message-in');
    
    if (!isIncoming && !isOutgoing) return; // Not a valid message
    
    console.log('Processing message:', isIncoming ? 'INCOMING' : 'OUTGOING');
    
    // Find the message content area to position buttons relative to it
    const messageContent = messageContainer.querySelector('.copyable-text') || 
                          messageContainer.querySelector('._ao3e.selectable-text.copyable-text');
    
    if (!messageContent) {
      console.log('No message content found, skipping');
      return;
    }

    // Create action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'odoo-message-actions';

    // Create single message buttons
    const ticketBtn = this.createActionButton('🎫', 'Create Ticket', 'ticket', () => {
      this.createFromMessage(messageContainer, 'ticket');
    });

    const taskBtn = this.createActionButton('📝', 'Create Task', 'task', () => {
      this.createFromMessage(messageContainer, 'task');
    });

    const leadBtn = this.createActionButton('💼', 'Create Lead', 'lead', () => {
      this.createFromMessage(messageContainer, 'lead');
    });

    // Create multi-select button
    const multiSelectBtn = document.createElement('button');
    multiSelectBtn.className = 'odoo-multiselect-btn';
    multiSelectBtn.innerHTML = '📋 Multi-Select';
    multiSelectBtn.onclick = () => {
      this.enterSelectionMode();
    };

    actionsContainer.appendChild(ticketBtn);
    actionsContainer.appendChild(taskBtn);
    actionsContainer.appendChild(leadBtn);
    actionsContainer.appendChild(multiSelectBtn);

    // Position the container relative to the message content
    messageContent.style.position = 'relative';
    messageContent.appendChild(actionsContainer);
    
    console.log('Added action buttons to message');
  }

  createActionButton(icon, tooltip, type, clickHandler) {
    const button = document.createElement('button');
    button.className = `odoo-action-btn ${type}`;
    button.innerHTML = `
      ${icon}
      <div class="odoo-tooltip">${tooltip}</div>
    `;
    button.onclick = clickHandler;
    return button;
  }

  enterSelectionMode() {
    this.selectionMode = true;
    this.selectedMessages.clear();
    
    // Add visual indicators
    document.body.classList.add('odoo-selection-mode-active');
    document.getElementById('odoo-selection-panel').classList.add('active');
    
    this.showNotification('Selection mode activated! Click messages to select them.', 'success');
    this.updateSelectionPanel();
  }

  exitSelectionMode() {
    this.selectionMode = false;
    this.selectedMessages.clear();
    
    // Remove visual indicators
    document.body.classList.remove('odoo-selection-mode-active');
    document.getElementById('odoo-selection-panel').classList.remove('active');
    
    // Clear selection visuals
    document.querySelectorAll('.odoo-message-selected').forEach(msg => {
      msg.classList.remove('odoo-message-selected');
    });
    
    this.showNotification('Selection mode deactivated.', 'success');
  }

  toggleMessageSelection(messageContainer) {
    const messageId = this.getMessageId(messageContainer);
    
    if (this.selectedMessages.has(messageId)) {
      this.selectedMessages.delete(messageId);
      messageContainer.classList.remove('odoo-message-selected');
    } else {
      const messageData = this.extractMessageData(messageContainer);
      this.selectedMessages.set(messageId, {
        container: messageContainer,
        data: messageData
      });
      messageContainer.classList.add('odoo-message-selected');
    }
    
    this.updateSelectionPanel();
  }

  getMessageId(messageContainer) {
    // Create a unique ID for the message based on its content and position
    const messageText = this.extractMessageData(messageContainer).content;
    const timestamp = this.extractMessageData(messageContainer).timestamp;
    return btoa(messageText.substring(0, 50) + timestamp.getTime()).replace(/[^a-zA-Z0-9]/g, '');
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
    const createBtn = document.getElementById('odoo-create-ticket');
    
    countElement.textContent = count;
    createBtn.disabled = count === 0;
    
    if (count === 0) {
      messagesContainer.innerHTML = `
        <p style="text-align: center; color: #666; font-size: 13px; margin: 20px 0;">
          Click messages to select them for the ticket
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
    if (this.selectedMessages.size === 0) return;
    
    try {
      // Get conversation data
      const conversationData = this.extractConversationData();
      
      // Combine all selected messages
      const messages = Array.from(this.selectedMessages.values()).map(item => ({
        content: item.data.content,
        timestamp: item.data.timestamp,
        senderType: this.isIncomingMessage(item.container) ? 'customer' : 'agent'
      }));
      
      // Sort messages by timestamp
      messages.sort((a, b) => a.timestamp - b.timestamp);
      
      // Create combined message preview for title modal
      const combinedPreview = messages.map(msg => 
        `[${msg.timestamp.toLocaleTimeString()}] ${msg.content.substring(0, 100)}...`
      ).join('\n\n');
      
      // Show title selection modal
      const titleData = await this.showTitleModal({
        content: combinedPreview,
        timestamp: messages[0].timestamp,
        type: 'multi'
      }, conversationData);
      
      if (!titleData) {
        return; // User cancelled
      }
      
      // Get Odoo config
      const config = await this.getOdooConfig();
      if (!config.url || !config.apiKey) {
        alert('Please configure Odoo connection first');
        return;
      }
      
      // Create ticket with multiple messages
      const ticketData = {
        contactName: conversationData.contactName,
        contactNumber: conversationData.contactNumber,
        summary: titleData.title,
        description: this.formatMultipleMessages(messages, conversationData),
        messages: messages,
        source: 'whatsapp_multiselect',
        priority: this.detectPriorityFromMultiple(messages)
      };
      
      // Disable create button during processing
      const createBtn = document.getElementById('odoo-create-ticket');
      createBtn.disabled = true;
      createBtn.textContent = 'Creating...';
      
      const result = await this.sendToBackground({
        action: 'createTicket',
        config: config,
        conversationData: ticketData
      });
      
      if (result.success) {
        this.showNotification(`Ticket created successfully with ${messages.length} messages! ID: ${result.ticketId}`, 'success');
        this.exitSelectionMode();
      } else {
        this.showNotification(`Error creating ticket: ${result.error}`, 'error');
      }
      
    } catch (error) {
      this.showNotification(`Error: ${error.message}`, 'error');
    } finally {
      // Re-enable create button
      const createBtn = document.getElementById('odoo-create-ticket');
      createBtn.disabled = this.selectedMessages.size === 0;
      createBtn.textContent = '🎫 Create Ticket';
    }
  }

  formatMultipleMessages(messages, conversationData) {
    let description = `Multi-message ticket created from WhatsApp conversation with ${conversationData.contactName}\n\n`;
    description += `=== CONVERSATION HISTORY (${messages.length} messages) ===\n\n`;
    
    messages.forEach((msg, index) => {
      const senderLabel = msg.senderType === 'customer' ? '👤 Customer' : '👨‍💼 Agent';
      const timestamp = msg.timestamp.toLocaleString();
      description += `${index + 1}. ${senderLabel} (${timestamp}):\n${msg.content}\n\n`;
    });
    
    description += `=== END CONVERSATION ===\n\n`;
    description += `Created from WhatsApp Web on ${new Date().toLocaleString()}`;
    
    return description;
  }

  detectPriorityFromMultiple(messages) {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'critical', 'help'];
    
    // Check if any message contains urgent keywords
    const hasUrgentMessage = messages.some(msg => 
      urgentKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    );
    
    return hasUrgentMessage ? '3' : '1'; // High priority if urgent, normal otherwise
  }

  isIncomingMessage(messageContainer) {
    return !!messageContainer.querySelector('.message-in');
  }

  async createFromMessage(messageElement, type) {
    const button = messageElement.querySelector(`.odoo-action-btn.${type}`);
    
    try {
      // Extract message data
      const messageData = this.extractMessageData(messageElement);
      const conversationData = this.extractConversationData();
      
      // Show title selection modal for tickets
      if (type === 'ticket') {
        const titleData = await this.showTitleModal(messageData, conversationData);
        if (!titleData) {
          return; // User cancelled
        }
        messageData.customTitle = titleData.title;
        messageData.titleOption = titleData.option;
      }
      
      button.classList.add('creating');
      
      // Get Odoo config
      const config = await this.getOdooConfig();
      if (!config.url || !config.apiKey) {
        alert('Please configure Odoo connection first');
        return;
      }

      // Create the item based on type
      let result;
      switch (type) {
        case 'ticket':
          result = await this.createTicket(messageData, conversationData, config);
          break;
        case 'task':
          result = await this.createTask(messageData, conversationData, config);
          break;
        case 'lead':
          result = await this.createLead(messageData, conversationData, config);
          break;
      }

      if (result.success) {
        this.showSuccess(button, type, result);
      } else {
        this.showError(button, result.error);
      }

    } catch (error) {
      this.showError(button, error.message);
    } finally {
      button.classList.remove('creating');
    }
  }

  extractMessageData(messageContainer) {
    // Extract message content from the actual WhatsApp structure
    const messageTextElement = messageContainer.querySelector('._ao3e.selectable-text.copyable-text span') ||
                              messageContainer.querySelector('.copyable-text ._ao3e') ||
                              messageContainer.querySelector('.selectable-text');
    
    const messageText = messageTextElement?.textContent?.trim() || '';
    
    // Extract timestamp from WhatsApp's time display
    const timeElements = messageContainer.querySelectorAll('.x1c4vz4f.x2lah0s');
    let timestamp = new Date();
    
    // Look for time in format like "9:47 am"
    for (const timeEl of timeElements) {
      const timeText = timeEl.textContent?.trim();
      if (timeText && timeText.match(/\d{1,2}:\d{2}\s*(am|pm)/i)) {
        timestamp = this.parseWhatsAppTime(timeText);
        break;
      }
    }
    
    // Detect message type
    const hasImage = messageContainer.querySelector('img[alt]');
    const hasDocument = messageContainer.querySelector('[data-icon]');
    const hasQuote = messageContainer.querySelector('._aju2'); // Quoted message
    
    let type = 'text';
    if (hasImage) type = 'image';
    else if (hasDocument) type = 'document';
    else if (hasQuote) type = 'quote';
    
    console.log('Extracted message data:', {
      content: messageText.substring(0, 50) + '...',
      timestamp: timestamp,
      type: type
    });
    
    return {
      content: messageText,
      timestamp: timestamp,
      type: type,
      element: messageContainer
    };
  }

  extractConversationData() {
    // Extract contact information from the actual WhatsApp Web structure
    let contactName = 'Unknown Contact';
    
    // Try multiple selectors for contact name
    const nameSelectors = [
      '[data-testid="conversation-header"] span[title]',
      'header span[title]',
      '.x1iyjqo2.x6ikm8r.x10wlt62 span',
      'h1 span'
    ];
    
    for (const selector of nameSelectors) {
      const nameElement = document.querySelector(selector);
      if (nameElement && nameElement.textContent?.trim()) {
        contactName = nameElement.textContent.trim();
        break;
      }
    }
    
    // Try to extract phone number from URL or other sources
    const contactNumber = this.extractPhoneNumber();
    
    console.log('Extracted conversation data:', {
      contactName: contactName,
      contactNumber: contactNumber
    });
    
    return {
      contactName: contactName,
      contactNumber: contactNumber,
      chatUrl: window.location.href
    };
  }

  extractPhoneNumber() {
    // WhatsApp Web doesn't easily expose phone numbers
    // Try to extract from URL or other sources
    const url = window.location.href;
    const phoneMatch = url.match(/\/(\d+)@/);
    return phoneMatch ? `+${phoneMatch[1]}` : null;
  }

  async createTicket(messageData, conversationData, config) {
    // Use custom title if provided, otherwise use default logic
    let ticketTitle;
    if (messageData.customTitle) {
      ticketTitle = messageData.customTitle;
    } else {
      ticketTitle = `WhatsApp: ${messageData.content.substring(0, 50)}...`;
    }

    const ticketData = {
      contactName: conversationData.contactName,
      contactNumber: conversationData.contactNumber,
      summary: ticketTitle,
      description: `Original message: "${messageData.content}"\n\nSent at: ${messageData.timestamp}\nFrom: ${conversationData.contactName}`,
      messages: [{
        content: messageData.content,
        timestamp: messageData.timestamp,
        senderType: 'customer'
      }],
      source: 'whatsapp_message',
      priority: this.detectPriority(messageData.content)
    };

    return await this.sendToBackground({
      action: 'createTicket',
      config: config,
      conversationData: ticketData
    });
  }

  async createTask(messageData, conversationData, config) {
    const taskData = {
      name: `WhatsApp Task: ${messageData.content.substring(0, 30)}...`,
      description: `Task created from WhatsApp message:\n"${messageData.content}"\n\nFrom: ${conversationData.contactName}\nAt: ${messageData.timestamp}`,
      partner_name: conversationData.contactName,
      date_deadline: this.calculateDeadline(messageData.content),
      priority: this.detectPriority(messageData.content)
    };

    return await this.sendToBackground({
      action: 'createTask',
      config: config,
      taskData: taskData
    });
  }

  async createLead(messageData, conversationData, config) {
    const leadData = {
      name: `WhatsApp Lead: ${conversationData.contactName}`,
      contact_name: conversationData.contactName,
      phone: conversationData.contactNumber,
      description: `Lead from WhatsApp message:\n"${messageData.content}"\n\nReceived: ${messageData.timestamp}`,
      source_id: 'whatsapp',
      priority: this.detectLeadPriority(messageData.content)
    };

    return await this.sendToBackground({
      action: 'createLead',
      config: config,
      leadData: leadData
    });
  }

  detectPriority(messageContent) {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately', 'critical', 'help'];
    const content = messageContent.toLowerCase();
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return '3'; // High priority
    }
    return '1'; // Normal priority
  }

  detectLeadPriority(messageContent) {
    const buyingKeywords = ['buy', 'purchase', 'price', 'cost', 'quote', 'interested'];
    const content = messageContent.toLowerCase();
    
    if (buyingKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    return 'medium';
  }

  calculateDeadline(messageContent) {
    // Simple deadline detection
    const content = messageContent.toLowerCase();
    if (content.includes('urgent') || content.includes('asap')) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    } else if (content.includes('this week')) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Next week
    }
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days default
  }

  async showTitleModal(messageData, conversationData) {
    return new Promise((resolve) => {
      // Create modal overlay
      const modal = document.createElement('div');
      modal.className = 'odoo-title-modal';
      
      // Create modal content
      const modalContent = document.createElement('div');
      modalContent.className = 'odoo-title-modal-content';
      
      // Handle multi-message vs single message display
      let displayMessage, messageStart, modalTitle;
      
      if (messageData.type === 'multi') {
        modalTitle = 'Create Multi-Message Ticket Title';
        displayMessage = messageData.content.length > 200 
          ? messageData.content.substring(0, 200) + '...' 
          : messageData.content;
        messageStart = `Conversation with ${conversationData.contactName}`;
      } else {
        modalTitle = 'Create Ticket Title';
        displayMessage = messageData.content.length > 100 
          ? messageData.content.substring(0, 100) + '...' 
          : messageData.content;
        messageStart = messageData.content.substring(0, 30);
      }
      
      const contactName = conversationData.contactName || 'Unknown Contact';
      
      modalContent.innerHTML = `
        <h3>${modalTitle}</h3>
        
        <div class="odoo-title-modal-message">
          <strong>${messageData.type === 'multi' ? 'Selected Messages:' : 'Message:'}</strong> "${displayMessage}"
        </div>
        
        <div class="odoo-title-options">
          <div class="odoo-title-option">
            <input type="radio" id="title-option-1" name="titleOption" value="custom" checked>
            <label for="title-option-1">Write custom title</label>
          </div>
          <div class="odoo-title-option">
            <input type="radio" id="title-option-2" name="titleOption" value="message-start">
            <label for="title-option-2">${messageData.type === 'multi' ? 'Use conversation context' : 'Use message start'}: "${messageStart}..."</label>
          </div>
          <div class="odoo-title-option">
            <input type="radio" id="title-option-3" name="titleOption" value="contact-based">
            <label for="title-option-3">Contact-based: "Support request from ${contactName}"</label>
          </div>
          <div class="odoo-title-option">
            <input type="radio" id="title-option-4" name="titleOption" value="auto">
            <label for="title-option-4">Auto-generate: "WhatsApp: ${messageStart}..."</label>
          </div>
        </div>
        
        <input type="text" 
               class="odoo-title-input" 
               placeholder="Enter custom ticket title..." 
               maxlength="100"
               value="">
        
        <div class="odoo-title-buttons">
          <button class="odoo-title-btn secondary" data-action="cancel">Cancel</button>
          <button class="odoo-title-btn primary" data-action="create">Create Ticket</button>
        </div>
      `;
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Get elements
      const titleInput = modalContent.querySelector('.odoo-title-input');
      const radioButtons = modalContent.querySelectorAll('input[name="titleOption"]');
      const createBtn = modalContent.querySelector('[data-action="create"]');
      const cancelBtn = modalContent.querySelector('[data-action="cancel"]');
      
      // Update input based on radio selection
      const updateTitleInput = () => {
        const selectedOption = modalContent.querySelector('input[name="titleOption"]:checked').value;
        
        switch (selectedOption) {
          case 'custom':
            titleInput.value = '';
            titleInput.disabled = false;
            titleInput.focus();
            break;
          case 'message-start':
            titleInput.value = `${messageStart}...`;
            titleInput.disabled = true;
            break;
          case 'contact-based':
            titleInput.value = `Support request from ${contactName}`;
            titleInput.disabled = true;
            break;
          case 'auto':
            titleInput.value = `WhatsApp: ${messageStart}...`;
            titleInput.disabled = true;
            break;
        }
      };
      
      // Initial setup
      updateTitleInput();
      
      // Event listeners
      radioButtons.forEach(radio => {
        radio.addEventListener('change', updateTitleInput);
      });
      
      // Validate and enable/disable create button
      const validateTitle = () => {
        const title = titleInput.value.trim();
        createBtn.disabled = !title || title.length < 3;
      };
      
      titleInput.addEventListener('input', validateTitle);
      radioButtons.forEach(radio => {
        radio.addEventListener('change', validateTitle);
      });
      
      // Initial validation
      validateTitle();
      
      // Button handlers
      createBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const selectedOption = modalContent.querySelector('input[name="titleOption"]:checked').value;
        
        if (title && title.length >= 3) {
          modal.remove();
          resolve({
            title: title,
            option: selectedOption
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
      
      // Keyboard shortcuts
      document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
          modal.remove();
          document.removeEventListener('keydown', escapeHandler);
          resolve(null);
        } else if (e.key === 'Enter' && e.ctrlKey) {
          createBtn.click();
          document.removeEventListener('keydown', escapeHandler);
        }
      });
    });
  }

  showSuccess(button, type, result) {
    const originalIcon = button.innerHTML;
    button.innerHTML = '✅';
    button.classList.add('success');
    
    // Show enhanced notification
    const itemName = type.charAt(0).toUpperCase() + type.slice(1);
    const itemId = result.ticketId || result.taskId || result.leadId;
    this.showNotification(`${itemName} created successfully! ID: ${itemId}`, 'success');
    
    // Reset button after 3 seconds
    setTimeout(() => {
      button.innerHTML = originalIcon;
      button.classList.remove('success');
    }, 3000);
  }

  showError(button, error) {
    const originalIcon = button.innerHTML;
    button.innerHTML = '❌';
    button.classList.add('error');
    
    this.showNotification(`Error: ${error}`, 'error');
    
    setTimeout(() => {
      button.innerHTML = originalIcon;
      button.classList.remove('error');
    }, 3000);
  }

  showNotification(message, type) {
    // Create enhanced notification
    const notification = document.createElement('div');
    notification.className = `odoo-notification ${type}`;
    
    const title = type === 'success' ? '✅ Success!' : '❌ Error';
    
    notification.innerHTML = `
      <div class="odoo-notification-title">${title}</div>
      <div class="odoo-notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  parseWhatsAppTime(timeString) {
    // Parse WhatsApp timestamp (e.g., "2:30 PM")
    const now = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const messageTime = new Date(now);
    messageTime.setHours(hour, parseInt(minutes), 0, 0);
    
    return messageTime;
  }

  async getOdooConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['odooConfig'], (result) => {
        resolve(result.odooConfig || {});
      });
    });
  }

  async sendToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize the tracker
const messageTracker = new WhatsAppMessageTracker();