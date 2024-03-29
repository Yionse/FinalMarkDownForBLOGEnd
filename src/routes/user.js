const express = require("express");
const router = express.Router();

const pool = require("../utils/getDbContext");
const getEmailCode = require("../utils/getRandom");
const send = require("../utils/send");
const sendEmailCode = require("../utils/sendEmailCode");
const { getToken } = require("../utils/tokens");
const getRandomSalt = require("../utils/getRandomSalt");
const getUserInfo = require("../utils/getUserInfo");

const checkCode = (res, qq, code, callback) => {
  /**
   *
   * @param {*} res 发送对象
   * @param {*} qq 要验证的对应qq
   * @param {*} code 接收到的验证码，需要和数据库中的比对
   * @param {*} callback 验证通过时，传入函数
   */
  try {
    // 需要传入一个没过期，且验证通过的函数，也就是在验证码通过验证后的函数
    pool.query(
      `SELECT sendtime, code FROM USERCODE WHERE qq=${qq}`,
      (err, sqlRes) => {
        if (sqlRes.length < 1) {
          // 当前不存在该用户，也没有发验证码
          send.warn(res, "验证码错误");
          return;
        }
        const intervalSecond =
          (+new Date() - Number(sqlRes[0].sendtime)) / 1000;
        if (Math.floor(intervalSecond) > 60) {
          //  验证码过期
          send.warn(res, "验证码过期，请重新发送验证码");
          return;
        } else if (code === sqlRes[0].code) {
          //  没过期，且验证码相同
          callback();
        } else {
          // 验证码错误
          send.warn(res, "验证码错误");
        }
      }
    );
  } catch (error) {
    send.error(res, "网络错误", error);
  }
};

router.post("/forget", (req, res) => {
  const { qq, pass, code } = req.body;
  checkCode(res, qq, code, () => {
    // 通过验证时，更新密码
    pool.query(
      `UPDATE USERPASS SET pass = '${pass}' where qq = '${qq}'`,
      (err, sqlRes) => {
        if (sqlRes.affectedRows > 0) {
          send.success(res, {}, "重置密码成功", true);
        } else {
          send.warn(res, "重置失败，可能还未注册");
        }
      }
    );
  });
});

router.post("/register", (req, res) => {
  const { qq, pass, code } = req.body;
  try {
    checkCode(res, qq, code, () => {
      // 需要传入一个没过期，且验证通过的函数，也就是在验证码通过验证后的函数
      pool.query(`SELECT * FROM USERPASS WHERE qq=${qq}`, (err, sqlRes) => {
        if (sqlRes.length > 0 && sqlRes[0]?.pass) {
          // 当前数据库中已存在该数据了，所以不能再次进行插入
          send.warn(res, "当前用户已经存在，请直接登录");
          return;
        } else {
          // 注册成功，插入密码表
          pool.query(
            `UPDATE USERPASS SET pass='${pass}', createtime='${+new Date()}' WHERE qq='${qq}'`
          );
          // 插入个人信息表
          pool.query(
            `INSERT INTO userinfo VALUES ('${qq}', 'https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=5', '${qq}', '${+new Date()}', '0', '0', '未填', '未填', '未填', '这里介绍不了')`
          );
          send.success(res, {}, "注册成功", true);
        }
      });
    });
  } catch (error) {
    send.error(res, "网络错误", error);
  }
});

router.post("/login", (req, res) => {
  const { qq, pass } = req.body;
  try {
    pool.query(`SELECT * FROM USERPASS WHERE qq = ${qq}`, (err, sqlRes) => {
      if (sqlRes?.length > 0 && sqlRes[0]?.pass === pass) {
        // 查到了该数据，且密码验证通过
        const token = getToken(qq, sqlRes[0]?.salt);
        pool.query(`SELECT * FROM USERINFO WHERE qq=${qq}`, (err, sqlRes) => {
          send.success(
            res,
            { isLogin: true, token: "Bearer " + token, userInfo: sqlRes[0] },
            "登录成功",
            true
          );
        });
      } else {
        // 没查到，当前用户没注册
        send.warn(res, "当前用户没注册,或密码错误");
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
    await sendEmailCode(qq, code);
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
    send.success(res, {}, "验证码发送成功", true);
  } catch (error) {
    if (error.responseCode === 550) {
      send.warn(res, "当前QQ号有误", { isQQError: true });
      return;
    }
    send.error(res, "网络错误", error);
  }
});

router.post("/getsalt", (req, res) => {
  const { qq, isCreate } = req.body;
  try {
    pool.query(`SELECT * FROM USERPASS WHERE qq='${qq}'`, (err, sqlRes) => {
      if (!isCreate) {
        // 不是注册用户
        send.success(res, { salt: sqlRes[0]?.salt }, "获取随机盐成功");
        return;
      }
      if (sqlRes.length < 1) {
        const salt = getRandomSalt();
        // 当前不存在该用户，说明执行的是注册操作
        pool.query(`INSERT INTO USERPASS value('${qq}', '', '', '${salt}')`);
        send.success(res, { salt }, "获取随机盐成功");
      } else {
        // 是注册用户，但当前数据库中已存在，所以无需再次创建
        send.success(res, {}, "当前已经存在盐值");
      }
    });
  } catch (error) {
    send.error(res, "网络错误", error);
  }
});

router.get("/getuserinfo", async (req, res) => {
  const { qq } = req.query;
  const sqlRes = await getUserInfo(qq);
  send.success(res, { sqlRes }, "获取用户信息成功");
});

module.exports = router;
