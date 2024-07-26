const jwt = require("jsonwebtoken");

class JWTAuthenticator {
  createJWTToken(payload, expiresIn = process.env.JWT_EXPIRES_IN) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  verifyJWTToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = new JWTAuthenticator();
