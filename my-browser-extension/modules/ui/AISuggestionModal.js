// AI Suggestion Modal - Chrome Extension Compatible
// No imports/exports - using global window object

(function() {
  'use strict';
  
  class AISuggestionModal {
    constructor(messages, conversationData) {
      this.messages = messages;
      this.conversationData = conversationData;
      this.selectedSuggestion = null;
      this.suggestions = null;
      this.modal = null;
    }
    
    async show() {
      return new Promise((resolve) => {
        this.resolve = resolve;
        this.render();
      });
    }
    
    render() {
      // Create modal
      this.modal = document.createElement('div');
      this.modal.className = 'odoo-ai-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'odoo-ai-modal-content';
      
      // Step 1: Selected Messages
      const step1 = this.renderStep1();
      modalContent.appendChild(step1);
      
      // Step 2: AI Analysis (shown during loading)
      const step2 = this.renderStep2();
      modalContent.appendChild(step2);
      
      // Step 3: Suggestions (will be shown after analysis)
      const step3 = this.renderStep3();
      modalContent.appendChild(step3);
      
      this.modal.appendChild(modalContent);
      document.body.appendChild(this.modal);
      
      // Close on backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close(null);
        }
      });
      
      // Close on Escape key
      this.escapeHandler = (e) => {
        if (e.key === 'Escape') {
          this.close(null);
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
      
      // AUTO-START ANALYSIS - No button needed
      setTimeout(() => {
        this.analyzeMessages();
      }, 500);
    }
    
    renderStep1() {
      const step = document.createElement('div');
      step.className = 'odoo-ai-step-card';
      
      step.innerHTML = `
        <div class="odoo-ai-step-header">
          <div class="odoo-ai-step-number">1</div>
          <div class="odoo-ai-step-info">
            <div class="odoo-ai-step-title">Selected Messages</div>
            <div class="odoo-ai-step-subtitle">${this.messages.length} message${this.messages.length !== 1 ? 's' : ''} selected from conversation</div>
          </div>
        </div>
        
        <div class="odoo-ai-messages-preview">
          ${this.renderMessages()}
        </div>
        
        <div class="odoo-ai-info-box">
          <strong>Contact Detected:</strong> ${this.conversationData.contactName} ${this.conversationData.contactNumber ? '(' + this.conversationData.contactNumber + ')' : ''}
        </div>
      `;
      
      return step;
    }
    
    renderMessages() {
      return this.messages.map(msg => {
        const sender = msg.senderType === 'customer' ? '<strong>Customer:</strong>' : '<strong>Agent:</strong>';
        const time = new Date(msg.timestamp).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        return `
          <div class="odoo-ai-message-item">
            ${sender} ${msg.content}
            <div class="odoo-ai-message-meta">Today at ${time}</div>
          </div>
        `;
      }).join('');
    }
    
    renderStep2() {
      const step = document.createElement('div');
      step.className = 'odoo-ai-step-card';
      step.id = 'odoo-ai-step-2';
      
      step.innerHTML = `
        <div class="odoo-ai-step-header">
          <div class="odoo-ai-step-number">2</div>
          <div class="odoo-ai-step-info">
            <div class="odoo-ai-step-title">AI Analysis</div>
            <div class="odoo-ai-step-subtitle">Analyzing conversation context and intent</div>
          </div>
        </div>
        
        <div class="odoo-ai-analyze-section">
          <div class="odoo-ai-icon">🧠</div>
          <div class="odoo-ai-analyzing-text">
            <p>🔍 Analyzing conversation tone and urgency...</p>
            <p>📊 Identifying key entities and requirements...</p>
            <p>🎯 Generating recommendations...</p>
          </div>
        </div>
      `;
      
      return step;
    }
    
    renderStep3() {
      const step = document.createElement('div');
      step.className = 'odoo-ai-step-card';
      step.id = 'odoo-ai-step-3';
      step.style.display = 'none';
      
      step.innerHTML = `
        <div class="odoo-ai-step-header">
          <div class="odoo-ai-step-number">3</div>
          <div class="odoo-ai-step-info">
            <div class="odoo-ai-step-title">AI Recommendations</div>
            <div class="odoo-ai-step-subtitle">Review and select the best action</div>
          </div>
        </div>
        
        <div class="odoo-ai-suggestions-grid" id="odoo-ai-suggestions-grid">
          <!-- Suggestions will be inserted here -->
        </div>
        
        <div class="odoo-ai-info-box">
          <strong>💡 Pro Tip:</strong> You can edit any suggestion before creating it, or choose a different type if AI's recommendation doesn't match your needs.
        </div>
        
        <div class="odoo-ai-final-actions">
          <button class="odoo-ai-final-btn create" id="odoo-ai-create-btn" disabled>Create Selected Item</button>
          <button class="odoo-ai-final-btn cancel" id="odoo-ai-cancel-btn">Cancel</button>
        </div>
      `;
      
      return step;
    }
    
    async analyzeMessages() {
      // AI analysis already started automatically
      const step2 = document.getElementById('odoo-ai-step-2');
      
      // Perform AI analysis
      await this.performAIAnalysis();
      
      // Hide step 2 and show suggestions
      setTimeout(() => {
        if (step2) {
          step2.style.display = 'none';
        }
        
        const step3 = document.getElementById('odoo-ai-step-3');
        step3.style.display = 'block';
        this.renderSuggestions();
        
        // Scroll to suggestions
        step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add event listeners for final actions
        document.getElementById('odoo-ai-create-btn').addEventListener('click', () => {
          this.createSelectedItem();
        });
        
        document.getElementById('odoo-ai-cancel-btn').addEventListener('click', () => {
          this.close(null);
        });
      }, 2000); // 2 seconds for AI analysis animation
    }
    
    async performAIAnalysis() {
      // This is where you would call your AI API
      // For now, we'll create mock suggestions based on message content
      
      const combinedContent = this.messages.map(m => m.content).join(' ').toLowerCase();
      
      // Analyze content to determine what to create
      let ticketConfidence = 50;
      let taskConfidence = 30;
      let leadConfidence = 20;
      
      // Keywords that increase ticket confidence
      const ticketKeywords = ['problem', 'issue', 'help', 'not working', 'broken', 'error', 'trouble', 'support'];
      const taskKeywords = ['need to', 'please', 'can you', 'could you', 'schedule', 'arrange', 'setup'];
      const leadKeywords = ['interested', 'quote', 'price', 'buy', 'purchase', 'how much', 'demo'];
      
      // Calculate confidence scores
      ticketKeywords.forEach(keyword => {
        if (combinedContent.includes(keyword)) ticketConfidence += 10;
      });
      
      taskKeywords.forEach(keyword => {
        if (combinedContent.includes(keyword)) taskConfidence += 8;
      });
      
      leadKeywords.forEach(keyword => {
        if (combinedContent.includes(keyword)) leadConfidence += 12;
      });
      
      // Normalize to 100
      const total = ticketConfidence + taskConfidence + leadConfidence;
      ticketConfidence = Math.round((ticketConfidence / total) * 100);
      taskConfidence = Math.round((taskConfidence / total) * 100);
      leadConfidence = 100 - ticketConfidence - taskConfidence;
      
      // Determine priority based on keywords
      let priority = '1'; // Normal
      if (combinedContent.includes('urgent') || combinedContent.includes('asap')) {
        priority = '3'; // High
      } else if (combinedContent.includes('important') || combinedContent.includes('soon')) {
        priority = '2'; // Medium
      }
      
      // Generate suggestions
      this.suggestions = {
        ticket: {
          type: 'ticket',
          confidence: ticketConfidence,
          title: this.generateTitle('ticket'),
          priority: priority,
          category: 'Support Request',
          reasoning: this.generateReasoning('ticket', combinedContent)
        },
        task: {
          type: 'task',
          confidence: taskConfidence,
          title: this.generateTitle('task'),
          priority: priority,
          assignedTo: 'Support Team',
          reasoning: this.generateReasoning('task', combinedContent)
        },
        lead: {
          type: 'lead',
          confidence: leadConfidence,
          title: this.generateTitle('lead'),
          priority: priority,
          reasoning: this.generateReasoning('lead', combinedContent)
        }
      };
    }
    
    generateTitle(type) {
      const firstMessage = this.messages[0].content;
      const truncated = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
      
      const prefixes = {
        ticket: 'Support Request',
        task: 'Action Required',
        lead: 'Sales Inquiry'
      };
      
      return `${prefixes[type]}: ${truncated}`;
    }
    
    generateReasoning(type, content) {
      const reasonings = {
        ticket: {
          high: 'Customer reports an issue requiring immediate resolution. Contains support-related keywords.',
          medium: 'Conversation indicates a customer service matter that needs tracking and follow-up.',
          low: 'Content suggests general inquiry rather than specific issue.'
        },
        task: {
          high: 'Contains actionable items and specific requests that require internal team action.',
          medium: 'Includes elements that could be tracked as internal tasks.',
          low: 'Primarily customer-facing communication, not suitable for internal task tracking.'
        },
        lead: {
          high: 'Contains sales intent and interest in products/services.',
          medium: 'Shows potential interest that could be developed into sales opportunity.',
          low: 'Existing customer support case, not a new sales opportunity.'
        }
      };
      
      const confidence = this.suggestions ? this.suggestions[type].confidence : 50;
      
      if (confidence >= 70) return reasonings[type].high;
      if (confidence >= 40) return reasonings[type].medium;
      return reasonings[type].low;
    }
    
    renderSuggestions() {
      const grid = document.getElementById('odoo-ai-suggestions-grid');
      
      // Sort by confidence
      const sorted = Object.values(this.suggestions).sort((a, b) => b.confidence - a.confidence);
      const recommended = sorted[0];
      
      grid.innerHTML = sorted.map(suggestion => {
        const isRecommended = suggestion === recommended;
        const priorityStars = '⭐'.repeat(parseInt(suggestion.priority));
        const priorityLabels = { '1': 'Low', '2': 'Medium', '3': 'High' };
        
        return `
          <div class="odoo-ai-suggestion-card ${isRecommended ? 'recommended' : ''}" data-type="${suggestion.type}">
            <div class="odoo-ai-suggestion-header">
              <div class="odoo-ai-suggestion-type">
                <div class="odoo-ai-type-icon ${suggestion.type}">
                  ${suggestion.type === 'ticket' ? '🎫' : suggestion.type === 'task' ? '✓' : '👤'}
                </div>
                <div class="odoo-ai-type-name">${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}</div>
              </div>
              ${isRecommended ? '<div class="odoo-ai-recommended-badge">Recommended</div>' : ''}
            </div>
            
            <div class="odoo-ai-confidence-bar">
              <div class="odoo-ai-confidence-label">
                <span>AI Confidence</span>
                <span><strong>${suggestion.confidence}%</strong></span>
              </div>
              <div class="odoo-ai-confidence-progress">
                <div class="odoo-ai-confidence-fill" style="width: ${suggestion.confidence}%;"></div>
              </div>
            </div>
            
            <div class="odoo-ai-reasoning">
              <div class="odoo-ai-reasoning-title">
                <span>💡</span> Why ${suggestion.type === 'ticket' ? 'a Ticket' : suggestion.type === 'task' ? 'a Task' : 'a Lead'}?
              </div>
              <div class="odoo-ai-reasoning-text">
                ${suggestion.reasoning}
              </div>
            </div>
            
            <div class="odoo-ai-suggestion-details">
              <div class="odoo-ai-detail-item">
                <div class="odoo-ai-detail-label">Title:</div>
                <div class="odoo-ai-detail-value">${suggestion.title}</div>
              </div>
              <div class="odoo-ai-detail-item">
                <div class="odoo-ai-detail-label">Priority:</div>
                <div class="odoo-ai-detail-value">${priorityStars} ${priorityLabels[suggestion.priority]}</div>
              </div>
              ${suggestion.category ? `
                <div class="odoo-ai-detail-item">
                  <div class="odoo-ai-detail-label">Category:</div>
                  <div class="odoo-ai-detail-value">${suggestion.category}</div>
                </div>
              ` : ''}
              ${suggestion.assignedTo ? `
                <div class="odoo-ai-detail-item">
                  <div class="odoo-ai-detail-label">Assigned:</div>
                  <div class="odoo-ai-detail-value">${suggestion.assignedTo}</div>
                </div>
              ` : ''}
            </div>
            
            <div class="odoo-ai-suggestion-actions">
              <button class="odoo-ai-action-btn ${isRecommended ? 'primary' : 'secondary'}" data-action="select">
                ${isRecommended ? '✓ Select' : 'Select'}
              </button>
              <button class="odoo-ai-action-btn secondary" data-action="edit">Edit</button>
            </div>
          </div>
        `;
      }).join('');
      
      // Add click handlers
      grid.querySelectorAll('.odoo-ai-suggestion-card').forEach(card => {
        const selectBtn = card.querySelector('[data-action="select"]');
        const editBtn = card.querySelector('[data-action="edit"]');
        
        selectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectSuggestion(card.dataset.type);
        });
        
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editSuggestion(card.dataset.type);
        });
        
        // Card click also selects
        card.addEventListener('click', () => {
          this.selectSuggestion(card.dataset.type);
        });
      });
      
      // Auto-select recommended
      const recommendedType = recommended.type;
      setTimeout(() => {
        this.selectSuggestion(recommendedType);
      }, 500);
    }
    
    selectSuggestion(type) {
      // Remove previous selection
      document.querySelectorAll('.odoo-ai-suggestion-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('[data-action="select"]');
        btn.textContent = 'Select';
      });
      
      // Add new selection
      const card = document.querySelector(`[data-type="${type}"]`);
      card.classList.add('selected');
      const btn = card.querySelector('[data-action="select"]');
      btn.innerHTML = '✓ Selected';
      
      this.selectedSuggestion = this.suggestions[type];
      
      // Enable create button
      document.getElementById('odoo-ai-create-btn').disabled = false;
    }
    
    editSuggestion(type) {
      // This would open the standard title modal with pre-filled data
      console.log('Edit suggestion:', type);
      
      // Close AI modal and open standard modal with pre-filled data
      const suggestion = this.suggestions[type];
      
      this.close({
        editMode: true,
        type: type,
        data: {
          title: suggestion.title,
          priority: suggestion.priority,
          aiGenerated: true
        }
      });
    }
    
    createSelectedItem() {
      if (!this.selectedSuggestion) return;
      
      const createBtn = document.getElementById('odoo-ai-create-btn');
      createBtn.disabled = true;
      createBtn.textContent = 'Creating...';
      
      // Return the selected suggestion to be created
      this.close({
        create: true,
        type: this.selectedSuggestion.type,
        data: {
          title: this.selectedSuggestion.title,
          priority: this.selectedSuggestion.priority,
          aiGenerated: true
        }
      });
    }
    
    close(result) {
      if (this.modal) {
        this.modal.remove();
      }
      
      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
      }
      
      if (this.resolve) {
        this.resolve(result);
      }
    }
  }
  
  // Make available globally
  window.AISuggestionModal = AISuggestionModal;
  
  console.log('✅ AISuggestionModal loaded');
})();