const express = require("express");
const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const { getTokenInfo } = require("../utils/tokens");
const getUserInfo = require("../utils/getUserInfo");
const router = express.Router();

router.post("/updateuserimg", async (req, res) => {
  const sqlRes = await getSqlData(
    `UPDATE USERINFO SET USERIMG='${req.body.userImg.replace(
      "\\",
      "/"
    )}' WHERE qq='${req.body.qq}'`
  );
  if (sqlRes.changedRows === 1) {
    send.success(res, { isUpdateSuccess: true }, "更换成功", true);
  } else {
    send.warn(res, "更换失败", { isUpdateSuccess: false });
  }
});

router.post("/token", async (req, res) => {
  const { token } = req.body;
  const { isSuccess, user } = getTokenInfo(token?.split(" ")[1]);
  send.success(
    res,
    { isSuccess, ...(await getUserInfo(user)) },
    isSuccess ? "验证成功" : "验证失败"
  );
});

module.exports = router;