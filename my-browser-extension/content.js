// Enhanced content.js with one-click message ticket creation
class WhatsAppMessageTracker {
  constructor() {
    console.log('WhatsApp One-Click Ticket Creator Initialized');
    this.init();
  }

  init() {
    this.addCustomStyles();
    this.startMonitoring();
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
      
      /* Add a small indicator dot for processed messages */
      .odoo-processed::after {
        content: '●';
        position: absolute;
        top: 8px;
        right: 8px;
        width: 6px;
        height: 6px;
        background: #25D366;
        border-radius: 50%;
        font-size: 6px;
        opacity: 0.6;
        z-index: 10;
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
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        padding: 16px 20px;
        z-index: 10000;
        font-size: 14px;
        max-width: 350px;
        border-left: 4px solid #25D366;
        animation: slideInRight 0.3s ease-out;
      }
      
      .odoo-notification.error {
        border-left-color: #F44336;
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

  looksLikeMessage(element) {
    // This method is no longer used with the new detection
    return false;
  }

  addMessageActions(messageContainer) {
    // Skip if already has actions
    if (messageContainer.querySelector('.odoo-message-actions')) return;

    // Determine if this is an incoming message (customer) or outgoing (agent)
    const isOutgoing = messageContainer.querySelector('.message-out');
    const isIncoming = messageContainer.querySelector('.message-in');
    
    if (!isIncoming && !isOutgoing) return; // Not a valid message
    
    // For now, add buttons to both incoming and outgoing for testing
    // Later we can filter to only incoming messages
    
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

    // Create buttons
    const ticketBtn = this.createActionButton('🎫', 'Create Ticket', 'ticket', () => {
      this.createFromMessage(messageContainer, 'ticket');
    });

    const taskBtn = this.createActionButton('📝', 'Create Task', 'task', () => {
      this.createFromMessage(messageContainer, 'task');
    });

    const leadBtn = this.createActionButton('💼', 'Create Lead', 'lead', () => {
      this.createFromMessage(messageContainer, 'lead');
    });

    actionsContainer.appendChild(ticketBtn);
    actionsContainer.appendChild(taskBtn);
    actionsContainer.appendChild(leadBtn);

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

  async createFromMessage(messageElement, type) {
    const button = messageElement.querySelector(`.odoo-action-btn.${type}`);
    button.classList.add('creating');
    
    try {
      // Extract message data
      const messageData = this.extractMessageData(messageElement);
      const conversationData = this.extractConversationData();
      
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
    const ticketData = {
      contactName: conversationData.contactName,
      contactNumber: conversationData.contactNumber,
      summary: `WhatsApp: ${messageData.content.substring(0, 50)}...`,
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
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
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