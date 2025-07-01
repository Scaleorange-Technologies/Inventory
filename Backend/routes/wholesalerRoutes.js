const express = require('express');
const router = express.Router();
const { registerWholesaler,login,createCustomer,fetchRetailers ,getProducts,addProduct,updateProduct,deleteProduct,getAnalytics,getAllOrders,getOrderDetails,updateOrderStatus,deleteOrder} = require('../controller/wholesalerController');
const authenticate=require('../middlewares/middleware')
router.post('/register-wholesaler', registerWholesaler);
router.post('/login', login);
router.post("/customers", createCustomer);
router.get('/retailers', authenticate, fetchRetailers);


//products


router.get('/wholesaler/getproduct',authenticate,getProducts);
router.post('/wholesaler/addproduct',authenticate, addProduct);
router.put('/wholesaler/:productId', authenticate,updateProduct);
router.delete('/wholesaler/:productId',authenticate,deleteProduct);


router.get("/analytics", authenticate,getAnalytics);


router.get('/orders', authenticate,getAllOrders);

// GET /api/orders/:orderId/details - Get specific order details
router.get('/:orderId/details',authenticate, getOrderDetails);

// PUT /api/orders/:orderId/status - Update order status
router.put('/:orderId/status', authenticate,updateOrderStatus);

// DELETE /api/orders/:orderId - Delete/Cancel order
router.delete('/:orderId', deleteOrder);
module.exports = router;
