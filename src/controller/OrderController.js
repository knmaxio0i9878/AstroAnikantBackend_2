const orderSchema = require("../models/OrderModel")
const mailUtil = require("../service/MailUtil")
const cartSchema = require("../models/Cart")
const shipRocketService = require('../service/ShipRocket');
const { sendingMail } = require("../service/MailUtil"); // Update the path


// ADD THIS IMPORT AT THE TOP OF YOUR CONTROLLER FILE

const createOrder = async (req, res) => {
    try {
        const order = {
            cart: req.body.cart,
            typeOfPayment: req.body.typeOfPayment,
            shippingAddress: req.body.shippingAddress,
            orderNotes: req.body.orderNotes,
            deliveryPreference: req.body.deliveryPreference,
            amount: req.body.amount,
            status: req.body.status || 'pending'
        };

        const response = await orderSchema.create(order);
        if (!response) {
            return res.status(404).json({
                message: "Order Failed"
            });
        }

        // Update cart status
        await cartSchema.findByIdAndUpdate(req.body.cart, { status: "Ordered" });
        
        // Populate the cart with user and product details
        const populatedOrder = await orderSchema.findById(response._id)
            .populate({
                path: 'cart',
                populate: [
                    { path: 'user' },
                    { path: 'items.product' }
                ]
            });

        console.log('=== DEBUG POPULATED ORDER ===');
        console.log('Order exists:', !!populatedOrder);
        console.log('Cart exists:', !!populatedOrder?.cart);

        if (!populatedOrder || !populatedOrder.cart) {
            console.error('Population failed - missing data');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (without shipping integration)",
                note: "Cart data missing - ShipRocket integration skipped"
            });
        }

        // USE THE SHIPPING ADDRESS FROM THE FORM (req.body.shippingAddress)
        const shippingAddress = req.body.shippingAddress;
        
        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.pincode) {
            console.error('Shipping address incomplete');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (incomplete shipping address)",
                note: "Shipping address incomplete - ShipRocket integration skipped"
            });
        }

        // Clean the phone number - remove non-digits
        let cleanPhone = shippingAddress.phone.toString().replace(/\D/g, '');
        if (cleanPhone.length === 10) {
            // Phone is good
        } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.substring(2); // Remove country code
        } else {
            console.error('Invalid phone number format');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (invalid phone number)",
                note: "Phone number invalid - ShipRocket integration skipped"
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shippingAddress.email)) {
            console.error('Invalid email format');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (invalid email)",
                note: "Email invalid - ShipRocket integration skipped"
            });
        }

        // Ensure pincode is 6 digits
        const pincode = shippingAddress.pincode.toString().trim();
        if (!/^\d{6}$/.test(pincode)) {
            console.error('Invalid pincode format');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (invalid pincode)",
                note: "Pincode invalid - ShipRocket integration skipped"
            });
        }

        // Calculate total weight, amount and prepare order items
        let totalWeight = 0;
        let totalAmount = 0;
        const orderItems = [];

        if (!populatedOrder.cart.items || populatedOrder.cart.items.length === 0) {
            console.log('No items in cart');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (no items for shipping)",
                note: "Cart is empty - ShipRocket integration skipped"
            });
        }

        // Process cart items
        let hasValidItems = false;
        populatedOrder.cart.items.forEach((item, index) => {
            if (!item.product) {
                console.log(`Item ${index} has no product, skipping`);
                return;
            }

            // Handle pricing
            let finalPrice = 0;
            const discountedPrice = parseFloat(item.product.discountedPrice);
            const originalPrice = parseFloat(item.product.price);
            
            if (!isNaN(discountedPrice) && discountedPrice > 0) {
                finalPrice = discountedPrice;
            } else if (!isNaN(originalPrice) && originalPrice > 0) {
                finalPrice = originalPrice;
            } else {
                console.log(`Product ${item.product.name || item.product._id} has no valid price, using default`);
                finalPrice = 100;
            }

            // Handle weight
            let weight = 0.5; // Default weight
            if (item.product.weight) {
                if (typeof item.product.weight === 'object' && item.product.weight.value) {
                    weight = parseFloat(item.product.weight.value) || 0.5;
                } else if (typeof item.product.weight === 'number') {
                    weight = parseFloat(item.product.weight) || 0.5;
                }
            }
            
            totalWeight += weight * item.quantity;
            totalAmount += finalPrice * item.quantity;
            hasValidItems = true;
            
            orderItems.push({
                name: item.product.name || 'Product',
                sku: item.product.sku || item.product.slug || item.product._id.toString(),
                units: parseInt(item.quantity) || 1,
                selling_price: finalPrice,
                discount: 0,
                tax: "",
                hsn: parseInt(item.product.hsn) || 0
            });
        });

        if (!hasValidItems || totalAmount <= 0) {
            console.log('No valid items found');
            return res.status(200).json({
                data: response,
                message: "Order Placed Successfully (invalid items for shipping)",
                note: "No valid items found - ShipRocket integration skipped"
            });
        }

        console.log('Calculated totals:', { totalAmount, totalWeight, itemCount: orderItems.length });

        // Prepare variables for final response
        let finalOrderData = response;
        let orderMessage = "Order Placed Successfully";
        let shipmentDetails = null;

        // Try ShipRocket integration
        try {
            const serviceStatus = shipRocketService.getServiceStatus();
            if (serviceStatus.isBlocked) {
                console.log('ShipRocket service is temporarily blocked');
            } else {
                console.log('Attempting ShipRocket integration...');
                await shipRocketService.authenticate();

                // Try multiple pickup location options
                const pickupOptions = [
                    "Primary", 
                    "primary", 
                    "PRIMARY",
                    "Default",
                    "default", 
                    "Main",
                    "Warehouse"
                ];

                let shipmentResponse = null;
                let shipRocketOrderData = null;

                for (const pickupLocation of pickupOptions) {
                    try {
                        // BUILD SHIPROCKET ORDER DATA USING FORM SHIPPING ADDRESS
                        shipRocketOrderData = {
                            order_id: response._id.toString(),
                            order_date: new Date().toISOString().split('T')[0],
                            pickup_location: pickupLocation,
                            
                            // USE SHIPPING ADDRESS FROM FORM
                            billing_customer_name: shippingAddress.firstName,
                            billing_last_name: shippingAddress.lastName,
                            billing_address: shippingAddress.address,
                            billing_address_2: shippingAddress.deliveryInstructions || "",
                            billing_city: shippingAddress.city,
                            billing_pincode: pincode,
                            billing_state: shippingAddress.state,
                            billing_country: "India",
                            billing_email: shippingAddress.email,
                            billing_phone: cleanPhone,
                            
                            // Shipping address - same as billing
                            shipping_is_billing: true,
                            
                            order_items: orderItems,
                            payment_method: 'COD',
                            shipping_charges: 0,
                            giftwrap_charges: 0,
                            transaction_charges: 0,
                            total_discount: 0,
                            sub_total: Math.round(totalAmount),
                            length: 10,
                            breadth: 10,
                            height: 10,
                            weight: Math.max(parseFloat(totalWeight.toFixed(2)), 0.1)
                        };

                        console.log(`Trying pickup location: ${pickupLocation}`);
                        
                        shipmentResponse = await shipRocketService.createShipment(shipRocketOrderData);
                        
                        if (shipmentResponse && shipmentResponse.status_code === 1) {
                            console.log(`Success with pickup location: ${pickupLocation}`);
                            break;
                        }
                    } catch (pickupError) {
                        console.log(`Pickup location ${pickupLocation} failed:`, pickupError.response?.data?.message || pickupError.message);
                        continue;
                    }
                }

                // If all pickup locations failed, try without pickup location
                if (!shipmentResponse || shipmentResponse.status_code !== 1) {
                    try {
                        console.log('Trying without pickup_location field...');
                        const { pickup_location, ...orderDataWithoutPickup } = shipRocketOrderData;
                        shipmentResponse = await shipRocketService.createShipment(orderDataWithoutPickup);
                    } catch (nopickupError) {
                        console.log('Failed without pickup_location:', nopickupError.response?.data?.message || nopickupError.message);
                    }
                }
                
                if (shipmentResponse && shipmentResponse.status_code === 1) {
                    // Update order with shipment details
                    const updateData = {
                        'shipment.shiprocket_order_id': shipmentResponse.order_id,
                        'shipment.shipment_id': shipmentResponse.shipment_id
                    };

                    if (shipmentResponse.awb_code) {
                        updateData['shipment.awb_code'] = shipmentResponse.awb_code;
                    }

                    const updatedOrder = await orderSchema.findByIdAndUpdate(
                        response._id, 
                        updateData,
                        { new: true }
                    );
                    
                    console.log('ShipRocket order created successfully!');
                    
                    finalOrderData = updatedOrder;
                    orderMessage = "Order Placed Successfully with ShipRocket";
                    shipmentDetails = {
                        shiprocket_order_id: shipmentResponse.order_id,
                        shipment_id: shipmentResponse.shipment_id,
                        awb_code: shipmentResponse.awb_code || null
                    };
                }
            }
        } catch (shipmentError) {
            console.error('ShipRocket integration failed:', shipmentError.message);
        }

        // ===== SEND ORDER CONFIRMATION EMAIL =====
        try {
            const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName} ji`;
            
            // Build order items HTML
            let itemsHTML = '';
            orderItems.forEach(item => {
                itemsHTML += `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.units}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.selling_price.toFixed(2)}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.selling_price * item.units).toFixed(2)}</td>
                    </tr>
                `;
            });

            const emailHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🙏 Namaste ${customerName}</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #555;">Thank you for placing your order with us. We are honored to serve you.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Details</h2>
                            <p><strong>Order ID:</strong> ${response._id}</p>
                            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
                            ${shipmentDetails ? `<p><strong>Tracking ID:</strong> ${shipmentDetails.awb_code || 'Will be updated soon'}</p>` : ''}
                        </div>

                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Items</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f5f5f5;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Item</th>
                                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #667eea;">Qty</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #667eea;">Price</th>
                                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #667eea;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total:</td>
                                        <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px; color: #667eea;">₹${totalAmount.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Delivery Address</h2>
                            <p style="margin: 5px 0;"><strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong></p>
                            <p style="margin: 5px 0;">${shippingAddress.address}</p>
                            <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} - ${pincode}</p>
                            <p style="margin: 5px 0;">Phone: ${shippingAddress.phone}</p>
                            ${shippingAddress.deliveryInstructions ? `<p style="margin: 5px 0;"><em>Note: ${shippingAddress.deliveryInstructions}</em></p>` : ''}
                        </div>

                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404;"><strong>📦 Next Steps:</strong> Your order is being processed and will be shipped shortly. You will receive tracking details via email once dispatched.</p>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="color: #777; font-size: 14px;">If you have any questions, please don't hesitate to contact us.</p>
                            <p style="color: #777; font-size: 14px; margin: 10px 0;">🙏 Thank you for choosing us!</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await sendingMail(
                shippingAddress.email,
                `Order Confirmation - ${response._id}`,
                emailHTML
            );
            
            console.log('Order confirmation email sent successfully to:', shippingAddress.email);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError.message);
            // Don't fail the order if email fails
        }

        // Return final response
        return res.status(200).json({
            data: finalOrderData,
            message: orderMessage,
            ...(shipmentDetails && { shipment_details: shipmentDetails })
        });

    } catch (error) {
        console.error('Order creation error:', error.message);
        
        return res.status(500).json({
            message: "Order creation failed",
            error: error.message
        });
    }
};

const getAllOrder = async (req, res) => {
    try {
        const order = await orderSchema.find().populate({
            path: "cart",
            populate: [
                { path: "user" },
                { 
                    path: "items.product",
                    select: "name price images description slug category stock discountedPrice"
                }
            ]
        });

        res.status(200).json({
            data: order,
            message: "Successfully got all the orders"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
}

const getSingleOrder = async (req, res) => {
    const id = req.params.id;   

    try {
        // Fetch order and populate the necessary fields
        const order = await orderSchema.findById(id).populate({
            path: "cart",
            populate: [
                { path: "user" },
                { path: "items.product" }
            ]
        });

        if (order) {
            return res.status(200).json({
                data: order,
                message: "Single Order Retrieved Successfully",
            });
        } else {
            return res.status(404).json({
                message: "Order Not Found",
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
};

const deleteOrder = async (req, res) => {
    const id = req.params.id;
    
    try {
        const deleteOrder = await orderSchema.findByIdAndDelete(id);
        console.log(deleteOrder);
        
        if (deleteOrder) {
            // Optional: Update cart status back to "In Cart" when order is deleted
            await cartSchema.findByIdAndUpdate(deleteOrder.cart, { status: "In Cart" });
            
            res.status(200).json({
                data: deleteOrder,
                message: 'Order deleted Successfully'
            });
        } else {
            res.status(404).json({
                message: 'No such Order found'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
}// const updateOrderComplete = async (req, res) => {
//     const id = req.params.id


//     try {
//         const order = await orderschema.findById(id).populate("user_id")
//         const email = order?.user?.email
//         console.log("email", email);
//         const orderstatus = {
//             status: req.body.status,
//             halfamount: req.body.halfamount,
//             remainingamount: req.body.remainingamount
//         }

//         const response = await orderschema.findByIdAndUpdate(id, orderstatus)
//         await mail.sendingMail(email, "AdVUE Order Success", emailBody)
//         if (response) {
//             res.status(201).json({
//                 data: response,
//                 message: 'Order updated Successfully'
//             })
//         }
//         else {
//             res.status(404).json({
//                 message: 'No such Order found'
//             })
//         }
//     }
//     catch (error) {
//         console.log(error);

//     }



// }
// const updateOrderCancel = async (req, res) => {
//     const id = req.params.id
//     const emailBody = `
//   <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
//     <h3 style="color: #333;">We are sorry to say you that your order is being cancelled due to unpaid payment !</h3><br/>
//     <h3 style="color: #333;">If you want to continue then pay the remaining payment. The number of days will not be added to your advertisement.</h3><br/>
//     <h3 style="color: #333;">You can pay the remaining amount that we provided bank details on your previous email.</h3><br/>
//     <h3 style="color: #333;">Here is the upi details also : <b><ul>pmakwana1908@ohkhdhc</ul></b></h3><br/>





