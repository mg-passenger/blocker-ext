# Website Blocker Extension

**cooperative.mg-passenger.online**

A Chrome extension that blocks all websites except `mg-passenger.online` and its subdomains.

## Features

- 🔒 **Website Blocking**: Blocks all domains except `mg-passenger.online`
- 🎛️ **Easy Control**: Toggle blocking on/off with a simple switch
- 📊 **Statistics**: Track how many requests have been blocked
- 🎨 **Modern UI**: Clean and intuitive popup interface
- 🛡️ **Secure**: Uses Manifest V3 for enhanced security

## Installation

### Method 1: Load Unpacked Extension (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `blocker-ext` folder
5. The extension will be installed and appear in your extensions list

### Method 2: Pack Extension (Distribution)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Pack extension"
4. Browse to the `blocker-ext` folder
5. Click "Pack Extension"
6. A `.crx` file will be created for distribution

## Usage

### Basic Usage

1. **Enable/Disable**: Click the extension icon in the toolbar to open the popup
2. **Toggle Blocking**: Use the switch to enable or disable website blocking
3. **View Statistics**: See how many requests have been blocked
4. **Reset Stats**: Click "Reset Stats" to clear the counter

### Blocked Pages

When you visit a blocked website, you'll see:

- A full-screen overlay with blocking message
- Link to the allowed domain (`mg-passenger.online`)
- Instructions on how to disable blocking

### Allowed Domains

The following domains are allowed:

- `mg-passenger.online`
- `*.mg-passenger.online` (all subdomains)

## Files Structure

```
blocker-ext/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for request blocking
├── popup.html            # Popup interface HTML
├── popup.css             # Popup interface styles
├── popup.js              # Popup interface logic
├── content.js            # Content script for page blocking
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 icon
│   ├── icon32.png        # 32x32 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

## Technical Details

### Manifest V3 Features

- **Service Worker**: Background script runs as a service worker
- **Web Request API**: Blocks requests at the network level
- **Storage API**: Stores settings and statistics
- **Content Scripts**: Injects blocking overlay on web pages

### Permissions

- `webRequest`: Required for blocking network requests
- `webRequestBlocking`: Required for blocking requests
- `storage`: Required for storing settings and statistics
- `activeTab`: Required for popup functionality
- `<all_urls>`: Required for blocking all websites

### Security Features

- **Request Blocking**: Blocks requests at the network level
- **Content Script Protection**: Prevents bypassing through developer tools
- **Keyboard Shortcut Blocking**: Prevents common bypass methods
- **Context Menu Blocking**: Prevents right-click context menu

## Customization

### Changing Allowed Domain

To change the allowed domain, edit the `ALLOWED_DOMAIN` constant in:

- `background.js` (line 2)
- `content.js` (line 6)

### Modifying UI

- **Popup Interface**: Edit `popup.html`, `popup.css`, and `popup.js`
- **Blocking Overlay**: Edit the `createBlockingOverlay()` function in `content.js`
- **Icons**: Replace the placeholder files in the `icons/` directory

## Troubleshooting

### Extension Not Working

1. Check if the extension is enabled in `chrome://extensions/`
2. Ensure "Developer mode" is enabled
3. Try reloading the extension
4. Check the browser console for errors

### Websites Still Loading

1. Verify the extension is enabled in the popup
2. Check if the website is a subdomain of `mg-passenger.online`
3. Clear browser cache and reload the page
4. Check if the website uses HTTPS (some sites may bypass blocking)

### Performance Issues

1. The extension is lightweight and shouldn't impact performance
2. If you experience issues, try disabling and re-enabling the extension
3. Check for conflicts with other extensions

## Development

### Testing

1. Load the extension in developer mode
2. Visit various websites to test blocking
3. Test the popup interface functionality
4. Verify statistics are being tracked correctly

### Building

The extension is ready to use as-is. For distribution:

1. Replace placeholder icon files with actual PNG images
2. Update version number in `manifest.json` if needed
3. Pack the extension using Chrome's developer tools

## License

This extension is created for the cooperative.mg-passenger.online project.

## Support

For issues or questions, please refer to the Chrome Extensions documentation or contact the development team.
