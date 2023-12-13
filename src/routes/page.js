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
    `SELECT likeCount, unlikeCount from Pages where pageid='${pageid}'`
  );

  if (sqlRes.length > 0) {
    send.success(res, { data: sqlRes[0] }, "读取成功");
  }
});

module.exports = router;
