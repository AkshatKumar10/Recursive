// background.js - Enhanced service worker
const API_BASE_URL = 'http://localhost:5000';

// Install event
chrome.runtime.onInstalled.addListener((details) => {
    console.log("Consumer Grievance Auto-Fill Extension Installed");
    
    if (details.reason === 'install') {
        // Show welcome notification
        chrome.notifications.create('welcome', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Grievance Helper Installed!',
            message: 'Extension is ready. Visit government complaint sites to auto-fill forms.'
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    // Check if we're on a supported site
    const url = tab.url.toLowerCase();
    const supportedSites = ['consumerhelpline.gov.in', 'fcaportal.nic.in'];
    const isSupported = supportedSites.some(site => url.includes(site));
    
    if (!isSupported) {
        // Show notification for unsupported sites
        chrome.notifications.create('unsupported', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Unsupported Site',
            message: 'Please visit consumerhelpline.gov.in or fcaportal.nic.in to use auto-fill features.'
        });
        return;
    }
    
    // Try to inject content script if not already present
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content-script.js']
        });
    } catch (error) {
        console.log('Content script already injected or failed to inject:', error);
    }
});

// Listen for tab updates to detect navigation to complaint pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = tab.url.toLowerCase();
        const supportedSites = ['consumerhelpline.gov.in', 'fcaportal.nic.in'];
        const isComplaintPage = ['complaint', 'grievance', 'register', 'lodge', 'file'].some(
            keyword => url.includes(keyword)
        );
        
        // Auto-inject content script on complaint pages
        if (supportedSites.some(site => url.includes(site)) && isComplaintPage) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content-script.js']
            }).catch(error => {
                console.log('Failed to inject content script:', error);
            });
        }
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.action) {
        case 'fetchGrievanceData':
            fetchGrievanceData()
                .then(data => sendResponse({ success: true, data }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep message channel open for async response
            
        case 'updateGrievanceStatus':
            updateGrievanceStatus(message.data)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'showNotification':
            chrome.notifications.create('status', {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: message.title || 'Grievance Helper',
                message: message.message
            });
            break;
    }
});

// Helper function to fetch grievance data
async function fetchGrievanceData() {
    const endpoints = [
        `${API_BASE_URL}/api/get-latest-grievance`,
        `${API_BASE_URL}/get_grievance/USER123`,
        `${API_BASE_URL}/get-latest-grievance`
    ];

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Handle different response formats
                if (result.status === 'success' && result.data) {
                    return result.data;
                } else if (result.state || result.city || result.sector) {
                    return result;
                }
            }
        } catch (err) {
            console.log(`Failed to fetch from ${endpoint}:`, err);
            continue;
        }
    }
    
    throw new Error('All API endpoints failed');
}

// Helper function to update grievance status
async function updateGrievanceStatus(data) {
    const endpoints = [
        `${API_BASE_URL}/api/update-grievance-status`,
        `${API_BASE_URL}/update-grievance-status`
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (err) {
            console.log(`Failed to update status at ${endpoint}:`, err);
        }
    }
    
    throw new Error('Failed to update status at all endpoints');
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.notifications.clear(notificationId);
    
    if (notificationId === 'unsupported') {
        // Open supported site in new tab
        chrome.tabs.create({
            url: 'https://consumerhelpline.gov.in/user/register-complaint.php'
        });
    }
});

// Periodic check for pending grievances (every 5 minutes)
chrome.alarms.create('checkGrievances', { delayInMinutes: 1, periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkGrievances') {
        checkForPendingGrievances();
    }
});

// Check for pending grievances and notify user
async function checkForPendingGrievances() {
    try {
        const data = await fetchGrievanceData();
        
        if (data && Object.keys(data).length > 0) {
            // Check if user is on a complaint page
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tabs.length > 0) {
                const url = tabs[0].url.toLowerCase();
                const supportedSites = ['consumerhelpline.gov.in', 'fcaportal.nic.in'];
                const isComplaintPage = ['complaint', 'grievance', 'register', 'lodge', 'file'].some(
                    keyword => url.includes(keyword)
                );
                
                if (supportedSites.some(site => url.includes(site)) && isComplaintPage) {
                    chrome.notifications.create('pendingGrievance', {
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: 'Pending Grievance Found!',
                        message: 'You have a pending grievance. Click the extension icon to auto-fill the form.'
                    });
                }
            }
        }
    } catch (error) {
        console.log('Error checking for pending grievances:', error);
    }
}