//     <p style="margin-top: 20px; color: #555;">If you have any questions, feel free to contact us.</p> <br />

//     <p style="margin-top: 20px; color: #555;">AdVUE Office : 8140952934 </p> <br />

//   </div>
// `;

//     try {
//         const order = await orderschema.findById(id).populate("user_id")
//         const email = order?.user_id?.email
//         console.log("email", email);
//         const orderstatus = {
//             status: req.body.status,
//             halfamount: req.body.halfamount,
//             remainingamount: req.body.remainingamount
//         }

//         const response = await orderschema.findByIdAndUpdate(id, orderstatus)
//         await mail.sendingMail(email, "AdVUE Order Cancelled", emailBody)
//         if (response) {
//             res.status(201).json({
//                 data: response,
//                 message: 'Order updated Successfully'
//             })
//         }
//         else {
//             res.status(404).json({
//                 message: 'No such Order found'
//             })
//         }
//     }
//     catch (error) {
//         console.log(error);

//     }

// }
const getUserOrders = async (req, res) => {
    const userId = req.params.userId;
    console.log('Requested userId:', userId);
    
    try {
        // First, get all orders without population
        const allOrders = await orderSchema.find();
        console.log('Total orders in database:', allOrders.length);
        
        // Now populate them
        const populatedOrders = await orderSchema.find()
            .populate({
                path: "cart",
                populate: [
                    { path: "user" },
                    { 
                        path: "items.product",
                        select: "name price images description shortDescription discountedPrice"
                    }
                ]
            });

        console.log('Populated orders:', populatedOrders.length);
        
        // Check the structure
        if (populatedOrders.length > 0) {
            console.log('Sample order structure:', JSON.stringify(populatedOrders[0], null, 2));
        }

        // Filter for user
        const filteredOrders = populatedOrders.filter(order => {
            const orderUserId = order?.cart?.user?._id?.toString();
            console.log('Order user ID:', orderUserId, 'Requested user ID:', userId);
            return orderUserId === userId;
        });

        console.log('Filtered orders for user:', filteredOrders.length);

        res.status(200).json({
            data: filteredOrders,
            message: "User orders retrieved successfully"
        });
    } catch (err) {
        console.error('Error in getUserOrders:', err);
        res.status(500).json({
            message: "Server Error",
            error: err.message,
        });
    }
};
// ADD THESE NEW FUNCTIONS TO YOUR CONTROLLER:


