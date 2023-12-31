const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const getSqlUniqueDataBaseName = require("../utils/getUniqueSqlDataName");
const { sendWs } = require("../utils/getSendWs");

router.get("/systemNotification", async (req, res) => {
  const { qq } = req.query || "";
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
      messageid varchar(43) NOT NULL ,
      targetQQ varchar(13) NOT NULL,
      fromQQ varchar(13) NOT NULL,
      content varchar(200) NOT NULL,
      lastDate varchar(13) NOT NULL,
      isRead char(1) NOT NULL COMMENT '0未读1已读',
      PRIMARY KEY (messageid)
    );
    INSERT INTO ${dataName} VALUES('${
      qq + targetQQ + +new Date()
    }', '${targetQQ}', '${qq}', '${content}', '${lastDate}', '0' );

    SELECT isIncludeTableId('${qq}', '${dataName}');
    SELECT isIncludeTableId('${targetQQ}', '${dataName}')
    `
  );
  const sqlRes = await getSqlData(
    `SELECT userImg, userName from userinfo where qq='${qq}'`
  );
  sendWs(targetQQ, qq, "message", {
    content,
    lastDate,
    userName: sqlRes[0]?.userName,
    userImg: sqlRes[0]?.userImg,
  });
  send.success(res, {}, "发送成功");
});

router.post("/unreadCount", async (req, res) => {
  const { qq } = req.body;
  // 获取系统通知中的未读通知
  const systemUnreadCount = await getSqlData(
    `SELECT count(notificationid) as unreadCount from systemnotification where targetQQ = ${qq} and isRead = 0`
  );
  const currentTables =
    (
      await getSqlData(`SELECT messageDataName FROM userinfo where qq='${qq}'`)
    )?.[0]?.messageDataName?.split("-") || [];
  currentTables.pop();
  let unreadCount = 0;
  await Promise.all(
    currentTables.map(async (element) => {
      const sqlRes = await getSqlData(
        `SELECT count(*) as unreadCount FROM ${element} where isRead = 0 and targetQQ = '${qq}'`
      );
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
  const { qq } = req.query || "";
  const currentTables =
    (
      await getSqlData(`SELECT messageDataName FROM userinfo where qq='${qq}'`)
    )?.[0]?.messageDataName?.split("-") || [];
  currentTables.pop();

  const result = [];
  await Promise.all(
    currentTables.map(async (element) => {
      // 按照targetQQ分组，这样的话，可以将两人的消息分开，然后分别得到两人的最大的lastDate，最后再比较两人的lastDate
      const sqlRes = await getSqlData(
        `SELECT targetQQ, max(lastDate) as lastDate, fromQQ FROM ${element} GROUP BY targetQQ, fromQQ`
      );

      // 查询未读条数
      const sqlRes2 = await getSqlData(
        `SELECT lastDate FROM ${element} where isRead = 0 and targetQQ = '${qq}'`
      );
      const chatItem =
        sqlRes[0].targetQQ === qq ? sqlRes[0].fromQQ : sqlRes[0].targetQQ;

      // 无法判断target和from，需要借助chatItem，来查询信息
      const userInfo = await getSqlData(
        `SELECT userImg as targetImg, userName as targetName from userinfo WHERE qq = '${chatItem}'`
      );
      result.push({
        qq: chatItem,
        targetImg: userInfo[0].targetImg,
        targetName: userInfo[0].targetName,
        lastDate:
          sqlRes.length === 1
            ? Number(sqlRes[0]?.lastDate)
            : Math.max(sqlRes[0]?.lastDate, sqlRes[1]?.lastDate),
        unreadCount: sqlRes2.length > 0 ? sqlRes2.length : 0,
      });
    })
  );
  send.success(res, { result }, "读取成功");
});

router.get("/read", async (req, res) => {
  const { targetQQ, fromQQ } = req.query;
  const tableName = getSqlUniqueDataBaseName(targetQQ, fromQQ);
  const sqlRes = await getSqlData(
    `UPDATE ${tableName} SET isRead = 1 WHERE targetQQ = '${targetQQ}'`
  );
  if (sqlRes.affectedRows > 0) {
    send.success(res, {}, "已读成功");
  } else {
    send.error(res, "网络错误", {});
  }
});

router.get("/list", async (req, res) => {
  // fromQQ是自己
  const { fromQQ } = req.query || "";

  // 重构一版WebSocket
  const currentTables =
    (
      await getSqlData(
        `SELECT messageDataName FROM userinfo where qq='${fromQQ}'`
      )
    )?.[0]?.messageDataName?.split("-") || [];

  currentTables.pop();
  const result = [];
  await Promise.all(
    currentTables.map(async (tableName) => {
      const chatList = await getSqlData(
        `SELECT targetQQ, fromQQ, content as messageContent, lastDate FROM ${tableName} `
      );
      const chatUser =
        chatList?.[0].targetQQ === fromQQ
          ? chatList?.[0].fromQQ
          : chatList?.[0].targetQQ;
      result.push({
        qq: chatUser,
        messageList: JSON.stringify(chatList),
      });
    })
  );
  const data = result.map((item) => {
    return {
      qq: item.qq,
      messageList: JSON.parse(item.messageList),
    };
  });
  send.success(
    res,
    {
      data: data.map((item) => {
        return {
          qq: item.qq,
          messageList: item.messageList.sort(
            (a, b) => Number(a.lastDate) - Number(b.lastDate)
          ),
        };
      }),
    },
    "读取成功"
  );
});

module.exports = router;
