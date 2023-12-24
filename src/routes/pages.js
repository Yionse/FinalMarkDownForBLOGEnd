const express = require("express");
const send = require("../utils/send");
const getSqlData = require("../utils/getSqlData");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.post("/delete", async (req, res) => {
  const { id, qq } = req.body;
  const sqlRes = await getSqlData(`DELETE FROM pages WHERE pageid = '${id}'`);
  await getSqlData(
    `UPDATE USERINFO SET pagesNumber = pagesNumber -1 where qq = '${qq}'`
  );
  if (sqlRes.affectedRows === 1) {
    send.success(res, {}, "删除文章成功", true);
  } else {
    send.warn(res, "删除文章失败");
  }
});

router.post("/update", async (req, res) => {
  const { content, title, pageid, desc, coverUrl, qq } = req.body;
  const sqlRes = await getSqlData(
    `UPDATE pages SET title='${title}', coverUrl='${coverUrl}', description='${desc}' WHERE qq='${qq}' AND pageid='${pageid}'`
  );
  fs.readFile(
    `${path.join(__dirname + "../../../mds", pageid + ".md")}`,
    "utf-8",
    (err, data) => {
      if (err) send.error(res, "修改失败");
      if (data) {
        fs.writeFile(
          `${path.join(__dirname + "../../../mds", pageid + ".md")}`,
          content,
          () => {}
        );
        send.success(res, {}, "修改成功", true);
      }
    }
  );
});

router.get("/comment", async (req, res) => {
  const { pageid, qq, createTime, content } = req.query;
  const targetQQ = pageid.slice(0, -13);
  const sqlRes = await getSqlData(
    `INSERT INTO USERCOMMENT VALUES('${pageid}', '${qq}', '${createTime}', '${content}')`
  );
  const sqlRes2 = await getSqlData(
    `INSERT INTO systemnotification VALUES('${
      pageid + +new Date()
    }', '${pageid}', 'comment', '${targetQQ}', '${qq}', 0, ${+new Date()})`
  );
  if (sqlRes.affectedRows === 1 && sqlRes2.affectedRows === 1) {
    send.success(res, {}, "发表成功", true);
  } else {
    send.warn(res, "发表失败");
  }
});

module.exports = router;
