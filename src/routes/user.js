const express = require("express");
const router = express.Router();

const pool = require("../utils/getDbContext");
const getEmailCode = require("../utils/getRandom");
const send = require("../utils/send");
const sendEmailCode = require("../utils/sendEmailCode");

router.post("/register", (req, res) => {
  const { qq, pass, code } = req.body;
  try {
    pool.query(`SELECT * FROM USERPASS WHERE qq=${qq}`, (err, sqlRes) => {
      if (sqlRes.length > 0) {
        // 当前数据库中已存在该数据了，所以不能再次进行插入
        send.warn(res, "当前用户已经存在，请直接登录");
        return;
      } else {
        // 可以注册，判断验证码是否过期
        pool.query(
          `SELECT sendtime, code FROM USERCODE WHERE qq=${qq}`,
          (err, sqlRes) => {
            const intervalSecond =
              (+new Date() - Number(sqlRes[0].sendtime)) / 1000;
            if (Math.floor(intervalSecond) > 60) {
              //  验证码过期
              send.warn(res, "验证码过期，请重新发送验证码");
              return;
            } else if (code === sqlRes[0].code) {
              //  没过期，且验证码相同
              pool.query(
                `INSERT INTO USERPASS VALUE('${qq}', '${pass}', '${+new Date()}')`
              );
              send.success(res, {}, "注册成功", true);
            } else {
              // 验证码错误
              send.warn(res, "验证码错误");
            }
          }
        );
      }
    });
  } catch (error) {
    send.error(res, "网络错误", error);
  }
});

router.post("/login", (req, res) => {
  const { qq } = req.body;
  try {
    pool.query(`SELECT * FROM USERPASS WHERE qq = ${qq}`, (err, sqlRes) => {
      if (sqlRes?.length > 0) {
        // 查到了，将密码返回
        send.success(res, { pass: sqlRes[0].pass });
      } else {
        // 没查到，当前用户没注册
        send.warn(res, "当前用户没注册");
      }
    });
  } catch (error) {
    send.error(res, "网络错误", error);
  }
});

router.post("/code", async (req, res) => {
  const code = getEmailCode();
  const qq = req.body.qq;
  try {
    await sendEmailCode(qq, code).catch((err) => {
      if (err && err.responseCode === 550) {
        send.warn(res, "当前QQ号有误", { isQQError: true });
      } else {
        send.warn(res, "网络错误");
      }
    });
    pool.query(`SELECT * FROM USERCODE WHERE qq=${qq}`, (err, sqlRes) => {
      if (sqlRes?.length > 0) {
        // 当前已经存在该qq的验证码了，需要覆盖
        pool.query(
          `UPDATE USERCODE SET code = ${code}, sendtime = ${+new Date()} WHERE qq = ${qq}`
        );
      } else {
        // 不存在的话，进行插入
        pool.query(
          `INSERT INTO USERCODE VALUE('${qq}', '${code}', '${+new Date()}')`
        );
      }
    });
    send.success(res, "验证码发送成功");
  } catch (error) {
    send.error(res, "网络错误", error);
  }
});

module.exports = router;
