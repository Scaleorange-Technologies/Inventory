

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  client=require("../config/dbConfig")
const redis = require('../config/redisClient');
  const {getUserByEmail, updateUserAccessToken,getRetailerByUserId,getProductsByWholesaler,getWholesalersForRetailer,getProductStockModel,getMultipleProductsStockModel} = require("../model/retailermodel");
// const retailerlogin = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//       const user = await getUserByEmail(email);
//       console.log("user", user);
//       if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
  
//       let token = user.access_token;
  
//       // If token doesn't exist, generate and save it
//       if (!token) {
//         token = jwt.sign(
//           { user_id: user.user_id, role: user.role },
//           process.env.JWT_SECRET,
//           { expiresIn: '365d' }
//         );
  
//         await updateUserAccessToken(user.user_id, token);
//       }
  
//       res.json({
//         access_token: token,
//         user: {
//           user_id: user.user_id,
//           username: user.username,
//           email: user.email,
//           role: user.role,
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Server error' });
//     }
//   };
  



const retailerlogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await getUserByEmail(email);
      console.log("user", user);
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      // Check if the user role is 'customer'
      if (user.role !== 'customer') {
        return res.status(403).json({ error: 'Access denied. Only customers can log in.' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      let token = user.access_token;
  
      // If token doesn't exist, generate and save it
      if (!token) {
        token = jwt.sign(
          { user_id: user.user_id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '365d' }
        );
  
        await updateUserAccessToken(user.user_id, token);
      }
  
      res.json({
        access_token: token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };






async function getMyWholesalers(req, res) {
    try {
        // Extract token from headers
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Decode token to get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;
        console.log("Decoded user ID:", userId);

        // Get all retailers linked to this user
        const retailers = await getRetailerByUserId(userId);
        if (!retailers || retailers.length === 0) {
            return res.status(404).json({ error: 'Retailer not found' });
        }

        const wholesalerSet = new Map(); // To collect unique wholesalers

        // Loop through all retailers and get associated wholesalers
        for (const r of retailers) {
            const wholesalers = await getWholesalersForRetailer(r.retailer_id);
            wholesalers.forEach(w => {
                if (!wholesalerSet.has(w.wholesaler_id)) {
                    wholesalerSet.set(w.wholesaler_id, w);
                }
            });
        }

        // Format response
        const formattedWholesalers = [...wholesalerSet.values()].map(w => ({
            id: w.wholesaler_id,
            name: w.business_name,
            location: w.location,
            contact: w.phone || 'N/A',
            category: w.supply_category,
            verified: true // You can add actual logic for verification if needed
        }));

        res.json({
            success: true,
            wholesalers: formattedWholesalers
        });

    } catch (error) {
        console.error('Error fetching wholesalers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



async function getWholesalerProducts(req, res) {
        try {
            console.log("Fetching products for wholesaler:", req.params);
            const { wholesalerId } = req.params;
            
            // Verify retailer has access to this wholesaler
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.user_id;
            // console.log("Decoded user ID:", userId);
             console.log("Wholesaler ID:", wholesalerId);
            const retailer = await getRetailerByUserId(userId);
            if (!retailer) {
                return res.status(404).json({ error: 'Retailer not found' });
            }

            // Get products
            const products = await getProductsByWholesaler(wholesalerId);
            
       


            const formattedProducts = products.map(p => ({
                id: p.product_id,
                name: p.name,               // was just `name` — error here
                // unit: p.unit || '',         // remove if no unit column
                price: p.price,
                stock: p.stock,
                // category: p.category,
                // discount: p.discount || 0,
                wholesalerId: parseInt(wholesalerId),
                image: getProductEmoji(p.category, p.name)
            }));
            
            res.json({
                success: true,
                products: formattedProducts
            });

        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

// Helper function to get emoji for products
function getProductEmoji(category, productName) {
    const name = productName.toLowerCase();
    if (name.includes('tomato')) return '🍅';
    if (name.includes('onion')) return '🧅';
    if (name.includes('rice')) return '🍚';
    if (name.includes('wheat') || name.includes('flour')) return '🌾';
    if (name.includes('oil')) return '🛢️';
    if (name.includes('coconut')) return '🥥';
    
    // Default by category
    switch (category?.toLowerCase()) {
        case 'vegetables': return '🥬';
        case 'grains': return '🌾';
        case 'oils': return '🛢️';
        default: return '📦';
    }
}
 
  



const getCart = async (req, res) => {
console.log("hiii")
  try {
      const userId = req.user.user_id;
      const cartKey = `cart:${userId}`;
      
      const cartData = await redis.get(cartKey);
      
      if (!cartData) {
          return res.json({ 
              success: true, 
              cart: [],
              message: 'Cart is empty'
          });
      }

      const cart = JSON.parse(cartData);
      res.json({ 
          success: true, 
          cart: cart,
          totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
      });

  } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Error fetching cart' 
      });
  }
};



const addToCart = async (req, res) => {
  try {
    console.log('Adding item to cart for user:', req.user.user_id);
    const userId = req.user.user_id;

    const { product, quantity  } = req.body;
    console.log("req.body", req.body);

    const cartKey = `cart:${userId}`;

    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: 'Product data is required' });
    }

    let cart = [];
    const existingCartData = await redis.get(cartKey); // changed from hgetall to get
    if (existingCartData) {
      cart = JSON.parse(existingCartData);
    }

    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    console.log("product",product)
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {


      cart.push({
        ...product,
        quantity,
        wholesaler_id: product.wholesaler_id, // ✅ Add this line
        addedAt: new Date().toISOString()
      });
      
    
    }

    await redis.set(cartKey, JSON.stringify(cart));

    res.json({
      success: true,
      message: 'Item added to cart',
      cart,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Error adding item to cart' });
  }
};





const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { productId, quantity } = req.body;
    console.log("Update cart item for user:", userId, "Product ID:", productId, "Quantity:", quantity);
    const cartKey = `cart:${userId}`;

    if (!productId || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or quantity'
      });
    }

    // Get existing cart or initialize empty
    const existingCartData = await redis.get(cartKey);
    let cart = [];
    if (existingCartData) {
      cart = JSON.parse(existingCartData);
    }

    if (quantity === 0) {
      // Remove item from cart
      cart = cart.filter(item => item.id !== productId);
    } else {
      // Find item index in cart
      const itemIndex = cart.findIndex(item => item.id === productId);
      if (itemIndex > -1) {
        // Update quantity
        cart[itemIndex].quantity = quantity;
      } else {
        // Add new item with quantity
        cart.push({ id: productId, quantity });
      }
    }

    // Save updated cart back to Redis
    await redis.set(cartKey, JSON.stringify(cart));

    return res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: cart,
      totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart'
    });
  }
};





