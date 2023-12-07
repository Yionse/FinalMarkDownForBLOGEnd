const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
const cors = require("cors");

//  启用标头处理，方便后续拿到ip地址
// app.set("trust proxy", true);

// 引入全局属性
require("dotenv").config();

const { user, users, files } = require("./routes");
const { verifyToken } = require("./utils/tokens");

// 限制ip访问
// app.use((req, res, next) => {
//   if (req.headers.origin === "http://localhost:9009") {
//     next();
//   } else {
//     res.status(403).send({
//       msg: "限制IP访问",
//     });
//   }
// });

// 解决前端跨域
app.use(cors());

// post参数解析
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function getContent() {
  const filePath = path.join(
    __dirname,
    "/mds",
    "6a85fc6e8406ee19f11191c6b9cb1339.md"
  );
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

// 带s的路由需要经过token鉴权
app.use("/user", user);
app.use("/users", verifyToken, users);
app.use("/files", verifyToken, files);

// 往外跳一层
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/imgsForMd", express.static(path.join(__dirname, "../imgsForMd")));
app.use("/mds", express.static(path.join(__dirname, "../mds")));

app.listen(9876, () => {
  console.log("服务器启动成功！");
});
