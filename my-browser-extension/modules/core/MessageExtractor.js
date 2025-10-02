// Message Data Extraction Utilities - Chrome Extension Compatible
// No imports/exports - using global window object

(function() {
  'use strict';
  
  class MessageExtractor {
    static extractMessageData(messageContainer) {
      const messageTextElement = 
        messageContainer.querySelector('.selectable-text.copyable-text span') ||
        messageContainer.querySelector('.copyable-text span.selectable-text') ||
        messageContainer.querySelector('.copyable-text .selectable-text') ||
        messageContainer.querySelector('.copyable-text span') ||
        messageContainer.querySelector('.selectable-text');
      
      const messageText = messageTextElement?.textContent?.trim() || '';
      
      // IMPROVED TIMESTAMP EXTRACTION
      let timestamp = new Date();
      let timeText = null;
      
      // Priority 1: Check data attribute (most reliable)
      const dataElement = messageContainer.querySelector('[data-pre-plain-text]');
      if (dataElement) {
        const dataText = dataElement.getAttribute('data-pre-plain-text');
        const timeMatch = dataText?.match(/\[(\d{1,2}:\d{2}\s*(?:am|pm)?)/i);
        if (timeMatch) {
          timeText = timeMatch[1];
        }
      }
      
      // Priority 2: Known selector (if still works)
      if (!timeText) {
        const knownTimeEl = messageContainer.querySelector('.x1c4vz4f.x2lah0s');
        timeText = knownTimeEl?.textContent?.trim();
      }
      
      // Priority 3: Search all spans for time pattern
      if (!timeText || !timeText.match(/\d{1,2}:\d{2}/)) {
        const allSpans = messageContainer.querySelectorAll('span');
        for (const span of allSpans) {
          const text = span.textContent?.trim();
          if (text && text.match(/^\d{1,2}:\d{2}\s*(am|pm)?$/i)) {
            timeText = text;
            break;
          }
        }
      }
      
      // Parse the time if found
      if (timeText && timeText.match(/\d{1,2}:\d{2}/)) {
        timestamp = this.parseWhatsAppTime(timeText);
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

    static parseGroupIdentifiers(groupHeaderText) {
      // Group header might be: "John, +32478940363, Alice, Bob"
      // Split by comma and trim
      const parts = groupHeaderText.split(',').map(p => p.trim());
      
      const names = [];
      const phones = [];
      
      parts.forEach(part => {
        // Check if it's a phone number pattern
        if (/^\+?\d[\d\s-]+$/.test(part)) {
          phones.push(part);
        } else {
          names.push(part);
        }
      });
      
      return { names, phones };
    }
    
static isGroupChat() {
  console.log('--- Checking if group chat ---');
  
  const url = window.location.href;
  console.log('URL:', url);
  
  // Method 1: Check URL - groups have @g.us instead of @c.us
  if (url.includes('@g.us')) {
    console.log('✅ Detected GROUP via URL (@g.us)');
    return true;
  }
  
  // Method 2: Look for participant list in header
  // Groups have a span with title containing multiple contacts/phones
  const participantSpan = document.querySelector('header span[title]');
  if (participantSpan) {
    const title = participantSpan.getAttribute('title');
    console.log('Found title attribute:', title);
    
    // If title contains commas or "You", it's likely a group
    if (title && (title.includes(',') || title.includes('You'))) {
      console.log('✅ Detected GROUP via participant list in title');
      return true;
    }
  }
  
  // Method 3: Look for group info icon
  const groupIcon = document.querySelector('[data-testid="group-info"]') ||
                    document.querySelector('[aria-label*="Group info"]');
  if (groupIcon) {
    console.log('✅ Detected GROUP via group info icon');
    return true;
  }
  
  // Method 4: Check for participant count indicator
  const participantCount = document.querySelector('[data-testid="conversation-info-header-chat-subtitle"]');
  if (participantCount?.textContent?.includes('participant')) {
    console.log('✅ Detected GROUP via participant count:', participantCount.textContent);
    return true;
  }
  
  console.log('ℹ️ Detected INDIVIDUAL chat');
  return false;
}

static extractGroupMembers() {
  // Extract group members from the title attribute
  const participantSpan = document.querySelector('header span[title]');
  if (!participantSpan) return null;
  
  const title = participantSpan.getAttribute('title');
  if (!title) return null;
  
  console.log('Parsing group members from title:', title);
  
  // Title format: "Bsi, +32 477 85 29 45, +32 472 82 61 69, ..., You"
  // Split by comma and trim
  const parts = title.split(',').map(p => p.trim());
  
  const names = [];
  const phones = [];
  
  parts.forEach(part => {
    // Skip "You"
    if (part.toLowerCase() === 'you') return;
    
    // Check if it's a phone number pattern
    if (/^\+?\d[\d\s-]+$/.test(part)) {
      phones.push(part);
    } else {
      names.push(part);
    }
  });
  
  console.log('Extracted group members - Names:', names, 'Phones:', phones);
  
  return { names, phones };
}

static extractConversationData() {
  console.log('=== EXTRACTING CONVERSATION DATA ===');
  
  let contactName = 'Unknown Contact';
  let contactIdentifier = null;
  let isGroup = this.isGroupChat();
  let groupIdentifiers = null;
  
  console.log('Is group chat:', isGroup);
  console.log('Current URL:', window.location.href);
  
  // Extract header text (contact name or group name)
  const nameSelectors = [
    '[data-testid="conversation-header"] span[dir="auto"]._ao3e',
    'header span[dir="auto"]._ao3e',
    'header span[dir="auto"]',
  ];
  
  for (const selector of nameSelectors) {
    console.log('Trying selector:', selector);
    const nameElement = document.querySelector(selector);
    
    if (nameElement) {
      console.log('Found element:', nameElement);
      console.log('Element text content:', nameElement.textContent);
    } else {
      console.log('Element not found');
    }
    
    if (nameElement && nameElement.textContent?.trim()) {
      contactIdentifier = nameElement.textContent.trim();
      contactName = contactIdentifier;
      console.log('✅ SUCCESS - Extracted contact:', contactName);
      break;
    }
  }
  
  if (!contactIdentifier) {
    console.warn('❌ FAILED - Could not extract contact name from any selector');
    console.log('Trying to find ANY header element for debugging:');
    const anyHeader = document.querySelector('header');
    if (anyHeader) {
      console.log('Header HTML:', anyHeader.innerHTML.substring(0, 500));
    }
  }
  
  // If group, extract members from title attribute
  if (isGroup) {
    groupIdentifiers = this.extractGroupMembers();
    console.log('Group identifiers:', groupIdentifiers);
  }
  
  // Extract phone from URL (though it seems to always be null in your case)
  const contactNumber = this.extractPhoneNumber();
  console.log('Phone number from URL:', contactNumber);
  
  // If contactIdentifier is a phone number and we don't have contactNumber from URL
  if (!contactNumber && contactIdentifier && /^\+?\d[\d\s-]+$/.test(contactIdentifier)) {
    console.log('Using contactIdentifier as phone number');
  }
  
  const result = {
    contactName: contactName,
    contactNumber: contactNumber,
    contactIdentifier: contactIdentifier,
    isGroup: isGroup,
    groupIdentifiers: groupIdentifiers,
    chatUrl: window.location.href
  };
  
  console.log('Final conversation data:', result);
  console.log('=== END EXTRACTION ===');
  
  return result;
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