// Options page script for website blocker extension
document.addEventListener('DOMContentLoaded', function() {
    const allowedDomainInput = document.getElementById('allowedDomain');
    const enableBlockingCheckbox = document.getElementById('enableBlocking');
    const showNotificationsCheckbox = document.getElementById('showNotifications');
    const blockKeyboardShortcutsCheckbox = document.getElementById('blockKeyboardShortcuts');
    const blockContextMenuCheckbox = document.getElementById('blockContextMenu');
    const totalBlockedSpan = document.getElementById('totalBlocked');
    const extensionStatusSpan = document.getElementById('extensionStatus');
    const lastResetSpan = document.getElementById('lastReset');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');
    const resetStatsBtn = document.getElementById('resetStats');
    const exportStatsBtn = document.getElementById('exportStats');
    const statusDiv = document.getElementById('status');

    // Load current settings
    loadSettings();

    // Save settings button
    saveSettingsBtn.addEventListener('click', function() {
        saveSettings();
    });

    // Reset settings button
    resetSettingsBtn.addEventListener('click', function() {
        resetToDefaults();
    });

    // Reset stats button
    resetStatsBtn.addEventListener('click', function() {
        resetStatistics();
    });

    // Export stats button
    exportStatsBtn.addEventListener('click', function() {
        exportStatistics();
    });

    // Load settings from storage
    function loadSettings() {
        chrome.storage.local.get([
            'allowedDomain',
            'enabled',
            'showNotifications',
            'blockKeyboardShortcuts',
            'blockContextMenu',
            'blockedCount',
            'lastReset'
        ], function(result) {
            // Set form values
            allowedDomainInput.value = result.allowedDomain || 'mg-passenger.online';
            enableBlockingCheckbox.checked = result.enabled !== false;
            showNotificationsCheckbox.checked = result.showNotifications !== false;
            blockKeyboardShortcutsCheckbox.checked = result.blockKeyboardShortcuts !== false;
            blockContextMenuCheckbox.checked = result.blockContextMenu !== false;
            
            // Update statistics
            totalBlockedSpan.textContent = result.blockedCount || 0;
            extensionStatusSpan.textContent = result.enabled !== false ? 'Active' : 'Inactive';
            lastResetSpan.textContent = result.lastReset || 'Never';
        });
    }

    // Save settings to storage
    function saveSettings() {
        const settings = {
            allowedDomain: allowedDomainInput.value.trim(),
            enabled: enableBlockingCheckbox.checked,
            showNotifications: showNotificationsCheckbox.checked,
            blockKeyboardShortcuts: blockKeyboardShortcutsCheckbox.checked,
            blockContextMenu: blockContextMenuCheckbox.checked
        };

        // Validate domain
        if (!settings.allowedDomain) {
            showStatus('Please enter a valid domain', 'error');
            return;
        }

        chrome.storage.local.set(settings, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus('Settings saved successfully!', 'success');
                
                // Update status display
                extensionStatusSpan.textContent = settings.enabled ? 'Active' : 'Inactive';
                
                // Reload extension to apply new settings
                chrome.runtime.reload();
            }
        });
    }

    // Reset to default settings
    function resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            const defaultSettings = {
                allowedDomain: 'mg-passenger.online',
                enabled: true,
                showNotifications: true,
                blockKeyboardShortcuts: true,
                blockContextMenu: true
            };

            chrome.storage.local.set(defaultSettings, function() {
                if (chrome.runtime.lastError) {
                    showStatus('Error resetting settings: ' + chrome.runtime.lastError.message, 'error');
                } else {
                    showStatus('Settings reset to defaults!', 'success');
                    loadSettings();
                    chrome.runtime.reload();
                }
            });
        }
    }

    // Reset statistics
    function resetStatistics() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            const now = new Date().toLocaleString();
            
            chrome.storage.local.set({
                blockedCount: 0,
                lastReset: now
            }, function() {
                if (chrome.runtime.lastError) {
                    showStatus('Error resetting statistics: ' + chrome.runtime.lastError.message, 'error');
                } else {
                    showStatus('Statistics reset successfully!', 'success');
                    totalBlockedSpan.textContent = '0';
                    lastResetSpan.textContent = now;
                }
            });
        }
    }

    // Export statistics
    function exportStatistics() {
        chrome.storage.local.get(null, function(data) {
            const exportData = {
                timestamp: new Date().toISOString(),
                extension: 'cooperative.mg-passenger.online',
                version: '1.0.0',
                statistics: {
                    blockedCount: data.blockedCount || 0,
                    lastReset: data.lastReset || 'Never',
                    enabled: data.enabled !== false
                },
                settings: {
                    allowedDomain: data.allowedDomain || 'mg-passenger.online',
                    showNotifications: data.showNotifications !== false,
                    blockKeyboardShortcuts: data.blockKeyboardShortcuts !== false,
                    blockContextMenu: data.blockContextMenu !== false
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'website-blocker-stats-' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showStatus('Statistics exported successfully!', 'success');
        });
    }

    // Show status message
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.style.display = 'block';

        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local') {
            if (changes.blockedCount) {
                totalBlockedSpan.textContent = changes.blockedCount.newValue || 0;
            }
            if (changes.enabled) {
                extensionStatusSpan.textContent = changes.enabled.newValue ? 'Active' : 'Inactive';
            }
            if (changes.lastReset) {
                lastResetSpan.textContent = changes.lastReset.newValue || 'Never';
            }
        }
    });

    // Auto-save on input changes (with debounce)
    let saveTimeout;
    function debouncedSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveSettings, 1000);
    }

    // Add event listeners for auto-save
    allowedDomainInput.addEventListener('input', debouncedSave);
    enableBlockingCheckbox.addEventListener('change', debouncedSave);
    showNotificationsCheckbox.addEventListener('change', debouncedSave);
    blockKeyboardShortcutsCheckbox.addEventListener('change', debouncedSave);
    blockContextMenuCheckbox.addEventListener('change', debouncedSave);
}); 