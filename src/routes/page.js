const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getMdContent = require("../utils/getMdContent");
const getSqlData = require("../utils/getSqlData");

router.get("/md", async (req, res) => {
  const { pageId } = req?.query;
  const content = getMdContent((pageId || "404") + ".md");
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
  const sqlRes = await getSqlData("SELECT * FROM PAGES WHERE qq='admin'");
  send.success(res, { data: sqlRes }, "读取成功");
});

router.get("/data", async (req, res) => {
  const { pageid } = req?.query;
  const sqlRes = await getSqlData(
    `SELECT
      pages.likeCount as linkCount,
      pages.unlikeCount as unlikeCount,
      COUNT(usercomment.pageid) as commnetCount
    FROM
      pages
      RIGHT JOIN usercomment ON pages.pageid = usercomment.pageid
    WHERE
      usercomment.pageid = '${pageid}'
    GROUP BY pages.likeCount, pages.unlikeCount;`
  );
  if (sqlRes.length > 0) {
    send.success(res, { data: sqlRes[0] }, "读取成功");
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
module.exports = router;
