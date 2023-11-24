const express = require("express");
const router = express.Router();
const pool = require("../utils/getDbContext");

const getEmailCode = require("../utils/getRandom");
const send = require("../utils/send");

router.post("/register", (req, res) => {
  console.log(req.body);
  res.send({
    code: 200,
    msg: "访问成功！",
    result: {
      test: 111,
    },
  });
});

router.post("/code", (req, res) => {
  const code = getEmailCode();
  const qq = req.body.qq;
  pool.query(
    `INSERT INTO USERCODE value('${
      +new Date() + qq
    }','${qq}','${code}', '${+new Date()}')`,
    (err, res) => {
      if (err) send.error(res, err);
    }
  );
  send.success(res);
});

module.exports = router;
