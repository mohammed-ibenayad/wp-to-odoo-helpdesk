// AI Provider System - Chrome Extension Compatible
// Supports: DeepSeek, Claude, OpenAI, and extensible for more

(function() {
  'use strict';
  
  /**
   * Base AI Provider Configuration
   */
  const AI_PROVIDERS = {
    deepseek: {
      name: 'DeepSeek',
      baseURL: 'https://api.deepseek.com',
      endpoint: '/chat/completions',
      model: 'deepseek-chat',
      supportsJSON: true,
      headerFormat: (apiKey) => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }),
      requestFormat: (messages, options) => ({
        messages: messages,
        model: options.model || 'deepseek-chat',
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        response_format: { type: 'json_object' },
        stream: false
      }),
      responseParser: (data) => {
        return data.choices[0].message.content;
      }
    },
    
    claude: {
      name: 'Claude (Anthropic)',
      baseURL: 'https://api.anthropic.com',
      endpoint: '/v1/messages',
      model: 'claude-sonnet-4-20250514',
      supportsJSON: false, // Claude uses different JSON approach
      headerFormat: (apiKey) => ({
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }),
      requestFormat: (messages, options) => ({
        model: options.model || 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        messages: messages
      }),
      responseParser: (data) => {
        return data.content[0].text;
      }
    },
    
    openai: {
      name: 'OpenAI',
      baseURL: 'https://api.openai.com',
      endpoint: '/v1/chat/completions',
      model: 'gpt-4-turbo-preview',
      supportsJSON: true,
      headerFormat: (apiKey) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }),
      requestFormat: (messages, options) => ({
        model: options.model || 'gpt-4-turbo-preview',
        messages: messages,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        response_format: { type: 'json_object' },
        stream: false
      }),
      responseParser: (data) => {
        return data.choices[0].message.content;
      }
    }
  };
  
  /**
   * AI Analysis Manager
   * Handles conversation analysis with multiple AI providers
   */
  class AIAnalysisManager {
    constructor(providerName = 'deepseek') {
      this.providerName = providerName;
      this.provider = AI_PROVIDERS[providerName];
      
      if (!this.provider) {
        throw new Error(`Unknown AI provider: ${providerName}`);
      }
      
      console.log(`🤖 AI Provider initialized: ${this.provider.name}`);
    }
    
    /**
     * Get API key from storage
     */
    async getAPIKey() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['aiConfig'], (result) => {
          const config = result.aiConfig || {};
          const apiKey = config[`${this.providerName}_api_key`];
          resolve(apiKey);
        });
      });
    }
    
    /**
     * Main analysis method - analyzes WhatsApp conversation
     */
    async analyzeConversation(messages, conversationData) {
      try {
        console.log(`📊 Starting AI analysis with ${this.provider.name}...`);
        
        const apiKey = await this.getAPIKey();
        
        if (!apiKey) {
          throw new Error(`API key not configured for ${this.provider.name}`);
        }
        
        // Build the prompt
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(messages, conversationData);
        
        // Format messages according to provider
        const formattedMessages = this.formatMessages(systemPrompt, userPrompt);
        
        // Make API call
        const response = await this.callAI(apiKey, formattedMessages);
        
        // Parse and validate response
        const suggestions = this.parseResponse(response);
        
        console.log('✅ AI analysis complete:', suggestions);
        
        return {
          success: true,
          suggestions: suggestions,
          provider: this.provider.name
        };
        
      } catch (error) {
        console.error('❌ AI analysis failed:', error);
        
        return {
          success: false,
          error: error.message,
          fallback: this.generateFallbackSuggestions(messages, conversationData)
        };
      }
    }
    
    /**
     * Build system prompt
     */
    buildSystemPrompt() {
      return `You are an expert business analyst specializing in customer service workflows. Your task is to analyze WhatsApp customer conversations and recommend the most appropriate Odoo record type (Support Ticket, Task, or Lead) to create.

Consider these factors:
1. **Support Ticket**: Customer reports issues, needs help, has problems, requests support
2. **Task**: Internal action items, follow-ups, scheduled work, things team needs to do
3. **Lead**: Sales inquiries, product interest, pricing questions, new business opportunities

Provide confidence scores (0-100) and clear reasoning for each recommendation.`;
    }
    
    /**
     * Build user prompt with conversation context
     */
    buildUserPrompt(messages, conversationData) {
      const messageText = messages.map((msg, i) => {
        const sender = msg.senderType === 'customer' ? 'CUSTOMER' : 'AGENT';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        return `[${time}] ${sender}: ${msg.content}`;
      }).join('\n');
      
      return `Analyze this WhatsApp customer service conversation:

CONTACT INFORMATION:
- Name: ${conversationData.contactName}
- Phone: ${conversationData.contactNumber || 'N/A'}
- Is Group Chat: ${conversationData.isGroup ? 'Yes' : 'No'}

CONVERSATION (${messages.length} messages):
${messageText}

TASK:
Analyze this conversation and provide recommendations for THREE types of Odoo records:
1. **Support Ticket** (helpdesk.ticket) - For customer issues and support requests
2. **Internal Task** (project.task) - For team action items and follow-ups
3. **Sales Lead** (crm.lead) - For sales opportunities and inquiries

For EACH type, provide:
- **confidence**: Score from 0-100 indicating how well this conversation fits this record type
- **title**: A clear, concise title for the record (max 100 characters)
- **priority**: Choose ONE: "0" (None), "1" (Low), "2" (Medium), "3" (High)
- **reasoning**: 2-3 sentences explaining your recommendation

IMPORTANT: Respond with ONLY valid JSON in this EXACT format:
{
  "ticket": {
    "confidence": 85,
    "title": "Customer reports payment processing issue",
    "priority": "3",
    "reasoning": "Customer explicitly states payment failure with urgency indicators. Multiple follow-up questions indicate unresolved issue requiring support team attention."
  },
  "task": {
    "confidence": 45,
    "title": "Follow up on customer payment issue",
    "priority": "2",
    "reasoning": "Could be tracked as internal follow-up task for payment team. Lower confidence as primarily customer-facing issue."
  },
  "lead": {
    "confidence": 10,
    "title": "Payment inquiry from existing customer",
    "priority": "1",
    "reasoning": "Not a sales opportunity. This is an existing customer with technical issue, not new business inquiry."
  }
}

DO NOT include any text before or after the JSON object.`;
    }
    
    /**
     * Format messages according to provider requirements
     */
    formatMessages(systemPrompt, userPrompt) {
      if (this.providerName === 'claude') {
        // Claude uses different message format
        return [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userPrompt}`
          }
        ];
      } else {
        // OpenAI/DeepSeek format
        return [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ];
      }
    }
    
    /**
     * Make API call to AI provider
     */
    async callAI(apiKey, messages, options = {}) {
      const url = `${this.provider.baseURL}${this.provider.endpoint}`;
      const headers = this.provider.headerFormat(apiKey);
      const body = this.provider.requestFormat(messages, {
        model: options.model || this.provider.model,
        maxTokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      });
      
      console.log(`🌐 Calling ${this.provider.name} API...`);
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      const content = this.provider.responseParser(data);
      
      return content;
    }
    
    /**
     * Parse AI response and validate structure
     */
    parseResponse(responseText) {
      try {
        // Clean response (remove markdown code blocks if present)
        let cleanedText = responseText.trim();
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Parse JSON
        const parsed = JSON.parse(cleanedText);
        
        // Validate structure
        this.validateSuggestions(parsed);
        
        return parsed;
        
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        console.log('Raw response:', responseText);
        throw new Error(`Invalid AI response format: ${error.message}`);
      }
    }
    
    /**
     * Validate suggestions structure
     */
    validateSuggestions(suggestions) {
      const requiredTypes = ['ticket', 'task', 'lead'];
      const requiredFields = ['confidence', 'title', 'priority', 'reasoning'];
      
      for (const type of requiredTypes) {
        if (!suggestions[type]) {
          throw new Error(`Missing ${type} suggestion`);
        }
        
        for (const field of requiredFields) {
          if (suggestions[type][field] === undefined) {
            throw new Error(`Missing ${field} in ${type} suggestion`);
          }
        }
        
        // Validate data types
        const conf = suggestions[type].confidence;
        if (typeof conf !== 'number' || conf < 0 || conf > 100) {
          throw new Error(`Invalid confidence score for ${type}: ${conf}`);
        }
        
        const priority = suggestions[type].priority;
        if (!['0', '1', '2', '3'].includes(String(priority))) {
          throw new Error(`Invalid priority for ${type}: ${priority}`);
        }
      }
    }
    
    /**
     * Generate fallback suggestions if AI fails
     */
    generateFallbackSuggestions(messages, conversationData) {
      console.log('⚠️ Using fallback suggestion generation');
      
      const combinedContent = messages.map(m => m.content).join(' ').toLowerCase();
      const firstMessage = messages[0].content;
      
      // Simple keyword-based scoring
      let ticketScore = 50;
      let taskScore = 30;
      let leadScore = 20;
      
      const ticketKeywords = ['problem', 'issue', 'help', 'not working', 'broken', 'error'];
      const taskKeywords = ['need to', 'please', 'can you', 'schedule', 'arrange'];
      const leadKeywords = ['interested', 'quote', 'price', 'buy', 'purchase'];
      
      ticketKeywords.forEach(kw => {
        if (combinedContent.includes(kw)) ticketScore += 10;
      });
      taskKeywords.forEach(kw => {
        if (combinedContent.includes(kw)) taskScore += 8;
      });
      leadKeywords.forEach(kw => {
        if (combinedContent.includes(kw)) leadScore += 12;
      });
      
      // Normalize
      const total = ticketScore + taskScore + leadScore;
      ticketScore = Math.round((ticketScore / total) * 100);
      taskScore = Math.round((taskScore / total) * 100);
      leadScore = 100 - ticketScore - taskScore;
      
      // Detect priority
      let priority = '1';
      if (combinedContent.includes('urgent') || combinedContent.includes('asap')) {
        priority = '3';
      } else if (combinedContent.includes('important')) {
        priority = '2';
      }
      
      const truncated = firstMessage.substring(0, 50) + '...';
      
      return {
        ticket: {
          confidence: ticketScore,
          title: `Support: ${truncated}`,
          priority: priority,
          reasoning: 'Automated analysis based on conversation keywords and patterns.'
        },
        task: {
          confidence: taskScore,
          title: `Task: ${truncated}`,
          priority: priority,
          reasoning: 'Automated analysis suggests this may require internal action.'
        },
        lead: {
          confidence: leadScore,
          title: `Inquiry: ${truncated}`,
          priority: priority,
          reasoning: 'Automated analysis detected potential sales inquiry elements.'
        }
      };
    }
    
    /**
     * Test AI provider connection
     */
    async testConnection() {
      try {
        const apiKey = await this.getAPIKey();
        
        if (!apiKey) {
          return {
            success: false,
            message: 'API key not configured'
          };
        }
        
        // Simple test message
        const testMessages = this.formatMessages(
          'You are a helpful assistant.',
          'Respond with exactly: {"status": "ok", "message": "Connection successful"}'
        );
        
        const response = await this.callAI(apiKey, testMessages, {
          maxTokens: 100,
          temperature: 0
        });
        
        return {
          success: true,
          message: `Connected to ${this.provider.name}`,
          response: response
        };
        
      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    }
  }
  
  /**
   * AI Configuration Manager
   * Handles API key storage and provider selection
   */
  class AIConfigManager {
    static async saveConfig(provider, apiKey) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['aiConfig'], (result) => {
          const config = result.aiConfig || {};
          config[`${provider}_api_key`] = apiKey;
          config.selectedProvider = provider;
          
          chrome.storage.local.set({ aiConfig: config }, () => {
            console.log(`✅ AI config saved for ${provider}`);
            resolve(true);
          });
        });
      });
    }
    
    static async getConfig() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['aiConfig'], (result) => {
          resolve(result.aiConfig || {});
        });
      });
    }
    
    static async getSelectedProvider() {
      const config = await this.getConfig();
      return config.selectedProvider || 'deepseek';
    }
    
    static getAvailableProviders() {
      return Object.keys(AI_PROVIDERS).map(key => ({
        id: key,
        name: AI_PROVIDERS[key].name,
        model: AI_PROVIDERS[key].model
      }));
    }
  }
  
  // Make available globally
  window.AIAnalysisManager = AIAnalysisManager;
  window.AIConfigManager = AIConfigManager;
  window.AI_PROVIDERS = AI_PROVIDERS;
  
  console.log('✅ AIProvider system loaded with support for:', 
    Object.keys(AI_PROVIDERS).map(k => AI_PROVIDERS[k].name).join(', '));
  
})();

// USAGE EXAMPLE:
/*
// 1. Save API key (typically done in popup/settings)
await AIConfigManager.saveConfig('deepseek', 'sk-your-api-key');

// 2. Create analyzer instance
const analyzer = new AIAnalysisManager('deepseek'); // or 'claude', 'openai'

// 3. Analyze conversation
const result = await analyzer.analyzeConversation(messages, conversationData);

if (result.success) {
  console.log('AI Suggestions:', result.suggestions);
  // result.suggestions = { ticket: {...}, task: {...}, lead: {...} }
} else {
  console.error('AI failed:', result.error);
  console.log('Using fallback:', result.fallback);
}
*/