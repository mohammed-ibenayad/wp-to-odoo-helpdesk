// Enhanced background.js with full multi-message support for all types
class OdooAPIClient {
  constructor(config) {
    this.url = config.url;
    this.apiKey = config.apiKey;
    this.uid = null;
    this.username = config.username;
    this.database = null;
    this.debug = true;
  }
  
  log(message, data = null) {
    if (this.debug) {
      console.log(`[Odoo API] ${message}`, data || '');
    }
  }
  
  async authenticate() {
    try {
      this.log('Starting authentication process...');
      this.log('URL:', this.url);
      this.log('API Key length:', this.apiKey ? this.apiKey.length : 'NO API KEY');
      
      const dbInfo = await this.getDatabaseInfo();
      this.log('Database info detected:', dbInfo);
      
      if (!dbInfo.database) {
        throw new Error('Could not determine database name from URL');
      }
      
      this.database = dbInfo.database;      
      
      this.log('Using database:', this.database);
      
      
      const loginUrl = `${this.url}/xmlrpc/2/common`;
      this.log('Authentication URL:', loginUrl);
      
      const loginData = {
        method: 'authenticate',
        params: [this.database, this.username, this.apiKey, {}]
      };
      
      this.log('Sending authentication request...');
      const response = await this.xmlrpcCall(loginUrl, loginData);
      this.log('Authentication response:', response);
      
      this.uid = response;
      const success = this.uid > 0;
      this.log('Authentication success:', success);
      this.log('User ID:', this.uid);
      
      return success;
    } catch (error) {
      this.log('Authentication error:', error.message);
      console.error('Full authentication error:', error);
      return false;
    }
  }

  async getDatabaseInfo() {
    const urlParts = new URL(this.url);
    const hostname = urlParts.hostname;
    this.log('Parsing hostname:', hostname);
    
    if (hostname.includes('.odoo.com')) {
      const parts = hostname.split('.');
      this.log('Hostname parts:', parts);
      
      let subdomain;
      if (parts.length >= 3 && parts[parts.length - 3] === 'dev') {
        subdomain = parts.slice(0, -3).join('-');
      } else {
        subdomain = parts[0];
      }
      
      this.log('Extracted subdomain as database:', subdomain);
      
      return {
        database: subdomain,
        username: null
      };
    }
    
    this.log('Attempting to get database list for self-hosted instance...');
    try {
      const dbListUrl = `${this.url}/xmlrpc/2/db`;
      const dbListData = {
        method: 'list',
        params: []
      };
      
      const databases = await this.xmlrpcCall(dbListUrl, dbListData);
      this.log('Available databases:', databases);
      
      if (databases && databases.length > 0) {
        return {
          database: databases[0],
          username: null
        };
      }
    } catch (error) {
      this.log('Database list error:', error.message);
    }
    
    return {
      database: 'postgres',
      username: null
    };
  }

