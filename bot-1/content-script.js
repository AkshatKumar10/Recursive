// content-script.js - Enhanced for better data fetching and form filling
console.log("Consumer Grievance Extension loaded on:", window.location.href);

const API_BASE_URL = 'http://localhost:5000';

// Enhanced field mapping for different government websites
const FIELD_MAPPINGS = {
    'consumerhelpline.gov.in': {
        'state': ['select[name="state"]', 'select[id="state"]', '#state'],
        'city': ['input[name="city"]', 'input[id="city"]', '#city', 'input[name="purchaseCity"]'],
        'sector': ['select[name="sector"]', 'select[id="sector"]', '#sector', 'select[name="sectorIndustry"]'],
        'category': ['input[name="category"]', 'select[name="category"]', '#category'],
        'company': ['input[name="company_name"]', 'input[name="company"]', '#company'],
        'grievance': ['textarea[name="nature"]', 'textarea[name="grievance_details"]', '#grievance', 'textarea[name="natureOfGrievance"]'],
        'productValue': ['select[name="product_value"]', '#productValue'],
        'dealerInfo': ['textarea[name="dealer_info"]', '#dealerInfo']
    }
};

class GrievanceAutoFill {
    constructor() {
        this.grievanceData = null;
        this.currentWebsite = this.detectWebsite();
        this.fieldMapping = FIELD_MAPPINGS[this.currentWebsite] || FIELD_MAPPINGS['consumerhelpline.gov.in'];
        this.initializeExtension();
    }

    detectWebsite() {
        const url = window.location.href.toLowerCase();
        if (url.includes('consumerhelpline.gov.in')) return 'consumerhelpline.gov.in';
        if (url.includes('fcaportal.nic.in')) return 'fcaportal.nic.in';
        return 'consumerhelpline.gov.in'; // default
    }

    async initializeExtension() {
        // Check if we're on a complaint/grievance page
        const isComplaintPage = this.isComplaintPage();
        if (!isComplaintPage) {
            console.log("Not on a complaint page, extension inactive");
            return;
        }

        console.log("Initializing extension on complaint page");
        
        // Wait for page to be fully loaded
        await this.waitForPageLoad();
        
        // Add extension UI
        this.addExtensionUI();
        
        // Auto-fetch data after a short delay
        setTimeout(() => {
            this.fetchAndFillData();
        }, 2000);
    }

    isComplaintPage() {
        const url = window.location.href.toLowerCase();
        const complainKeywords = ['complaint', 'grievance', 'register', 'lodge', 'file'];
        return complainKeywords.some(keyword => url.includes(keyword));
    }

    waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    addExtensionUI() {
        // Remove existing extension if any
        const existing = document.getElementById('grievance-extension');
        if (existing) existing.remove();

        const extensionDiv = document.createElement('div');
        extensionDiv.id = 'grievance-extension';
        extensionDiv.innerHTML = `
            <div id="extension-container" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                min-width: 280px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600;">🛡️ Grievance Helper</h3>
                    <div id="minimize-btn" style="
                        cursor: pointer;
                        font-size: 20px;
                        width: 25px;
                        height: 25px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.2);
                        transition: background 0.2s;
                    ">−</div>
                </div>
                
                <div id="extension-content">
                    <div id="status" style="
                        margin-bottom: 15px; 
                        font-size: 14px;
                        padding: 8px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 6px;
                        border-left: 3px solid #4CAF50;
                    ">Ready to fetch data...</div>
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="fetch-data-btn" style="
                            background: rgba(255,255,255,0.2);
                            border: 1px solid rgba(255,255,255,0.3);
                            color: white;
                            padding: 10px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            flex: 1;
                        ">🔄 Fetch Data</button>
                        
                        <button id="fill-form-btn" style="
                            background: rgba(76, 175, 80, 0.8);
                            border: 1px solid rgba(76, 175, 80, 0.5);
                            color: white;
                            padding: 10px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            flex: 1;
                        ">✍️ Fill Form</button>
                    </div>
                    
                    <div id="data-preview" style="
                        margin-top: 15px;
                        font-size: 12px;
                        background: rgba(0,0,0,0.2);
                        padding: 10px;
                        border-radius: 6px;
                        max-height: 150px;
                        overflow-y: auto;
                        display: none;
                    "></div>
                </div>
            </div>
        `;

        document.body.appendChild(extensionDiv);
        this.attachEventListeners();
    }