const assignCourier = async (req, res) => {
    const { orderId, courier_company_id } = req.body;
    
    try {
        const order = await orderSchema.findById(orderId);
        if (!order || !order.shipment.shipment_id) {
            return res.status(404).json({ message: 'Order or shipment not found' });
        }

        // Assign courier via ShipRocket API
        const assignResponse = await shipRocketService.assignCourier({
            shipment_id: order.shipment.shipment_id,
            courier_company_id: courier_company_id
        });

        if (assignResponse.status_code === 1) {
            // Update order with AWB and courier details
            await orderSchema.findByIdAndUpdate(orderId, {
                'shipment.awb_code': assignResponse.awb_code,
                'shipment.courier_company_id': courier_company_id,
                'shipment.courier_name': assignResponse.courier_name,
                'status': 'Shipped'
            });
        }

        res.status(200).json({
            data: assignResponse,
            message: 'Courier assigned successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning courier', error: error.message });
    }
};

const trackOrder = async (req, res) => {
    const { orderId } = req.params;
    
    try {
        const order = await orderSchema.findById(orderId);
        if (!order || !order.shipment.shipment_id) {
            return res.status(404).json({ message: 'Order or shipment not found' });
        }

        const trackingData = await shipRocketService.trackShipment(order.shipment.shipment_id);
        
        res.status(200).json({
            data: trackingData,
            message: 'Tracking information retrieved'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error tracking order', error: error.message });
    }
};

// ADD THIS WEBHOOK HANDLER FUNCTION
const handleShiprocketWebhook = async (req, res) => {
    try {
        console.log('=== SHIPROCKET WEBHOOK RECEIVED ===');
        console.log('Webhook payload:', JSON.stringify(req.body, null, 2));

        const { 
            order_id, 
            shipment_status, 
            awb, 
            courier_name,
            current_status,
            shipment_id 
        } = req.body;

        // Find order by shiprocket order_id
        const order = await orderSchema.findOne({ 
            'shipment.shiprocket_order_id': order_id 
        });

        if (!order) {
            console.log(`Order not found for shiprocket_order_id: ${order_id}`);
            return res.status(404).json({ 
                message: 'Order not found',
                success: false 
            });
        }

        console.log(`Processing webhook for Order ID: ${order._id}`);

        // Update order based on shipment status
        const updateData = {};
        
        // Normalize the status (ShipRocket sends various status formats)
        const normalizedStatus = (shipment_status || current_status || '').toUpperCase();
        
        console.log('Normalized status:', normalizedStatus);

        // Map ShipRocket status to your order status
        if (normalizedStatus === 'DELIVERED') {
            updateData.status = 'completed';
            console.log('✅ Setting order status to COMPLETED');
        } else if (normalizedStatus === 'SHIPPED' || normalizedStatus === 'IN TRANSIT') {
            updateData.status = 'processing';
            console.log('📦 Setting order status to PROCESSING');
        } else if (normalizedStatus === 'OUT FOR DELIVERY') {
            updateData.status = 'processing';
            console.log('🚚 Setting order status to PROCESSING (Out for delivery)');
        } else if (normalizedStatus === 'RTO' || normalizedStatus === 'CANCELLED') {
            updateData.status = 'cancelled';
            console.log('❌ Setting order status to CANCELLED');
        }

        // Update AWB if provided
        if (awb && !order.shipment.awb_code) {
            updateData['shipment.awb_code'] = awb;
            console.log('Updated AWB code:', awb);
        }

        // Update courier name if provided
        if (courier_name) {
            updateData['shipment.courier_name'] = courier_name;
        }

        // Perform the update
        const updatedOrder = await orderSchema.findByIdAndUpdate(
            order._id,
            updateData,
            { new: true }
        ).populate({
            path: "cart",
            populate: [
                { path: "user" },
                { path: "items.product" }
            ]
        });

        console.log('✅ Order updated successfully');

        // Send delivery confirmation email if order is delivered
        if (normalizedStatus === 'DELIVERED') {
            try {
                const user = updatedOrder.cart?.user;
                const shippingAddress = updatedOrder.shippingAddress;
                
                if (user?.email || shippingAddress?.email) {
                    const customerEmail = shippingAddress?.email || user?.email;
                    const customerName = shippingAddress?.firstName 
                        ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
                        : user?.name || 'Customer';

                    const emailHTML = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                        </head>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                <h1 style="color: white; margin: 0;">🎉 Order Delivered!</h1>
                            </div>
                            
                            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                                <p style="font-size: 16px;">Dear ${customerName},</p>
                                <p style="font-size: 16px;">Great news! Your order has been successfully delivered.</p>
                                
                                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h2 style="color: #10b981; margin-top: 0;">Order Details</h2>
                                    <p><strong>Order ID:</strong> ${order._id}</p>
                                    <p><strong>Tracking Number:</strong> ${awb || order.shipment?.awb_code || 'N/A'}</p>
                                    <p><strong>Courier:</strong> ${courier_name || 'N/A'}</p>
                                    <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                                </div>

                                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #065f46;"><strong>💚 Thank you for shopping with us!</strong></p>
                                    <p style="margin: 10px 0 0 0; color: #065f46;">We hope you love your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
                                </div>

                                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                                    <p style="color: #777; font-size: 14px;">🙏 Thank you for choosing us!</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `;

                    await sendingMail(
                        customerEmail,
                        `Order Delivered - ${order._id}`,
                        emailHTML
                    );
                    
                    console.log('✅ Delivery confirmation email sent to:', customerEmail);
                }
            } catch (emailError) {
                console.error('Failed to send delivery email:', emailError.message);
                // Don't fail the webhook if email fails
            }
        }

        res.status(200).json({ 
            success: true,
            message: 'Webhook processed successfully',
            order_id: order._id,
            new_status: updateData.status
        });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Webhook processing failed',
            error: error.message 
        });
    }
};

// Update your module.exports
module.exports = {
    createOrder,
    getAllOrder,
    getSingleOrder,
    deleteOrder,
    getUserOrders,
    assignCourier,    // ADD THIS
    trackOrder,        // ADD THIS
    handleShiprocketWebhook // ADD THIS
};