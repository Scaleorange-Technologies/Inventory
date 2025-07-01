const { getUserByAccessToken } = require('../model/wholesalerModel');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  const user = await getUserByAccessToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
};

module.exports = authenticate;
