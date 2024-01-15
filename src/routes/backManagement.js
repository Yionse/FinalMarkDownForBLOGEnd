const express = require("express");
const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const getRandom = require("../utils/getRandom");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { code } = req.body;
  const sqlRes = await getSqlData(
    "SELECT code, sendtime from usercode where qq = 'admin'"
  );
  if ((+new Date() - Number(sqlRes[0].sendtime)) / 1000 < 60) {
    // 没超时
    const isLogin = sqlRes[0].code == code;
    if (isLogin) {
      send.success(res, { isLogin }, "登录成功", true);
    } else {
      send.warn(res, "验证码错误");
    }
  } else {
    send.warn(res, "验证码已超时");
  }
});

router.get("/getCode", async (req, res) => {
  await getSqlData(
    `UPDATE usercode set code = '${getRandom()}', sendtime = '${+new Date()}' where qq = 'admin'`
  );
  send.success(res, {}, "发送验证码成功", true);
});

module.exports = router;
