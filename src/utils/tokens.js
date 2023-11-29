const jwt = require("jsonwebtoken");

function getToken(qq, salt) {
  // 使用qq和盐值，生成Token
  return jwt.sign({ user: qq + salt + "" }, process.env.SECRETKEY, {
    expiresIn: process.env.TOKEN_VALIDITY,
  });
}

function verifyToken(token) {
  let isSuccess = true;
  jwt.verify(token, process.env.SECRETKEY, (err, res) => {
    if (err) {
      isSuccess = false;
      return;
    }
  });
  return isSuccess;
}

module.exports = {
  getToken,
  verifyToken,
};
