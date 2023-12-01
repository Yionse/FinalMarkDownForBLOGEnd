const express = require("express");
const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
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

module.exports = router;
