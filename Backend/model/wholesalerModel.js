



const  client=require("../config/dbConfig")
const bcrypt = require("bcrypt");



const getUserByAccessToken = async (accessToken) => {
  const res = await client.query(
    'SELECT * FROM users WHERE access_token = $1',
    [accessToken]
  );
  return res.rows[0];
};

const createUser = async (userData) => {
    console.log("Creating user with data:", userData);
  const { username, email, phone,password, role, referral_code } = userData;
  const query = `
    INSERT INTO users (username, email, phone,password, role, referral_code, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5, $6,NOW(), NOW())
    RETURNING user_id
  `;

  const values = [username, email, phone, password, role, referral_code || null];
  const result = await client.query(query, values);
  return result.rows[0];
};



const createWholesalerBusiness = async (data) => {
    const { user_id, business_name, supply_category, location, address, territory } = data;
    const query = `
      INSERT INTO wholesaler_business (user_id, business_name, supply_category,  created_at, updated_at)
      VALUES ($1,$2,$3, NOW(), NOW())
      RETURNING wholesaler_id
    `;
  
    const values = [user_id, business_name, supply_category];
    const result = await client.query(query, values);
    return result.rows[0];
  };
  

  const getUserByEmail = async (email) => {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  };


  const updateUserAccessToken = async (userId, token) => {
    await client.query('UPDATE users SET access_token = $1 WHERE user_id = $2', [token, userId]);
  };
  

 

  // async function createCustomermodel (accessToken, { name, email, phone, password }) {
  //   console.log("Creating customer with data:", { accessToken,name, email, phone, password });
  //   // Get wholesaler user using access_token
  //   const { rows } = await client.query("SELECT user_id FROM users WHERE access_token = $1 AND role = 'wholesaler'", [accessToken]);
  //   const wholesaler = rows[0];
  
  //   if (!wholesaler) throw new Error("Invalid wholesaler token");
  
  //   const hashedPassword = await bcrypt.hash(password, 10);
  
  //   // Create new user
  //   const userResult = await client.query(
  //     `INSERT INTO users (username, email, phone, password, role) 
  //      VALUES ($1, $2, $3, $4, 'customer') RETURNING user_id`,
  //     [name, email, phone, hashedPassword]
  //   );
  
  //   const newUserId = userResult.rows[0].user_id;
  
  //   // Create retailer entry
  //   await client.query(
  //     `INSERT INTO retailers (user_id, wholesaler_id, retailer_name) VALUES ($1, $2, $3)`,
  //     [newUserId, wholesaler.user_id, name]
  //   );
  
  //   return { user_id: newUserId };
  // };



  async function createCustomermodel(accessToken, { name, email, phone, password }) {

    console.log("Creating customer with data:", { accessToken, name, email, phone, password });
  
    // Get wholesaler user using access_token
    // const { rows } = await client.query(
    //   "SELECT user_id FROM users WHERE access_token = $1 AND role = 'wholesaler'", 
    //   [accessToken]
    // );

    const { rows } = await client.query(
      `
      SELECT u.user_id, wb.wholesaler_id
      FROM users u
      JOIN wholesaler_business wb ON u.user_id = wb.user_id
      WHERE u.access_token = $1 AND u.role = 'wholesaler'
      `,
      [accessToken]
    );
    
    console.log("rows",rows)
    const wholesaler = rows[0];
    console.log("Wholesaler found:", wholesaler);
  
    if (!wholesaler) throw new Error("Invalid wholesaler token");
  
    // Check if the user already exists by email
    const existingUserResult = await client.query(
      "SELECT user_id FROM users WHERE email = $1", 
      [email]
    );
  
    let userId;
    console.log("Existing user result:", existingUserResult.rows);
    if (existingUserResult.rows.length > 0) {
      // User exists, use existing user_id
      console.log("here")
      userId = existingUserResult.rows[0].user_id;

    } else {
      // User does not exist, create new one
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userResult = await client.query(
        `INSERT INTO users (username, email, phone, password, role) 
         VALUES ($1, $2, $3, $4, 'customer') RETURNING user_id`,
        [name, email, phone, hashedPassword]
      );
  
      userId = userResult.rows[0].user_id;
    }
  console.log("Using user_id:", userId);
  console.log("Wholesaler user_id:", wholesaler.user_id);
    // Create retailer entry
    await client.query(
      `INSERT INTO retailers (user_id, wholesaler_id, retailer_name) VALUES ($1, $2, $3)`,
      [userId, wholesaler.wholesaler_id, name]
    );
  
    return { user_id: userId };
  }
  
  const getRetailersByWholesalerId = async (wholesalerId) => {
    console.log("Fetching retailers for wholesaler ID:", wholesalerId);
    const res = await client.query(
      `SELECT r.retailer_id, u.username AS name, u.email, u.phone, u.address
       FROM retailers r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.wholesaler_id = $1`,
      [wholesalerId]
    );
    return res.rows;
  };

 const getProductsByWholesalermodel = async (wholesalerId) => {
  console.log("Fetching products for wholesaler ID:", wholesalerId);
    const result = await client.query(`
      SELECT 
        p.name,
        p.product_id,
        i.purchase_price,
        i.sale_price,
        i.quantity
      FROM wholesaler_inventory i
      JOIN products p ON i.product_id = p.product_id
      WHERE i.wholesaler_id = $1
    `, [wholesalerId]);
    console.log(result.rows);

    return result.rows;
  };
  
 const addProductmodel = async (product, wholesalerId) => {
  console.log("Adding product:", product, "for wholesaler ID:", wholesalerId);
    const { name, purchase_price, sale_price, quantity } = product;
  
    const productRes = await client.query(
      `INSERT INTO products (name) VALUES ($1) RETURNING product_id`,
      [name]
    );
  
    const productId = productRes.rows[0].product_id;
  
    await client.query(
      `INSERT INTO wholesaler_inventory 
       (product_id, wholesaler_id, purchase_price, sale_price, quantity) 
       VALUES ($1, $2, $3, $4, $5)`,
      [productId, wholesalerId, purchase_price, sale_price, quantity]
    );
  
    return { success: true };
  };
  

  
