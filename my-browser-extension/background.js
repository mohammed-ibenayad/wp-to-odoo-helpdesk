// Enhanced background.js with Contact Search & Manual Selection
// Odoo JSON-2 API (Odoo 19+ ONLY) 

class OdooJSON2Client {
  constructor(config) {
    this.url = config.url.replace(/\/$/, '');
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
  
  async getDatabaseName() {
    const urlParts = new URL(this.url);
    const hostname = urlParts.hostname;
    
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
    
    this.log('ℹ️ Using single database mode');
    return null;
  }
  
  async callMethod(model, method, params = {}) {
    const endpoint = `${this.url}/json/2/${model}/${method}`;
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `bearer ${this.apiKey}`,
      'User-Agent': 'WhatsApp-Odoo-Integration/2.0'
    };
    
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
  
  async testConnection() {
    try {
      this.log('🔍 Testing connection...');
      
      const versionCheck = await this.verifyOdooVersion();
      if (!versionCheck.supported) {
        return {
          success: false,
          error: versionCheck.message
        };
      }
      
      this.database = await this.getDatabaseName();
      this.log('📊 Database:', this.database || 'single-db mode');
      
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
   * 🆕 Search contacts by query string
   */
  async searchContacts(query, limit = 10) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      // Build search domain - search in name, phone, email
      const domain = [
        '|', '|',
        ['name', 'ilike', query],
        ['phone', 'ilike', query],
        ['email', 'ilike', query]
      ];
      
      // Search for contacts
      const partnerIds = await this.callMethod('res.partner', 'search', {
        domain: domain,
        limit: limit
      });
      
      if (!partnerIds || partnerIds.length === 0) {
        return [];
      }
      
      // Read contact details
      const partners = await this.callMethod('res.partner', 'read', {
        ids: partnerIds,
        fields: ['id', 'name', 'phone', 'email', 'is_company', 'image_128']
      });
      
      return partners;
      
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }
  
  /**
   * 🆕 Get contact suggestions based on WhatsApp data
   */
  /**
 * Get contact suggestions based on WhatsApp data
 */
async suggestContacts(contactName, contactNumber) {
  try {
    if (!this.database) {
      this.database = await this.getDatabaseName();
    }
    
    this.log('Suggesting contacts for:', { contactName, contactNumber });
    
    const suggestions = [];
    
    // Try phone match first (most reliable)
    if (contactNumber) {
      const phoneDigits = contactNumber.replace(/\D/g, '');
      
      if (phoneDigits.length >= 8) {
      // Use the last 9 digits of the phone number for a flexible search string
      const searchString = phoneDigits.slice(-9);

      // Define a broad search domain, mimicking the working manual search
      const domain = [
        '|', '|',
        ['name', 'ilike', searchString],
        ['phone', 'ilike', searchString],
        ['email', 'ilike', searchString]
      ];

      // Search for partners using the broad domain
      const phoneMatches = await this.callMethod('res.partner', 'search', {
        domain: domain,
        limit: 3
      });

      // If any matching partners were found...
      if (phoneMatches && phoneMatches.length > 0) {
        // ...read their details. The 'mobile' field is removed.
        const phoneContacts = await this.callMethod('res.partner', 'read', {
          ids: phoneMatches,
          fields: ['id', 'name', 'phone', 'email', 'image_128']
        });

        // Add the found contacts to our suggestions list
        suggestions.push(...phoneContacts);
      }
    }
    }
    
    // Try name match if no phone matches
    if (suggestions.length === 0 && contactName && contactName !== 'Unknown Contact') {
      const nameMatches = await this.callMethod('res.partner', 'search', {
        domain: [['name', 'ilike', contactName]],
        limit: 5
      });
      
      if (nameMatches && nameMatches.length > 0) {
        const nameContacts = await this.callMethod('res.partner', 'read', {
          ids: nameMatches,
          fields: ['id', 'name', 'phone', 'mobile', 'email', 'image_128']
        });
        
        // Prefer phone over mobile
        nameContacts.forEach(p => {
          if (!p.phone && p.mobile) {
            p.phone = p.mobile;
          }
        });
        
        suggestions.push(...nameContacts);
      }
    }
    
    // Remove duplicates
    const uniqueSuggestions = suggestions.filter((contact, index, self) =>
      index === self.findIndex(c => c.id === contact.id)
    );
    
    this.log(`Found ${uniqueSuggestions.length} unique contacts`);
    
    return { success: true, contacts: uniqueSuggestions };
    
  } catch (error) {
    this.log('Error getting contact suggestions:', error);
    return { success: false, error: error.message, contacts: [] };
  }
}
  /**
   * 🆕 Create new contact
   */
  async createContact(contactData) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      const partnerValues = {
        name: contactData.name,
        phone: contactData.phone || '',
        email: contactData.email || '',
        is_company: false,
        comment: contactData.comment || 'Created from WhatsApp integration'
      };
      
      const partnerId = await this.callMethod('res.partner', 'create', {
        vals_list: [partnerValues]
      });
      
      const actualPartnerId = Array.isArray(partnerId) ? partnerId[0] : partnerId;
      
      // Read back the created contact
      const newContact = await this.callMethod('res.partner', 'read', {
        ids: [actualPartnerId],
        fields: ['id', 'name', 'phone', 'email', 'image_128']
      });
      
      return {
        success: true,
        contact: newContact[0]
      };
      
    } catch (error) {
      console.error('Error creating contact:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Create a helpdesk ticket with optional contact
   */
  async createTicket(conversationData) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      const ticketTitle = conversationData.summary || `WhatsApp: ${conversationData.contactName}`;
      
      // Build ticket values
      const ticketValues = {
        name: ticketTitle,
        description: conversationData.description,
        priority: conversationData.priority || '1',
        stage_id: 1
      };
      
      // Add contact if provided
      if (conversationData.partner_id) {
        ticketValues.partner_id = conversationData.partner_id;
      } else {
        // Store contact info in description if no contact linked
        ticketValues.description = `Contact: ${conversationData.contactName}\n` +
          (conversationData.contactNumber ? `Phone: ${conversationData.contactNumber}\n\n` : '\n') +
          conversationData.description;
      }
      
      const ticketId = await this.callMethod('helpdesk.ticket', 'create', {
        vals_list: [ticketValues]
      });
      
      const actualTicketId = Array.isArray(ticketId) ? ticketId[0] : ticketId;
      
      if (conversationData.messages) {
        await this.logConversation(actualTicketId, conversationData, 'helpdesk.ticket');
      }
      
      return {
        success: true,
        ticketId: actualTicketId,
        partnerId: conversationData.partner_id || null
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
   * Create a project task with optional contact
   */
  async createTask(taskData) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      const projectId = await this.getDefaultProject();
      
      const taskValues = {
        name: taskData.name,
        description: taskData.description,
        date_deadline: taskData.date_deadline ? this.formatDate(taskData.date_deadline) : false,
        priority: taskData.priority || '1',
        project_id: projectId
      };
      
      // Add contact if provided
      if (taskData.partner_id) {
        taskValues.partner_id = taskData.partner_id;
      } else {
        // Store contact info in description
        taskValues.description = `Contact: ${taskData.partner_name || 'Unknown'}\n\n` +
          taskData.description;
      }
      
      const taskId = await this.callMethod('project.task', 'create', {
        vals_list: [taskValues]
      });
      
      const actualTaskId = Array.isArray(taskId) ? taskId[0] : taskId;
      
      if (taskData.messages) {
        await this.logConversation(actualTaskId, taskData, 'project.task');
      }
      
      return {
        success: true,
        taskId: actualTaskId,
        partnerId: taskData.partner_id || null
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
   * Create a CRM lead with optional contact
   */
  async createLead(leadData) {
    try {
      if (!this.database) {
        this.database = await this.getDatabaseName();
      }
      
      const sourceId = await this.getOrCreateSource(leadData.source_id || 'WhatsApp');
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
      
      // Add contact if provided
      if (leadData.partner_id) {
        leadValues.partner_id = leadData.partner_id;
      }
      
      const leadId = await this.callMethod('crm.lead', 'create', {
        vals_list: [leadValues]
      });
      
      const actualLeadId = Array.isArray(leadId) ? leadId[0] : leadId;
      
      if (leadData.messages) {
        await this.logConversation(actualLeadId, leadData, 'crm.lead');
      }
      
      return {
        success: true,
        leadId: actualLeadId,
        partnerId: leadData.partner_id || null
      };
      
    } catch (error) {
      console.error('Error creating lead:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
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
  
  formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  }
  
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
  
  getModelDisplayName(modelName) {
    const modelNames = {
      'helpdesk.ticket': 'Ticket',
      'project.task': 'Task',
      'crm.lead': 'Lead'
    };
    return modelNames[modelName] || 'Record';
  }
  
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
  
  // 🆕 Contact search handler
  if (message.action === 'searchContacts') {
    handleSearchContacts(message.config, message.query)
      .then(sendResponse)
      .catch(error => {
        console.error('Search contacts error:', error);
        sendResponse({
          success: false,
          error: error.message,
          contacts: []
        });
      });
    return true;
  }
  
  // 🆕 Contact suggestions handler
  if (message.action === 'suggestContacts') {
    handleSuggestContacts(message.config, message.contactName, message.contactNumber)
      .then(sendResponse)
      .catch(error => {
        console.error('Suggest contacts error:', error);
        sendResponse({
          success: false,
          error: error.message,
          contacts: []
        });
      });
    return true;
  }
  
  // 🆕 Create contact handler
  if (message.action === 'createContact') {
    handleCreateContact(message.config, message.contactData)
      .then(sendResponse)
      .catch(error => {
        console.error('Create contact error:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }
});

async function handleCreateTicket(config, conversationData) {
  console.log('Handling create ticket');
  const odooClient = new OdooJSON2Client(config);
  return await odooClient.createTicket(conversationData);
}

async function handleCreateTask(config, taskData) {
  console.log('Handling create task');
  const odooClient = new OdooJSON2Client(config);
  return await odooClient.createTask(taskData);
}

async function handleCreateLead(config, leadData) {
  console.log('Handling create lead');
  const odooClient = new OdooJSON2Client(config);
  return await odooClient.createLead(leadData);
}

async function testOdooConnection(config) {
  console.log('Testing connection with JSON-2 API');
  
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

// 🆕 Handle contact search
async function handleSearchContacts(config, query) {
  console.log('Searching contacts:', query);
  
  try {
    const odooClient = new OdooJSON2Client(config);
    const contacts = await odooClient.searchContacts(query);
    
    return {
      success: true,
      contacts: contacts
    };
  } catch (error) {
    console.error('Search contacts error:', error);
    return {
      success: false,
      error: error.message,
      contacts: []
    };
  }
}

// 🆕 Handle contact suggestions
async function handleSuggestContacts(config, contactName, contactNumber) {
  console.log('Getting contact suggestions for:', contactName, contactNumber);
  
  try {
    const odooClient = new OdooJSON2Client(config);
    const contacts = await odooClient.suggestContacts(contactName, contactNumber);
    
    return {
      success: true,
      contacts: contacts
    };
  } catch (error) {
    console.error('Suggest contacts error:', error);
    return {
      success: false,
      error: error.message,
      contacts: []
    };
  }
}

// 🆕 Handle contact creation
async function handleCreateContact(config, contactData) {
  console.log('Creating new contact:', contactData.name);
  
  try {
    const odooClient = new OdooJSON2Client(config);
    const result = await odooClient.createContact(contactData);
    
    return result;
  } catch (error) {
    console.error('Create contact error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}