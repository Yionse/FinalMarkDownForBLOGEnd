const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");

router.post("/unreadCount", async (req, res) => {
  const { qq } = req.body;
  const sqlRes = await getSqlData(
    `SELECT count(notificationid) as unreadCount from systemnotification where targetQQ = ${qq} and isRead = 0`
  );
  const sqlRes2 = await getSqlData(
    `SELECT count(messageid) as messageUnreadCount from messagelist where targetQQ = ${qq} and isRead = 0`
  );
  if (sqlRes.length > 0 && sqlRes2.length > 0) {
    send.success(res, {
      unreadCount: sqlRes[0].unreadCount + sqlRes2[0].messageUnreadCount,
    });
  } else {
    send.error(res, "网络错误");
  }
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

router.get("/send", async (req, res) => {
  const { targetQQ, content, qq, lastDate } = req.query;
  const sqlRes = await getSqlData(
    `INSERT INTO messagelist VALUES('${
      qq + targetQQ + +new Date()
    }', '${targetQQ}', '${qq}', '${content}', '${lastDate}', '0')`
  );
  if (sqlRes.affectedRows > 0) {
    send.success(res, {}, "发送成功");
  } else {
    send.error(res, "网络错误", {});
  }
});

module.exports = router;
