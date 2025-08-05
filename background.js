// Background service worker for website blocking using Manifest V3
const ALLOWED_DOMAINS = ['mg-passenger.online', 'google.com'];
let isEnabled = true; // Default to enabled

// Function to check if URL should be blocked
function shouldBlockUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Allow mg-passenger.online, google.com and their subdomains
    for (const allowedDomain of ALLOWED_DOMAINS) {
      if (hostname === allowedDomain || hostname.endsWith('.' + allowedDomain)) {
        return false; // Don't block
      }
    }
    
    // Block everything else
    return true;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return true; // Block if we can't parse the URL
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('Website blocker extension installed');
    
    // Set default settings
    chrome.storage.local.set({
      enabled: true,
      allowedDomain: ALLOWED_DOMAINS, // Store allowed domains as an array
      blockedCount: 0
    });
  }
});

// Load initial enabled state
chrome.storage.local.get(['enabled'], function(result) {
  isEnabled = result.enabled !== false;
});

// Listen for storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local' && changes.enabled) {
    isEnabled = changes.enabled.newValue;
    console.log('Extension ' + (isEnabled ? 'enabled' : 'disabled'));
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getStats') {
    chrome.storage.local.get(['blockedCount', 'enabled'], function(result) {
      sendResponse({
        blockedCount: result.blockedCount || 0,
        enabled: result.enabled !== false
      });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'toggleEnabled') {
    isEnabled = request.enabled;
    chrome.storage.local.set({ enabled: request.enabled });
    sendResponse({ success: true });
  }
  
  if (request.action === 'resetStats') {
    chrome.storage.local.set({ blockedCount: 0 });
    sendResponse({ success: true });
  }
});

// Use content script approach for blocking
// The content script will handle the actual blocking on the page level 