const removeFromCart = async (req, res) => {
  try {
      const userId = req.user.user_id;
      const { productId } = req.params;
      const cartKey = `cart:${userId}`;

      // Get existing cart
      const existingCartData = await redis.get(cartKey);
      
      if (!existingCartData) {
          return res.status(500).json({ 
              success: false, 
              message: 'Cart not found' 
          });
      }

      let cart = JSON.parse(existingCartData);
       console.log("yyyy",cart)
      // Remove item
      // cart = cart.filter(item => item.id !== productId);
      cart = cart.filter(item => {
        console.log('Checking item:', item);
        console.log('Comparing item.id:', item.id, 'with productId:', productId);
        const keep = item.id !== Number(productId);
        console.log('Keep this item?', keep);
        return keep;
      });
      
      // Save updated cart back to Redis
      await redis.set(cartKey, JSON.stringify(cart));

      res.json({ 
          success: true, 
          message: 'Item removed from cart',
          cart: cart,
          totalItems: cart.reduce((sum, item) => sum + item.quantity, 0)
      });

  } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Error removing item from cart' 
      });
  }
};



const clearCart = async (req, res) => {
  try {
      const userId = req.user.id;
      const cartKey = `cart:${userId}`;

      await redis.del(cartKey);

      res.json({ 
          success: true, 
          message: 'Cart cleared',
          cart: [],
          totalItems: 0
      });

  } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Error clearing cart' 
      });
  }
};

// Get cart total amount
const getCartTotal = async (req, res) => {
  try {
      const userId = req.user.id;
      const cartKey = `cart:${userId}`;
      
      const cartData = await redis.get(cartKey);
      
      if (!cartData) {
          return res.json({ 
              success: true, 
              total: 0,
              totalItems: 0
          });
      }

      const cart = JSON.parse(cartData);
      const total = cart.reduce((sum, item) => {
          const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
          return sum + (discountedPrice * item.quantity);
      }, 0);

      res.json({ 
          success: true, 
          total: Math.round(total),
          totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
          cart: cart
      });

  } catch (error) {
      console.error('Get cart total error:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Error calculating cart total' 
      });
  }
};


