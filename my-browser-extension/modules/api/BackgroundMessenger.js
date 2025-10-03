// Background Message Handler - Chrome Extension Compatible
// No imports/exports - using global window object

(function() {
  'use strict';
  
  class BackgroundMessenger {
    static async getOdooConfig() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['odooConfig'], (result) => {
          resolve(result.odooConfig || {});
        });
      });
    }
    
    static async sendToBackground(message) {
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
    
    static async createTicket(conversationData) {
      const config = await this.getOdooConfig();
      return await this.sendToBackground({
        action: 'createTicket',
        config: config,
        conversationData: conversationData
      });
    }
    
    static async createTask(taskData) {
      const config = await this.getOdooConfig();
      return await this.sendToBackground({
        action: 'createTask',
        config: config,
        taskData: taskData
      });
    }
    
    static async createLead(leadData) {
      const config = await this.getOdooConfig();
      return await this.sendToBackground({
        action: 'createLead',
        config: config,
        leadData: leadData
      });
    }
    
    static async searchContacts(query) {
      const config = await this.getOdooConfig();
      const result = await this.sendToBackground({
        action: 'searchContacts',
        config: config,
        query: query
      });
      
      console.log('📋 searchContacts raw result:', result);
      
      return result;
    }
    
    /**
     * 🆕 BATCH search contacts - ONE API call instead of many
     */
    static async batchSearchContacts(phones, names) {
      const config = await this.getOdooConfig();
      
      console.log('📦 BackgroundMessenger.batchSearchContacts called with:', { phones, names });
      
      const result = await this.sendToBackground({
        action: 'batchSearchContacts',
        config: config,
        phones: phones,
        names: names
      });
      
      console.log('🔥 batchSearchContacts result:', result);
      
      return result;
    }
    
    static async suggestContacts(contactName, contactNumber) {
      const config = await this.getOdooConfig();
      const result = await this.sendToBackground({
        action: 'suggestContacts',
        config: config,
        contactName: contactName,
        contactNumber: contactNumber
      });
      
      console.log('💡 suggestContacts raw result:', result);
      
      return result;
    }
    
    static async createContact(contactData) {
      const config = await this.getOdooConfig();
      return await this.sendToBackground({
        action: 'createContact',
        config: config,
        contactData: contactData
      });
    }
  }
  
  // Make available globally
  window.BackgroundMessenger = BackgroundMessenger;
  
  console.log('✅ BackgroundMessenger loaded');
})();