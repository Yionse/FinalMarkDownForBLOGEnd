const jwt = require("jsonwebtoken");

function getToken(qq) {
  return jwt.sign(qq, process.env.SECRETKEY, {
    expiresIn: process.env.TOKEN_VALIDITY,
  });
}

module.exports = {
  getToken,
};
