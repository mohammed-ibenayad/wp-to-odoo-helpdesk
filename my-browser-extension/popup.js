// UPDATED popup.js with AIConfigManager integrated

// Enhanced popup.js with connection status and improved UX
class PopupManager {
  constructor() {
    this.initializeElements();
    this.loadSavedConfig();
    this.bindEvents();
    this.checkConnectionStatus();
  }
  
  initializeElements() {
    this.form = document.getElementById('configForm');
    this.testBtn = document.getElementById('testBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.loading = document.getElementById('loading');
    this.status = document.getElementById('status');
    this.connectionStatus = document.getElementById('connectionStatus');
    this.statusDot = document.getElementById('statusDot');
    this.statusText = document.getElementById('statusText');
    
    this.inputs = {
      url: document.getElementById('odooUrl'),
      username: document.getElementById('username'),
      apiKey: document.getElementById('apiKey')
    };
  }
  
  bindEvents() {
    this.testBtn.addEventListener('click', () => this.testConnection());
    this.form.addEventListener('submit', (e) => this.saveConfig(e));
    
    // Auto-save on input change with debounce
    Object.values(this.inputs).forEach(input => {
      input.addEventListener('input', () => this.debouncedAutoSave());
    });
    
    // Real-time validation
    Object.values(this.inputs).forEach(input => {
      input.addEventListener('input', () => this.validateForm());
    });
    
    // Enhanced input interactions
    Object.values(this.inputs).forEach(input => {
      input.addEventListener('focus', (e) => this.onInputFocus(e));
      input.addEventListener('blur', (e) => this.onInputBlur(e));
    });
  }
  
  onInputFocus(e) {
    e.target.parentElement.style.transform = 'translateY(-2px)';
    e.target.parentElement.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.15)';
  }
  
  onInputBlur(e) {
    e.target.parentElement.style.transform = 'translateY(0)';
    e.target.parentElement.style.boxShadow = 'none';
  }
  
