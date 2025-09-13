const axios = require('axios');

class ShipRocketService {
    constructor() {
        this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
        this.token = null;
        this.tokenExpiry = null;
        this.email = process.env.SHIPROCKET_EMAIL;
        this.password = process.env.SHIPROCKET_PASSWORD;
        this.isBlocked = false;
        this.blockExpiry = null;
    }

    // Check if we're currently blocked
    isCurrentlyBlocked() {
        if (this.isBlocked && this.blockExpiry) {
            const now = new Date();
            console.log('Checking block status:', {
                now: now.toISOString(),
                blockExpiry: this.blockExpiry.toISOString(),
                isStillBlocked: now < this.blockExpiry
            });
            
            if (now < this.blockExpiry) {
                const remainingMinutes = Math.ceil((this.blockExpiry - now) / (1000 * 60));
                console.log(`🚫 Still blocked for ${remainingMinutes} more minutes`);
                return true;
            } else {
                // Block has expired
                this.isBlocked = false;
                this.blockExpiry = null;
                console.log('✅ Block period has expired, can try again');
            }
        }
        return false;
    }

    // Check if token is still valid
    isTokenValid() {
        if (!this.token || !this.tokenExpiry) return false;
        const now = new Date();
        const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
        return now < (this.tokenExpiry.getTime() - bufferTime);
    }

    // Reset block status manually
    resetBlockStatus() {
        this.isBlocked = false;
        this.blockExpiry = null;
        this.token = null;
        this.tokenExpiry = null;
        console.log('🔄 ShipRocket block status has been manually reset');
    }

    async authenticate() {
        try {
            // Check if we're blocked
            if (this.isCurrentlyBlocked()) {
                throw new Error('ShipRocket login blocked due to too many attempts. Please wait 30 minutes.');
            }

            // Check if current token is still valid
            if (this.isTokenValid()) {
                console.log('✅ Using existing valid token');
                return this.token;
            }

            console.log('🔑 Attempting ShipRocket authentication...');
            console.log('Email:', this.email);
            console.log('Password length:', this.password ? this.password.length : 0);
            
            if (!this.email || !this.password) {
                throw new Error('ShipRocket credentials missing in environment variables');
            }

            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: this.email,
                password: this.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            
            console.log('Auth response status:', response.status);
            console.log('Auth response data:', response.data);
            
            if (response.data && response.data.token) {
                this.token = response.data.token;
                // ShipRocket tokens typically expire in 10 days, but we'll refresh more frequently
                this.tokenExpiry = new Date(Date.now() + (8 * 60 * 60 * 1000)); // 8 hours
                
                // Reset any block status on successful auth
                this.isBlocked = false;
                this.blockExpiry = null;
                
                console.log('✅ ShipRocket authentication successful!');
                return this.token;
            } else {
                throw new Error('No token received in response');
            }
            
        } catch (error) {
            console.error('❌ ShipRocket Authentication Error:', error.response?.data?.message || error.message);
            
            // Handle rate limiting
            if (error.response?.status === 400 && 
                error.response?.data?.message?.includes('Too many failed login attempts')) {
                
                this.isBlocked = true;
                this.blockExpiry = new Date(Date.now() + (31 * 60 * 1000)); // 31 minutes from now
                console.log('🚫 ShipRocket has blocked login attempts for 30 minutes');
                
                throw new Error('ShipRocket login blocked due to too many attempts. Please wait 30 minutes.');
            }
            
            // Handle other authentication errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                throw new Error('Invalid ShipRocket credentials. Please check email and password.');
            }
            
            throw error;
        }
    }

    async createShipment(orderData) {
        try {
            // Ensure we have a valid token
            await this.authenticate();
            
            if (!this.token) {
                throw new Error('Failed to get valid authentication token');
            }
            
            console.log('📦 Creating shipment in ShipRocket...');
            
            const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                timeout: 15000 // 15 second timeout
            });
            
            console.log('✅ ShipRocket shipment created successfully');
            console.log('Shipment response:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('❌ ShipRocket Create Shipment Error:', error.response?.data || error.message);
            
            // If token is invalid, clear it and retry once
            if (error.response?.status === 401 && this.token) {
                console.log('🔄 Token expired, clearing and retrying...');
                this.token = null;
                this.tokenExpiry = null;
                
                // Retry once with new token
                try {
                    await this.authenticate();
                    const retryResponse = await axios.post(`${this.baseURL}/orders/create/adhoc`, orderData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.token}`
                        },
                        timeout: 15000
                    });
                    console.log('✅ ShipRocket shipment created on retry');
                    return retryResponse.data;
                } catch (retryError) {
                    console.error('❌ Retry also failed:', retryError.response?.data || retryError.message);
                    throw retryError;
                }
            }
            
            throw error;
        }
    }

    // Track shipment
    async trackShipment(shipmentId) {
        try {
            await this.authenticate();
            
            const response = await axios.get(`${this.baseURL}/courier/track/shipment/${shipmentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                timeout: 10000
            });
            
            return response.data;
        } catch (error) {
            console.error('❌ ShipRocket Track Error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get service status
    getServiceStatus() {
        return {
            isBlocked: this.isBlocked,
            blockExpiry: this.blockExpiry,
            hasValidToken: this.isTokenValid(),
            tokenExpiry: this.tokenExpiry,
            email: this.email,
            passwordExists: !!this.password
        };
    }

    // Assign courier
    async assignCourier(data) {
        try {
            await this.authenticate();
            
            const response = await axios.post(`${this.baseURL}/courier/assign/awb`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('ShipRocket Assign Courier Error:', error.response?.data);
            throw error;
        }
    }

    // Cancel shipment
    async cancelShipment(awbCode) {
        try {
            await this.authenticate();
            
            const response = await axios.post(`${this.baseURL}/orders/cancel`, {
                awbs: [awbCode]
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('ShipRocket Cancel Error:', error.response?.data);
            throw error;
        }
    }
}

module.exports = new ShipRocketService();