const express = require("express");
const router = express.Router();
const moment = require("moment");

const send = require("../utils/send");
const getMdContent = require("../utils/getMdContent");
const getSqlData = require("../utils/getSqlData");
const { sendWs } = require("../utils/getSendWs");

router.get("/md", async (req, res) => {
  const { pageId } = req?.query;
  let content;
  try {
    content = getMdContent((pageId || "404") + ".md");
  } catch (error) {
    send.error(res, "读取MD失败", { isError: true });
    return;
  }
  if (content) {
    // 文章阅读量加1
    await getSqlData(
      `UPDATE PAGES SET viewCount=viewCount+1 WHERE pageid='${pageId}'`
    );
    send.success(res, { content }, "读取成功");
  } else {
    send.error(res, "文章不翼而飞了", { isError: true });
  }
});

router.get("/list", async (req, res) => {
  const { qq } = req?.query;
  const sqlRes = await getSqlData(
    `SELECT * FROM PAGES WHERE qq='${qq}' order by createtime desc`
  );
  send.success(res, { data: sqlRes }, "读取成功");
});

router.get("/indexmd", async (req, res) => {
  const { platform } = req.query;
  const sqlRes = await getSqlData("SELECT * FROM PAGES where position != ''");
  const date = moment().format("YYYY-MM-DD");
  await getSqlData(
    `update visitcount set count = count + 1 where platform = '${platform}' and date = '${date}'`
  );
  send.success(res, { data: sqlRes }, "读取成功");
});

router.get("/data", async (req, res) => {
  const { pageid } = req?.query;
  const sqlRes = await getSqlData(
    `SELECT likeCount, unlikeCount FROM PAGES WHERE pageid='${pageid}'`
  );
  const sqlRes2 = await getSqlData(
    `SELECT Count(pageId) as commnetCount FROM USERCOMMENT WHERE pageId='${pageid}'`
  );
  if (sqlRes.length > 0) {
    send.success(
      res,
      {
        data: {
          ...sqlRes[0],
          ...sqlRes2[0],
        },
      },
      "读取成功"
    );
  } else {
    send.error(res, "网络错误");
  }
});

router.get("/commentlist", async (req, res) => {
  const { pageid } = req?.query;
  const sqlRes = await getSqlData(
    `SELECT
      usercomment.qq,
      usercomment.createTime,
      usercomment.content,
      userinfo.userimg,
      userinfo.username
    FROM
      usercomment
      LEFT JOIN userinfo ON usercomment.qq = userinfo.qq
    WHERE
      usercomment.pageid = '${pageid}'
    Order by
      usercomment.createTime desc`
  );
  send.success(res, { data: sqlRes }, "读取成功");
});

router.get("/operator", async (req, res) => {
  const { pageid, type, fromQQ, targetQQ } = req?.query;
  let sqlRes;
  let sqlRes2;
  if (type === "top") {
    sqlRes = await getSqlData(
      `UPDATE PAGES SET likeCount=likeCount+1 WHERE pageid='${pageid}'`
    );
  } else {
    sqlRes = await getSqlData(
      `UPDATE PAGES SET unlikeCount=unlikeCount+1 WHERE pageid='${pageid}'`
    );
  }
  const lastDate = +new Date();
  sqlRes2 = await getSqlData(
    `INSERT INTO systemnotification VALUES('${
      pageid + lastDate
    }', '${pageid}', '${type}', '${targetQQ}', '${fromQQ}', 0, ${lastDate})`
  );
  if (sqlRes.affectedRows > 0 && sqlRes2.affectedRows > 0) {
    // 进行WebSocket操作
    sendWs(targetQQ, fromQQ, "notification", { type, lastDate, pageid });
    send.success(res, {}, `点${type === "top" ? "赞" : "踩"}成功`, true);
  } else {
    send.error(res, `点${type === "top" ? "赞" : "踩"}失败`);
  }
});

router.get("/query", async (req, res) => {
  const { key } = req?.query;
  const userRes = await getSqlData(
    `SELECT qq, userImg, userName, description from userinfo where userName like '%${key}%' or qq like '%${key}%'`
  );
  const titleRes = await getSqlData(
    `SELECT * from pages where (title like '%${key}%' or description like '%${key}%') and isCheckSuccess = 1`
  );
  send.success(res, { userRes, titleRes }, "搜索成功");
});

router.get("/count", async (req, res) => {
  const sqlRes = await getSqlData(
    "SELECT sum(count) as visitCount from visitcount"
  );
  const sqlRes2 = await getSqlData("SELECT count(qq) as pagesCount from pages");
  const sqlRes3 = await getSqlData(
    "SELECT count(qq) as userCount from userinfo"
  );
  send.success(
    res,
    {
      visitCount: sqlRes[0]?.visitCount,
      pagesCount: sqlRes2[0].pagesCount,
      userCount: sqlRes3[0].userCount,
    },
    "查询总访问量成功"
  );
});

module.exports = router;