  debouncedAutoSave() {
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveConfig();
    }, 1500);
  }
  
  validateForm() {
    const config = this.getCurrentConfig();
    const isValid = this.isConfigComplete(config);
    
    this.saveBtn.disabled = !isValid;
    this.testBtn.disabled = !isValid;
    
    if (!isValid) {
      this.updateConnectionStatus('disconnected', 'Configuration Incomplete');
    }
    
    return isValid;
  }
  
  getCurrentConfig() {
    return {
      url: this.inputs.url.value.trim(),
      username: this.inputs.username.value.trim(),
      apiKey: this.inputs.apiKey.value.trim()
    };
  }
  
  async loadSavedConfig() {
    try {
      const result = await chrome.storage.local.get(['odooConfig', 'lastConnectionTest']);
      const config = result.odooConfig || {};
      const lastTest = result.lastConnectionTest || null;
      
      console.log('Loaded config:', config);
      
      if (config.url) this.inputs.url.value = config.url;
      if (config.username) this.inputs.username.value = config.username;
      if (config.apiKey) this.inputs.apiKey.value = config.apiKey;
      
      if (this.isConfigComplete(config)) {
        this.showStatus('Configuration loaded successfully', 'success');
        
        if (lastTest) {
          const timeSinceTest = Date.now() - lastTest.timestamp;
          const hoursAgo = Math.floor(timeSinceTest / (1000 * 60 * 60));
          
          if (lastTest.success && hoursAgo < 24) {
            this.updateConnectionStatus('connected', `Connected (${hoursAgo}h ago)`);
          } else {
            this.updateConnectionStatus('unknown', 'Connection status unknown');
          }
        }
      } else {
        this.updateConnectionStatus('disconnected', 'Configuration needed');
      }
      
      this.validateForm();
    } catch (error) {
      console.error('Error loading config:', error);
      this.updateConnectionStatus('error', 'Error loading config');
    }
  }
  
  async saveConfig(e) {
    if (e) e.preventDefault();
    
    const config = this.getCurrentConfig();
    
    console.log('Saving config:', { ...config, apiKey: config.apiKey ? '[HIDDEN]' : 'EMPTY' });
    
    if (!this.isConfigComplete(config)) {
      this.showStatus('Please fill in all fields (URL, Username, API Key)', 'error');
      return;
    }
    
    try {
      this.setSaveButtonLoading(true);
      
      await chrome.storage.local.set({ odooConfig: config });
      this.showStatus('Configuration saved successfully!', 'success');
      console.log('Config saved successfully');
      
      this.updateConnectionStatus('unknown', 'Saved - Test connection');
    } catch (error) {
      this.showStatus('Error saving configuration', 'error');
      console.error('Save error:', error);
      this.updateConnectionStatus('error', 'Save failed');
    } finally {
      this.setSaveButtonLoading(false);
    }
  }
  
  setSaveButtonLoading(loading) {
    if (loading) {
      this.saveBtn.classList.add('btn-loading');
      this.saveBtn.textContent = 'Saving...';
      this.saveBtn.disabled = true;
    } else {
      this.saveBtn.classList.remove('btn-loading');
      this.saveBtn.textContent = 'Save Config';
      this.saveBtn.disabled = false;
    }
  }
  
  setTestButtonLoading(loading) {
    if (loading) {
      this.testBtn.classList.add('btn-loading');
      this.testBtn.textContent = 'Testing...';
      this.testBtn.disabled = true;
    } else {
      this.testBtn.classList.remove('btn-loading');
      this.testBtn.textContent = 'Test Connection';
      this.testBtn.disabled = false;
    }
  }
  
  async testConnection() {
    const config = this.getCurrentConfig();
    
    console.log('Testing with config:', { ...config, apiKey: config.apiKey ? '[HIDDEN]' : 'EMPTY' });
    
    if (!this.isConfigComplete(config)) {
      this.showStatus('Please fill in all fields before testing', 'error');
      return;
    }
    
    this.showLoading(true);
    this.setTestButtonLoading(true);
    this.hideStatus();
    this.updateConnectionStatus('testing', 'Testing connection...');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection',
        config: config
      });
      
      console.log('Test response:', response);
      
      const testResult = {
        success: response.success,
        message: response.message,
        timestamp: Date.now()
      };
      
      await chrome.storage.local.set({ lastConnectionTest: testResult });
      
      if (response.success) {
        this.showStatus('✅ Connection successful! Ready to create tickets, tasks, and leads.', 'success');
        this.updateConnectionStatus('connected', 'Connected successfully');
        await this.saveConfig();
      } else {
        this.showStatus(`❌ Connection failed: ${response.message}`, 'error');
        this.updateConnectionStatus('error', 'Connection failed');
      }
    } catch (error) {
      this.showStatus(`❌ Connection error: ${error.message}`, 'error');
      this.updateConnectionStatus('error', 'Connection error');
      console.error('Test error:', error);
    } finally {
      this.showLoading(false);
      this.setTestButtonLoading(false);
    }
  }
  
  async checkConnectionStatus() {
    try {
      const result = await chrome.storage.local.get(['lastConnectionTest', 'odooConfig']);
      const lastTest = result.lastConnectionTest;
      const config = result.odooConfig;
      
      if (!config || !this.isConfigComplete(config)) {
        this.updateConnectionStatus('disconnected', 'Configuration needed');
        return;
      }
      
      if (!lastTest) {
        this.updateConnectionStatus('unknown', 'Connection not tested');
        return;
      }
      
      const timeSinceTest = Date.now() - lastTest.timestamp;
      const hoursAgo = Math.floor(timeSinceTest / (1000 * 60 * 60));
      
      if (lastTest.success) {
        if (hoursAgo < 1) {
          this.updateConnectionStatus('connected', 'Connected (recently tested)');
        } else if (hoursAgo < 24) {
          this.updateConnectionStatus('connected', `Connected (${hoursAgo}h ago)`);
        } else {
          this.updateConnectionStatus('unknown', 'Connection test expired');
        }
      } else {
        this.updateConnectionStatus('error', `Failed (${hoursAgo}h ago)`);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      this.updateConnectionStatus('error', 'Status check failed');
    }
  }
  
  updateConnectionStatus(status, message) {
    this.statusText.textContent = message;
    
    this.statusDot.classList.remove('connected', 'testing', 'error');
    
    switch (status) {
      case 'connected':
        this.statusDot.classList.add('connected');
        break;
      case 'testing':
        this.statusDot.style.background = '#ffc107';
        this.statusDot.style.animation = 'pulse-yellow 1s infinite';
        break;
      case 'error':
        this.statusDot.classList.add('error');
        break;
      case 'disconnected':
      case 'unknown':
      default:
        break;
    }
  }
  
  isConfigComplete(config) {
    return config.url && config.username && config.apiKey && 
           config.url.length > 0 && config.username.length > 0 && config.apiKey.length > 0;
  }
  
  showStatus(message, type) {
    this.status.textContent = message;
    this.status.className = `status ${type}`;
    this.status.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => this.hideStatus(), 4000);
    }
  }
  
  hideStatus() {
    this.status.style.display = 'none';
  }
  
  showLoading(show) {
    if (show) {
      this.loading.classList.add('show');
    } else {
      this.loading.classList.remove('show');
    }
  }
}