  async createTicket(conversationData) {
    if (!this.uid) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }
    
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    try {
      const partnerId = await this.findOrCreatePartner(conversationData);
      
      const ticketTitle = conversationData.summary || `WhatsApp: ${conversationData.contactName}`;

      const ticketData = {
        name: ticketTitle,
        description: conversationData.description,
        partner_id: partnerId,
        priority: conversationData.priority || '1',
        stage_id: 1,
      };
      
      const createTicketCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'helpdesk.ticket',
          'create',
          [ticketData]
        ]
      };
      
      const ticketId = await this.xmlrpcCall(objectUrl, createTicketCall);
      
      if (conversationData.messages) {
        await this.logConversation(ticketId, conversationData, 'helpdesk.ticket');
      }
      
      return {
        success: true,
        ticketId: ticketId,
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

  async createTask(taskData) {
    if (!this.uid) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }
    
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    try {
      const partnerId = await this.findOrCreatePartnerByName(taskData.partner_name);
      
      const taskRecord = {
        name: taskData.name,
        description: taskData.description,
        partner_id: partnerId,
        date_deadline: taskData.date_deadline ? this.formatDate(taskData.date_deadline) : false,
        priority: taskData.priority || '1',
        user_id: this.uid,
        project_id: await this.getDefaultProject()
      };
      
      const createTaskCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'project.task',
          'create',
          [taskRecord]
        ]
      };
      
      const taskId = await this.xmlrpcCall(objectUrl, createTaskCall);
      
      // Log conversation for multi-message tasks
      if (taskData.messages) {
        await this.logConversation(taskId, taskData, 'project.task');
      }
      
      return {
        success: true,
        taskId: taskId,
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

  async createLead(leadData) {
    if (!this.uid) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }
    
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    try {
      const leadRecord = {
        name: leadData.name,
        contact_name: leadData.contact_name,
        phone: leadData.phone,
        description: leadData.description,
        source_id: await this.getOrCreateSource(leadData.source_id || 'WhatsApp'),
        priority: leadData.priority || 'medium',
        user_id: this.uid,
        team_id: await this.getDefaultSalesTeam()
      };
      
      const createLeadCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'crm.lead',
          'create',
          [leadRecord]
        ]
      };
      
      const leadId = await this.xmlrpcCall(objectUrl, createLeadCall);
      
      // Log conversation for multi-message leads
      if (leadData.messages) {
        await this.logConversation(leadId, leadData, 'crm.lead');
      }
      
      return {
        success: true,
        leadId: leadId
      };
      
    } catch (error) {
      console.error('Error creating lead:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findOrCreatePartner(conversationData) {
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    const searchCall = {
      method: 'execute_kw',
      params: [
        this.database,
        this.uid,
        this.apiKey,
        'res.partner',
        'search',
        [[
          '|',
          ['phone', 'like', conversationData.contactNumber || ''],
          ['name', '=', conversationData.contactName]
        ]],
        { limit: 1 }
      ]
    };
    
    const existingPartners = await this.xmlrpcCall(objectUrl, searchCall);
    
    if (existingPartners && existingPartners.length > 0) {
      return existingPartners[0];
    }
    
    const partnerData = {
      name: conversationData.contactName,
      phone: conversationData.contactNumber || '',
      is_company: false,
      supplier_rank: 0,
      customer_rank: 1,
      comment: 'Created from WhatsApp integration'
    };
    
    const createPartnerCall = {
      method: 'execute_kw',
      params: [
        this.database,
        this.uid,
        this.apiKey,
        'res.partner',
        'create',
        [partnerData]
      ]
    };
    
    return await this.xmlrpcCall(objectUrl, createPartnerCall);
  }

  async findOrCreatePartnerByName(partnerName) {
    if (!partnerName) {
      partnerName = 'WhatsApp Contact';
    }
    
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    const searchCall = {
      method: 'execute_kw',
      params: [
        this.database,
        this.uid,
        this.apiKey,
        'res.partner',
        'search',
        [['name', '=', partnerName]],
        { limit: 1 }
      ]
    };
    
    const existingPartners = await this.xmlrpcCall(objectUrl, searchCall);
    
    if (existingPartners && existingPartners.length > 0) {
      return existingPartners[0];
    }
    
    const partnerData = {
      name: partnerName,
      is_company: false,
      supplier_rank: 0,
      customer_rank: 1,
      comment: 'Created from WhatsApp integration'
    };
    
    const createPartnerCall = {
      method: 'execute_kw',
      params: [
        this.database,
        this.uid,
        this.apiKey,
        'res.partner',
        'create',
        [partnerData]
      ]
    };
    
    return await this.xmlrpcCall(objectUrl, createPartnerCall);
  }

  async getDefaultProject() {
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    try {
      const searchCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'project.project',
          'search',
          [['name', '=', 'WhatsApp Tasks']],
          { limit: 1 }
        ]
      };
      
      const existingProjects = await this.xmlrpcCall(objectUrl, searchCall);
      
      if (existingProjects && existingProjects.length > 0) {
        return existingProjects[0];
      }
      
      const projectData = {
        name: 'WhatsApp Tasks',
        description: 'Tasks created from WhatsApp messages',
        privacy_visibility: 'portal'
      };
      
      const createProjectCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'project.project',
          'create',
          [projectData]
        ]
      };
      
      return await this.xmlrpcCall(objectUrl, createProjectCall);
      
    } catch (error) {
      console.error('Error with project setup:', error);
      return false;
    }
  }

  async getDefaultSalesTeam() {
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    try {
      const searchCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'crm.team',
          'search',
          [],
          { limit: 1 }
        ]
      };
      
      const teams = await this.xmlrpcCall(objectUrl, searchCall);
      return teams && teams.length > 0 ? teams[0] : false;
      
    } catch (error) {
      console.error('Error finding sales team:', error);
      return false;
    }
  }

  async getOrCreateSource(sourceName) {
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    try {
      const searchCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'utm.source',
          'search',
          [['name', '=', sourceName]],
          { limit: 1 }
        ]
      };
      
      const existingSources = await this.xmlrpcCall(objectUrl, searchCall);
      
      if (existingSources && existingSources.length > 0) {
        return existingSources[0];
      }
      
      const sourceData = {
        name: sourceName
      };
      
      const createSourceCall = {
        method: 'execute_kw',
        params: [
          this.database,
          this.uid,
          this.apiKey,
          'utm.source',
          'create',
          [sourceData]
        ]
      };
      
      return await this.xmlrpcCall(objectUrl, createSourceCall);
      
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
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    let messageBody;
    if (recordData.messages && Array.isArray(recordData.messages)) {
      // Multi-message format
      messageBody = this.formatConversationMessages(recordData.messages);
    } else {
      // Single message format - extract from description or content
      const content = recordData.description || recordData.content || 'WhatsApp conversation';
      messageBody = `<h3>WhatsApp ${this.getModelDisplayName(modelName)}</h3>\n<p>${this.escapeHtml(content)}</p>`;
    }
    
    const noteData = {
      message: messageBody,
      model: modelName,
      res_id: recordId,
      message_type: 'comment',
      subtype_id: 1
    };
    
    const createNoteCall = {
      method: 'execute_kw',
      params: [
        this.database,
        this.uid,
        this.apiKey,
        'mail.message',
        'create',
        [noteData]
      ]
    };
    
    try {
      await this.xmlrpcCall(objectUrl, createNoteCall);
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

  async xmlrpcCall(url, data) {
    const payload = this.buildXMLRPCPayload(data);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: payload
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const xmlText = await response.text();
      return this.parseXMLRPCResponse(xmlText);
    } catch (error) {
      throw error;
    }
  }

  buildXMLRPCPayload(data) {
    const params = data.params.map(param => this.serializeParam(param)).join('');
    
    return `<?xml version="1.0"?>
<methodCall>
  <methodName>${data.method}</methodName>
  <params>
    ${params}
  </params>
</methodCall>`;
  }

  serializeParam(param) {
    if (typeof param === 'string') {
      return `<param><value><string>${this.escapeXml(param)}</string></value></param>`;
    } else if (typeof param === 'number') {
      return `<param><value><int>${param}</int></value></param>`;
    } else if (typeof param === 'boolean') {
      return `<param><value><boolean>${param ? 1 : 0}</boolean></value></param>`;
    } else if (Array.isArray(param)) {
      const arrayItems = param.map(item => `<value>${this.serializeValue(item)}</value>`).join('');
      return `<param><value><array><data>${arrayItems}</data></array></value></param>`;
    } else if (typeof param === 'object' && param !== null) {
      const members = Object.entries(param).map(([key, value]) => 
        `<member><name>${key}</name><value>${this.serializeValue(value)}</value></member>`
      ).join('');
      return `<param><value><struct>${members}</struct></value></param>`;
    }
    return `<param><value><string></string></value></param>`;
  }

  serializeValue(value) {
    if (typeof value === 'string') {
      return `<string>${this.escapeXml(value)}</string>`;
    } else if (typeof value === 'number') {
      return `<int>${value}</int>`;
    } else if (typeof value === 'boolean') {
      return `<boolean>${value ? 1 : 0}</boolean>`;
    } else if (Array.isArray(value)) {
      const arrayItems = value.map(item => `<value>${this.serializeValue(item)}</value>`).join('');
      return `<array><data>${arrayItems}</data></array>`;
    } else if (typeof value === 'object' && value !== null) {
      const members = Object.entries(value).map(([key, val]) => 
        `<member><name>${key}</name><value>${this.serializeValue(val)}</value></member>`
      ).join('');
      return `<struct>${members}</struct>`;
    }
    return '<string></string>';
  }

  escapeXml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  parseXMLRPCResponse(xmlText) {
    if (xmlText.includes('<fault>')) {
      const faultMatch = xmlText.match(/<member><name>faultString<\/name><value><string>(.*?)<\/string><\/value><\/member>/);
      if (faultMatch) {
        throw new Error(`XML-RPC Fault: ${faultMatch[1]}`);
      }
      throw new Error('XML-RPC Fault occurred');
    }
    
    const responseMatch = xmlText.match(/<methodResponse>\s*<params>\s*<param>\s*<value>(.*?)<\/value>\s*<\/param>\s*<\/params>\s*<\/methodResponse>/s);
    if (!responseMatch) {
      throw new Error('Invalid XML-RPC response format');
    }
    
    return this.parseValue(responseMatch[1]);
  }

  parseValue(valueContent) {
    valueContent = valueContent.trim();
    
    const stringMatch = valueContent.match(/^<string>(.*?)<\/string>$/s);
    if (stringMatch) {
      return this.unescapeXml(stringMatch[1]);
    }
    
    const intMatch = valueContent.match(/^<int>(\d+)<\/int>$/);
    if (intMatch) {
      return parseInt(intMatch[1]);
    }
    
    const boolMatch = valueContent.match(/^<boolean>([01])<\/boolean>$/);
    if (boolMatch) {
      return boolMatch[1] === '1';
    }
    
    const arrayMatch = valueContent.match(/^<array><data>(.*?)<\/data><\/array>$/s);
    if (arrayMatch) {
      const arrayContent = arrayMatch[1];
      const valueMatches = [...arrayContent.matchAll(/<value>(.*?)<\/value>/gs)];
      return valueMatches.map(match => this.parseValue(match[1]));
    }
    
    const structMatch = valueContent.match(/^<struct>(.*?)<\/struct>$/s);
    if (structMatch) {
      const structContent = structMatch[1];
      const memberMatches = [...structContent.matchAll(/<member><(?:n|name)>(.*?)<\/(?:n|name)><value>(.*?)<\/value><\/member>/gs)];
      const obj = {};
      memberMatches.forEach(match => {
        const key = match[1];
        const value = this.parseValue(match[2]);
        obj[key] = value;
      });
      return obj;
    }
    
    return this.unescapeXml(valueContent);
  }

  unescapeXml(text) {
    return String(text)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
}

