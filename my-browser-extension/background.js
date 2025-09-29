// Enhanced background.js using Odoo JSON-2 API (Odoo 19+ ONLY)
// Compatible with both Odoo Community Edition (self-hosted) and Odoo.com
// Requires Odoo 19.0 or higher

class OdooJSON2Client {
  constructor(config) {
    this.url = config.url.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.username = config.username;
    this.database = null;
    this.debug = true;
  }
  
  log(message, data = null) {
    if (this.debug) {
      console.log(`[Odoo JSON-2 API] ${message}`, data || '');
    }
  }
  
  /**
   * Verify Odoo version is 19 or higher
   */
  async verifyOdooVersion() {
    try {
      const versionUrl = `${this.url}/web/version`;
      const response = await fetch(versionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const versionInfo = await response.json();
        const version = versionInfo.version_info || versionInfo.server_version_info;
        
        if (version && version[0] >= 19) {
          this.log(`✅ Odoo ${version[0]}.0 detected - JSON-2 API supported`);
          return { supported: true, version: version[0] };
        } else {
          this.log(`❌ Odoo ${version ? version[0] : 'unknown'} detected - requires Odoo 19+`);
          return { 
            supported: false, 
            version: version ? version[0] : 'unknown',
            message: `This extension requires Odoo 19.0 or higher. Your version: ${version ? version[0] + '.0' : 'unknown'}`
          };
        }
      } else {
        return { 
          supported: false, 
          message: 'Could not detect Odoo version. Please ensure the server is accessible.' 
        };
      }
    } catch (error) {
      this.log('Version detection failed:', error);
      return { 
        supported: false, 
        message: `Connection failed: ${error.message}. Please check your URL.` 
      };
    }
  }
  
  /**
   * Get database name - works for both Community Edition and Odoo.com
   */
  async getDatabaseName() {
    const urlParts = new URL(this.url);
    const hostname = urlParts.hostname;
    
    // For *.odoo.com URLs, extract subdomain as database
    if (hostname.includes('.odoo.com')) {
      const parts = hostname.split('.');
      let subdomain;
      if (parts.length >= 3 && parts[parts.length - 3] === 'dev') {
        subdomain = parts.slice(0, -3).join('-');
      } else {
        subdomain = parts[0];
      }
      this.log('✅ Database detected from subdomain:', subdomain);
      return subdomain;
    }
    
    // For self-hosted (Community Edition), try to get database list
    try {
      const dbListUrl = `${this.url}/web/database/list`;
      const response = await fetch(dbListUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {},
          id: Math.random()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          const dbName = data.result[0];
          this.log('✅ Database detected from server:', dbName);
          return dbName;
        }
      }
    } catch (error) {
      this.log('Database list query failed:', error);
    }
    