// ============================================
// AI CONFIGURATION MANAGER
// ============================================

class AIConfigManager {
  constructor() {
    this.providerSelect = document.getElementById('aiProvider');
    this.apiKeyInput = document.getElementById('aiApiKey');
    this.testAiBtn = document.getElementById('testAiBtn');
    this.saveAiBtn = document.getElementById('saveAiBtn');
    this.aiConfigForm = document.getElementById('aiConfigForm');
    this.providerHelp = document.getElementById('aiProviderHelp');
    
    this.providerLinks = {
      deepseek: 'https://platform.deepseek.com',
      claude: 'https://console.anthropic.com',
      openai: 'https://platform.openai.com/api-keys'
    };
    
    this.init();
  }
  
  init() {
    this.loadAIConfig();
    this.bindEvents();
  }
  
  bindEvents() {
    this.providerSelect.addEventListener('change', () => {
      this.updateProviderHelp();
      // Load the API key for the newly selected provider
      this.loadProviderApiKey();
    });
    
    this.testAiBtn.addEventListener('click', () => this.testAIConnection());
    this.aiConfigForm.addEventListener('submit', (e) => this.saveAIConfig(e));
  }
  
  async loadAIConfig() {
    try {
      const result = await chrome.storage.local.get(['aiConfig']);
      const config = result.aiConfig || {};
      
      console.log('📋 Loaded AI config:', config);
      
      if (config.selectedProvider) {
        this.providerSelect.value = config.selectedProvider;
      }
      
      // Load API key for current provider
      await this.loadProviderApiKey();
      
      this.updateProviderHelp();
      
    } catch (error) {
      console.error('Error loading AI config:', error);
    }
  }
  
  async loadProviderApiKey() {
    try {
      const result = await chrome.storage.local.get(['aiConfig']);
      const config = result.aiConfig || {};
      const provider = this.providerSelect.value;
      const apiKey = config[`${provider}_api_key`];
      
      if (apiKey) {
        this.apiKeyInput.value = apiKey;
        console.log(`✅ Loaded API key for ${provider}`);
      } else {
        this.apiKeyInput.value = '';
        console.log(`ℹ️ No API key found for ${provider}`);
      }
    } catch (error) {
      console.error('Error loading provider API key:', error);
    }
  }
  
  updateProviderHelp() {
    const provider = this.providerSelect.value;
    const providerNames = {
      deepseek: 'DeepSeek',
      claude: 'Claude (Anthropic)',
      openai: 'OpenAI'
    };
    
    this.providerHelp.innerHTML = `
      Get your ${providerNames[provider]} API key from: 
      <a href="${this.providerLinks[provider]}" target="_blank" style="color: #25D366;">
        ${this.providerLinks[provider].replace('https://', '')}
      </a>
    `;
  }
  
  async saveAIConfig(e) {
    if (e) e.preventDefault();
    
    const provider = this.providerSelect.value;
    const apiKey = this.apiKeyInput.value.trim();
    
    if (!apiKey) {
      this.showStatus('Please enter an API key', 'error');
      return;
    }
    
    try {
      // Load existing config
      const result = await chrome.storage.local.get(['aiConfig']);
      const config = result.aiConfig || {};
      
      // Update config
      config.selectedProvider = provider;
      config[`${provider}_api_key`] = apiKey;
      
      // Save to storage
      await chrome.storage.local.set({ aiConfig: config });
      
      console.log(`✅ AI config saved for ${provider}:`, {
        selectedProvider: config.selectedProvider,
        hasKey: !!apiKey
      });
      
      this.showStatus(`AI configuration saved for ${provider}!`, 'success');
      
    } catch (error) {
      this.showStatus('Error saving AI configuration', 'error');
      console.error('Save AI config error:', error);
    }
  }
  
