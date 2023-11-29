const crypto = require("crypto");

// 获取随机盐
function getRandomSalt() {
  return crypto.randomBytes(Math.ceil(12)).toString("hex").slice(0, 24);
}

module.exports = getRandomSalt;
