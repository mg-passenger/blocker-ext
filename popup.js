// Popup script for website blocker extension
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const blockedCountElement = document.getElementById('blockedCount');
    const resetStatsBtn = document.getElementById('resetStats');
    const openSettingsBtn = document.getElementById('openSettings');

    // Load initial state
    loadStats();

    // Toggle switch event listener
    toggleSwitch.addEventListener('change', function() {
        const enabled = this.checked;
        updateStatus(enabled);
        
        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'toggleEnabled',
            enabled: enabled
        }, function(response) {
            if (response && response.success) {
                console.log('Extension ' + (enabled ? 'enabled' : 'disabled'));
            }
        });
    });

    // Reset stats button
    resetStatsBtn.addEventListener('click', function() {
        chrome.runtime.sendMessage({
            action: 'resetStats'
        }, function(response) {
            if (response && response.success) {
                blockedCountElement.textContent = '0';
                showNotification('Statistics reset successfully!');
            }
        });
    });

    // Open settings button
    openSettingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });

    // Load statistics from storage
    function loadStats() {
        chrome.runtime.sendMessage({
            action: 'getStats'
        }, function(response) {
            if (response) {
                blockedCountElement.textContent = response.blockedCount;
                toggleSwitch.checked = response.enabled;
                updateStatus(response.enabled);
            }
        });
    }

    // Update status display
    function updateStatus(enabled) {
        if (enabled) {
            statusDot.classList.remove('inactive');
            statusText.textContent = 'Active';
            statusText.style.color = '#4CAF50';
        } else {
            statusDot.classList.add('inactive');
            statusText.textContent = 'Inactive';
            statusText.style.color = '#f44336';
        }
    }

    // Show notification
    function showNotification(message) {
        // Create a simple notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Listen for storage changes to update stats in real-time
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local') {
            if (changes.blockedCount) {
                blockedCountElement.textContent = changes.blockedCount.newValue || 0;
            }
            if (changes.enabled) {
                toggleSwitch.checked = changes.enabled.newValue;
                updateStatus(changes.enabled.newValue);
            }
        }
    });

    // Refresh stats every 5 seconds
    setInterval(loadStats, 5000);
}); 