    // Fallback: return null (single database mode - header not needed)
    this.log('ℹ️ Using single database mode');
    return null;
  }
  
  /**
   * Make a JSON-2 API call
   */
  async callMethod(model, method, params = {}) {
    const endpoint = `${this.url}/json/2/${model}/${method}`;
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `bearer ${this.apiKey}`,
      'User-Agent': 'WhatsApp-Odoo-Integration/2.0'
    };
    
    // Add database header if needed (for multi-database setups)
    if (this.database) {
      headers['X-Odoo-Database'] = this.database;
    }
    
    this.log(`📤 API Call: ${model}.${method}`, { endpoint, params });
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        this.log('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      this.log(`✅ API Success: ${model}.${method}`, result);
      return result;
      
    } catch (error) {
      this.log('❌ Request failed:', error);
      throw error;
    }
  }
  
  /**
   * Test connection - verifies version, database, and API key
   */
  async testConnection() {
    try {
      this.log('🔍 Testing connection...');
      
      // Step 1: Verify Odoo version
      const versionCheck = await this.verifyOdooVersion();
      if (!versionCheck.supported) {
        return {
          success: false,
          error: versionCheck.message
        };
      }
      
      // Step 2: Get database name
      this.database = await this.getDatabaseName();
      this.log('📊 Database:', this.database || 'single-db mode');
      
      // Step 3: Test API key by getting current user context
      try {
        const userContext = await this.callMethod('res.users', 'context_get', {});
        
        this.log('✅ Connection successful!', {
          userId: userContext.uid,
          userName: userContext.name,
          database: this.database
        });
        
        return {
          success: true,
          userId: userContext.uid,
          userName: userContext.name,
          version: versionCheck.version,
          database: this.database
        };
      } catch (apiError) {
        // Provide specific error message for API key issues
        if (apiError.message.includes('Invalid apikey') || apiError.message.includes('401')) {
          return {
            success: false,
            error: 'Invalid API Key. Please check your API key and try again.'
          };
        }
        throw apiError;
      }
      
    } catch (error) {
      this.log('❌ Connection test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Create a helpdesk ticket
   */
  async createTicket(conversationData) {
    try {
      // Ensure database is set
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      // Find or create partner
      const partnerId = await this.findOrCreatePartner(conversationData);
      
      const ticketTitle = conversationData.summary || `WhatsApp: ${conversationData.contactName}`;
      
      // Create ticket data object
      const ticketValues = {
        name: ticketTitle,
        description: conversationData.description,
        partner_id: partnerId,
        priority: conversationData.priority || '1',
        stage_id: 1
      };
      
      // Create ticket using JSON-2 API with vals_list
      const ticketId = await this.callMethod('helpdesk.ticket', 'create', {
        vals_list: [ticketValues]
      });
      
      // Note: create returns a list of IDs when using vals_list
      const actualTicketId = Array.isArray(ticketId) ? ticketId[0] : ticketId;
      
      // Log conversation if messages are provided
      if (conversationData.messages) {
        await this.logConversation(actualTicketId, conversationData, 'helpdesk.ticket');
      }
      
      return {
        success: true,
        ticketId: actualTicketId,
        partnerId: partnerId
      };
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Create a project task
   */
  async createTask(taskData) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      const partnerId = await this.findOrCreatePartnerByName(taskData.partner_name);
      
      // Get or create default project
      const projectId = await this.getDefaultProject();
      
      const taskValues = {
        name: taskData.name,
        description: taskData.description,
        partner_id: partnerId,
        date_deadline: taskData.date_deadline ? this.formatDate(taskData.date_deadline) : false,
        priority: taskData.priority || '1',
        project_id: projectId
      };
      
      const taskId = await this.callMethod('project.task', 'create', {
        vals_list: [taskValues]
      });
      
      const actualTaskId = Array.isArray(taskId) ? taskId[0] : taskId;
      
      // Log conversation for multi-message tasks
      if (taskData.messages) {
        await this.logConversation(actualTaskId, taskData, 'project.task');
      }
      
      return {
        success: true,
        taskId: actualTaskId,
        partnerId: partnerId
      };
      
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Create a CRM lead
   */
  async createLead(leadData) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      // Get source ID
      const sourceId = await this.getOrCreateSource(leadData.source_id || 'WhatsApp');
      
      // Get default sales team
      const teamId = await this.getDefaultSalesTeam();
      
      const leadValues = {
        name: leadData.name,
        contact_name: leadData.contact_name,
        phone: leadData.phone,
        description: leadData.description,
        source_id: sourceId,
        priority: leadData.priority || '1',
        team_id: teamId
      };
      
      const leadId = await this.callMethod('crm.lead', 'create', {
        vals_list: [leadValues]
      });
      
      const actualLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
      
      // Log conversation for multi-message leads
      if (leadData.messages) {
        await this.logConversation(actualLeadId, leadData, 'crm.lead');
      }
      
      return {
        success: true,
        leadId: actualLeadId
      };
      
    } catch (error) {
      console.error('Error creating lead:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Find or create a partner (contact)
   */
  async findOrCreatePartner(conversationData) {
    // Search for existing partner
    const domain = [
      '|',
      ['phone', 'like', conversationData.contactNumber || ''],
      ['name', '=', conversationData.contactName]
    ];
    
    const existingPartners = await this.callMethod('res.partner', 'search', {
      domain: domain,
      limit: 1
    });
    
    if (existingPartners && existingPartners.length > 0) {
      return existingPartners[0];
    }
    
    // Create new partner
    const partnerValues = {
      name: conversationData.contactName,
      phone: conversationData.contactNumber || '',
      is_company: false,
      customer_rank: 1,
      comment: 'Created from WhatsApp integration'
    };
    
    const partnerId = await this.callMethod('res.partner', 'create', {
      vals_list: [partnerValues]
    });
    
    return Array.isArray(partnerId) ? partnerId[0] : partnerId;
  }
  
  /**
   * Find or create partner by name only
   */
  async findOrCreatePartnerByName(partnerName) {
    if (!partnerName) {
      partnerName = 'WhatsApp Contact';
    }
    
    const existingPartners = await this.callMethod('res.partner', 'search', {
      domain: [['name', '=', partnerName]],
      limit: 1
    });
    
    if (existingPartners && existingPartners.length > 0) {
      return existingPartners[0];
    }
    
    const partnerValues = {
      name: partnerName,
      is_company: false,
      customer_rank: 1,
      comment: 'Created from WhatsApp integration'
    };
    
    const partnerId = await this.callMethod('res.partner', 'create', {
      vals_list: [partnerValues]
    });
    
    return Array.isArray(partnerId) ? partnerId[0] : partnerId;
  }
  
  /**
   * Get or create default project for WhatsApp tasks
   */
  async getDefaultProject() {
    try {
      const existingProjects = await this.callMethod('project.project', 'search', {
        domain: [['name', '=', 'WhatsApp Tasks']],
        limit: 1
      });
      
      if (existingProjects && existingProjects.length > 0) {
        return existingProjects[0];
      }
      
      const projectValues = {
        name: 'WhatsApp Tasks',
        description: 'Tasks created from WhatsApp messages',
        privacy_visibility: 'portal'
      };
      
      const projectId = await this.callMethod('project.project', 'create', {
        vals_list: [projectValues]
      });
      
      return Array.isArray(projectId) ? projectId[0] : projectId;
      
    } catch (error) {
      console.error('Error with project setup:', error);
      return false;
    }
  }
  
  /**
   * Get default sales team
   */
  async getDefaultSalesTeam() {
    try {
      const teams = await this.callMethod('crm.team', 'search', {
        limit: 1
      });
      
      return teams && teams.length > 0 ? teams[0] : false;
      
    } catch (error) {
      console.error('Error finding sales team:', error);
      return false;
    }
  }
  
  /**
   * Get or create UTM source
   */
  async getOrCreateSource(sourceName) {
    try {
      const existingSources = await this.callMethod('utm.source', 'search', {
        domain: [['name', '=', sourceName]],
        limit: 1
      });
      
      if (existingSources && existingSources.length > 0) {
        return existingSources[0];
      }
      
      const sourceValues = { name: sourceName };
      
      const sourceId = await this.callMethod('utm.source', 'create', {
        vals_list: [sourceValues]
      });
      
      return Array.isArray(sourceId) ? sourceId[0] : sourceId;
      
    } catch (error) {
      console.error('Error with UTM source:', error);
      return false;
    }
  }
  
  /**
   * Format date for Odoo
   */
  formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Log conversation as mail message
   */
  async logConversation(recordId, recordData, modelName) {
    try {
      let messageBody;
      
      if (recordData.messages && Array.isArray(recordData.messages)) {
        messageBody = this.formatConversationMessages(recordData.messages);
      } else {
        const content = recordData.description || recordData.content || 'WhatsApp conversation';
        messageBody = `<h3>WhatsApp ${this.getModelDisplayName(modelName)}</h3>\n<p>${this.escapeHtml(content)}</p>`;
      }
      
      const noteValues = {
        body: messageBody,
        model: modelName,
        res_id: recordId,
        message_type: 'comment',
        subtype_id: 1
      };
      
      await this.callMethod('mail.message', 'create', {
        vals_list: [noteValues]
      });
      
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  }
  
  /**
   * Get display name for model
   */
  getModelDisplayName(modelName) {
    const modelNames = {
      'helpdesk.ticket': 'Ticket',
      'project.task': 'Task',
      'crm.lead': 'Lead'
    };
    return modelNames[modelName] || 'Record';
  }
  
  /**
   * Format multiple messages for logging
   */
  formatConversationMessages(messages) {
    let formattedMessages = '<h3>WhatsApp Conversation History</h3>\n';
    
    messages.forEach((msg, index) => {
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown time';
      const sender = msg.senderType === 'customer' ? '👤 Customer' : '👨‍💼 Agent';
      const escapedContent = this.escapeHtml(msg.content);
      formattedMessages += `<p><strong>${index + 1}. ${sender}</strong> (${timestamp}):<br/>${escapedContent}</p>\n`;
    });
    
    formattedMessages += `<hr/><p><em>Created from WhatsApp Web on ${new Date().toLocaleString()}</em></p>`;
    
    return formattedMessages;
  }
  
  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Message handlers for Chrome extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.action);
  
  if (message.action === 'createTicket') {
    handleCreateTicket(message.config, message.conversationData)
      .then(sendResponse)
      .catch(error => {
        console.error('Create ticket error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }
  
  if (message.action === 'createTask') {
    handleCreateTask(message.config, message.taskData)
      .then(sendResponse)
      .catch(error => {
        console.error('Create task error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }
  
  if (message.action === 'createLead') {
    handleCreateLead(message.config, message.leadData)
      .then(sendResponse)
      .catch(error => {
        console.error('Create lead error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }
  
  if (message.action === 'testConnection') {
    testOdooConnection(message.config)
      .then(sendResponse)
      .catch(error => {
        console.error('Test connection error:', error);
        sendResponse({
          success: false,
          message: error.message
        });
      });
    return true;
  }
});

// Handler functions
async function handleCreateTicket(config, conversationData) {
  console.log('Handling create ticket with JSON-2 API');
  console.log('Conversation data:', {
    ...conversationData,
    messages: conversationData.messages ? `${conversationData.messages.length} messages` : 'no messages'
  });
  
  const odooClient = new OdooJSON2Client(config);
  return await odooClient.createTicket(conversationData);
}

async function handleCreateTask(config, taskData) {
  console.log('Handling create task with JSON-2 API');
  console.log('Task data:', {
    ...taskData,
    messages: taskData.messages ? `${taskData.messages.length} messages` : 'no messages'
  });
  
  const odooClient = new OdooJSON2Client(config);
  return await odooClient.createTask(taskData);
}

async function handleCreateLead(config, leadData) {
  console.log('Handling create lead with JSON-2 API');
  console.log('Lead data:', {
    ...leadData,
    messages: leadData.messages ? `${leadData.messages.length} messages` : 'no messages'
  });
  
  const odooClient = new OdooJSON2Client(config);
  return await odooClient.createLead(leadData);
}

async function testOdooConnection(config) {
  console.log('Testing connection with JSON-2 API (Odoo 19+ required)');
  
  try {
    const odooClient = new OdooJSON2Client(config);
    const result = await odooClient.testConnection();
    
    return {
      success: result.success,
      message: result.success 
        ? `✅ Connection successful!\n📊 Odoo ${result.version}.0\n👤 User: ${result.userName}\n💾 Database: ${result.database || 'single-db mode'}` 
        : `❌ ${result.error}`
    };
  } catch (error) {
    console.error('Test connection error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}