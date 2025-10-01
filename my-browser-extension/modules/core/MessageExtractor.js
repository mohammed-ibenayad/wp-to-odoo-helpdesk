// Message Data Extraction Utilities - Chrome Extension Compatible
// No imports/exports - using global window object

(function() {
  'use strict';
  
  class MessageExtractor {
    static extractMessageData(messageContainer) {
      const messageTextElement = messageContainer.querySelector('._ao3e.selectable-text.copyable-text span') ||
                                messageContainer.querySelector('.copyable-text ._ao3e') ||
                                messageContainer.querySelector('.selectable-text');
      
      const messageText = messageTextElement?.textContent?.trim() || '';
      
      const timeElements = messageContainer.querySelectorAll('.x1c4vz4f.x2lah0s');
      let timestamp = new Date();
      
      for (const timeEl of timeElements) {
        const timeText = timeEl.textContent?.trim();
        if (timeText && timeText.match(/\d{1,2}:\d{2}\s*(am|pm)/i)) {
          timestamp = this.parseWhatsAppTime(timeText);
          break;
        }
      }
      
      const hasImage = messageContainer.querySelector('img[alt]');
      const hasDocument = messageContainer.querySelector('[data-icon]');
      const hasQuote = messageContainer.querySelector('._aju2');
      
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
    
    static extractConversationData() {
      let contactName = 'Unknown Contact';
      
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
    
    static extractPhoneNumber() {
      const url = window.location.href;
      const phoneMatch = url.match(/\/(\d+)@/);
      return phoneMatch ? `+${phoneMatch[1]}` : null;
    }
    
    static parseWhatsAppTime(timeString) {
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
    
    static isIncomingMessage(messageContainer) {
      return !!messageContainer.querySelector('.message-in');
    }
    
    static getMessageId(messageContainer) {
      const messageData = this.extractMessageData(messageContainer);
      const messageText = messageData.content;
      const timestamp = messageData.timestamp;
      
      const uniqueString = messageText + timestamp.getTime();
      return this.simpleHash(uniqueString);
    }
    
    static simpleHash(str) {
      let hash = 0;
      if (str.length === 0) return hash.toString();
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString() + Date.now().toString().slice(-6);
    }
    
    static calculateDeadline(messageContent) {
      const content = messageContent.toLowerCase();
      if (content.includes('urgent') || content.includes('asap')) {
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (content.includes('this week')) {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
      return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }
    
    static formatMultipleMessages(messages, conversationData, type) {
      const typeLabels = {
        ticket: 'Multi-message ticket',
        task: 'Multi-message task', 
        lead: 'Multi-message lead'
      };
      
      let description = `${typeLabels[type]} created from WhatsApp conversation with ${conversationData.contactName}\n\n`;
      description += `=== CONVERSATION HISTORY (${messages.length} messages) ===\n\n`;
      
      messages.forEach((msg, index) => {
        const senderLabel = msg.senderType === 'customer' ? '👤 Customer' : '👨‍💼 Agent';
        const timestamp = msg.timestamp.toLocaleString();
        description += `${index + 1}. ${senderLabel} (${timestamp}):\n${msg.content}\n\n`;
      });
      
      description += `=== END CONVERSATION ===\n\n`;
      description += `Created from WhatsApp Web on ${new Date().toLocaleString()}`;
      
      return description;
    }
  }
  
  // Make available globally
  window.MessageExtractor = MessageExtractor;
  
  console.log('✅ MessageExtractor loaded');
})();