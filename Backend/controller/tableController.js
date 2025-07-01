// const client = require('../../config/dbConfig');
const client=require('../config/dbConfig')
const {
  createUsersTableQuery,
  createWholesalerBusinessTableQuery,
  createRetailersTableQuery,
  createProductsTableQuery,
  createInventoryTableQuery,
  createOrdersTableQuery,
  createOrderDetailsTableQuery,
  createPaymentTableQuery
} = require('../utils/tableSchema');

const createTables = async () => {
  try {
    await client.query(createUsersTableQuery());
    console.log('Users table created successfully');

    await client.query(createWholesalerBusinessTableQuery());
    console.log('Wholesaler Business table created successfully');

    await client.query(createRetailersTableQuery());
    console.log('Retailers table created successfully');

    await client.query(createProductsTableQuery());
    console.log('Products table created successfully');

    await client.query(createInventoryTableQuery());
    console.log('Wholesaler Inventory table created successfully');

    await client.query(createOrdersTableQuery());
    console.log('Orders table created successfully');

    await client.query(createOrderDetailsTableQuery());
    console.log('Order Details table created successfully');

    await client.query(createPaymentTableQuery());
    console.log('Payments table created successfully');

  } catch (error) {
    console.log('Error creating tables:', error);
    throw error;
  }
};

module.exports = {
  createTables
};
