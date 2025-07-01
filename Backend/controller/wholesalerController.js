const { createUser,createWholesalerBusiness, updateOrderStatusModel } = require('../model/wholesalerModel');
const bcrypt = require('bcrypt');
const { getUserByEmail,getRetailersByWholesalerId ,updateUserAccessToken,createCustomermodel,getProductsByWholesalermodel,addProductmodel,updateProductmodel,deleteProductmodel,getTotalProductsByWholesaler,getTotalRetailersByWholesaler,getRetailersByWholesaler,getProductsByWholesaler,getOrdersByWholesaler, getOrderDetailsById,getTotalOrdersByWholesaler} = require('../model/wholesalerModel');
const jwt = require('jsonwebtoken');
const  client=require("../config/dbConfig")

const registerWholesaler = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
    //   location,
    //   address,
      password,
      business_name,
      supply_category,
    //   territory,
      referral_code,
    } = req.body;

    // Simple validation
    if (!username || !email || !phone || !password || !business_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
  console.log("hii");
    // Create user record with role 'wholesaler'
    const user = await createUser({
      username,
      email,
      phone,
    //   location,
    //   address,
      password: hashedPassword,
      role: 'wholesaler',
      referral_code,
    });

    // Simulate payment step — here we just mock success
    const paymentSuccess = true; // Replace with actual payment integration later

    if (!paymentSuccess) {
      return res.status(402).json({ error: 'Payment failed' });
    }

    // Create wholesaler business linked to user
    const wholesalerBusiness = await createWholesalerBusiness({
      user_id: user.user_id,
      business_name,
      supply_category,
    //   location,
    //   address,
    //   territory,
    });

    // Return success, frontend can now redirect to login
    res.json({ message: 'Registration and payment successful. Please login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};




const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    console.log("user", user);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    if (user.role !== 'wholesaler') {
      return res.status(403).json({ error: 'Access denied. Only wholesalers can log in.' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

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





async function createCustomer  (req, res) {
  try {
    console.log("headeer",req.headers)
    const accessToken = req.headers.authorization?.split(" ")[1];
    console.log("Access Token:", accessToken);
    const { name, email, phone, password } = req.body;

    if (!accessToken) return res.status(401).json({ message: "Access token missing" });

    const result = await createCustomermodel(accessToken, { name, email, phone, password });
    res.status(201).json({ message: "Customer created", result });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





const fetchRetailers = async (req, res) => {
  console.log("Fetching retailers for wholesaler", req.user);
  try {
    const userId = req.user.user_id;

    // First get the wholesaler_id for the given user_id
    const wholesalerResult = await client.query(
      'SELECT wholesaler_id FROM wholesaler_business WHERE user_id = $1',
      [userId]
    );

    if (wholesalerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wholesaler not found for this user' });
    }

    const wholesalerId = wholesalerResult.rows[0].wholesaler_id;

    // Now fetch retailers using the actual wholesaler_id
    const retailers = await getRetailersByWholesalerId(wholesalerId);
    res.json(retailers);
  } catch (error) {
    console.error('Error fetching retailers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProducts = async (req, res) => {
  console.log("Fetching products for wholesaler",req);
  const userId = req.user.user_id;

  const wholesalerId = await getWholesalerIdByUserId(userId);
  if (!wholesalerId) {
    return res.status(404).json({ error: 'Wholesaler not found for this user' });
  }

  console.log("Found wholesaler ID:", wholesalerId);

  const products = await getProductsByWholesalermodel(wholesalerId);
  res.json(products);
};



const addProduct = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log("Adding product for user ID:", userId);

    const wholesalerId = await getWholesalerIdByUserId(userId);
    if (!wholesalerId) {
      return res.status(404).json({ error: 'Wholesaler not found for this user' });
    }

    console.log("Found wholesaler ID:", wholesalerId);

    await addProductmodel(req.body, wholesalerId);
    res.json({ message: 'Product added successfully' });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  console.log("Updating product with data:");
  console.log(req.body);
  console.log("Request params:", req.params);
  const { productId } = req.params;
  const userId = req.user.user_id;

  const wholesalerId = await getWholesalerIdByUserId(userId);
  if (!wholesalerId) {
    return res.status(404).json({ error: 'Wholesaler not found for this user' });
  }

  console.log("Found wholesaler ID:", wholesalerId);
  console.log("Updating product with ID:", productId, "for wholesaler ID:", wholesalerId);
  await updateProductmodel(productId, wholesalerId, req.body);
  res.json({ message: 'Product updated successfully' });
};

const deleteProduct = async (req, res) => {
  const userId = req.user.user_id;

  const wholesalerId = await getWholesalerIdByUserId(userId);
  if (!wholesalerId) {
    return res.status(404).json({ error: 'Wholesaler not found for this user' });
  }

  console.log("Found wholesaler ID:", wholesalerId);  const { productId } = req.params;
  await deleteProductmodel(productId, wholesalerId);
  res.json({ message: 'Product deleted successfully' });
};


async function getWholesalerIdByUserId(userId) {
  const query = `
    SELECT wholesaler_id
    FROM wholesaler_business
    WHERE user_id = $1
    LIMIT 1;
  `;
  const result = await client.query(query, [userId]);
  return result.rows.length > 0 ? result.rows[0].wholesaler_id : null;
}





async function getAnalytics(req, res) {
  try {
    const userId = req.user.user_id;
console.log("Fetching analytics for user ID:", userId);
    // Step 1: Fetch wholesaler_id using user_id
    const wholesalerId = await getWholesalerIdByUserId(userId);
    if (!wholesalerId) {
      return res.status(404).json({ message: "Wholesaler not found for user" });
    }

    // Step 2: Fetch analytics data
    const [totalRetailers, totalProducts, retailers, products,orders] = await Promise.all([
      getTotalRetailersByWholesaler(wholesalerId),
      getTotalProductsByWholesaler(wholesalerId),
      getRetailersByWholesaler(wholesalerId),
      getProductsByWholesaler(wholesalerId),
      getTotalOrdersByWholesaler(wholesalerId),

    ]);
  console.log("order count",orders);
    // Step 3: Return analytics JSON
    res.json({
      totalRetailers,
      totalProducts,
      retailers,
      products,
      orders,
    });
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    res.status(500).json({ message: "Server error" });
  }
}
async function getAllOrders(req, res) {
  console.log("Fetching all orders for wholesaler", req.user);
  try {
      const userId = req.user.user_id;
      const wholesalerId = await getWholesalerIdByUserId(userId);
      console.log("Wholesaler ID:", wholesalerId);
      if (!wholesalerId) {
        return res.status(404).json({ message: "Wholesaler not found for user" });
      }
      const orders = await getOrdersByWholesaler(wholesalerId);
      
      res.status(200).json({
          success: true,
          orders: orders
      });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch orders',
          error: error.message
      });
  }
}

// Get order details by order ID
async function getOrderDetails(req, res) {
  try {
      const { orderId } = req.params;
      console.log("Fetching order details for order ID:", orderId);
      const userId = req.user.user_id;

          const wholesalerId = await getWholesalerIdByUserId(userId);
      console.log("Wholesaler ID:", wholesalerId);
      if (!wholesalerId) {
        return res.status(404).json({ message: "Wholesaler not found for user" });
      }
      const orderDetails = await getOrderDetailsById(orderId, wholesalerId);
      
      if (!orderDetails) {
          return res.status(404).json({
              success: false,
              message: 'Order not found'
          });
      }
      
      res.status(200).json({
          success: true,
          orderDetails: orderDetails
      });
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch order details',
          error: error.message
      });
  }
}

// Update order status
async function updateOrderStatus(req, res) {
  try {
      const { orderId } = req.params;
      console.log("Updating order status for order ID:", orderId);
      const { status } = req.body;
      console.log("New status:", status);
      const userId = req.user.user_id;
      const wholesalerId = await getWholesalerIdByUserId(userId);
      console.log("Wholesaler ID:", wholesalerId);
      if (!wholesalerId) {
        return res.status(404).json({ message: "Wholesaler not found for user" });
      }
      
      const validStatuses = ['pending', 'Accepted','confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({
              success: false,
              message: 'Invalid status value'
          });
      }
      
      const updated = await updateOrderStatusModel(orderId, status, wholesalerId);
      
      if (!updated) {
          return res.status(404).json({
              success: false,
              message: 'Order not found or not authorized'
          });
      }
      
      res.status(200).json({
          success: true,
          message: 'Order status updated successfully'
      });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to update order status',
          error: error.message
      });
  }
}

// Delete/Cancel order
async function deleteOrder(req, res) {
  try {
      const { orderId } = req.params;
      const wholesalerId = req.user.wholesaler_id;
      
      const deleted = await ordersModel.deleteOrder(orderId, wholesalerId);
      
      if (!deleted) {
          return res.status(404).json({
              success: false,
              message: 'Order not found or not authorized'
          });
      }
      
      res.status(200).json({
          success: true,
          message: 'Order deleted successfully'
      });
  } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to delete order',
          error: error.message
      });
  }
}

module.exports = {
  registerWholesaler,
  login,
  createCustomer,
  fetchRetailers,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAnalytics,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  deleteOrder
};
