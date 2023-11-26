const express = require("express");
const router = express.Router();

const pool = require("../utils/getDbContext");
const getEmailCode = require("../utils/getRandom");
const send = require("../utils/send");
const sendEmailCode = require("../utils/sendEmailCode");

router.post("/register", (req, res) => {
  const { qq, pass } = req.body;
  pool.query(`SELECT * FROM USERPASS WHERE qq=${qq}`, (err, sqlRes) => {
    if (err) send.error(res, err);
    if (sqlRes.length > 0) {
      // 当前数据库中已存在该数据了，所以不能再次进行插入
      send.warn(res, "当前用户已经存在，请直接登录");
      return;
    } else {
      // 可以注册
      pool.query(
        `INSERT INTO USERPASS VALUE('${qq}', '${pass}', '${+new Date()}')`
      ),
        (err) => err && send.error(res, err);
    }
    send.success(res);
  });
});

router.post("/code", async (req, res) => {
  let isErr = false;
  const code = getEmailCode();
  const qq = req.body.qq;
  await sendEmailCode(qq, code).catch((err) => {
    isErr = true;
    if (err && err.responseCode === 550) {
      send.warn(res, "当前QQ号有误", { isQQError: true });
    } else {
      send.warn(res, "网络错误");
    }
  });
  if (isErr) {
    return;
  }
  pool.query(`SELECT * FROM USERCODE WHERE qq=${qq}`, (err, sqlRes) => {
    if (err) send.error(res, err);
    if (sqlRes.length > 0) {
      // 当前已经存在该qq的验证码了，需要覆盖
      pool.query(
        `UPDATE USERCODE SET code = ${code}, sendtime = ${+new Date()} WHERE qq = ${qq}`,
        (err) => {
          if (err) send.error(res, err);
        }
      );
    } else {
      // 不存在的话，进行插入
      pool.query(
        `INSERT INTO USERCODE VALUE('${qq}', '${code}', '${+new Date()}')`,
        (err) => {
          if (err) send.error(res, err);
        }
      );
    }
  });
  send.success(res);
});

module.exports = router;
