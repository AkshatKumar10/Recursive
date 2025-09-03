// popup.js - Extension popup functionality
const API_BASE_URL = 'http://localhost:5000';

class PopupController {
    constructor() {
        this.grievanceData = null;
        this.currentTab = null;
        this.init();
    }

    async init() {
        // Get current tab info
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tabs[0];
        } catch (error) {
            console.error('Error getting current tab:', error);
        }

        this.setupEventListeners();
        this.checkCurrentPage();
    }

    setupEventListeners() {
        const checkPageBtn = document.getElementById('checkPageBtn');
        const fetchDataBtn = document.getElementById('fetchDataBtn');
        const fillFormBtn = document.getElementById('fillFormBtn');
        const testDataBtn = document.getElementById('testDataBtn');

        if (checkPageBtn) {
            checkPageBtn.addEventListener('click', () => this.checkCurrentPage());
        }

        if (fetchDataBtn) {
            fetchDataBtn.addEventListener('click', () => this.fetchData());
        }

        if (fillFormBtn) {
            fillFormBtn.addEventListener('click', () => this.fillForm());
        }

        if (testDataBtn) {
            testDataBtn.addEventListener('click', () => this.loadTestData());
        }
    }

    updateStatus(message, type = 'info') {
        const statusCard = document.getElementById('statusCard');
        const statusText = document.getElementById('statusText');
        
        if (statusCard && statusText) {
            statusText.textContent = message;
            
            // Remove existing status classes
            statusCard.classList.remove('error', 'success', 'warning');
            
            // Add new status class
            if (type !== 'info') {
                statusCard.classList.add(type);
            }
        }
    }

    showLoading(show = true) {
        const loading = document.getElementById('loading');
        const content = document.querySelector('.action-buttons');
        
        if (loading && content) {
            loading.style.display = show ? 'block' : 'none';
            content.style.display = show ? 'none' : 'flex';
        }
    }

    async checkCurrentPage() {
        if (!this.currentTab) {
            this.updateStatus('Unable to check current page', 'error');
            return;
        }

        const url = this.currentTab.url.toLowerCase();
        const supportedSites = [
            'consumerhelpline.gov.in',
            'fcaportal.nic.in'
        ];

        const isSupported = supportedSites.some(site => url.includes(site));
        const isComplaintPage = ['complaint', 'grievance', 'register', 'lodge', 'file'].some(
            keyword => url.includes(keyword)
        );

        if (isSupported && isComplaintPage) {
            this.updateStatus('✅ Compatible page detected', 'success');
        } else if (isSupported) {
            this.updateStatus('⚠️ Supported site - navigate to complaint page', 'warning');
        } else {
            this.updateStatus('❌ Not on a supported government site', 'error');
        }
    }

    async fetchData() {
        this.showLoading(true);
        this.updateStatus('Fetching latest grievance data...');

        try {
            // Try multiple endpoints for compatibility
            const endpoints = [
                `${API_BASE_URL}/api/get-latest-grievance`,
                `${API_BASE_URL}/get_grievance/USER123`,
                `${API_BASE_URL}/get-latest-grievance`
            ];

            let response = null;
            let result = null;

            for (const endpoint of endpoints) {
                try {
                    response = await fetch(endpoint, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (response.ok) {
                        result = await response.json();
                        console.log('Fetched data from:', endpoint, result);
                        break;
                    }
                } catch (err) {
                    console.log(`Failed to fetch from ${endpoint}:`, err);
                    continue;
                }
            }
            
            if (!result) {
                throw new Error('All API endpoints failed');
            }
            
            // Handle different response formats
            if (result.status === 'success' && result.data) {
                this.grievanceData = result.data;
            } else if (result.state || result.city || result.sector) {
                // Direct data format
                this.grievanceData = result;
            } else {
                throw new Error('Invalid data format received');
            }
            
            this.updateStatus('✅ Data fetched successfully!', 'success');
            this.enableFillButton();
            
        } catch (error) {
            console.error('Error fetching data:', error);
            this.updateStatus(`❌ Error: ${error.message}`, 'error');
            this.grievanceData = null;
            this.disableFillButton();
        } finally {
            this.showLoading(false);
        }
    }

    loadTestData() {
        this.grievanceData = {
            state: 'Karnataka',
            city: 'Bangalore',
            sector: 'E-Commerce',
            category: 'Defective Product',
            company: 'ABC Electronics',
            grievance: 'Product received was damaged and company is not responding to refund requests.',
            productValue: '10000-25000',
            dealerInfo: 'XYZ Store, MG Road, Bangalore'
        };
        
        this.updateStatus('🧪 Test data loaded successfully', 'success');
        this.enableFillButton();
    }

    async fillForm() {
        if (!this.grievanceData) {
            this.updateStatus('❌ No data available to fill', 'error');
            return;
        }

        if (!this.currentTab) {
            this.updateStatus('❌ Unable to access current tab', 'error');
            return;
        }

        this.showLoading(true);
        this.updateStatus('Filling form on current page...');

        try {
            // Execute content script to fill the form
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                function: this.injectFillScript,
                args: [this.grievanceData]
            });

            this.updateStatus('✅ Form filling completed!', 'success');
            
            // Close popup after success
            setTimeout(() => {
                window.close();
            }, 2000);

        } catch (error) {
            console.error('Error filling form:', error);
            this.updateStatus('❌ Error filling form', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // This function will be injected into the page
    injectFillScript(grievanceData) {
        // Field mapping for different government websites
        const fieldMappings = {
            'state': ['select[name="state"]', 'select[id="state"]', '#state'],
            'city': ['input[name="city"]', 'input[id="city"]', '#city', 'input[name="purchaseCity"]'],
            'sector': ['select[name="sector"]', 'select[id="sector"]', '#sector', 'select[name="sectorIndustry"]'],
            'category': ['input[name="category"]', 'select[name="category"]', '#category'],
            'company': ['input[name="company_name"]', 'input[name="company"]', '#company'],
            'grievance': ['textarea[name="nature"]', 'textarea[name="grievance_details"]', '#grievance', 'textarea[name="natureOfGrievance"]'],
            'productValue': ['select[name="product_value"]', '#productValue'],
            'dealerInfo': ['textarea[name="dealer_info"]', '#dealerInfo']
        };

        function fillElement(element, value) {
            if (!element || !value) return false;
            
            const tagName = element.tagName.toLowerCase();
            
            try {
                if (tagName === 'select') {
                    return fillSelectField(element, value);
                } else if (tagName === 'input' || tagName === 'textarea') {
                    element.value = value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                }
            } catch (err) {
                console.error('Error filling element:', err);
                return false;
            }
            
            return false;
        }

        function fillSelectField(selectElement, value) {
            const options = Array.from(selectElement.options);
            
            // Try exact match first
            let matchingOption = options.find(option => 
                option.value.toLowerCase() === value.toLowerCase() ||
                option.text.toLowerCase() === value.toLowerCase()
            );
            
            // Try partial match if exact match fails
            if (!matchingOption) {
                matchingOption = options.find(option => 
                    option.value.toLowerCase().includes(value.toLowerCase()) ||
                    option.text.toLowerCase().includes(value.toLowerCase()) ||
                    value.toLowerCase().includes(option.text.toLowerCase())
                );
            }
            
            if (matchingOption) {
                selectElement.value = matchingOption.value;
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            
            return false;
        }

        // Fill form fields
        let filledFields = 0;
        let attemptedFields = 0;
        
        for (const [dataKey, selectors] of Object.entries(fieldMappings)) {
            const value = grievanceData[dataKey];
            
            if (!value) continue;
            
            attemptedFields++;
            
            // Try each selector until one works
            let fieldFilled = false;
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                
                if (element && !fieldFilled) {
                    try {
                        if (fillElement(element, value)) {
                            filledFields++;
                            fieldFilled = true;
                            console.log(`✅ Filled ${dataKey} using selector: ${selector}`);
                        }
                    } catch (err) {
                        console.log(`Failed to fill ${selector}:`, err);
                    }
                }
            }
            
            if (!fieldFilled) {
                console.log(`❌ Could not fill field: ${dataKey}`);
            }
        }
        
        // Show result notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
                z-index: 999999;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: bold;
                animation: slideDown 0.3s ease-out;
            ">
                🎉 Auto-filled ${filledFields}/${attemptedFields} form fields!
            </div>
            <style>
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        return { filledFields, attemptedFields };
    }

    enableFillButton() {
        const fillFormBtn = document.getElementById('fillFormBtn');
        if (fillFormBtn) {
            fillFormBtn.disabled = false;
            fillFormBtn.style.opacity = '1';
        }
    }

    disableFillButton() {
        const fillFormBtn = document.getElementById('fillFormBtn');
        if (fillFormBtn) {
            fillFormBtn.disabled = true;
            fillFormBtn.style.opacity = '0.6';
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});