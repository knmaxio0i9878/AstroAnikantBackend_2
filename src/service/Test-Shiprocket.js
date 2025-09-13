const shipRocketService = require('./ShipRocket');

async function testShipRocket() {
    try {
        console.log('Testing ShipRocket authentication...');
        const token = await shipRocketService.authenticate();
        console.log('Authentication successful, token:', token);
        
        // Test with minimal order data
        const testOrderData = {
            order_id: "TEST_ORDER_" + Date.now(),
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: "Primary",
            billing_customer_name: "Test Customer",
            billing_last_name: "",
            billing_address: "Test Address",
            billing_city: "Mumbai",
            billing_pincode: "400001",
            billing_state: "Maharashtra",
            billing_country: "India",
            billing_email: "test@example.com",
            billing_phone: "9876543210",
            shipping_is_billing: true,
            order_items: [{
                name: "Test Product",
                sku: "TEST_SKU",
                units: 1,
                selling_price: 100,
                discount: 0,
                tax: "",
                hsn: 0
            }],
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: 100,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };
        
        console.log('Creating test shipment...');
        const result = await shipRocketService.createShipment(testOrderData);
        console.log('Test shipment result:', result);
        
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

// Run this: node test-shiprocket.js
testShipRocket();
