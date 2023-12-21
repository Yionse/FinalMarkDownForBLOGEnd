const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");

router.post("/unreadCount", async (req, res) => {
  const { qq } = req.body;
  const sqlRes = await getSqlData(
    `SELECT count(notificationid) as unreadCount from systemnotification where targetQQ = ${qq}`
  );
  send.success(res, { unreadCount: sqlRes[0].unreadCount });
});

module.exports = router;
