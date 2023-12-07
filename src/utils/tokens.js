const jwt = require("jsonwebtoken");
const send = require("./send");

function getToken(qq, salt) {
  // 使用qq和盐值，生成Token
  return jwt.sign({ user: qq + "-" + salt }, process.env.SECRETKEY, {
    expiresIn: process.env.TOKEN_VALIDITY,
  });
}

function getTokenInfo(token) {
  let returnRes = {
    isSuccess: true,
    user: null,
  };
  jwt.verify(token, process.env.SECRETKEY, (err, res) => {
    if (err) {
      returnRes.isSuccess = false;
      return;
    }
    returnRes.user = res?.user?.split("-")[0];
  });
  return returnRes;
}

function verifyToken(req, res, next) {
  if (!req.headers["x-token"]) {
    send.error(res, "请先登录");
    return;
  }
  const verifyTokenRes = getTokenInfo(req.headers["x-token"].split(" ")[1]);
  if (verifyTokenRes.isSuccess) {
    next();
  } else {
    send.error(res, "登录已失效");
  }
}

module.exports = {
  getToken,
  getTokenInfo,
  verifyToken,
};
