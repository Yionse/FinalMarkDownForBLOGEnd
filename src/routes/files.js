const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.post("/upload", uploadFile, (req, res) => {
  if (!req.file) {
    return res.status(400).send("上传失败");
  }
  // 获取上传的文件扩展名
  const extname = path.extname(req.file.originalname);

  // 为上传的文件添加扩展名
  fs.renameSync(req.file.path, `${req.file.path}${extname}`);
  //返回路径
  res.status(200).send({
    url: "http://localhost:9876/" + req.file.path + extname,
    message: "上传成功",
  });
});

function uploadFile(req, res, next) {
  //dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
  let upload = multer({ dest: "uploads" }).single("avatar");
  upload(req, res, (err) => {
    //打印结果看下面的截图
    if (err) {
      res.send("err:" + err);
    } else {
      //将文件信息赋值到req.body中，继续执行下一步
      req.body.photo = req.file.filename;
      next();
    }
  });
}

router.post("/imgInMd", uploadFileForImg, (req, res) => {
  if (!req.file) {
    return res.status(400).send("上传失败");
  }
  // 获取上传的文件扩展名
  const extname = path.extname(req.file.originalname);

  // 为上传的文件添加扩展名
  fs.renameSync(req.file.path, `${req.file.path}${extname}`);

  //返回路径
  res.status(200).send({
    url: "http://localhost:9876/" + req.file.path + extname,
    message: "上传成功",
  });
});

function uploadFileForImg(req, res, next) {
  //dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
  let upload = multer({ dest: "imgsForMd" }).single("imgsformd");
  upload(req, res, (err) => {
    //打印结果看下面的截图
    if (err) {
      res.send("err:" + err);
    } else {
      //将文件信息赋值到req.body中，继续执行下一步
      req.body.photo = req.file.filename;
      next();
    }
  });
}

router.post("/md", uploadFiles, (req, res) => {
  if (!req.file) {
    return res.status(400).send("上传失败");
  }
  // 获取上传的文件扩展名
  const extname = path.extname(req.file.originalname);
  // 为上传的文件添加扩展名
  fs.renameSync(req.file.path, `${req.file.path}${extname}`);
  console.log(req.body);
  //返回信息
  res.status(200).send({
    url: "http://localhost:9876/" + req.file.path + extname,
    message: "上传成功",
  });

  // 对文件进行处理，将Url进行替换为在线的Url
  updateUrlInMd(
    `${path.join(__dirname + "../../../", req.file.path + extname)}`,
    JSON.parse(req.body.fileList),
    JSON.parse(req.body.localImgUrl)
  );
});

function uploadFiles(req, res, next) {
  //dest 值为文件存储的路径;single方法,表示上传单个文件,参数为表单数据对应的key
  let upload = multer({ dest: "mds" }).single("md");
  upload(req, res, (err) => {
    //打印结果看下面的截图
    if (err) {
      res.send("err:" + err);
    } else {
      //将文件信息赋值到req.body中，继续执行下一步
      req.body.photo = req.file.filename;
      next();
    }
  });
}

function updateUrlInMd(filePath, newUrl, oldUrl) {
  fs.readFile(filePath, "utf-8", (_, data) => {
    if (oldUrl.length === newUrl.length && oldUrl.length > 0 && data) {
      //  先将原来的括号破坏，让其成为字符串，而不再是地址，否则无法使用正则替换
      let newContent = data
        .replace(/\(/g, "这是左括号")
        .replace(/\)/g, "右括号");
      for (let i = 0; i < oldUrl.length; i++) {
        oldUrl[i] = oldUrl[i]
          .replace(/\(/g, "这是左括号")
          .replace(/\)/g, "右括号");
        newUrl[i] = newUrl[i].replace(/\\/g, "/");
        while (newContent.includes(oldUrl[i])) {
          newContent = newContent.replace(oldUrl[i], newUrl[i]);
        }
      }
      const modify = data.replace(data, newContent);
      fs.writeFile(filePath, modify, () => {});
    }
  });
}

module.exports = router;
