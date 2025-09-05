// whatsapp-odoo-poc/background.js
// Service Worker with Smart Authentication

class OdooAPIClient {
  constructor(config) {
    this.url = config.url;
    this.apiKey = config.apiKey;
    this.uid = null;
    this.username = null;
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
      
      // First, get the database info
      const dbInfo = await this.getDatabaseInfo();
      this.log('Database info detected:', dbInfo);
      
      if (!dbInfo.database) {
        throw new Error('Could not determine database name from URL');
      }
      
      this.database = dbInfo.database;
      this.username = dbInfo.username || 'info@belgogreen.be';
      
      this.log('Using database:', this.database);
      this.log('Using username:', this.username);
      
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
  
  async tryMultipleAuthentications(primaryDbName) {
    const loginUrl = `${this.url}/xmlrpc/2/common`;
    
    // Generate possible username/database combinations
    const combinations = this.generateAuthCombinations(primaryDbName);
    this.log(`Trying ${combinations.length} authentication combinations...`);
    
    const attempts = [];
    
    for (const combo of combinations) {
      this.log(`Trying: ${combo.username}@${combo.database}`);
      
      const loginData = {
        method: 'authenticate',
        params: [combo.database, combo.username, this.apiKey, {}]
      };
      
      try {
        const response = await this.xmlrpcCall(loginUrl, loginData);
        this.log(`Response for ${combo.username}@${combo.database}:`, response);
        
        attempts.push({
          username: combo.username,
          database: combo.database,
          response: response,
          success: response && response > 0
        });
        
        // If we got a positive user ID, authentication succeeded
        if (response && response > 0) {
          return {
            success: true,
            uid: response,
            username: combo.username,
            database: combo.database,
            attempts: attempts
          };
        }
        
      } catch (error) {
        this.log(`Error for ${combo.username}@${combo.database}:`, error.message);
        attempts.push({
          username: combo.username,
          database: combo.database,
          error: error.message,
          success: false
        });
      }
    }
    
    return {
      success: false,
      attempts: attempts
    };
  }
  
  generateAuthCombinations(primaryDbName) {
    // Generate possible database names
    const possibleDatabases = [
      primaryDbName, // belgogreen-main-staging-22779376
      primaryDbName.split('-')[0], // belgogreen
      'postgres',
      'odoo',
      'main',
      'staging'
    ];
    
    // Generate possible usernames - we need to figure out the actual username
    // The API key is tied to a specific user, but we don't know which one
    const possibleUsernames = [
      'admin',
      'Administrator',
      'user',
      // Add more if you know other possible usernames
    ];
    
    const combinations = [];
    
    // Try all combinations
    for (const db of possibleDatabases) {
      for (const username of possibleUsernames) {
        combinations.push({ database: db, username: username });
      }
    }
    
    return combinations;
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
        // Dev instance: subdomain.dev.odoo.com
        subdomain = parts.slice(0, -3).join('-');
      } else {
        // Regular instance: subdomain.odoo.com  
        subdomain = parts[0];
      }
      
      this.log('Extracted subdomain as database:', subdomain);
      
      return {
        database: subdomain,
        username: null
      };
    }
    
    // For self-hosted instances
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
      // First, try to find or create the customer
      const partnerId = await this.findOrCreatePartner(conversationData);
      
      // Create the helpdesk ticket
      const ticketData = {
        name: `WhatsApp: ${conversationData.contactName}`,
        description: conversationData.summary,
        partner_id: partnerId,
        priority: '1',
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
      
      // Log the conversation for future reference
      await this.logConversation(ticketId, conversationData);
      
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
  
  async logConversation(ticketId, conversationData) {
    const objectUrl = `${this.url}/xmlrpc/2/object`;
    
    const messageBody = this.formatConversationMessages(conversationData.messages);
    
    const noteData = {
      message: messageBody,
      model: 'helpdesk.ticket',
      res_id: ticketId,
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
  
  formatConversationMessages(messages) {
    let formattedMessages = '<h3>WhatsApp Conversation History</h3>\n';
    
    messages.forEach(msg => {
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Unknown time';
      const sender = msg.senderType === 'customer' ? '👤 Customer' : '👨‍💼 Agent';
      const escapedContent = this.escapeHtml(msg.content);
      formattedMessages += `<p><strong>${sender}</strong> (${timestamp}):<br/>${escapedContent}</p>\n`;
    });
    
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
    // Check for fault first
    if (xmlText.includes('<fault>')) {
      const faultMatch = xmlText.match(/<member><n>faultString<\/name><value><string>(.*?)<\/string><\/value><\/member>/);
      if (faultMatch) {
        throw new Error(`XML-RPC Fault: ${faultMatch[1]}`);
      }
      throw new Error('XML-RPC Fault occurred');
    }
    
    // Extract the main response value
    const responseMatch = xmlText.match(/<methodResponse>\s*<params>\s*<param>\s*<value>(.*?)<\/value>\s*<\/param>\s*<\/params>\s*<\/methodResponse>/s);
    if (!responseMatch) {
      throw new Error('Invalid XML-RPC response format');
    }
    
    return this.parseValue(responseMatch[1]);
  }
  
  parseValue(valueContent) {
    valueContent = valueContent.trim();
    
    // String value
    const stringMatch = valueContent.match(/^<string>(.*?)<\/string>$/s);
    if (stringMatch) {
      return this.unescapeXml(stringMatch[1]);
    }
    
    // Integer value
    const intMatch = valueContent.match(/^<int>(\d+)<\/int>$/);
    if (intMatch) {
      return parseInt(intMatch[1]);
    }
    
    // Boolean value
    const boolMatch = valueContent.match(/^<boolean>([01])<\/boolean>$/);
    if (boolMatch) {
      return boolMatch[1] === '1';
    }
    
    // Array value
    const arrayMatch = valueContent.match(/^<array><data>(.*?)<\/data><\/array>$/s);
    if (arrayMatch) {
      const arrayContent = arrayMatch[1];
      const valueMatches = [...arrayContent.matchAll(/<value>(.*?)<\/value>/gs)];
      return valueMatches.map(match => this.parseValue(match[1]));
    }
    
    // Struct value
    const structMatch = valueContent.match(/^<struct>(.*?)<\/struct>$/s);
    if (structMatch) {
      const structContent = structMatch[1];
      // Handle both <n> and <name> formats
      const memberMatches = [...structContent.matchAll(/<member><(?:n|name)>(.*?)<\/(?:n|name)><value>(.*?)<\/value><\/member>/gs)];
      const obj = {};
      memberMatches.forEach(match => {
        const key = match[1];
        const value = this.parseValue(match[2]);
        obj[key] = value;
      });
      return obj;
    }
    
    // Raw text
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

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'createTicket') {
    handleCreateTicket(message.config, message.conversationData)
      .then(sendResponse)
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true;
  }
  
  if (message.action === 'openPopup') {
    chrome.action.openPopup();
  }
  
  if (message.action === 'testConnection') {
    testOdooConnection(message.config)
      .then(sendResponse)
      .catch(error => {
        sendResponse({
          success: false,
          message: error.message
        });
      });
    return true;
  }
});

async function handleCreateTicket(config, conversationData) {
  const odooClient = new OdooAPIClient(config);
  return await odooClient.createTicket(conversationData);
}

async function testOdooConnection(config) {
  console.log('Testing connection with config:', { 
    url: config.url, 
    username: config.username, 
    apiKeyLength: config.apiKey?.length 
  });
  
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