const placeOrder = async (req, res) => {
  
  try {
    const userId = req.user.user_id;
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }


    // Group items by wholesaler
    const itemsByWholesaler = {};
    for (const item of cart) {
      if (!item.wholesalerId) {
        return res.status(400).json({ success: false, message: 'Missing wholesaler_id in product' });
      }
      if (!itemsByWholesaler[item.wholesalerId]) {
        itemsByWholesaler[item.wholesalerId] = [];
      }
      itemsByWholesaler[item.wholesalerId].push(item);
    }

    const createdOrders = [];

    for (const [wholesalerId, items] of Object.entries(itemsByWholesaler)) {
      // Get retailer_id
      const retailerResult = await client.query(
        'SELECT retailer_id FROM retailers WHERE user_id = $1',
        [userId]
      );
      if (retailerResult.rows.length === 0) {
        throw new Error('Retailer not found');
      }
      const retailerId = retailerResult.rows[0].retailer_id;

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (retailer_id, wholesaler_id, status)
         VALUES ($1, $2, $3)
         RETURNING order_id`,
        [retailerId, wholesalerId, 'Accepted']
      );
      const orderId = orderResult.rows[0].order_id;

      let totalAmount = 0;

      for (const item of items) {
        const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
        totalAmount += discountedPrice * item.quantity;

        // Insert order details
        await client.query(
          `INSERT INTO order_details (order_id, product_id, price, quantity, user_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.id, item.price, item.quantity, userId]
        );

        // Reduce inventory quantity
        const updateResult = await client.query(
          `UPDATE wholesaler_inventory
           SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
           WHERE product_id = $2 AND wholesaler_id = $3 AND quantity >= $1`,
          [item.quantity, item.id, wholesalerId]
        );

        if (updateResult.rowCount === 0) {
          return res.status(400).json({
            success: false,
            message: `Not enough inventory for product ID ${item.id} from wholesaler ${wholesalerId}`,
          });
        }
      }

      // Insert payment
      await client.query(
        `INSERT INTO payments (wholesaler_id, start_date, end_date, price, payment_status, payment_method)
         VALUES ($1, CURRENT_DATE, CURRENT_DATE, $2, $3, $4)`,
        [wholesalerId, totalAmount, 'success', 'pending']
      );

      createdOrders.push({ wholesalerId, orderId, totalAmount });
    }

 
    // Clear cart after placing order
    const cartKey = `cart:${userId}`;
    await redis.del(cartKey);

    res.status(200).json({
      success: true,
      message: 'Orders placed successfully',
      orders: createdOrders,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

const getRetailerOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const retailerQuery = 'SELECT retailer_id FROM retailers WHERE user_id = $1';
    const retailerResult = await client.query(retailerQuery, [userId]);
    
    if (retailerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Retailer not found'
      });
    }
    
    const retailerId = retailerResult.rows[0].retailer_id;

    const ordersQuery = `
      SELECT 
        o.order_id,
        o.order_date,
        o.status,
        wb.business_name as wholesaler_name,
        SUM(od.price * od.quantity) as total_amount
      FROM orders o
      JOIN wholesaler_business wb ON o.wholesaler_id = wb.wholesaler_id
      JOIN order_details od ON o.order_id = od.order_id
      WHERE o.retailer_id = $1
      GROUP BY o.order_id, o.order_date, o.status, wb.business_name
      ORDER BY o.order_date DESC
    `;

    const result = await client.query(ordersQuery, [retailerId]);

    res.json({
      success: true,
      orders: result.rows
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};




const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.user_id;
   console.log("orderId",orderId);
   console.log("userId",userId);
    // Get retailer_id from retailers table using user_id
    const retailerQuery = 'SELECT retailer_id FROM retailers WHERE user_id = $1';
    const retailerResult = await client.query(retailerQuery, [userId]);
    
    if (retailerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Retailer not found'
      });
    }
    
    const retailerId = retailerResult.rows[0].retailer_id;

    // Verify order belongs to this retailer
    const orderVerifyQuery = 'SELECT order_id FROM orders WHERE order_id = $1 AND retailer_id = $2';
    const orderVerifyResult = await client.query(orderVerifyQuery, [orderId, retailerId]);
    
    if (orderVerifyResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Get order details with product information
    const orderDetailsQuery = `
      SELECT 
        od.order_detail_id,
        od.quantity,
        od.price,
        p.name as product_name
      FROM order_details od
      JOIN products p ON od.product_id = p.product_id
      WHERE od.order_id = $1
    `;

    const result = await client.query(orderDetailsQuery, [orderId]);

    res.json({
      success: true,
      orderDetails: result.rows
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
};



const getCurrentStock = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const stock = await getProductStockModel(productId);
    
    if (stock === null) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      stock: stock,
      productId: parseInt(productId)
    });

  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get stock for multiple products (for cart validation)
const getMultipleProductsStock = async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    const stockData = await getMultipleProductsStockModel(productIds);
    
    res.json({
      success: true,
      stockData: stockData
    });

  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

  module.exports={
    retailerlogin,
    getMyWholesalers,
    getWholesalerProducts,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    getRetailerOrders,
    getOrderDetails,
    getCurrentStock,
    getMultipleProductsStock
  }