// Enhanced message handlers
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

// Enhanced handler functions with multi-message support
async function handleCreateTicket(config, conversationData) {
  console.log('Handling create ticket with config:', config);
  console.log('Conversation data:', {
    ...conversationData,
    messages: conversationData.messages ? `${conversationData.messages.length} messages` : 'no messages'
  });
  const odooClient = new OdooAPIClient(config);
  return await odooClient.createTicket(conversationData);
}

async function handleCreateTask(config, taskData) {
  console.log('Handling create task with config:', config);
  console.log('Task data:', {
    ...taskData,
    messages: taskData.messages ? `${taskData.messages.length} messages` : 'no messages'
  });
  const odooClient = new OdooAPIClient(config);
  return await odooClient.createTask(taskData);
}

async function handleCreateLead(config, leadData) {
  console.log('Handling create lead with config:', config);
  console.log('Lead data:', {
    ...leadData,
    messages: leadData.messages ? `${leadData.messages.length} messages` : 'no messages'
  });
  const odooClient = new OdooAPIClient(config);
  return await odooClient.createLead(leadData);
}

async function testOdooConnection(config) {
  console.log('Testing connection with config:', config);
  try {
    const odooClient = new OdooAPIClient(config);
    const authenticated = await odooClient.authenticate();
    
    return {
      success: authenticated,
      message: authenticated ? 'Connection successful!' : 'Authentication failed - check console for details'
    };
  } catch (error) {
    console.error('Test connection error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}