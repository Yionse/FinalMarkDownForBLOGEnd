const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");

router.post("/unreadCount", async (req, res) => {
  const { qq } = req.body;
  const sqlRes = await getSqlData(
    `SELECT count(notificationid) as unreadCount from systemnotification where targetQQ = ${qq} and isRead = 0`
  );
  send.success(res, { unreadCount: sqlRes[0].unreadCount });
});

router.get("/systemNotification", async (req, res) => {
  const { qq } = req.query;
  // 获取该用户相关的通知
  const sqlRes = await getSqlData(
    `SELECT pageId, notificationType ,fromQQ, operatorDate, userName FROM systemnotification LEFT JOIN userinfo on systemnotification.fromQQ =  userinfo.qq where targetQQ = ${qq}`
  );
  // 将这些通知标记为已读
  const sqlRes2 = await getSqlData(`
    UPDATE systemnotification SET isRead = 1 WHERE targetQQ = ${qq}
  `);
  if (sqlRes.length > 0 && sqlRes2.affectedRows > 0) {
    send.success(res, { systemNotification: sqlRes });
  } else {
    send.error(res, "网络错误", {});
  }
});

module.exports = router;
