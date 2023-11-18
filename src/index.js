const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const router = express.Router();
const cors = require("cors");

// 解决前端跨域
app.use(cors());

function getContent() {
  const filePath = path.join(__dirname, "/mds", "umi3.md");
  return fs.readFileSync(filePath, "utf-8", (err, content) => {
    if (err) return new Error("读取文件失败");
    return content;
  });
}

router.post("/md", (req, res) => {
  const content = getContent();
  res.send({
    code: 200,
    msg: "访问成功！",
    result: {
      data: content,
      res: "111",
    },
  });
});

app.use("/test", router);

app.listen(9876, () => {
  console.log("服务器启动成功！");
});
