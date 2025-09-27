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
    }, 1500); // Increased debounce time
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
        
        // Show last connection status if available
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
      // Add loading state to save button
      this.setSaveButtonLoading(true);
      
      await chrome.storage.local.set({ odooConfig: config });
      this.showStatus('Configuration saved successfully!', 'success');
      console.log('Config saved successfully');
      
      // Update connection status
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
      this.saveBtn.textContent = '💾 Save Config';
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
      this.testBtn.textContent = '🔍 Test Connection';
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
      
      // Store test result with timestamp
      const testResult = {
        success: response.success,
        message: response.message,
        timestamp: Date.now()
      };
      
      await chrome.storage.local.set({ lastConnectionTest: testResult });
      
      if (response.success) {
        this.showStatus('✅ Connection successful! Ready to create tickets, tasks, and leads.', 'success');
        this.updateConnectionStatus('connected', 'Connected successfully');
        await this.saveConfig(); // Auto-save on successful test
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
    
    // Remove all status classes
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
        // Default red styling is already applied
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
    
    // Auto-hide success messages
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

// Enhanced CSS for testing animation
const additionalStyles = `
  @keyframes pulse-yellow {
    0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
  }
`;

// Add additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});