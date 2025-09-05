// whatsapp-odoo-poc/popup.js

class PopupManager {
  constructor() {
    this.initializeElements();
    this.loadSavedConfig();
    this.bindEvents();
  }
  
  initializeElements() {
    this.form = document.getElementById('configForm');
    this.testBtn = document.getElementById('testBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.loading = document.getElementById('loading');
    this.status = document.getElementById('status');
    
    this.inputs = {
      url: document.getElementById('odooUrl'),
      username: document.getElementById('username'),
      apiKey: document.getElementById('apiKey')
    };
  }
  
  bindEvents() {
    this.testBtn.addEventListener('click', () => this.testConnection());
    this.form.addEventListener('submit', (e) => this.saveConfig(e));
    
    // Auto-save on input change
    Object.values(this.inputs).forEach(input => {
      input.addEventListener('input', () => this.autoSave());
    });
  }
  
  async loadSavedConfig() {
    try {
      const result = await chrome.storage.local.get(['odooConfig']);
      const config = result.odooConfig || {};
      
      console.log('Loaded config:', config);
      
      if (config.url) this.inputs.url.value = config.url;
      if (config.username) this.inputs.username.value = config.username;
      if (config.apiKey) this.inputs.apiKey.value = config.apiKey;
      
      if (this.isConfigComplete(config)) {
        this.showStatus('Configuration loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }
  
  async saveConfig(e) {
    if (e) e.preventDefault();
    
    const config = {
      url: this.inputs.url.value.trim(),
      username: this.inputs.username.value.trim(),
      apiKey: this.inputs.apiKey.value.trim()
    };
    
    console.log('Saving config:', { ...config, apiKey: config.apiKey ? '[HIDDEN]' : 'EMPTY' });
    
    if (!this.isConfigComplete(config)) {
      this.showStatus('Please fill in all fields (URL, Username, API Key)', 'error');
      return;
    }
    
    try {
      await chrome.storage.local.set({ odooConfig: config });
      this.showStatus('Configuration saved successfully!', 'success');
      console.log('Config saved successfully');
    } catch (error) {
      this.showStatus('Error saving configuration', 'error');
      console.error('Save error:', error);
    }
  }
  
  async autoSave() {
    // Debounced auto-save
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveConfig();
    }, 1000);
  }
  
  async testConnection() {
    const config = {
      url: this.inputs.url.value.trim(),
      username: this.inputs.username.value.trim(),
      apiKey: this.inputs.apiKey.value.trim()
    };
    
    console.log('Testing with config:', { ...config, apiKey: config.apiKey ? '[HIDDEN]' : 'EMPTY' });
    
    if (!this.isConfigComplete(config)) {
      this.showStatus('Please fill in all fields before testing', 'error');
      return;
    }
    
    this.showLoading(true);
    this.hideStatus();
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection',
        config: config
      });
      
      console.log('Test response:', response);
      
      if (response.success) {
        this.showStatus('✅ Connection successful!', 'success');
        await this.saveConfig(); // Auto-save on successful test
      } else {
        this.showStatus(`❌ Connection failed: ${response.message}`, 'error');
      }
    } catch (error) {
      this.showStatus(`❌ Connection error: ${error.message}`, 'error');
      console.error('Test error:', error);
    } finally {
      this.showLoading(false);
    }
  }
  
  isConfigComplete(config) {
    return config.url && config.username && config.apiKey;
  }
  
  showStatus(message, type) {
    this.status.textContent = message;
    this.status.className = `status ${type}`;
    this.status.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => this.hideStatus(), 3000);
    }
  }
  
  hideStatus() {
    this.status.style.display = 'none';
  }
  
  showLoading(show) {
    if (show) {
      this.loading.classList.add('show');
      this.testBtn.disabled = true;
    } else {
      this.loading.classList.remove('show');
      this.testBtn.disabled = false;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});