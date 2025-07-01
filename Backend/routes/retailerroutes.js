const express = require('express');
const router = express.Router();
const { retailerlogin ,getMyWholesalers,getWholesalerProducts} = require('../controller/retailerController');
const {getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartTotal,placeOrder,getOrderDetails,getRetailerOrders,getCurrentStock,getMultipleProductsStock} = require('../controller/retailerController');
const authenticate = require('../middlewares/middleware');

router.post('/retailerlogin', retailerlogin);
router.get('/my-wholesalers', authenticate, getMyWholesalers);

// Get products from specific wholesaler
router.get('/wholesaler/:wholesalerId/products',  getWholesalerProducts);



router.get('/getcart', authenticate,getCart);                    // GET /api/cart - Get user's cart
router.post('/addcart', authenticate,addToCart);              // POST /api/cart/add - Add item to cart
router.put('/updatecart', authenticate,updateCartItem);       // PUT /api/cart/update - Update item quantity
router.delete('/removecart/:productId',authenticate, removeFromCart); // DELETE /api/cart/remove/:productId - Remove item
router.delete('/clearcart', authenticate,clearCart);          // DELETE /api/cart/clear - Clear entire cart
router.get('/totalcart',authenticate, getCartTotal); 

router.post('/place-order', authenticate, placeOrder);

// Get Retailer Orders
router.get('/my-orders', authenticate, getRetailerOrders);

// Get Order Details
router.get('/order/:orderId/details', authenticate, getOrderDetails);

router.get('/stock/:productId', authenticate, getCurrentStock);

// Get stock for multiple products
router.post('/stock/multiple', authenticate,getMultipleProductsStock);

module.exports = router;