const updateProductmodel = async (productId, wholesalerId, product) => {
    const { name, purchase_price, sale_price, quantity } = product;
  
    await client.query(`UPDATE products SET name = $1, updated_at = NOW() WHERE product_id = $2`, [name, productId]);
  
    await client.query(`
      UPDATE wholesaler_inventory 
      SET purchase_price = $1, sale_price = $2, quantity = $3, last_updated = NOW()
      WHERE product_id = $4 AND wholesaler_id = $5
    `, [purchase_price, sale_price, quantity, productId, wholesalerId]);
  
    return { success: true };
  };
  


const deleteProductmodel = async (productId, wholesalerId) => {
    await client.query(`DELETE FROM wholesaler_inventory WHERE product_id = $1 AND wholesaler_id = $2`, [productId, wholesalerId]);
    await client.query(`DELETE FROM products WHERE product_id = $1`, [productId]);
  
    return { success: true };
  };


  const  getTotalRetailersByWholesaler= async(wholesalerId) =>{
    const result = await client.query(
      `SELECT COUNT(*) AS total FROM retailers WHERE wholesaler_id = $1`,
      [wholesalerId]
    );
    return parseInt(result.rows[0].total, 10);
  }



const getRetailersByWholesaler=async(wholesalerId)=> {
    const result = await client.query(
      `SELECT retailer_id, retailer_name, created_at FROM retailers WHERE wholesaler_id = $1 ORDER BY created_at DESC`,
      [wholesalerId]
    );
    return result.rows;
  }

const getTotalProductsByWholesaler=async(wholesalerId) =>{
    const result = await client.query(
      `
      SELECT COUNT(DISTINCT p.product_id) AS total
      FROM products p
      JOIN wholesaler_inventory wi ON p.product_id = wi.product_id
      WHERE wi.wholesaler_id = $1
      `,
      [wholesalerId]
    );
    return parseInt(result.rows[0].total, 10);
  }
  
const  getProductsByWholesaler=async (wholesalerId)=> {
    const result = await client.query(
      `
      SELECT p.product_id, p.name, p.description, p.image, p.created_at
      FROM products p
      JOIN wholesaler_inventory wi ON p.product_id = wi.product_id
      WHERE wi.wholesaler_id = $1
      ORDER BY p.created_at DESC
      `,
      [wholesalerId]
    );
    return result.rows;
  }
  
  async function getTotalOrdersByWholesaler(wholesalerId) {
    console.log("Getting total orders for wholesaler ID:", wholesalerId);
    try {
      const query = `
        SELECT COUNT(*) as total 
        FROM orders 
        WHERE wholesaler_id = $1
      `;
      const result = await client.query(query, [wholesalerId]);
      console.log("Total orders result:", result.rows);
      return parseInt(result.rows[0].total) || 0;
    } catch (error) {
      console.error("Error getting total orders:", error);
      throw error;
    }
  }

  async function getOrdersByWholesaler(wholesalerId) {
    const query = `
        SELECT 
            o.order_id,
            o.order_date,
            o.status,
            u.username as retailer_name,
            u.email as retailer_email,
            u.phone as retailer_phone,
            COALESCE(SUM(od.price * od.quantity), 0) as total_amount
        FROM orders o
        LEFT JOIN retailers r ON o.retailer_id = r.retailer_id
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN order_details od ON o.order_id = od.order_id
        WHERE o.wholesaler_id = $1
        GROUP BY o.order_id, o.order_date, o.status, u.username, u.email, u.phone
        ORDER BY o.order_date DESC
    `;
    
    try {
        const result = await client.query(query, [wholesalerId]);
        return result.rows;
    } catch (error) {
        console.error('Database error in getOrdersByWholesaler:', error);
        throw error;
    }
}