  async testAIConnection() {
    const provider = this.providerSelect.value;
    const apiKey = this.apiKeyInput.value.trim();
    
    if (!apiKey) {
      this.showStatus('Please enter an API key first', 'error');
      return;
    }
    
    // Disable button and show loading state
    this.testAiBtn.disabled = true;
    this.testAiBtn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
        <span>Testing ${provider}...</span>
      </div>
    `;
    
    // Show initial status
    this.showStatus(`Testing connection to ${provider}...`, 'info');
    
    try {
      // Save config first
      await this.saveAIConfig();
      
      console.log(`Testing AI connection for ${provider}...`);
      
      // Add timeout to the test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
      });
      
      const testPromise = chrome.runtime.sendMessage({
        action: 'testAI',
        provider: provider
      });
      
      // Race between test and timeout
      const response = await Promise.race([testPromise, timeoutPromise]);
      
      console.log('AI test response:', response);
      
      if (response.success) {
        // SUCCESS - Show detailed success message
        this.showStatus(
          `${this.getProviderName(provider)} connected successfully! Ready to use AI suggestions.`,
          'success'
        );
        
        console.log(`${provider} test successful:`, response);
        
      } else {
        // FAILURE - Show detailed error message
        const errorMessage = response.message || 'Unknown error';
        
        this.showStatus(
          `${this.getProviderName(provider)} test failed: ${errorMessage}`,
          'error'
        );
        
        // Show helpful hints based on error type
        if (errorMessage.includes('401') || errorMessage.includes('Invalid')) {
          setTimeout(() => {
            this.showStatus(
              'Tip: Check if your API key is correct and has not expired',
              'info'
            );
          }, 3000);
        } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          setTimeout(() => {
            this.showStatus(
              'Tip: Your API key may not have the required permissions',
              'info'
            );
          }, 3000);
        } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
          setTimeout(() => {
            this.showStatus(
              'Tip: Check your internet connection and firewall settings',
              'info'
            );
          }, 3000);
        }
        
        console.error(`${provider} test failed:`, response);
      }
      
    } catch (error) {
      // EXCEPTION - Show error with details
      const errorMsg = error.message || 'Unknown error occurred';
      
      this.showStatus(
        `Test error: ${errorMsg}`,
        'error'
      );
      
      console.error('AI test exception:', error);
      
      // Show recovery suggestion
      setTimeout(() => {
        this.showStatus(
          'Tip: Try reloading the extension or checking your API key',
          'info'
        );
      }, 3000);
      
    } finally {
      // Reset button state
      this.testAiBtn.disabled = false;
      this.testAiBtn.innerHTML = 'Test AI';
    }
  }
  
  getProviderName(provider) {
    const names = {
      deepseek: 'DeepSeek',
      claude: 'Claude (Anthropic)',
      openai: 'OpenAI GPT-4'
    };
    return names[provider] || provider;
  }
  
  showStatus(message, type) {
    const status = document.getElementById('status');
    if (!status) {
      console.error('❌ Status element not found!');
      alert(message); // Fallback to alert
      return;
    }
    
    // Clear any existing content
    status.innerHTML = '';
    
    // Create message text
    const messageText = document.createElement('span');
    messageText.textContent = message;
    messageText.style.flex = '1';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'status-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
      status.style.display = 'none';
    };
    
    // Add elements to status
    status.appendChild(messageText);
    status.appendChild(closeBtn);
    
    // Set class and show
    status.className = `status ${type}`;
    status.style.display = 'flex';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 5000);
    }
    // Error and info messages stay visible until manually closed
    
    // Scroll to status if needed
    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================
// INITIALIZE BOTH MANAGERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing popup managers...');
  new PopupManager();
  new AIConfigManager();
  console.log('✅ Popup initialized');
});