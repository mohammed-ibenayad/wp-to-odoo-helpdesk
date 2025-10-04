// AI Suggestion Modal - WITH REAL AI INTEGRATION
// Updated to use AIAnalysisManager

(function() {
  'use strict';
  
  class AISuggestionModal {
    constructor(messages, conversationData) {
      this.messages = messages;
      this.conversationData = conversationData;
      this.selectedSuggestion = null;
      this.suggestions = null;
      this.modal = null;
      this.aiProvider = null;
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
      
      // AUTO-START ANALYSIS
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
          <div class="odoo-ai-analyzing-text" id="ai-status-text">
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
            <div class="odoo-ai-step-subtitle" id="ai-provider-subtitle">Review and select the best action</div>
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
      const step2 = document.getElementById('odoo-ai-step-2');
      const statusText = document.getElementById('ai-status-text');
      
      try {
        // Update status
        statusText.innerHTML = `
          <p>🤖 Initializing AI provider...</p>
        `;
        
        // Get selected provider
        const providerName = await window.AIConfigManager.getSelectedProvider();
        const providerInfo = window.AI_PROVIDERS[providerName];
        
        console.log(`🤖 Using AI provider: ${providerInfo.name}`);
        
        // Update status
        statusText.innerHTML = `
          <p>🤖 Connecting to ${providerInfo.name}...</p>
          <p style="font-size: 12px; color: #999;">Model: ${providerInfo.model}</p>
        `;
        
        // Create analyzer
        this.aiProvider = new window.AIAnalysisManager(providerName);
        
        // Update status
        statusText.innerHTML = `
          <p>🔍 Analyzing ${this.messages.length} messages...</p>
          <p>📊 Evaluating conversation context...</p>
          <p>🎯 Generating smart recommendations...</p>
        `;
        
        // Perform AI analysis
        const result = await this.aiProvider.analyzeConversation(
          this.messages,
          this.conversationData
        );
        
        if (result.success) {
          this.suggestions = result.suggestions;
          console.log('✅ AI Analysis successful:', this.suggestions);
          
          // Show success and transition to suggestions
          statusText.innerHTML = `
            <p style="color: #25D366; font-weight: 600;">✅ Analysis complete!</p>
            <p style="font-size: 12px; color: #666;">Powered by ${result.provider}</p>
          `;
          
          setTimeout(() => {
            this.showSuggestions(result.provider);
          }, 1000);
          
        } else {
          console.warn('⚠️ AI Analysis failed, using fallback:', result.error);
          
          // Use fallback suggestions
          this.suggestions = result.fallback;
          
          // Show warning
          statusText.innerHTML = `
            <p style="color: #ff9800; font-weight: 600;">⚠️ Using automated analysis</p>
            <p style="font-size: 12px; color: #666;">${result.error}</p>
          `;
          
          setTimeout(() => {
            this.showSuggestions('Automated Analysis');
          }, 1500);
        }
        
      } catch (error) {
        console.error('❌ Critical error in AI analysis:', error);
        this.showErrorState(error.message);
      }
    }
    
    showSuggestions(providerName) {
      const step2 = document.getElementById('odoo-ai-step-2');
      const step3 = document.getElementById('odoo-ai-step-3');
      
      // Hide analysis step
      if (step2) {
        step2.style.display = 'none';
      }
      
      // Update subtitle with provider info
      const subtitle = document.getElementById('ai-provider-subtitle');
      if (subtitle) {
        subtitle.textContent = `Powered by ${providerName}`;
      }
      
      // Show suggestions step
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
    }
    
    showErrorState(errorMessage) {
      const step2 = document.getElementById('odoo-ai-step-2');
      
      step2.innerHTML = `
        <div class="odoo-ai-step-header">
          <div class="odoo-ai-step-number">2</div>
          <div class="odoo-ai-step-info">
            <div class="odoo-ai-step-title">AI Analysis Failed</div>
            <div class="odoo-ai-step-subtitle">Unable to complete analysis</div>
          </div>
        </div>
        
        <div class="odoo-ai-analyze-section">
          <div class="odoo-ai-icon" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); animation: none;">⚠️</div>
          <div style="text-align: center; padding: 20px;">
            <p style="color: #dc3545; font-weight: 600; margin-bottom: 12px;">
              ${errorMessage}
            </p>
            <p style="font-size: 13px; color: #666; margin-bottom: 20px;">
              Please check your AI configuration and try again, or proceed with manual creation.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="odoo-ai-final-btn cancel" id="retry-analysis-btn">🔄 Retry</button>
              <button class="odoo-ai-final-btn cancel" id="manual-create-btn">✏️ Create Manually</button>
            </div>
          </div>
        </div>
      `;
      
      // Add retry handler
      document.getElementById('retry-analysis-btn').addEventListener('click', () => {
        step2.innerHTML = this.renderStep2().innerHTML;
        this.analyzeMessages();
      });
      
      // Add manual create handler
      document.getElementById('manual-create-btn').addEventListener('click', () => {
        this.close({ manualMode: true });
      });
    }
    
    renderSuggestions() {
      const grid = document.getElementById('odoo-ai-suggestions-grid');
      
      // Sort by confidence
      const sorted = Object.values(this.suggestions).sort((a, b) => b.confidence - a.confidence);
      const recommended = sorted[0];
      
      grid.innerHTML = sorted.map(suggestion => {
        const isRecommended = suggestion === recommended;
        const priorityStars = '⭐'.repeat(parseInt(suggestion.priority));
        const priorityLabels = { '0': 'None', '1': 'Low', '2': 'Medium', '3': 'High' };
        
        // Determine type from suggestions object
        let type = 'ticket';
        if (suggestion === this.suggestions.task) type = 'task';
        if (suggestion === this.suggestions.lead) type = 'lead';
        
        return `
          <div class="odoo-ai-suggestion-card ${isRecommended ? 'recommended' : ''}" data-type="${type}">
            <div class="odoo-ai-suggestion-header">
              <div class="odoo-ai-suggestion-type">
                <div class="odoo-ai-type-icon ${type}">
                  ${type === 'ticket' ? '🎫' : type === 'task' ? '✓' : '👤'}
                </div>
                <div class="odoo-ai-type-name">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
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
                <span>💡</span> Why ${type === 'ticket' ? 'a Ticket' : type === 'task' ? 'a Task' : 'a Lead'}?
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
      const recommendedType = Object.keys(this.suggestions).find(
        key => this.suggestions[key] === recommended
      );
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
      this.selectedSuggestion.type = type; // Store type
      
      // Enable create button
      document.getElementById('odoo-ai-create-btn').disabled = false;
    }
    
    editSuggestion(type) {
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
  
  console.log('✅ AISuggestionModal loaded with AI integration');
})();