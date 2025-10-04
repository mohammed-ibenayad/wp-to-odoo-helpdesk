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
    this.startMonitoring();
    this.addSelectionPanel();
  }


  addSelectionPanel() {
  const panel = document.createElement('div');
  panel.className = 'odoo-selection-panel';
  panel.id = 'odoo-selection-panel';
  
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
      <!-- NEW: AI Smart Button -->
  <button class="odoo-selection-btn ai-smart" id="odoo-ai-suggest" 
          style="grid-column: span 3; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    🤖 AI Smart Suggest
  </button>

      
      
      <!-- Manual buttons -->
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
  
  // Add event listeners
  document.getElementById('odoo-ai-suggest').addEventListener('click', () => {
    this.showAISuggestionModal();
  });
  
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
  const aiSuggestBtn = document.getElementById('odoo-ai-suggest'); // NEW
  aiSuggestBtn.disabled = count === 0;
  
  countElement.textContent = count === 0 ? 'No messages selected' : 
                             count === 1 ? '1 message selected' :
                             `${count} messages selected`;

  createTicketBtn.disabled = count === 0;
  createTaskBtn.disabled = count === 0;
  createLeadBtn.disabled = count === 0;
  aiSuggestBtn.disabled = count === 0; // NEW
    
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

    // REMOVED: aiDescription - not needed for manual creation

    // Show title modal for multi-message selection
    const titleData = await this.showTitleModal({
      content: combinedPreview,
      timestamp: messages[0].timestamp,
      type: 'multi',
      firstMessageContent: firstMessageContent,
      suggestedDescription: '' // Empty for manual creation
    }, conversationData, type);
    
    if (!titleData) {
      return; // User cancelled
    }

    // Use custom description if provided, otherwise use formatted messages
    const finalDescription = titleData.description || 
      window.MessageExtractor.formatMultipleMessages(messages, conversationData, type);
    
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
        description: finalDescription, // CHANGED - use finalDescription
        messages: messages,
        source: 'whatsapp_multiselect',
        priority: priority,
        partner_id: titleData.partner_id
      };
      result = await window.BackgroundMessenger.createTicket(ticketData);
    } else if (type === 'task') {
      const taskData = {
        name: titleData.title,
        description: finalDescription, // CHANGED - use finalDescription
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
        description: finalDescription, // CHANGED - use finalDescription
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
      this.clearSelection();
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

async createFromSelectionWithAIData(type, aiData, messages, conversationData) {
  try {
    const combinedPreview = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.content.substring(0, 100)}...`
    ).join('\n\n');

    // BUILD AI DESCRIPTION with reasoning - MOVED HERE
    const aiDescription = `AI ANALYSIS:
${aiData.reasoning}

CONVERSATION SUMMARY:
${window.MessageExtractor.formatMultipleMessages(messages, conversationData, type)}`;

    // Show title modal WITH AI-generated data pre-filled
    const titleData = await this.showTitleModal({
      content: combinedPreview,
      timestamp: messages[0].timestamp,
      type: 'multi',
      firstMessageContent: messages[0].content,
      aiSuggested: true,
      suggestedTitle: aiData.title,
      suggestedPriority: aiData.priority,
      suggestedDescription: aiDescription // NOW it's defined!
    }, conversationData, type);
    
    if (!titleData) {
      return;
    }
    
    // Use user's description if provided, otherwise use formatted messages
    const finalDescription = titleData.description || 
      window.MessageExtractor.formatMultipleMessages(messages, conversationData, type);

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
        description: finalDescription, // CHANGED - use finalDescription
        messages: messages,
        source: 'whatsapp_ai_edited',
        priority: priority,
        partner_id: titleData.partner_id
      };
      result = await window.BackgroundMessenger.createTicket(ticketData);
    } else if (type === 'task') {
      const taskData = {
        name: titleData.title,
        description: finalDescription, // CHANGED - use finalDescription
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
        description: finalDescription, // CHANGED - use finalDescription
        messages: messages,
        source_id: 'whatsapp',
        priority: priority,
        partner_id: titleData.partner_id
      };
      result = await window.BackgroundMessenger.createLead(leadData);
    }
    
    
    if (result.success) {
      const itemId = result.ticketId || result.taskId || result.leadId;
      window.NotificationManager.showSuccess(
        `🤖 AI-generated ${type} created successfully! ID: ${itemId}`
      );
      this.clearSelection();
    } else {
      window.NotificationManager.showError(`Error creating ${type}: ${result.error}`);
    }
  } catch (error) {
    window.NotificationManager.showError(`Error: ${error.message}`);
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
    
    // DETERMINE INITIAL VALUES (AI or Auto)
    const isAISuggested = messageData.aiSuggested || false;
    const initialTitle = messageData.suggestedTitle || '';
    const initialPriority = messageData.suggestedPriority || '0';
    
    // Debug log
    if (isAISuggested) {
      console.log('🤖 AI data loaded into modal:', {
        title: initialTitle,
        priority: initialPriority
      });
    }
    
    // NEW HTML STRUCTURE
    modalContent.innerHTML = `
      <div class="odoo-modal-header">
        <h3>Create ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        ${isAISuggested ? '<div style="font-size: 12px; color: #667eea; margin-top: 4px;">🤖 AI-suggested values loaded</div>' : ''}
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
                   value="${initialTitle}">
            <span class="odoo-char-counter" id="char-counter">${initialTitle.length}/100</span>
          </div>
        </div>
        
        <div class="odoo-modal-divider"></div>
        
        <!-- DESCRIPTION/NOTE SECTION -->
        <div class="odoo-modal-section">
          <label class="odoo-section-label">
            <span class="odoo-section-label-icon">📋</span>
            Description / Internal Note
          </label>
          
          <textarea 
            class="odoo-description-input" 
            id="description-input"
            placeholder="Add additional notes or context..."
            rows="6"
            maxlength="5000"
          >${messageData.suggestedDescription || ''}</textarea>
          
          <div style="display: flex; justify-content: space-between; margin-top: 6px;">
            <span style="font-size: 11px; color: #6c757d;">Optional: Add context that will be included in the ticket/task/lead</span>
            <span class="odoo-char-counter" id="description-char-counter">0/5000</span>
          </div>
        </div>

                <div class="odoo-modal-divider"></div>


        <!-- PRIORITY SECTION -->
        <div class="odoo-modal-section">
          <label class="odoo-section-label">
            Priority
          </label>
          
          <div class="odoo-priority-buttons">
            <button type="button" class="odoo-priority-btn priority-none ${initialPriority === '0' ? 'active' : ''}" data-priority="0">
              <span class="odoo-priority-stars-display">—</span>
              <span class="odoo-priority-label">None</span>
            </button>
            <button type="button" class="odoo-priority-btn priority-low ${initialPriority === '1' ? 'active' : ''}" data-priority="1">
              <span class="odoo-priority-stars-display">★</span>
              <span class="odoo-priority-label">Low</span>
            </button>
            <button type="button" class="odoo-priority-btn priority-medium ${initialPriority === '2' ? 'active' : ''}" data-priority="2">
              <span class="odoo-priority-stars-display">★★</span>
              <span class="odoo-priority-label">Medium</span>
            </button>
            <button type="button" class="odoo-priority-btn priority-high ${initialPriority === '3' ? 'active' : ''}" data-priority="3">
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
    
    // DECLARE VARIABLES AT TOP (MOVED HERE)
    let selectedContact = null;
    let contactMode = 'none';
    let searchTimeout = null;
    
    // ===== JAVASCRIPT HANDLERS =====
    
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
          if (!isAISuggested) {
            titleInput.value = '';
          }
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

    const descriptionInput = modalContent.querySelector('#description-input');
const descriptionCharCounter = modalContent.querySelector('#description-char-counter');

if (descriptionInput && descriptionCharCounter) {
  // Set initial counter
  descriptionCharCounter.textContent = `${descriptionInput.value.length}/5000`;
  
  descriptionInput.addEventListener('input', (e) => {
    const length = e.target.value.length;
    descriptionCharCounter.textContent = `${length}/5000`;
    
    descriptionCharCounter.classList.remove('warning', 'danger');
    if (length > 4000) descriptionCharCounter.classList.add('warning');
    if (length > 4800) descriptionCharCounter.classList.add('danger');
  });
}
    
    // 2. Priority Buttons Handler
    let selectedPriority = initialPriority;
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
        
        if (contactExpanded.classList.contains('show')) {
          contactExpanded.classList.remove('show');
          contactCollapsed.style.display = 'flex';
        }
      }
    });
    
    // 4. Load contact suggestions
    const loadContactSuggestions = async () => {
      try {
        contactSuggestions.style.display = 'block';
        contactSuggestions.innerHTML = '<div class="odoo-contact-loading">Loading suggestions...</div>';
        
        let result;
        
        if (conversationData.isGroup && conversationData.groupIdentifiers) {
          const names = Array.isArray(conversationData.groupIdentifiers.names) 
            ? conversationData.groupIdentifiers.names 
            : [];
          
          const phones = Array.isArray(conversationData.groupIdentifiers.phones)
            ? conversationData.groupIdentifiers.phones
            : [];
          
          console.log('🚀 BATCH searching group members in ONE request:', { names, phones });
          
          const batchResult = await window.BackgroundMessenger.batchSearchContacts(phones, names);
          
          console.log('🎯 Batch result:', batchResult);
          
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
          console.log('🔍 Single contact search:', {
            name: conversationData.contactName,
            phone: conversationData.contactNumber
          });
          result = await window.BackgroundMessenger.suggestContacts(
            conversationData.contactName,
            conversationData.contactNumber
          );
          
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
    const searchContacts = async (query) => {
      try {
        const spinner = modalContent.querySelector('#contact-search-spinner');
        if (spinner) spinner.style.display = 'block';
        
        const result = await window.BackgroundMessenger.searchContacts(query);
        
        if (spinner) spinner.style.display = 'none';
        
        console.log('Search result for query:', query, result);
        
        if (contactSuggestions) contactSuggestions.style.display = 'none';
        
        if (result.success && result.contacts && result.contacts.length > 0) {
          displaySearchResults(result.contacts);
        } else {
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
      const chipsContainer = modalContent.querySelector('#contact-chips-container');
      const chips = modalContent.querySelector('#contact-chips');
      
      if (contactSuggestions) contactSuggestions.style.display = 'none';
      if (contactResults) contactResults.style.display = 'none';
      if (quickCreateSection) quickCreateSection.style.display = 'none';
      
      if (!chipsContainer || !chips) {
        console.warn('⚠️ Chips container missing');
        return;
      }
      
      if (contacts.length === 0) {
        chipsContainer.innerHTML = `
          <div style="text-align: center; padding: 24px 16px; background: #f8f9fa; border-radius: 8px; margin: 8px 0;">
            <div style="font-size: 36px; margin-bottom: 12px;">😕</div>
            <p style="margin-bottom: 8px; font-size: 14px; color: #495057; font-weight: 500;">No contacts found</p>
            <p style="margin-bottom: 16px; font-size: 12px; color: #999;">Try a different search term</p>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
              <button class="odoo-contact-back-btn" id="back-to-suggestions" style="background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ← Back to Suggestions
              </button>
              <button class="odoo-contact-create-new-btn" id="show-create-contact-search" style="background: #007AFF; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;">
                ➕ Create New Contact
              </button>
            </div>
          </div>
        `;
        chipsContainer.style.display = 'block';
        
        const backBtn = modalContent.querySelector('#back-to-suggestions');
        backBtn?.addEventListener('click', () => {
          contactSearchInput.value = '';
          chipsContainer.style.display = 'none';
          loadContactSuggestions();
        });
        
        modalContent.querySelector('#show-create-contact-search')?.addEventListener('click', showQuickCreateForm);
        return;
      }
      
      let html = '<div style="margin-bottom: 8px; padding: 8px 12px; background: #e8f5e9; border-radius: 6px; border-left: 3px solid #25D366;"><p style="font-size: 12px; font-weight: 600; color: #1b5e20; margin: 0;">✨ Found ' + contacts.length + ' contact' + (contacts.length === 1 ? '' : 's') + '</p></div>';
      
      contacts.forEach(contact => {
        const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const details = [contact.phone, contact.email].filter(Boolean).join(' • ');
        html += `
          <div class="odoo-contact-chip" data-contact-id="${contact.id}">
            <div class="odoo-contact-chip-avatar">${initials}</div>
            <div style="flex: 1;">
              <div class="odoo-contact-chip-name">${contact.name}</div>
              ${details ? `<div style="font-size: 11px; color: #999; margin-top: 2px;">${details}</div>` : ''}
            </div>
          </div>
        `;
      });
      
      chips.innerHTML = html;
      chipsContainer.style.display = 'block';
      
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
    
    if (isAISuggested && initialTitle) {
      const length = initialTitle.length;
      charCounter.textContent = `${length}/100`;
      if (length > 80) charCounter.classList.add('warning');
      if (length > 95) charCounter.classList.add('danger');
    }
    
    // 10. Create and Cancel buttons
    const createBtn = modalContent.querySelector('[data-action="create"]');
    const cancelBtn = modalContent.querySelector('[data-action="cancel"]');
    
    createBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const description = descriptionInput ? descriptionInput.value.trim() : '';
  
  if (title && title.length >= 3) {
    modal.remove();
    resolve({
      title: title,
      description: description, // NEW
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


async showAISuggestionModal() {
  if (this.selectedMessages.size === 0) {
    window.NotificationManager.showError('Please select at least one message');
    return;
  }

  const conversationData = window.MessageExtractor.extractConversationData();
  
  const messages = Array.from(this.selectedMessages.values()).map(item => ({
    content: item.data.content,
    timestamp: item.data.timestamp,
    senderType: window.MessageExtractor.isIncomingMessage(item.container) ? 'customer' : 'agent'
  }));
  
  messages.sort((a, b) => a.timestamp - b.timestamp);
  
  // Show AI modal
  const aiModal = new window.AISuggestionModal(messages, conversationData);
  const result = await aiModal.show();
  
  if (result && result.create) {
    await this.createFromAISuggestion(result.type, result.data, messages, conversationData);
  } else if (result && result.editMode) {
    // Pass AI-generated data to the manual flow
    await this.createFromSelectionWithAIData(result.type, result.data, messages, conversationData);
  }
}
// Add method to create items from AI suggestions
async createFromAISuggestion(type, aiData, messages, conversationData) {
  try {
    let result;
    
    if (type === 'ticket') {
      const ticketData = {
        contactName: conversationData.contactName,
        contactNumber: conversationData.contactNumber,
        summary: aiData.title,
        description: window.MessageExtractor.formatMultipleMessages(messages, conversationData, 'ticket'),
        messages: messages,
        source: 'whatsapp_ai',
        priority: aiData.priority,
        partner_id: null
      };
      result = await window.BackgroundMessenger.createTicket(ticketData);
    } else if (type === 'task') {
      const taskData = {
        name: aiData.title,
        description: window.MessageExtractor.formatMultipleMessages(messages, conversationData, 'task'),
        partner_name: conversationData.contactName,
        messages: messages,
        date_deadline: window.MessageExtractor.calculateDeadline(messages[0].content),
        priority: aiData.priority,
        partner_id: null
      };
      result = await window.BackgroundMessenger.createTask(taskData);
    } else if (type === 'lead') {
      const leadData = {
        name: aiData.title,
        contact_name: conversationData.contactName,
        phone: conversationData.contactNumber,
        description: window.MessageExtractor.formatMultipleMessages(messages, conversationData, 'lead'),
        messages: messages,
        source_id: 'whatsapp',
        priority: aiData.priority,
        partner_id: null
      };
      result = await window.BackgroundMessenger.createLead(leadData);
    }
    
    if (result.success) {
      const itemId = result.ticketId || result.taskId || result.leadId;
      window.NotificationManager.showSuccess(
        `🤖 AI-generated ${type} created successfully! ID: ${itemId}`
      );
      this.clearSelection();
    } else {
      window.NotificationManager.showError(`Error creating ${type}: ${result.error}`);
    }
  } catch (error) {
    window.NotificationManager.showError(`Error: ${error.message}`);
  } finally {
    // Reset button state
    console.log('🔍 Finally block - resetting button for type:', type);
    const createBtn = document.getElementById(`odoo-create-${type}`);
    console.log('🔍 Button found:', createBtn);
    console.log('🔍 Selected messages size:', this.selectedMessages.size);
    
    if (createBtn) {
      createBtn.disabled = this.selectedMessages.size === 0;
      const icon = this.modernIcons[type];
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      createBtn.innerHTML = `${icon} ${capitalizedType}`;
      console.log('✅ Button reset to:', createBtn.innerHTML);
    } else {
      console.warn('⚠️ Button not found!');
    }
  }
}
}

// Initialize the tracker
const messageTracker = new WhatsAppMessageTracker();