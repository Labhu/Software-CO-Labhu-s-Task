const crypto = require("crypto");

class CryptoClass {
  hashPassword(password) {
    return crypto.createHash("md5").update(password).digest("hex");
  }

  verifyPassword(hasPsw, password) {
    const encryptedInputPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");
    return hasPsw === encryptedInputPassword;
  }
}

module.exports = new CryptoClass();