    attachEventListeners() {
        const fetchBtn = document.getElementById('fetch-data-btn');
        const fillBtn = document.getElementById('fill-form-btn');
        const minimizeBtn = document.getElementById('minimize-btn');

        if (fetchBtn) {
            fetchBtn.addEventListener('click', () => this.fetchAndFillData());
        }

        if (fillBtn) {
            fillBtn.addEventListener('click', () => this.fillForm());
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }

        // Add hover effects
        [fetchBtn, fillBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-1px)';
                    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = 'none';
                });
            }
        });
    }

    async fetchAndFillData() {
        this.updateStatus('🔄 Fetching latest grievance data...', '#FFA726');
        
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
                throw new Error('All endpoints failed');
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
            
            this.updateStatus('✅ Data fetched successfully!', '#4CAF50');
            this.showDataPreview();
            
            // Auto-fill after successful fetch
            setTimeout(() => this.fillForm(), 1500);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            this.updateStatus(`❌ Error: ${error.message}`, '#F44336');
            
            // Show example data for testing
            this.showTestDataOption();
        }
    }

    showDataPreview() {
        const preview = document.getElementById('data-preview');
        if (preview && this.grievanceData) {
            const data = this.grievanceData;
            preview.innerHTML = `
                <strong>📊 Data Preview:</strong><br>
                State: ${data.state || 'N/A'}<br>
                City: ${data.city || 'N/A'}<br>
                Sector: ${data.sector || 'N/A'}<br>
                Category: ${data.category || 'N/A'}<br>
                Company: ${data.company || 'N/A'}<br>
                Grievance: ${data.grievance ? (data.grievance.substring(0, 50) + '...') : 'N/A'}
            `;
            preview.style.display = 'block';
        }
    }

    showTestDataOption() {
        const preview = document.getElementById('data-preview');
        if (preview) {
            preview.innerHTML = `
                <strong>🧪 Test Mode Available</strong><br>
                <button id="use-test-data" style="
                    background: #FF9800;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-top: 5px;
                ">Use Test Data</button>
            `;
            preview.style.display = 'block';
            
            document.getElementById('use-test-data').addEventListener('click', () => {
                this.loadTestData();
            });
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
        
        this.updateStatus('🧪 Test data loaded', '#FF9800');
        this.showDataPreview();
    }

    fillForm() {
        if (!this.grievanceData) {
            this.updateStatus('❌ No data available to fill', '#F44336');
            return;
        }

        this.updateStatus('✍️ Filling form fields...', '#2196F3');
        
        let filledFields = 0;
        let attemptedFields = 0;
        
        try {
            // Fill each field based on mapping
            for (const [dataKey, selectors] of Object.entries(this.fieldMapping)) {
                const value = this.grievanceData[dataKey];
                
                if (!value) continue;
                
                attemptedFields++;
                
                // Try each selector until one works
                let fieldFilled = false;
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    
                    if (element && !fieldFilled) {
                        try {
                            if (this.fillElement(element, value)) {
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
            
            this.updateStatus(`✅ Filled ${filledFields}/${attemptedFields} fields!`, '#4CAF50');
            
            // Mark as submitted in backend
            this.markAsSubmitted();
            
            // Show completion message
            setTimeout(() => {
                this.updateStatus('🎉 Form auto-fill completed!', '#4CAF50');
            }, 2000);
            
        } catch (error) {
            console.error('Error filling form:', error);
            this.updateStatus('❌ Error filling form', '#F44336');
        }
    }

    fillElement(element, value) {
        if (!element || !value) return false;
        
        const tagName = element.tagName.toLowerCase();
        
        try {
            if (tagName === 'select') {
                return this.fillSelectField(element, value);
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

    fillSelectField(selectElement, value) {
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

    async markAsSubmitted() {
        try {
            const updateEndpoints = [
                `${API_BASE_URL}/api/update-grievance-status`,
                `${API_BASE_URL}/update-grievance-status`
            ];
            
            const updateData = {
                grievance_id: this.grievanceData._id || this.grievanceData.id || 'unknown',
                status: 'form_filled',
                submission_data: {
                    filled_at: new Date().toISOString(),
                    url: window.location.href,
                    website: this.currentWebsite
                }
            };
            
            for (const endpoint of updateEndpoints) {
                try {
                    await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                    });
                    console.log('Status updated successfully');
                    break;
                } catch (err) {
                    console.log(`Failed to update status at ${endpoint}:`, err);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    updateStatus(message, color = 'white') {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.innerHTML = message;
            statusElement.style.borderLeftColor = color;
            statusElement.style.background = `${color}20`;
        }
    }

    toggleMinimize() {
        const content = document.getElementById('extension-content');
        const minimizeBtn = document.getElementById('minimize-btn');
        
        if (content && minimizeBtn) {
            if (content.style.display === 'none') {
                content.style.display = 'block';
                minimizeBtn.textContent = '−';
            } else {
                content.style.display = 'none';
                minimizeBtn.textContent = '+';
            }
        }
    }
}

// Initialize the extension
function initializeExtension() {
    // Wait a bit for page to settle
    setTimeout(() => {
        try {
            new GrievanceAutoFill();
        } catch (error) {
            console.error('Error initializing extension:', error);
        }
    }, 1000);
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}

// Also listen for navigation changes (for SPA websites)
let currentUrl = window.location.href;
setInterval(() => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        initializeExtension();
    }
}, 2000);