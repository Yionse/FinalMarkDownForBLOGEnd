const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
const cors = require("cors");

// 引入全局属性
require("dotenv").config();

// 连接数据库
const pool = require("./utils/getDbContext");

const { user } = require("./routes");

// 解决前端跨域
app.use(cors());

// post参数解析
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.use("/user", user);

app.listen(9876, () => {
  console.log("服务器启动成功！");
});
