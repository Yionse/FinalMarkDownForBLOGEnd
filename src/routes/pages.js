const express = require("express");
const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const router = express.Router();

router.post("/delete", async (req, res) => {
  const { id } = req.body;
  const sqlRes = await getSqlData(`DELETE FROM pages WHERE pageid = '${id}'`);
  if (sqlRes.affectedRows === 1) {
    send.success(res, {}, "删除文章成功", true);
  } else {
    send.warn(res, "删除文章失败");
  }
});

module.exports = router;
