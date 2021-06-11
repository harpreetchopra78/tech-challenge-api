const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  const accessTokenHeader = req.get('authorization');
  if (accessTokenHeader && accessTokenHeader.split(' ')[1]) {
    try {
      const decoded = jwt.verify(accessTokenHeader.split(' ')[1], process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).send("Token invalid or expired. Please logout and log back in.");
    }
  }
  else {
    res.status(401).send("Send a valid token");
  }
}

module.exports = {
  isAuth
}