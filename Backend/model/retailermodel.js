const  client=require("../config/dbConfig")
const bcrypt = require("bcrypt");

const getUserByEmail = async (email) => {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  };


const updateUserAccessToken = async (userId, token) => {
    await client.query('UPDATE users SET access_token = $1 WHERE user_id = $2', [token, userId]);
  };
  
  async function getRetailerByUserId(userId) {
    const query = `
        SELECT retailer_id, user_id, wholesaler_id, retailer_name 
        FROM retailers 
        WHERE user_id = $1
    `;
    const result = await client.query(query, [userId]);

    return result.rows;
}

// Get wholesalers associated with a retailer
async function getWholesalersForRetailer(retailerId) {
    const query = `
        SELECT DISTINCT wb.wholesaler_id, wb.business_name, wb.supply_category, 
               wb.location, wb.address, wb.territory, u.phone, u.email
        FROM wholesaler_business wb
        JOIN retailers r ON wb.wholesaler_id = r.wholesaler_id
        JOIN users u ON wb.user_id = u.user_id
        WHERE r.retailer_id = $1
    `;
    const result = await client.query(query, [retailerId]);
    return result.rows;

}





async function getProductsByWholesaler(wholesalerId) {
    const query = `
        SELECT 
            p.product_id, 
            p.name, 
            -- assuming unit is missing, remove or add it if necessary
            i.sale_price AS price, 
            i.quantity AS stock
        FROM wholesaler_inventory i
        JOIN products p ON i.product_id = p.product_id
        WHERE i.wholesaler_id = $1 
    `;
    const result = await client.query(query, [wholesalerId]);
    return result.rows;
}

const getProductStockModel = async (productId) => {
    try {
      const query = `
        SELECT wi.quantity as stock 
        FROM wholesaler_inventory wi 
        WHERE wi.product_id = $1 
        LIMIT 1
      `;
      
      const result = await client.query(query, [productId]);
      
      if (result.rows.length === 0) {
        return null; // Product not found
      }
      
      return result.rows[0].stock;
    } catch (error) {
      console.error('Error in getProductStock:', error);
      throw error;
    }
  };
  
  // Get stock for multiple products
  const getMultipleProductsStockModel = async (productIds) => {
    try {
      const placeholders = productIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT 
          wi.product_id,
          p.name,
          wi.quantity as stock,
          wi.sale_price as price
        FROM wholesaler_inventory wi 
        JOIN products p ON wi.product_id = p.product_id
        WHERE wi.product_id IN (${placeholders})
      `;
      
      const result = await client.query(query, productIds);
      
      // Convert to object for easy lookup
      const stockMap = {};
      result.rows.forEach(row => {
        stockMap[row.product_id] = {
          stock: row.stock,
          name: row.name,
          price: row.price
        };
      });
      
      return stockMap;
    } catch (error) {
      console.error('Error in getMultipleProductsStock:', error);
      throw error;
    }
  };

  module.exports={
        getUserByEmail,
        updateUserAccessToken,
        getRetailerByUserId,
        getProductsByWholesaler,
        getWholesalersForRetailer,
        getProductStockModel,
        getMultipleProductsStockModel
  }