const express = require("express");
const moment = require("moment");
const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const getRandom = require("../utils/getRandom");
const sendEmailCode = require("../utils/sendEmailCode");
const router = express.Router();
const getMdContent = require("../utils/getMdContent");

router.post("/login", async (req, res) => {
  const { code } = req.body;
  const sqlRes = await getSqlData(
    "SELECT code, sendtime from usercode where qq = 'admin'"
  );
  if ((+new Date() - Number(sqlRes[0].sendtime)) / 1000 < 60) {
    // 没超时
    const isLogin = sqlRes[0].code == code;
    if (isLogin) {
      send.success(res, { isLogin }, "登录成功", true);
    } else {
      send.warn(res, "验证码错误");
    }
  } else {
    send.warn(res, "验证码已超时");
  }
});

router.get("/getCode", async (req, res) => {
  const code = getRandom();
  await sendEmailCode("3225593545", code);
  await getSqlData(
    `UPDATE usercode set code = '${code}', sendtime = '${+new Date()}' where qq = 'admin'`
  );
  send.success(res, {}, "发送验证码成功", true);
});

// 获取网页数据
router.post("/getWebsiteData", async (req, res) => {
  // 访问数据相关
  const date = moment().subtract(7, "days").format("YYYY-MM-DD");
  // 总量
  const sqlRes = await getSqlData(
    "SELECT sum(count) as visitAllCount from visitcount"
  );
  // 网页小程序分别
  const sqlRes2 = await getSqlData(
    "SELECT platform, sum(count) as visitCount from visitcount group by platform"
  );
  // 近7日访问数量
  const sqlRes3 = await getSqlData(
    `SELECT sum(count) as visitCount from visitcount where date > '${date}'`
  );

  // 用户数据相关
  // 用户总量
  const [{ userAllCount }] = await getSqlData(
    "SELECT count(qq) as userAllCount from userinfo"
  );
  const latelyThirtyDate = moment().subtract(1, "months").valueOf();
  // 近一个月注册数
  const [{ latelyThirty }] = await getSqlData(
    `SELECT count(qq) as latelyThirty from userinfo where registerDate > ${latelyThirtyDate}`
  );

  // 文章相关
  // 文章数量
  const [{ pageAllCount }] = await getSqlData(
    "SELECT count(pageid) as pageAllCount from pages"
  );
  // 点赞/踩
  const [{ likeAllCount, unlikeAllCount }] = await getSqlData(
    "SELECT sum(likeCount) as likeAllCount, sum(unlikeCount) as unlikeAllCount from pages"
  );
  // 评论
  const [{ commentAllCount }] = await getSqlData(
    "SELECT count(*) as commentAllCount from usercomment"
  );
  send.success(
    res,
    {
      visitAllCount: sqlRes[0]?.visitAllCount,
      respectivelyCount: sqlRes2,
      latelySeven: sqlRes3[0]?.visitCount,
      userAllCount,
      latelyThirty,
      pageAllCount,
      likeAllCount,
      unlikeAllCount,
      commentAllCount,
    },
    "查询数据成功"
  );
});

// 获取图表数据 w
router.post("/getChartsDataMonth", async (req, res) => {
  const { visitDataDateForRadius } = req.body;
  const date = moment()
    .subtract(1, visitDataDateForRadius)
    .format("YYYY-MM-DD");
  // 近一个月访问数量汇总，分为网页-app，折线图
  const sqlRes = await getSqlData(
    `SELECT * from visitcount where date > '${date}'`
  );
  // 近一个月发布文章数量汇总，条形图

  send.success(res, { visitCollect: sqlRes }, "获取数据成功");
});

// 获取文章阅读数据
router.post("/getPageReadCount", async (req, res) => {
  const sqlRes = await getSqlData(
    "SELECT title as type, viewCount as value from pages where isCheckSuccess = '1'"
  );
  send.success(res, { pageViewCount: sqlRes });
});

// 获取用户列表数据
router.post("/userList", async (req, res) => {
  const sqlRes = await getSqlData("SELECT * from userinfo");
  send.success(res, { userList: sqlRes });
});

// 获取文章列表
router.post("/pagesList", async (req, res) => {
  const sqlRes = await getSqlData(
    "SELECT pages.*, userinfo.username, userinfo.pagesNumber FROM pages LEFT JOIN userinfo ON pages.qq = userinfo.qq WHERE userinfo.qq != 'admin'"
  );
  send.success(res, { pagesList: sqlRes });
});

// 获取文章内容·
router.get("/md", async (req, res) => {
  const { pageId } = req?.query;
  const content = getMdContent((pageId || "404") + ".md");
  if (content) {
    send.success(res, { content }, "读取成功");
  } else {
    send.error(res, "文章不翼而飞了", { isError: true });
  }
});

// 审核过程
router.post("/check", async (req, res) => {
  const { pageid, isCheckSuccess, reason } = req.body;
  await getSqlData(
    `UPDATE pages Set isCheckSuccess=${isCheckSuccess}, reason='${reason}' where pageid = '${pageid}'`
  );
  send.success(res, {}, "操作成功");
});

module.exports = router;
