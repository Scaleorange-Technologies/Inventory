const express = require('express');
const client=require('./config/dbConfig.js')
const cors = require('cors');
const { createTables } = require('./controller/tableController.js');
const { createDatabase } = require('./config/config');
const wholesalerRoutes = require('./routes/wholesalerRoutes.js');
const RetailerRoutes = require('./routes/retailerroutes.js');
// const redis = require('./config/redisClient');
const redis=require('./config/redisClient.js')
require('dotenv').config();
const http= require("http");
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '1gb' }));

app.use(cors({
 origin: '*' ,
   credentials: true,
 allowedHeaders: ['Authorization', 'Content-Type', 'token']
}));

app.use('/api', wholesalerRoutes);

app.use('/api',RetailerRoutes);


app.post("/api/pay", async(req, res) => {
  const payEndpoint = "/pg/v1/pay";
  const merchantTransactionId = uniqid();
  const {amount,corporateorder_id } = req.body;
  console.log("hello")
  const token = req.headers["token"]
  const decode = jwt.decode(token);
  console.log(decode);
  console.log(amount)
  const customer_id = decode.id;
  const amountinrupee = amount * 100
  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": 123,
    "amount": amountinrupee,
    "redirectUrl":`https://app.caterorange.com/api/redirect-url/${merchantTransactionId}?customer_id=${customer_id}&corporateorder_id=${corporateorder_id}`,
    "redirectMode": "REDIRECT",
    "callbackUrl": "https://webhook.site/callback-url",
    "mobileNumber": "9999999999",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  };

  const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  const base64EncodedPayload = bufferObj.toString("base64");

  const xVerify = crypto
    .createHash('sha256')
    .update(base64EncodedPayload + payEndpoint + SALT_KEY)
    .digest('hex') + "###" + SALT_INDEX;

  const options = {
    method: 'post',
    url: PHONEPE_HOST_URL + payEndpoint,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      "X-VERIFY": xVerify 
    },
    data: {
      request: base64EncodedPayload
    }
  };
  console.log("1")
  axios
    .request(options)
    .then(function (response) {
        console.log("2")
      console.log(response.data);
      const url = response.data.data.instrumentResponse.redirectInfo.url;
      res.json({ redirectUrl: url }); 
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send(error.message);
    });
});

app.get('/api/redirect-url/:merchantTransactionId', async(req, res) => {
  const { merchantTransactionId } = req.params;
  const { customer_id, corporateorder_id  } = req.query;
  console.log(customer_id)
  console.log('The merchant Transaction id is', merchantTransactionId);
  if (merchantTransactionId) {
    const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + '###' + SALT_INDEX;
    const options = {
      method: 'get',
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        "X-MERCHANT-ID": MERCHANT_ID,
        "X-VERIFY": xVerify
      },
    };
    axios
      .request(options)
      .then(async function (response) {
        console.log(response.data);
        if (response.data.code === 'PAYMENT_SUCCESS') {
          const paymentData = response.data.data;
          const paymentInstrument = paymentData.paymentInstrument;
         
          const paymentPayload = {
            paymentType: paymentInstrument.type, // PaymentType
            merchantTransactionId: paymentData.merchantTransactionId, // MerchantReferenceId
            phonePeReferenceId: paymentData.transactionId, // PhonePeReferenceId
            paymentFrom: "PhonePe", // From
            instrument: paymentInstrument.cardType || 'N/A', // Instrument (CARD or other)
            bankReferenceNo: paymentInstrument.brn || 'N/A', // BankReferenceNo
            amount: paymentData.amount,
            customer_id,corporateorder_id// Amount
             // Replace this with the actual customer_id (from session or request)
          };
         console.log("Checking vcvvcvcbch",corporateorder_id[0])
          // Make an Axios POST request to the new API for inserting the payment
          try {
            if(corporateorder_id[0]==='C')
            {
            const response=await axios.post('https://app.caterorange.com/api/insert-payment', paymentPayload);
            }
            if(corporateorder_id[0]==='E') 
              {
              const response=await axios.post('https://app.caterorange.com/api/insertevent-payment', paymentPayload);
              }
        res.status(200);
          } catch (error) {
            console.error("Error in sending payment data: ", error);
          }
          if(corporateorder_id[0]==='C'){
          // Redirect to success page
          res.redirect('https://app.caterorange.com/success');}
          else if(corporateorder_id[0]==='E'){
            res.redirect('https://app.caterorange.com/Esuccess'); 
          }
          // Redirect to the success page
        } else {
          res.redirect('https://app.caterorange.com/failure'); // Redirect to a failure page if needed
        }
      })
      .catch(function (error) {  
        console.error(error);
        res.status(500).send(error.message);
      });
  } else {
    res.status(400).send({ error: 'Error' });     
  }
});
const initializeApp = async () => {
 try {
 await createDatabase();
 console.log('Database created or already exists');

 await client.connect();
 console.log('Connected to the inventory DB');

 await createTables();
 console.log('Tables created successfully');


 
 const PORT = process.env.PORT || 4000; 

server.listen(PORT, (err) => {
  if (err) {
  console.log('Error starting the server:', err.message || err);
  process.exit(1); 
  } else {
  console.log(`Server is running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  }
  });
 server.on('error', (err) => {
 console.log('Server encountered an error:', err.message || err);
 process.exit(1);
 });
 
 
 

 
 } catch (err) {
 console.log('Initialization error:', err.message);
 process.exit(1);
 }
};
  

process.on('unhandledRejection', (err) => {
 console.log('Unhandled Promise Rejection:', err);
 process.exit(1);
});

process.on('uncaughtException', (err) => {
 console.log('Uncaught Exception:', err);
 process.exit(1);
});
  
initializeApp();

module.exports={app,redis};
