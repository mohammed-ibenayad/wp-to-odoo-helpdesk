// whatsapp-odoo-poc/content.js
// Simple working version - bypasses complex detection

console.log('WhatsApp to Odoo POC - Simple Version Initialized');

// Create test button immediately
function createTestButton() {
  // Remove existing button if any
  const existingBtn = document.getElementById('odoo-test-btn');
  if (existingBtn) existingBtn.remove();
  
  const testButton = document.createElement('button');
  testButton.id = 'odoo-test-btn';
  testButton.innerHTML = '🧪 Test Odoo Integration';
  testButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #25D366;
    color: white;
    border: none;
    padding: 15px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    z-index: 99999;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  `;
  
  testButton.onclick = async function() {
    await testTicketCreation(this);
  };
  
  document.body.appendChild(testButton);
  console.log('✅ Test button added to page');
}

async function testTicketCreation(button) {
  button.innerHTML = '⏳ Creating ticket...';
  button.disabled = true;
  
  try {
    // Get config from extension storage
    const config = await getOdooConfig();
    
    if (!config.url || !config.apiKey) {
      alert('❌ Please configure Odoo connection first.\n\nClick the extension icon in the toolbar to set up your connection.');
      button.innerHTML = '🧪 Test Odoo Integration';
      button.disabled = false;
      return;
    }
    
    console.log('Using config:', { url: config.url, username: config.username, hasApiKey: !!config.apiKey });
    
    // Create test conversation data
    const conversationData = {
      contactName: 'Test Integration Contact',
      contactNumber: '+32987654321',
      startTime: new Date(),
      messages: [
        { 
          content: 'Hello! This is a test message from the WhatsApp integration.', 
          timestamp: new Date(), 
          senderType: 'customer' 
        },
        { 
          content: 'Hi there! I received your message. This integration is working perfectly!', 
          timestamp: new Date(), 
          senderType: 'agent' 
        },
        { 
          content: 'Great! Thank you for the quick response.', 
          timestamp: new Date(), 
          senderType: 'customer' 
        }
      ],
      summary: generateTestSummary()
    };
    
    console.log('Sending ticket creation request...');
    
    // Send to background script
    const response = await sendToBackground({
      action: 'createTicket',
      config: config,
      conversationData: conversationData
    });
    
    console.log('Response received:', response);
    
    if (response && response.success) {
      alert(`🎉 SUCCESS!\n\nTicket created successfully!\nTicket ID: ${response.ticketId}\nCustomer ID: ${response.partnerId}\n\nCheck your Odoo helpdesk for the new ticket titled:\n"WhatsApp: Test Integration Contact"`);
      
      button.innerHTML = '✅ Ticket Created!';
      button.style.background = '#4CAF50';
      
      // Reset button after 5 seconds
      setTimeout(() => {
        button.innerHTML = '🧪 Test Odoo Integration';
        button.style.background = '#25D366';
        button.disabled = false;
      }, 5000);
      
    } else {
      const errorMsg = response ? response.error : 'No response received';
      alert(`❌ Error creating ticket:\n\n${errorMsg}\n\nCheck the browser console for more details.`);
      console.error('Ticket creation failed:', response);
      
      button.innerHTML = '❌ Failed';
      button.style.background = '#F44336';
      
      setTimeout(() => {
        button.innerHTML = '🧪 Test Odoo Integration';
        button.style.background = '#25D366';
        button.disabled = false;
      }, 3000);
    }
    
  } catch (error) {
    console.error('Test error:', error);
    alert(`❌ Error: ${error.message}`);
    
    button.innerHTML = '❌ Error';
    button.style.background = '#F44336';
    
    setTimeout(() => {
      button.innerHTML = '🧪 Test Odoo Integration';
      button.style.background = '#25D366';
      button.disabled = false;
    }, 3000);
  }
}

function generateTestSummary() {
  return `WhatsApp conversation with Test Integration Contact
Started: ${new Date().toLocaleString()}
Total messages: 3 (2 from customer, 1 from agent)

Recent messages:
Customer: Hello! This is a test message from the WhatsApp integration.
Agent: Hi there! I received your message. This integration is working perfectly!
Customer: Great! Thank you for the quick response.

--- 
This ticket was created by the WhatsApp to Odoo integration test function.
Integration working correctly as of ${new Date().toLocaleString()}.`;
}

async function getOdooConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['odooConfig'], (result) => {
      resolve(result.odooConfig || {});
    });
  });
}

async function sendToBackground(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response);
      }
    });
  });
}

// Create the test button when script loads
setTimeout(createTestButton, 1000);

// Also create button if page changes (for navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(createTestButton, 2000);
  }
}).observe(document, { subtree: true, childList: true });

console.log('Simple WhatsApp to Odoo integration loaded. Test button will appear in 1 second.');