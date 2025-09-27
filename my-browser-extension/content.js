// Enhanced content.js with full multi-message selection and custom title selection for all types
class WhatsAppMessageTracker {
  // START: New Priority System Mappings
  taskPriorityMap = {
    '0': '0',  // No priority -> Odoo Task Normal
    '1': '0',  // Low priority -> Odoo Task Normal
    '2': '1',  // Medium priority -> Odoo Task High
    '3': '1'   // High priority -> Odoo Task High
  };

  leadPriorityMap = {
    '0': 'low',
    '1': 'low',
    '2': 'medium',
    '3': 'high'
  };
  // END: New Priority System Mappings

  constructor() {
    console.log('WhatsApp Multi-Message Creator Initialized - Full Version');
    this.selectedMessages = new Map();
    this.selectionMode = false;
    // Modern SVG icon definitions
    this.modernIcons = {
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
      </svg>`
    };
    this.init();
  }

  init() {
    this.addCustomStyles();
    this.startMonitoring();
    this.addSelectionPanel();
  }

  addCustomStyles() {
    const style = document.createElement('style');
    const modernSVGStyles = `
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
      
      .odoo-action-btn .odoo-icon-svg {
        width: 20px;
        height: 20px;
      }
      
      .odoo-selection-btn .odoo-icon-svg {
        width: 16px;
        height: 16px;
        margin-right: 6px;
      }
    `;

    style.textContent = `
      ${modernSVGStyles}
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
        min-width: 350px;
        max-width: 450px;
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
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }
      
      .odoo-selection-actions .odoo-selection-btn.danger {
        grid-column: span 3;
        margin-top: 8px;
      }
      
      .odoo-selection-btn {
        padding: 10px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
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
        
        .odoo-selection-actions {
          grid-template-columns: 1fr;
          gap: 6px;
        }
        
        .odoo-selection-actions .odoo-selection-btn.danger {
          grid-column: span 1;
        }
      }
      
      .odoo-action-btn.success {
        background: rgba(76, 175, 80, 0.2) !important;
        color: #4CAF50 !important;
      }
      
      .odoo-action-btn.error {
        background: rgba(244, 67, 54, 0.2) !important;
        color: #F44336 !important;
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
      
      /* START: New Priority Selection CSS */
      .odoo-priority-section {
        margin: 16px 0;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }
      
      .odoo-priority-label {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
      
      .odoo-priority-label .odoo-icon-svg {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        stroke: #666;
      }
      
      .odoo-priority-stars {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
      }
      
      .priority-star {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-radius: 4px;
      }
      
      .priority-star svg {
        width: 24px;
        height: 24px;
        stroke: #ddd;
        fill: none;
        transition: all 0.2s ease;
      }
      
      .priority-star:hover svg {
        stroke: #ffd700;
        transform: scale(1.1);
      }
      
      .priority-star.active svg {
        stroke: #ffd700;
        fill: #ffd700;
      }
      
      .priority-star.active:hover svg {
        stroke: #ffed4a;
        fill: #ffed4a;
      }
      
      .odoo-priority-description {
        font-size: 12px;
        color: #666;
        text-align: center;
        font-style: italic;
      }
      
      .priority-level-0 { color: #999; }
      .priority-level-1 { color: #28a745; }
      .priority-level-2 { color: #ffc107; }
      .priority-level-3 { color: #dc3545; }
      /* END: New Priority Selection CSS */
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
          Click messages to select them for creation
        </p>
      </div>
      
      <div class="odoo-selection-actions">
        <button class="odoo-selection-btn ticket" id="odoo-create-ticket" disabled>
          ${this.modernIcons.ticket} Create Ticket
        </button>
        <button class="odoo-selection-btn task" id="odoo-create-task" disabled>
          ${this.modernIcons.task} Create Task
        </button>
        <button class="odoo-selection-btn lead" id="odoo-create-lead" disabled>
          ${this.modernIcons.lead} Create Lead
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
    
    document.getElementById('odoo-create-task').addEventListener('click', () => {
      this.createTaskFromSelection();
    });
    
    document.getElementById('odoo-create-lead').addEventListener('click', () => {
      this.createLeadFromSelection();
    });
    document.getElementById('odoo-clear-selection').addEventListener('click', () => {
      this.clearSelection();
    });
    document.getElementById('odoo-exit-selection').addEventListener('click', () => {
      this.exitSelectionMode();
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
    observer.observe(document.body, { childList: true, subtree: true });
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
    const hasMessageClass = container.querySelector('.message-in, .message-out');
    const hasCopyableText = container.querySelector('.copyable-text');
    const hasMessageContent = container.querySelector('._ao3e.selectable-text.copyable-text');
    return hasMessageClass && (hasCopyableText || hasMessageContent);
  }

  addMessageActions(messageContainer) {
    if (messageContainer.querySelector('.odoo-message-actions')) return;
    const isOutgoing = messageContainer.querySelector('.message-out');
    const isIncoming = messageContainer.querySelector('.message-in');
    if (!isIncoming && !isOutgoing) return;
    console.log('Processing message:', isIncoming ? 'INCOMING' : 'OUTGOING');
    const messageContent = messageContainer.querySelector('.copyable-text') || messageContainer.querySelector('._ao3e.selectable-text.copyable-text');
    if (!messageContent) {
      console.log('No message content found, skipping');
      return;
    }
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'odoo-message-actions';
    
    const ticketBtn = this.createActionButton('ticket', 'Create Ticket', 'ticket', () => {
      this.createFromMessage(messageContainer, 'ticket');
    });
    const taskBtn = this.createActionButton('task', 'Create Task', 'task', () => {
      this.createFromMessage(messageContainer, 'task');
    });
    const leadBtn = this.createActionButton('lead', 'Create Lead', 'lead', () => {
      this.createFromMessage(messageContainer, 'lead');
    });
    
    const multiSelectBtn = document.createElement('button');
    multiSelectBtn.className = 'odoo-multiselect-btn';
    multiSelectBtn.innerHTML = `${this.modernIcons.multiSelect} Multi-Select`;
    multiSelectBtn.onclick = () => {
      this.enterSelectionMode();
    };
    
    actionsContainer.appendChild(ticketBtn);
    actionsContainer.appendChild(taskBtn);
    actionsContainer.appendChild(leadBtn);
    actionsContainer.appendChild(multiSelectBtn);

    messageContent.style.position = 'relative';
    messageContent.appendChild(actionsContainer);
    console.log('Added action buttons to message');
  }

  createActionButton(iconType, tooltip, type, clickHandler) {
    const button = document.createElement('button');
    button.className = `odoo-action-btn ${type}`;
    // Use the modern SVG icon based on the type
    const iconSVG = this.modernIcons[iconType];
    button.innerHTML = `
      ${iconSVG}
      <div class="odoo-tooltip">${tooltip}</div>
    `;
    button.onclick = clickHandler;
    return button;
  }

  enterSelectionMode() {
    this.selectionMode = true;
    this.selectedMessages.clear();
    document.body.classList.add('odoo-selection-mode-active');
    document.getElementById('odoo-selection-panel').classList.add('active');
    this.showNotification('Selection mode activated! Click messages to select them.', 'success');
    this.updateSelectionPanel();
  }

  exitSelectionMode() {
    this.selectionMode = false;
    this.selectedMessages.clear();
    document.body.classList.remove('odoo-selection-mode-active');
    document.getElementById('odoo-selection-panel').classList.remove('active');
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
      this.selectedMessages.set(messageId, { container: messageContainer, data: messageData });
      messageContainer.classList.add('odoo-message-selected');
    }
    this.updateSelectionPanel();
  }

  getMessageId(messageContainer) {
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
    const createTicketBtn = document.getElementById('odoo-create-ticket');
    const createTaskBtn = document.getElementById('odoo-create-task');
    const createLeadBtn = document.getElementById('odoo-create-lead');

    countElement.textContent = count;
    createTicketBtn.disabled = count === 0;
    createTaskBtn.disabled = count === 0;
    createLeadBtn.disabled = count === 0;

    if (count === 0) {
      messagesContainer.innerHTML = `
        <p style="text-align: center; color: #666; font-size: 13px; margin: 20px 0;">
          Click messages to select them for creation
        </p>
      `;
    } else {
      const messagesHtml = Array.from(this.selectedMessages.values())
        .map(item => {
          const truncatedContent = item.data.content.length > 80 ? item.data.content.substring(0, 80) + '...' : item.data.content;
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

  // START: Updated showTitleModal function
  async showTitleModal(messageData, conversationData, type = 'ticket') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'odoo-title-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'odoo-title-modal-content';
    
    let displayMessage, messageStart, modalTitle;
    
    if (messageData.type === 'multi') {
      modalTitle = `Create Multi-Message ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      displayMessage = messageData.content.length > 200 
        ? messageData.content.substring(0, 200) + '...' 
        : messageData.content;
      messageStart = `Conversation with ${conversationData.contactName}`;
    } else {
      modalTitle = `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      displayMessage = messageData.content.length > 100 
        ? messageData.content.substring(0, 100) + '...' 
        : messageData.content;
      messageStart = messageData.content.substring(0, 30);
    }
    
    const contactName = conversationData.contactName || 'Unknown Contact';
    
    // Title options (existing code...)
    let titleOptions = '';
    if (type === 'ticket') {
      titleOptions = `
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
      `;
    }
    // ... (other type conditions remain the same)
    
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
        <label class="odoo-priority-label">
          <svg class="odoo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
          Priority Level
        </label>
        <div class="odoo-priority-stars" id="priority-stars">
          <button type="button" class="priority-star" data-priority="1" title="Low Priority">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </button>
          <button type="button" class="priority-star" data-priority="2" title="Medium Priority">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </button>
          <button type="button" class="priority-star" data-priority="3" title="High Priority">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </button>
        </div>
        <div class="odoo-priority-description" id="priority-description">
          Click stars to set priority level
        </div>
      </div>
      
      <div class="odoo-title-buttons">
        <button class="odoo-title-btn secondary" data-action="cancel">Cancel</button>
        <button class="odoo-title-btn primary" data-action="create">Create ${type.charAt(0).toUpperCase() + type.slice(1)}</button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Initialize priority selection
    let selectedPriority = '0'; // Default to no priority
    const priorityStars = modalContent.querySelectorAll('.priority-star');
    const priorityDescription = modalContent.querySelector('#priority-description');
    const titleInput = modalContent.querySelector('.odoo-title-input');
    const createBtn = modalContent.querySelector('.odoo-title-btn.primary');

    // Set initial custom title value (omitted for brevity, remains the same)
    if (type === 'ticket') {
      titleInput.value = `Support request from ${contactName}`;
      modalContent.querySelector('input[value="contact-based"]').checked = true;
    } else if (type === 'task') {
      titleInput.value = `Task for ${contactName}: ${messageStart}`;
    } else if (type === 'lead') {
      titleInput.value = `Lead from ${contactName}: ${messageStart}`;
    }
    
    // Title option change handler (omitted for brevity, remains the same)
    modalContent.querySelectorAll('input[name="titleOption"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const option = e.target.value;
        if (option === 'custom') {
          titleInput.value = titleInput.dataset.lastCustom || titleInput.value;
          titleInput.focus();
        } else if (option === 'message-start') {
          titleInput.dataset.lastCustom = titleInput.value;
          titleInput.value = messageData.type === 'multi' ? `Conversation with ${conversationData.contactName}` : `${messageStart}...`;
        } else if (option === 'contact-based') {
          titleInput.dataset.lastCustom = titleInput.value;
          titleInput.value = `Support request from ${contactName}`;
        } else if (option === 'auto') {
          titleInput.dataset.lastCustom = titleInput.value;
          titleInput.value = `WhatsApp: ${messageStart}...`;
        }
      });
    });
    
    // Title input handler (omitted for brevity, remains the same)
    titleInput.addEventListener('input', (e) => {
      if (e.target.value.length >= 3) {
        createBtn.disabled = false;
      } else {
        createBtn.disabled = true;
      }
    });

    const updatePriorityDisplay = (priority) => {
      selectedPriority = priority;
      const prioValue = parseInt(priority); 
      
      priorityStars.forEach((star) => {
        const starPrio = parseInt(star.dataset.priority);
        
        // Light up stars from 1 up to the selected priority value.
        // If prioValue is 0, no stars will be lit (as starPrio starts at 1).
        if (starPrio <= prioValue) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
      
      const descriptions = {
        '0': 'No priority set',
        '1': 'Low priority - Normal handling (1 Star)',
        '2': 'Medium priority - Elevated attention (2 Stars)',
        '3': 'High priority - Urgent handling required (3 Stars)'
      };
      
      priorityDescription.textContent = descriptions[priority];
      priorityDescription.className = `odoo-priority-description priority-level-${priority}`;
    };
    
    // Set default priority
    updatePriorityDisplay('0');
    
    // Bind priority star events - TOGGLE LOGIC HERE
    priorityStars.forEach((star) => {
      star.addEventListener('click', (e) => {
        e.preventDefault();
        const clickedPriority = star.dataset.priority;
        
        // If the user clicks the currently active highest star, reset to '0' (No Priority)
        if (clickedPriority === selectedPriority) {
          updatePriorityDisplay('0');
        } else {
          // Otherwise, set to the clicked star's priority
          updatePriorityDisplay(clickedPriority);
        }
      });
    });
    
    // Bind create button event (omitted for brevity, remains the same)
    createBtn.addEventListener('click', () => {
      const title = titleInput.value.trim();
      const selectedOption = modalContent.querySelector('input[name="titleOption"]:checked').value;
      
      if (title && title.length >= 3) {
        modal.remove();
        resolve({
          title: title,
          option: selectedOption,
          priority: selectedPriority
        });
      }
    });
    
    // Bind cancel button event (omitted for brevity, remains the same)
    modalContent.querySelector('.odoo-title-btn.secondary').addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });

    // Bind backdrop click (omitted for brevity, remains the same)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(null);
      }
    });

    // Initial check for button state (omitted for brevity, remains the same)
    if (titleInput.value.length < 3) {
        createBtn.disabled = true;
    }
  });
}
  // END: Updated showTitleModal function

  extractMessageData(messageElement) {
    const textElement = messageElement.querySelector('span.selectable-text');
    let content = 'No Text Content';
    if (textElement) {
        content = textElement.textContent.trim();
    } else {
        // Fallback for media or other message types
        const mediaElement = messageElement.querySelector('[data-testid="conversation-panel-messages"] [data-testid="media-container"]');
        if (mediaElement) {
            content = '[Media Message]';
        }
    }
    
    let timestampElement = messageElement.querySelector('span[data-testid="msg-time"]');
    if (!timestampElement) {
        // Fallback for different WhatsApp versions/layouts
        timestampElement = messageElement.querySelector('span.message-time, div[data-pre-plain-text] + div span.selectable-text + div span');
    }
    
    let timestamp = new Date().getTime();
    if (timestampElement) {
        const timeString = timestampElement.textContent.trim();
        if (timeString.includes(':')) {
            // Assuming timeString is in a format like 'HH:MM AM/PM'
            timestamp = this.parseWhatsAppTime(timeString).getTime();
        }
    }

    return {
      content: content,
      timestamp: new Date(timestamp),
      type: 'single'
    };
  }

  isIncomingMessage(messageContainer) {
    return !!messageContainer.querySelector('.message-in');
  }

  extractConversationData() {
    const header = document.querySelector('[data-testid="conversation-panel-header"]');
    const contactNameElement = header ? header.querySelector('[data-testid="conversation-contact-name"]') : null;
    const contactName = contactNameElement ? contactNameElement.textContent.trim() : 'Unknown Contact';
    
    // Attempt to find the phone number
    let contactNumber = '';
    const numberElement = header ? header.querySelector('[data-testid="conversation-contact-status"]') : null;
    if (numberElement && numberElement.textContent.trim().startsWith('+')) {
      contactNumber = numberElement.textContent.trim().replace(/[^0-9+]/g, '');
    }
    
    return {
      contactName: contactName,
      contactNumber: contactNumber
    };
  }
  
  formatMultipleMessages(messages, conversationData, type) {
    let description = `Odoo ${type} created from multiple WhatsApp messages from ${conversationData.contactName} (${conversationData.contactNumber || 'No number found'}):\n\n`;
    
    messages.forEach(msg => {
      const sender = msg.senderType === 'customer' ? conversationData.contactName : 'Agent (You)';
      description += `--- ${sender} at ${msg.timestamp.toLocaleTimeString()} ---\n`;
      description += `${msg.content}\n\n`;
    });
    
    return description;
  }

  // START: Updated createTicket function
  async createTicket(messageData, conversationData, config) {
    let ticketTitle;
    if (messageData.customTitle) {
      ticketTitle = messageData.customTitle;
    } else {
      // Fallback for unexpected path, though showTitleModal should always provide a title
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
      priority: messageData.priority || '1'  // Use selected priority instead of auto-detection
    };

    return await this.sendToBackground({
      action: 'createTicket',
      config: config,
      conversationData: ticketData
    });
  }
  // END: Updated createTicket function

  // START: Updated createFromMessage function
  async createFromMessage(messageElement, type) {
    const button = messageElement.querySelector(`.odoo-action-btn.${type}`);
    
    try {
      button.classList.add('creating');
      
      const config = await this.getOdooConfig();
      if (!config.url || !config.apiKey) {
        this.showError(button, 'Please configure Odoo connection first');
        return;
      }

      const messageData = this.extractMessageData(messageElement);
      const conversationData = this.extractConversationData();
      
      const titleData = await this.showTitleModal(messageData, conversationData, type);
      if (!titleData) {
        return;
      }
      
      messageData.customTitle = titleData.title;
      messageData.titleOption = titleData.option;
      messageData.priority = titleData.priority;  // Add priority to message data
      
      let result;
      
      if (type === 'ticket') {
        result = await this.createTicket(messageData, conversationData, config);
      } else if (type === 'task') {
        const taskPriority = this.taskPriorityMap[messageData.priority] || '0';
        const taskData = {
          name: messageData.customTitle,
          description: `Original message: "${messageData.content}"\n\nSent at: ${messageData.timestamp}\nFrom: ${conversationData.contactName}`,
          partner_name: conversationData.contactName,
          priority: taskPriority
        };
        result = await this.sendToBackground({
          action: 'createTask',
          config: config,
          taskData: taskData
        });
      } else if (type === 'lead') {
        const leadPriority = this.leadPriorityMap[messageData.priority] || 'low';
        const leadData = {
          name: messageData.customTitle,
          contact_name: conversationData.contactName,
          phone: conversationData.contactNumber,
          description: `Original message: "${messageData.content}"\n\nSent at: ${messageData.timestamp}\nFrom: ${conversationData.contactName}`,
          source_id: 'whatsapp',
          priority: leadPriority
        };
        result = await this.sendToBackground({
          action: 'createLead',
          config: config,
          leadData: leadData
        });
      }

      if (result && result.success) {
        this.showSuccess(button, `${type.charAt(0).toUpperCase() + type.slice(1)} created!`);
      } else {
        this.showError(button, `Failed to create ${type}. ${result ? result.error : ''}`);
      }
      
    } catch (error) {
      this.showError(button, error.message);
    } finally {
      button.classList.remove('creating');
    }
  }
  // END: Updated createFromMessage function

  // START: Updated createFromSelection function
  async createFromSelection(type) {
    if (this.selectedMessages.size === 0) return;

    try {
      const conversationData = this.extractConversationData();
      
      const messages = Array.from(this.selectedMessages.values()).map(item => ({
        content: item.data.content,
        timestamp: item.data.timestamp,
        senderType: this.isIncomingMessage(item.container) ? 'customer' : 'agent'
      }));
      
      messages.sort((a, b) => a.timestamp - b.timestamp);
      
      const combinedPreview = messages.map(msg => 
        `[${msg.timestamp.toLocaleTimeString()}] ${msg.content.substring(0, 100)}...`
      ).join('\n\n');
      
      const titleData = await this.showTitleModal({
        content: combinedPreview,
        timestamp: messages[0].timestamp,
        type: 'multi'
      }, conversationData, type);
      
      if (!titleData) {
        return;
      }
      
      const config = await this.getOdooConfig();
      if (!config.url || !config.apiKey) {
        alert('Please configure Odoo connection first');
        return;
      }
      
      const createBtn = document.getElementById(`odoo-create-${type}`);
      createBtn.disabled = true;
      createBtn.innerHTML = `Creating ${type}...`; // Changed to text while creating
      
      let result;

      if (type === 'ticket') {
        const ticketData = {
          contactName: conversationData.contactName,
          contactNumber: conversationData.contactNumber,
          summary: titleData.title,
          description: this.formatMultipleMessages(messages, conversationData, 'ticket'),
          messages: messages,
          source: 'whatsapp_multiselect',
          priority: titleData.priority  // Use selected priority (0-3)
        };
        
        result = await this.sendToBackground({
          action: 'createTicket',
          config: config,
          conversationData: ticketData
        });
      } else if (type === 'task') {
        const taskPriority = this.taskPriorityMap[titleData.priority] || '0';
        const taskData = {
          name: titleData.title,
          description: this.formatMultipleMessages(messages, conversationData, 'task'),
          partner_name: conversationData.contactName,
          messages: messages,
          date_deadline: this.calculateDeadline(combinedPreview), 
          priority: taskPriority // Use mapped priority ('0' or '1')
        };
        
        result = await this.sendToBackground({
          action: 'createTask',
          config: config,
          taskData: taskData
        });
      } else if (type === 'lead') {
        const leadPriority = this.leadPriorityMap[titleData.priority] || 'low';
        const leadData = {
          name: titleData.title,
          contact_name: conversationData.contactName,
          phone: conversationData.contactNumber,
          description: this.formatMultipleMessages(messages, conversationData, 'lead'),
          messages: messages,
          source_id: 'whatsapp',
          priority: leadPriority // Use mapped priority ('low', 'medium', or 'high')
        };
        
        result = await this.sendToBackground({
          action: 'createLead',
          config: config,
          leadData: leadData
        });
      }

      if (result && result.success) {
        this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`, 'success');
        this.exitSelectionMode(); // Also clears selection
      } else {
        this.showNotification(`Failed to create ${type}. ${result ? result.error : ''}`, 'error');
      }

    } catch (error) {
      this.showNotification(`Error: ${error.message}`, 'error');
    } finally {
      const createBtn = document.getElementById(`odoo-create-${type}`);
      createBtn.disabled = false;
      // Restore button text
      createBtn.innerHTML = `${this.modernIcons[type]} Create ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }
  }
  // END: Updated createFromSelection function

  // --- Utility Functions (Kept/Modified to exclude removed auto-detection) ---

  // Removed/Commented Out: detectPriority(messageContent)
  // Removed/Commented Out: detectPriorityFromMultiple(messages)
  // Removed/Commented Out: detectLeadPriority(messageContent)

  // Kept: calculateDeadline (assuming it's needed for task creation and works without the removed priority functions)
  calculateDeadline(messageContent) {
    // This is a placeholder/mock function. The actual implementation would look for keywords or use NLP.
    // Since the original was not provided, a simple mock is retained.
    const deadline = new Date();
    // Default: set deadline for 7 days from now
    deadline.setDate(deadline.getDate() + 7); 
    return deadline.toISOString().split('T')[0]; // Return date in 'YYYY-MM-DD' format
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `odoo-notification ${type}`;
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    
    notification.innerHTML = `
      <div class="odoo-notification-title">${type === 'success' ? this.modernIcons.success : this.modernIcons.error} ${title}</div>
      <div class="odoo-notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  showSuccess(button, message) {
    button.classList.add('success');
    button.innerHTML = this.modernIcons.success;
    this.showNotification(message, 'success');
    setTimeout(() => {
      button.classList.remove('success');
      button.innerHTML = this.modernIcons[button.classList.contains('ticket') ? 'ticket' : button.classList.contains('task') ? 'task' : 'lead'];
    }, 3000);
  }

  showError(button, message) {
    button.classList.add('error');
    button.innerHTML = this.modernIcons.error;
    this.showNotification(message, 'error');
    setTimeout(() => {
      button.classList.remove('error');
      button.innerHTML = this.modernIcons[button.classList.contains('ticket') ? 'ticket' : button.classList.contains('task') ? 'task' : 'lead'];
    }, 3000);
  }

  parseWhatsAppTime(timeString) {
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
          console.error("Runtime Error:", chrome.runtime.lastError.message);
          resolve({ success: false, error: 'Extension communication error.' });
        } else {
          resolve(response);
        }
      });
    });
  }
}

new WhatsAppMessageTracker();