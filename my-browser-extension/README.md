# WhatsApp to Odoo POC - Setup Instructions

## File Structure

Create a folder called `whatsapp-odoo-poc` with the following files:

```
whatsapp-odoo-poc/
├── manifest.json          # Extension configuration
├── content.js             # WhatsApp Web monitoring script
├── background.js          # API communication service worker
├── popup.html            # Configuration interface
└── popup.js              # Popup logic and settings management
```

## Installation Steps

### 1. Create Project Folder
```bash
mkdir whatsapp-odoo-poc
cd whatsapp-odoo-poc
```

### 2. Create All Files
Copy each file content from the artifacts above into the respective files:

- **manifest.json** - Extension manifest and permissions
- **content.js** - WhatsApp Web conversation monitoring
- **background.js** - Odoo API client and XML-RPC handling
- **popup.html** - Configuration popup interface
- **popup.js** - Popup functionality and storage management

### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select your `whatsapp-odoo-poc` folder
5. Extension should appear in your extensions list

### 4. Configure Odoo Connection
1. Click the extension icon in Chrome toolbar
2. Fill in your Odoo configuration:
   - **URL**: `http://localhost:8069` or your Odoo server URL
   - **Database**: Your Odoo database name
   - **Username**: Your Odoo username
   - **Password**: Your Odoo password
3. Click "Test Connection" to verify
4. Save configuration

### 5. Test the Integration
1. Open WhatsApp Web in a new Chrome tab
2. Open any conversation
3. Look for the green "📋 Create Ticket" button in the chat header
4. Click the button to create a ticket
5. Check your Odoo helpdesk for the new ticket

## Prerequisites

### Odoo Requirements
- Odoo 15.0+ (tested on 18.0)
- Helpdesk app installed and configured
- At least one helpdesk team set up
- User with appropriate permissions:
  - Create/read helpdesk tickets
  - Create/read contacts
  - Create mail messages

### Browser Requirements
- Chrome, Edge, or Firefox (Manifest V3 support)
- WhatsApp Web access
- Extension permissions granted

## Troubleshooting

### Common Issues

**Extension not loading:**
- Check all files are in correct folder
- Verify manifest.json syntax
- Check browser console for errors

**Button not appearing on WhatsApp:**
- Refresh WhatsApp Web page
- Check if conversation is fully loaded
- Try different conversations

**Connection test fails:**
- Verify Odoo URL is accessible
- Check database name and credentials
- Ensure Odoo external API is enabled
- Check for CORS issues

**Tickets not created:**
- Verify helpdesk app is installed
- Check user has required permissions
- Look at browser console for API errors
- Check Odoo server logs

### Debug Mode
Add this to content.js for more logging:
```javascript
// Add at top of WhatsAppMonitor constructor
console.log('Debug mode enabled');
this.debug = true;
```

## Next Steps

Once POC is working:
1. Test with multiple conversations
2. Verify data accuracy in created tickets
3. Test with different message types
4. Document any WhatsApp Web UI changes needed
5. Prepare for client demonstrations

## File Locations Summary

| File | Path | Purpose |
|------|------|---------|
| `manifest.json` | `/whatsapp-odoo-poc/manifest.json` | Extension configuration |
| `content.js` | `/whatsapp-odoo-poc/content.js` | WhatsApp monitoring |
| `background.js` | `/whatsapp-odoo-poc/background.js` | API communication |
| `popup.html` | `/whatsapp-odoo-poc/popup.html` | Settings interface |
| `popup.js` | `/whatsapp-odoo-poc/popup.js` | Settings logic |