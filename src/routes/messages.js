const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const getSqlUniqueDataBaseName = require("../utils/getUniqueSqlDataName");

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

router.post("/send", async (req, res) => {
  const { targetQQ, content, qq, lastDate } = req.body;
  const dataName = getSqlUniqueDataBaseName(targetQQ, qq);
  await getSqlData(
    // 创建两个用户关联的数据表，并且插入数据，然后将该数据库关联到各自对应的账户上
    `CREATE TABLE IF NOT EXISTS ${dataName} (
      messageid varchar(43) NOT NULL,
      targetQQ varchar(13) NOT NULL,
      fromQQ varchar(13) NOT NULL,
      content varchar(200) NOT NULL,
      lastDate varchar(13) NOT NULL,
      isRead char(1) NOT NULL COMMENT '0未读1已读'
    );
    INSERT INTO ${dataName} VALUES('${
      qq + targetQQ + +new Date()
    }', '${targetQQ}', '${qq}', '${content}', '${lastDate}', '0' );

    SELECT isIncludeTableId('${qq}', '${dataName}');
    SELECT isIncludeTableId('${targetQQ}', '${dataName}')
    `
  );
  send.success(res, {}, "发送成功");
});

router.post("/unreadCount", async (req, res) => {
  const { qq } = req.body;
  // 获取系统通知中的未读通知
  const systemUnreadCount = await getSqlData(
    `SELECT count(notificationid) as unreadCount from systemnotification where targetQQ = ${qq} and isRead = 0`
  );
  const currentTables = (
    await getSqlData(`SELECT messageDataName FROM userinfo where qq='${qq}'`)
  )?.[0]?.messageDataName?.split("-");
  currentTables.pop();
  let unreadCount = 0;

  await Promise.all(
    currentTables.map(async (element, index) => {
      const sqlRes = await getSqlData(
        `SELECT count(*) as unreadCount FROM ${element} where isRead = 0 and targetQQ = '${qq}'`
      );
      // const chatItem =
      //   "chat" +
      //   (sqlRes[0].targetQQ === qq ? sqlRes[0].fromQQ : sqlRes[0].targetQQ);
      // result.push({
      //   chat: chatItem,
      // });
      unreadCount += sqlRes[0].unreadCount;
    })
  );

  send.success(
    res,
    { unreadCount: unreadCount + systemUnreadCount[0].unreadCount },
    "读取成功"
  );
});

router.get("/contactPerson", async (req, res) => {
  const { qq } = req.query;
  send.success(res, {}, "读取成功");
});

router.get("/read", async (req, res) => {
  const { targetQQ, fromQQ } = req.query;
  const sqlRes = await getSqlData(
    `UPDATE messagelist SET isRead = 1 WHERE targetQQ = '${targetQQ}' AND fromQQ = '${fromQQ}'`
  );
  if (sqlRes.affectedRows > 0) {
    send.success(res, {}, "已读成功");
  } else {
    send.error(res, "网络错误", {});
  }
});

module.exports = router;