// Get detailed information about a specific order
async function getOrderDetailsById(orderId, wholesalerId) {
    const orderQuery = `
        SELECT 
            o.order_id,
            o.order_date,
            o.status,
            u.username as retailer_name,
            u.email as retailer_email,
            u.phone as retailer_phone,
            u.address as retailer_address
        FROM orders o
        LEFT JOIN retailers r ON o.retailer_id = r.retailer_id
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE o.order_id = $1 AND o.wholesaler_id = $2
    `;
    
    const itemsQuery = `
        SELECT 
            od.order_detail_id,
            od.quantity,
            od.price,
            p.name as product_name,
            p.description as product_description,
            p.image as product_image
        FROM order_details od
        LEFT JOIN products p ON od.product_id = p.product_id
        WHERE od.order_id = $1
    `;
    
    try {
        const orderResult = await client.query(orderQuery, [orderId, wholesalerId]);
        
        if (orderResult.rows.length === 0) {
            return null;
        }
        
        const itemsResult = await client.query(itemsQuery, [orderId]);
        
        const orderDetails = {
            ...orderResult.rows[0],
            items: itemsResult.rows,
            total_amount: itemsResult.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        return orderDetails;
    } catch (error) {
        console.error('Database error in getOrderDetailsById:', error);
        throw error;
    }
}

// Update order status
async function updateOrderStatusModel(orderId, status, wholesalerId) {
    const query = `
        UPDATE orders 
        SET status = $1 
        WHERE order_id = $2 AND wholesaler_id = $3
        RETURNING order_id
    `;
    
    try {
        const result = await client.query(query, [status, orderId, wholesalerId]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Database error in updateOrderStatus:', error);
        throw error;
    }
}

// Delete order (soft delete by setting status to cancelled)
async function deleteOrder(orderId, wholesalerId) {
    const query = `
        UPDATE orders 
        SET status = 'cancelled' 
        WHERE order_id = $1 AND wholesaler_id = $2
        RETURNING order_id
    `;
    
    try {
        const result = await db.query(query, [orderId, wholesalerId]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Database error in deleteOrder:', error);
        throw error;
    }
}

// Get orders by status
async function getOrdersByStatus(wholesalerId, status) {
    const query = `
        SELECT 
            o.order_id,
            o.order_date,
            o.status,
            u.username as retailer_name,
            COALESCE(SUM(od.price * od.quantity), 0) as total_amount
        FROM orders o
        LEFT JOIN retailers r ON o.retailer_id = r.retailer_id
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN order_details od ON o.order_id = od.order_id
        WHERE o.wholesaler_id = $1 AND o.status = $2
        GROUP BY o.order_id, o.order_date, o.status, u.username
        ORDER BY o.order_date DESC
    `;
    
    try {
        const result = await db.query(query, [wholesalerId, status]);
        return result.rows;
    } catch (error) {
        console.error('Database error in getOrdersByStatus:', error);
        throw error;
    }
}

module.exports = {
  createUser,
  createWholesalerBusiness,
  getUserByEmail,
  getRetailersByWholesalerId,
  updateUserAccessToken,
  createCustomermodel,
  getUserByAccessToken,
  getProductsByWholesalermodel,
  addProductmodel,
   updateProductmodel,
  deleteProductmodel,
  getTotalRetailersByWholesaler,
  getRetailersByWholesaler,
 getTotalProductsByWholesaler,
 getProductsByWholesaler,
 getOrdersByWholesaler,
 getOrderDetailsById,
 updateOrderStatusModel,
 deleteOrder,
 getOrdersByStatus,
 getTotalOrdersByWholesaler

};



