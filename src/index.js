const express = require("express");
const https = require("https");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

//  启用标头处理，方便后续拿到ip地址
// app.set("trust proxy", true);

// 引入全局属性
require("dotenv").config();

// 读取私钥和证书文件
const privateKey = fs.readFileSync(
  path.join(__dirname, "../blog.end.zhangtc.online.key"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "../blog.end.zhangtc.online_bundle.crt"),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

// 解决前端跨域
app.use(cors());

const {
  user,
  users,
  files,
  page,
  pages,
  messages,
  backManagement,
} = require("./routes");
const { verifyToken } = require("./utils/tokens");

// 进行WebSocket操作
const { wsConnections } = require("./utils/getSendWs");
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 9875 });

server.on("connection", (socket, req) => {
  const userId = req.url.split("=")?.[1];
  wsConnections.set(userId, socket);
  console.log(wsConnections.keys(), "连接池");
  socket.on("error", (error) => {
    console.log(error, "error");
  });
  socket.on("close", () => {
    wsConnections.delete(userId);
  });
});

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

// post参数解析
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 新增一个后台管理的接口
app.use("/back", backManagement);

// 带s的路由需要经过token鉴权
app.use("/user", user);
app.use("/page", page);
app.use("/pages", verifyToken, pages);
app.use("/messages", verifyToken, messages);
app.use("/users", verifyToken, users);
app.use("/files", verifyToken, files);

// 往外跳一层
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/imgsForMd", express.static(path.join(__dirname, "../imgsForMd")));
app.use("/mds", express.static(path.join(__dirname, "../mds")));
app.use("/systemImgs", express.static(path.join(__dirname, "../systemImgs")));

const PORT = 9876;

// 启动 HTTPS 服务器
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log("服务器启动成功！");
});
