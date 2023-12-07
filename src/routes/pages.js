const express = require("express");
const router = express.Router();

const send = require("../utils/send");
const getMdContent = require("../utils/getMdContent");

router.get("/md", async (req, res) => {
  const { pageId } = req?.query;
  const content = getMdContent((pageId || "404") + ".md");
  if (content) {
    send.success(res, { content }, "读取成功");
  } else {
    send.error(res, "文章不翼而飞了", { isError: true });
  }
});

module.exports = router;
