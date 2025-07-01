// config/redisClient.js
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

redis.ping()
  .then(() => console.log('Redis connected'))
  .catch(err => console.log('Redis connection failed:', err));

module.exports = redis;
