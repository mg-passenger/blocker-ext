// Content script for website blocker extension
(function() {
    'use strict';

    // Check if current page should be blocked
    function shouldBlockCurrentPage() {
        const hostname = window.location.hostname.toLowerCase();
        const allowedDomain = 'mg-passenger.online';
        
        // Allow mg-passenger.online and its subdomains
        if (hostname === allowedDomain || hostname.endsWith('.' + allowedDomain)) {
            return false;
        }
        
        return true;
    }

    // Create blocking overlay
    function createBlockingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'website-blocker-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg,rgb(226, 143, 19) 0%,rgb(255, 191, 1) 100%);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            text-align: center;
            color: white;
            max-width: 500px;
            padding: 40px;
            position: relative;
        `;

        // Add Orange logo
        const logoContainer = document.createElement('div');
        logoContainer.style.cssText = `
            position: absolute;
            top: -60px;
            right: -60px;
            opacity: 0.1;
            z-index: 1;
        `;

        const logo = document.createElement('img');
        logo.src = chrome.runtime.getURL('google_translate_icon.svg');
        logo.style.cssText = `
            width: 120px;
            height: 120px;
            filter: brightness(0) invert(1);
        `;
        logo.alt = 'Google Translate';

        logoContainer.appendChild(logo);
        content.appendChild(logoContainer);

        const icon = document.createElement('div');
        icon.innerHTML = '🚫';
        icon.style.cssText = `
            font-size: 64px;
            margin-bottom: 20px;
        `;

        const title = document.createElement('h1');
        title.textContent = 'Website Blocked';
        title.style.cssText = `
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 16px;
            color: white;
            position: relative;
            z-index: 2;
        `;

        const message = document.createElement('p');
        message.textContent = 'Cette machine n\'est pas autorisée à accéder à ce site. Seuls les sites mg-passenger.online et ses sous-domaines sont autorisés.';
        message.style.cssText = `
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            opacity: 0.9;
            position: relative;
            z-index: 2;
        `;

        const allowedLink = document.createElement('a');
        allowedLink.href = 'https://mg-passenger.online';
        allowedLink.textContent = 'Go to mg-passenger.online';
        allowedLink.style.cssText = `
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.3s ease;
            position: relative;
            z-index: 2;
        `;

        allowedLink.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 255, 255, 0.3)';
        });

        allowedLink.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(allowedLink);
        overlay.appendChild(content);

        return overlay;
    }

    // Check if extension is enabled
    function checkExtensionStatus() {
        chrome.storage.local.get(['enabled'], function(result) {
            const enabled = result.enabled !== false; // Default to true
            
            if (enabled && shouldBlockCurrentPage()) {
                // Remove any existing overlay first
                const existingOverlay = document.getElementById('website-blocker-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
                
                // Create and add blocking overlay
                const overlay = createBlockingOverlay();
                document.body.appendChild(overlay);
                
                // Prevent scrolling
                document.body.style.overflow = 'hidden';
                
                // Increment blocked count
                chrome.storage.local.get(['blockedCount'], function(result) {
                    const currentCount = result.blockedCount || 0;
                    chrome.storage.local.set({ blockedCount: currentCount + 1 });
                });
                
                console.log('Website blocked by cooperative.mg-passenger.online extension');
            } else {
                // Remove overlay if it exists and extension is disabled or page is allowed
                const existingOverlay = document.getElementById('website-blocker-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Run initial check
    checkExtensionStatus();

    // Listen for storage changes
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local' && changes.enabled) {
            checkExtensionStatus();
        }
    });

    // Prevent right-click context menu on blocked pages
    document.addEventListener('contextmenu', function(e) {
        if (shouldBlockCurrentPage()) {
            e.preventDefault();
            return false;
        }
    });

    // Prevent keyboard shortcuts that might bypass blocking
    document.addEventListener('keydown', function(e) {
        if (shouldBlockCurrentPage()) {
            // Block common keyboard shortcuts
            const blockedKeys = [
                'F5', 'F11', 'F12', // Refresh, fullscreen, dev tools
                'Ctrl+R', 'Ctrl+Shift+R', // Refresh
                'Ctrl+Shift+I', 'F12', // Developer tools
                'Ctrl+U', // View source
                'Ctrl+Shift+C' // Inspect element
            ];
            
            const keyCombo = [];
            if (e.ctrlKey) keyCombo.push('Ctrl');
            if (e.shiftKey) keyCombo.push('Shift');
            if (e.altKey) keyCombo.push('Alt');
            keyCombo.push(e.key);
            
            const keyString = keyCombo.join('+');
            
            if (blockedKeys.includes(keyString)) {
                e.preventDefault();
                return false;
            }
        }
    });

    // Prevent navigation to blocked sites
    function preventNavigation() {
        if (shouldBlockCurrentPage()) {
            // Try to redirect to allowed domain
            if (window.location.href !== 'https://mg-passenger.online') {
                window.location.href = 'https://mg-passenger.online';
            }
        }
    }

    // Run navigation prevention
    preventNavigation();

})(); 