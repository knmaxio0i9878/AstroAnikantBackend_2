const orderController = require("../controller/OrderController")
const router = require("express").Router()

router.post("/createorder",orderController.createOrder)
router.get("/getallorder",orderController.getAllOrder)
router.get("/getsingleorder/:id",orderController.getSingleOrder)
router.get("/deleteorder/:id",orderController.deleteOrder)
router.get('/user/:userId', orderController.getUserOrders);
router.post('/assign-courier', orderController.assignCourier);
router.get('/track/:orderId', orderController.trackOrder);
// Add this to your order routes for testing
router.get('/shiprocket-status', (req, res) => {
    const shipRocketService = require('../service/ShipRocket');
    const status = shipRocketService.getServiceStatus();
    
    const now = new Date();
    let message = 'Service available';
    
    if (status.isBlocked && status.blockExpiry) {
        const remainingMs = status.blockExpiry.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
        
        if (remainingMs > 0) {
            message = `Blocked for ${remainingMinutes} more minutes`;
        } else {
            message = 'Block period expired, ready to try';
        }
    }
    
    res.json({
        isBlocked: status.isBlocked,
        blockExpiry: status.blockExpiry,
        currentTime: now,
        message: message,
        hasValidToken: status.hasValidToken
    });
});

router.post('/reset-shiprocket-block', (req, res) => {
    const shipRocketService = require('../service/ShipRocket');
    shipRocketService.resetBlockStatus();
    
    res.json({
        message: 'ShipRocket block status reset successfully',
        status: shipRocketService.getServiceStatus()
    });
});

router.post('/shiprocket-webhook', orderController.handleShiprocketWebhook);




module.exports = router