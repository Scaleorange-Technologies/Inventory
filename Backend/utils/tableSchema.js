// Create Users Table
function createUsersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      access_token VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(255),
      location TEXT,
      address TEXT,
      password VARCHAR(255),
      role VARCHAR(20) CHECK (role IN ('wholesaler', 'customer')),
      referral_code VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Create Wholesaler Business Table
function createWholesalerBusinessTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS wholesaler_business (
      wholesaler_id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(user_id),
      business_name VARCHAR(255) NOT NULL,
      supply_category TEXT,
      location TEXT,
      address TEXT,
      territory TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Create Retailers Table
function createRetailersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS retailers (
      retailer_id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(user_id),
      wholesaler_id INT REFERENCES wholesaler_business(wholesaler_id),
      retailer_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

function createProductsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS products (
      product_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Create Wholesaler Inventory Table
function createInventoryTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS wholesaler_inventory (
      id SERIAL PRIMARY KEY,
      product_id INT REFERENCES products(product_id),
      wholesaler_id INT REFERENCES wholesaler_business(wholesaler_id),
      purchase_price FLOAT,
      sale_price FLOAT,
      quantity INT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Create Orders Table
function createOrdersTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS orders (
      order_id SERIAL PRIMARY KEY,
      retailer_id INT REFERENCES retailers(retailer_id),
      wholesaler_id INT REFERENCES wholesaler_business(wholesaler_id),
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50)
    );
  `;
}

// Create Order Details Table
function createOrderDetailsTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS order_details (
      order_detail_id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(order_id),
      product_id INT REFERENCES products(product_id),
      price FLOAT,
      quantity INT,
      user_id INT REFERENCES users(user_id)
    );
  `;
}

// Create Payment Table
function createPaymentTableQuery() {
  return `
    CREATE TABLE IF NOT EXISTS payments (
      payment_id SERIAL PRIMARY KEY,
      wholesaler_id INT REFERENCES wholesaler_business(wholesaler_id),
      start_date DATE,
      end_date DATE,
      price FLOAT,
      payment_status VARCHAR(50),
      payment_method VARCHAR(50)
    );
  `;
}

module.exports = {
  createUsersTableQuery,
  createWholesalerBusinessTableQuery,
  createRetailersTableQuery,
  createProductsTableQuery,
  createInventoryTableQuery,
  createOrdersTableQuery,
  createOrderDetailsTableQuery,
  createPaymentTableQuery
};
