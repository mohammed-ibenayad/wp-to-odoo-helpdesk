// AI Suggestion Modal - IMPROVED UX WITH MANUAL START
// Updated to use AIAnalysisManager

(function() {
  'use strict';
  
  class AISuggestionModal {
    constructor(messages, conversationData) {
      this.messages = [...messages]; // Clone array so we can modify it
      this.conversationData = conversationData;
      this.selectedSuggestion = null;
      this.suggestions = null;
      this.modal = null;
      this.aiProvider = null;
      this.analysisStarted = false;
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
      
      // Step 1: Review Messages (ALWAYS SHOWN FIRST)
      const step1 = this.renderStep1();
      modalContent.appendChild(step1);
      
      // Step 2: AI Analysis (HIDDEN INITIALLY)
      const step2 = this.renderStep2();
      modalContent.appendChild(step2);
      
      // Step 3: Suggestions (HIDDEN INITIALLY)
      const step3 = this.renderStep3();
      modalContent.appendChild(step3);
      
      this.modal.appendChild(modalContent);
      document.body.appendChild(this.modal);
      
      // Set up event listeners
      this.setupEventListeners();
      
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
    }
    
    setupEventListeners() {
      // Message removal buttons
      const removeButtons = document.querySelectorAll('.odoo-ai-message-remove');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(btn.getAttribute('data-index'));
          this.removeMessage(index);
        });
      });
      
      // Start analysis button
      const analyzeBtn = document.getElementById('start-analysis-btn');
      if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
          this.startAnalysis();
        });
      }
    }
    
    renderStep1() {
      const step = document.createElement('div');
      step.className = 'odoo-ai-step-card';
      step.id = 'odoo-ai-step-1';
      
      step.innerHTML = `
        <div class="odoo-ai-step-header">
          <div class="odoo-ai-step-number">1</div>
          <div class="odoo-ai-step-info">
            <div class="odoo-ai-step-title">Review Selected Messages</div>
            <div class="odoo-ai-step-subtitle" id="step1-subtitle">${this.messages.length} message${this.messages.length !== 1 ? 's' : ''} selected · Hover to remove</div>
          </div>
        </div>
        
        <div class="odoo-ai-messages-preview" id="ai-messages-preview">
          ${this.renderMessages()}
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
          <button class="odoo-ai-analyze-btn" id="start-analysis-btn">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9 11l3 3 8-8"/>
            </svg>
            Start AI Analysis (${this.messages.length} message${this.messages.length !== 1 ? 's' : ''})
          </button>
        </div>
      `;
      
      return step;
    }
    
    renderMessages() {
      if (this.messages.length === 0) {
        return '<div style="text-align: center; padding: 40px; color: #999;">No messages selected</div>';
      }
      
      return this.messages.map((msg, index) => {
        const sender = msg.senderType === 'customer' 
          ? '<strong style="color: #667eea;">Customer</strong>' 
          : '<strong style="color: #764ba2;">Agent</strong>';
        
        const time = new Date(msg.timestamp).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        const preview = msg.content.length > 150 
          ? msg.content.substring(0, 150) + '...' 
          : msg.content;
        
        return `
          <div class="odoo-ai-message-item" data-message-index="${index}">
            <button class="odoo-ai-message-remove" data-index="${index}" title="Remove this message">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="odoo-ai-message-sender">${sender} <span class="odoo-ai-message-time">${time}</span></div>
            <div class="odoo-ai-message-content">${preview}</div>
          </div>
        `;
      }).join('');
    }
    
    removeMessage(index) {
      console.log('Removing message at index:', index);
      
      // Remove message from array
      this.messages.splice(index, 1);
      
      // Check if we still have messages
      if (this.messages.length === 0) {
        alert('You must have at least one message selected');
        this.close(null);
        return;
      }
      
      // Re-render messages
      const preview = document.getElementById('ai-messages-preview');
      if (preview) {
        preview.innerHTML = this.renderMessages();
        
        // Re-attach event listeners
        this.setupEventListeners();
      }
      
      // Update subtitle
      const subtitle = document.getElementById('step1-subtitle');
      if (subtitle) {
        subtitle.textContent = `${this.messages.length} message${this.messages.length !== 1 ? 's' : ''} selected · Hover to remove`;
      }
      
      // Update button text
      const analyzeBtn = document.getElementById('start-analysis-btn');
      if (analyzeBtn) {
        analyzeBtn.innerHTML = `
          <svg style="width: 20px; height: 20px; margin-right: 8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 11l3 3 8-8"/>
          </svg>
          Start AI Analysis (${this.messages.length} message${this.messages.length !== 1 ? 's' : ''})
        `;
      }
    }
    
    renderStep2() {
      const step = document.createElement('div');
      step.className = 'odoo-ai-step-card';
      step.id = 'odoo-ai-step-2';
      step.style.display = 'none';
      
      step.innerHTML = `
        <div class="odoo-ai-step-header">
          <div class="odoo-ai-step-number">2</div>
          <div class="odoo-ai-step-info">
            <div class="odoo-ai-step-title">AI Analysis in Progress</div>
            <div class="odoo-ai-step-subtitle">Analyzing your conversation...</div>
          </div>
        </div>
        
        <div class="odoo-ai-analyze-section">
          <div class="odoo-ai-spinner-container">
            <div class="odoo-ai-spinner"></div>
          </div>
          
          <div class="odoo-ai-progress-steps" id="ai-progress-steps">
            <div class="odoo-ai-progress-step" data-step="1">
              <div class="odoo-ai-progress-icon">🔍</div>
              <div class="odoo-ai-progress-text">Analyzing ${this.messages.length} messages...</div>
            </div>
            <div class="odoo-ai-progress-step" data-step="2">
              <div class="odoo-ai-progress-icon">📊</div>
              <div class="odoo-ai-progress-text">Evaluating conversation context...</div>
            </div>
            <div class="odoo-ai-progress-step" data-step="3">
              <div class="odoo-ai-progress-icon">🎯</div>
              <div class="odoo-ai-progress-text">Generating smart recommendations...</div>
            </div>
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
            <div class="odoo-ai-step-subtitle" id="ai-provider-subtitle">Select the best action</div>
          </div>
        </div>
        
        <div class="odoo-ai-suggestions-grid" id="odoo-ai-suggestions-grid">
          <!-- Suggestions will be inserted here -->
        </div>
        
        <div class="odoo-ai-info-box">
          <strong>💡 Tip:</strong> Select a recommendation below, or click "Edit" to customize it before creating.
        </div>
        
        <div class="odoo-ai-final-actions">
          <button class="odoo-ai-final-btn cancel" id="odoo-ai-cancel-btn">Cancel</button>
          <button class="odoo-ai-final-btn create" id="odoo-ai-create-btn" disabled>Create Selected</button>
        </div>
      `;
      
      return step;
    }
    
    startAnalysis() {
      if (this.analysisStarted) return;
      this.analysisStarted = true;
      
      console.log('🚀 Starting AI analysis...');
      
      // Hide step 1, show step 2
      const step1 = document.getElementById('odoo-ai-step-1');
      const step2 = document.getElementById('odoo-ai-step-2');
      
      if (step1) step1.style.display = 'none';
      if (step2) {
        step2.style.display = 'block';
        step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Start the actual analysis
      this.analyzeMessages();
    }
    
    async analyzeMessages() {
      try {
        // Animate progress steps
        this.animateProgressSteps();
        
        // Get selected provider
        const providerName = await window.AIConfigManager.getSelectedProvider();
        const providerInfo = window.AI_PROVIDERS[providerName];
        
        console.log(`🤖 Using AI provider: ${providerInfo.name}`);
        
        // Create analyzer
        this.aiProvider = new window.AIAnalysisManager(providerName);
        
        // Perform AI analysis
        const result = await this.aiProvider.analyzeConversation(
          this.messages,
          this.conversationData
        );
        
        if (result.success) {
          this.suggestions = result.suggestions;
          console.log('✅ AI Analysis successful:', this.suggestions);
          
          // Show success state briefly
          this.showAnalysisComplete(result.provider);
          
          setTimeout(() => {
            this.showSuggestions(result.provider);
          }, 1200);
          
        } else {
          console.warn('⚠️ AI Analysis failed, using fallback:', result.error);
          
          // Use fallback suggestions
          this.suggestions = result.fallback;
          
          // Show warning state
          this.showAnalysisWarning(result.error);
          
          setTimeout(() => {
            this.showSuggestions('Automated Analysis');
          }, 1800);
        }
        
      } catch (error) {
        console.error('❌ Critical error in AI analysis:', error);
        this.showErrorState(error.message);
      }
    }
    
    animateProgressSteps() {
      const steps = document.querySelectorAll('.odoo-ai-progress-step');
      
      steps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add('active');
        }, index * 1000);
      });
    }
    
    showAnalysisComplete(providerName) {
      const progressContainer = document.getElementById('ai-progress-steps');
      if (progressContainer) {
        progressContainer.innerHTML = `
          <div class="odoo-ai-progress-step active complete">
            <div class="odoo-ai-progress-icon">✅</div>
            <div class="odoo-ai-progress-text">Analysis complete!</div>
          </div>
          <div style="text-align: center; margin-top: 12px; font-size: 13px; color: #666;">
            Powered by ${providerName}
          </div>
        `;
      }
    }
    
    showAnalysisWarning(errorMessage) {
      const progressContainer = document.getElementById('ai-progress-steps');
      if (progressContainer) {
        progressContainer.innerHTML = `
          <div class="odoo-ai-progress-step active warning">
            <div class="odoo-ai-progress-icon">⚠️</div>
            <div class="odoo-ai-progress-text">Using automated analysis</div>
          </div>
          <div style="text-align: center; margin-top: 12px; font-size: 12px; color: #ff9800;">
            ${errorMessage}
          </div>
        `;
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
            <div class="odoo-ai-step-title">Analysis Failed</div>
            <div class="odoo-ai-step-subtitle">Unable to complete AI analysis</div>
          </div>
        </div>
        
        <div class="odoo-ai-analyze-section">
          <div class="odoo-ai-brain-container">
            <div class="odoo-ai-brain" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">⚠️</div>
          </div>
          <div style="text-align: center; padding: 20px;">
            <p style="color: #dc3545; font-weight: 600; margin-bottom: 12px; font-size: 15px;">
              ${errorMessage}
            </p>
            <p style="font-size: 13px; color: #666; margin-bottom: 20px;">
              Please check your AI configuration in the extension settings.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="odoo-ai-final-btn cancel" id="retry-analysis-btn">🔄 Retry</button>
              <button class="odoo-ai-final-btn cancel" id="back-to-messages-btn">← Back</button>
            </div>
          </div>
        </div>
      `;
      
      // Add retry handler
      document.getElementById('retry-analysis-btn').addEventListener('click', () => {
        this.analysisStarted = false;
        step2.innerHTML = this.renderStep2().innerHTML;
        this.analyzeMessages();
      });
      
      // Add back handler
      document.getElementById('back-to-messages-btn').addEventListener('click', () => {
        this.analysisStarted = false;
        const step1 = document.getElementById('odoo-ai-step-1');
        step2.style.display = 'none';
        if (step1) {
          step1.style.display = 'block';
          step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
    
    renderSuggestions() {
      const grid = document.getElementById('odoo-ai-suggestions-grid');
      
      // Sort by confidence
      const types = ['ticket', 'task', 'lead'];
      const sorted = types
        .map(type => ({ ...this.suggestions[type], type }))
        .sort((a, b) => b.confidence - a.confidence);
      
      const recommended = sorted[0];
      
      grid.innerHTML = sorted.map(suggestion => {
        const isRecommended = suggestion === recommended;
        const priorityStars = '⭐'.repeat(parseInt(suggestion.priority));
        const priorityLabels = { '0': 'None', '1': 'Low', '2': 'Medium', '3': 'High' };
        
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
                <span>Confidence</span>
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
                <div class="odoo-ai-detail-value">${priorityStars || '—'} ${priorityLabels[suggestion.priority]}</div>
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
      setTimeout(() => {
        this.selectSuggestion(recommended.type);
      }, 300);
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
      
      this.selectedSuggestion = { ...this.suggestions[type], type };
      
      // Enable create button
      document.getElementById('odoo-ai-create-btn').disabled = false;
    }
    
    editSuggestion(type) {
      const suggestion = this.suggestions[type];
      
      this.close({
        editMode: true,
        type: type,
        data: {
          title: suggestion.title,
          priority: suggestion.priority,
          reasoning: suggestion.reasoning,
          aiGenerated: true
        }
      });
    }
    
    createSelectedItem() {
      if (!this.selectedSuggestion) return;
      
      const createBtn = document.getElementById('odoo-ai-create-btn');
      createBtn.disabled = true;
      createBtn.textContent = 'Creating...';
      
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
  
  console.log('✅ AISuggestionModal loaded - Improved UX');
})();