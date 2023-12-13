const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const getSqlData = require("../utils/getSqlData");
const send = require("../utils/send");

const router = express.Router();

router.post("/upload", uploadFile, async (req, res) => {
  if (!req.file) {
    return res.status(400).send("上传失败");
  }
  // 获取上传的文件扩展名
  const extname = path.extname(req.file.originalname);

  // 为上传的文件添加扩展名
  fs.renameSync(req.file.path, `${req.file.path}${extname}`);

  // 文件在线路径
  const url =
    "http://localhost:9876/" + req.file.path.replace("\\", "/") + extname;

  // 如果传递了qq，则说明是更换头像
  if (req.body.qq) {
    await getSqlData(
      `UPDATE USERINFO SET userImg='${url}' where qq='${req.body.qq}'`
    );
  }
  //返回数据
  res.status(200).send({
    url,
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

  /**
   *   在返回时，将对应的文件名与远程url对应成一个对象， 存在映射关系，方便在前端做文件比对
   *   文件名：req.file.originalname
   */

  //返回路径
  res.status(200).send({
    url: "http://localhost:9876/" + req.file.path.replace("\\", "/") + extname,
    fileName: req.file.originalname,
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

router.post("/md", uploadFiles, async (req, res) => {
  if (!req.file) {
    return res.status(400).send("上传失败");
  }
  const qq = JSON.parse(req.body.qq);
  const coverUrl = JSON.parse(req.body.cover);
  const title = JSON.parse(req.body.title);
  const desc = JSON.parse(req.body.desc);
  const pagesId = qq + +new Date();
  // 获取上传的文件扩展名
  const extname = path.extname(req.file.originalname);
  // 为上传的文件添加扩展名
  fs.renameSync(req.file.path, `mds\\${pagesId}${extname}`);

  // 对文件进行处理，将Url进行替换为在线的Url
  updateUrlInMd(
    `${path.join(__dirname + "../../../mds", pagesId + extname)}`,
    JSON.parse(req.body.fileList)
  );

  // 进行数据库操作
  const sqlRes = await getSqlData(
    `INSERT INTO PAGES VALUES('${qq}', '${pagesId}', '${title}', '${coverUrl}', '${+new Date()}', 0, 0,'${desc}', 0)`
  );

  await getSqlData(
    `UPDATE USERINFO SET pagesNumber = pagesNUmber + 1 where qq='${qq}'`
  );

  if (sqlRes?.affectedRows === 1) {
    send.success(res, {}, "上传成功");
    return;
  }
  send.error(res, {}, "上传失败");
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

function updateUrlInMd(filePath, fileList) {
  fs.readFile(filePath, "utf-8", (_, data) => {
    // if (oldUrl.length === newUrl.length && oldUrl.length > 0 && data) {
    //   //  先将原来的括号破坏，让其成为字符串，而不再是地址，否则无法使用正则替换
    //   let newContent = data;
    //   //   .replace(/\(/g, "这是左括号")
    //   //   .replace(/\)/g, "右括号");
    //   for (let i = 0; i < oldUrl.length; i++) {
    //     // oldUrl[i] = oldUrl[i]
    //     //   .replace(/\(/g, "这是左括号")
    //     //   .replace(/\)/g, "右括号");
    //     // newUrl[i] = newUrl[i].replace(/\\/g, "/");
    //     while (newContent.includes(oldUrl[i])) {
    //       newContent = newContent.replace(oldUrl[i], newUrl[i]);
    //     }
    //   }
    //   // console.log(newContent.replace(oldUrl[0], newUrl[0]));
    //   // console.log(oldUrl[0]);
    //   // console.log(newUrl[0]);
    //   console.log(newContent);
    //   const modify = data.replace(data, newContent);
    //   fs.writeFile(filePath, modify, () => {});
    // }
    if (fileList.length > 0 && data) {
      let newContent = data;
      for (let i = 0; i < fileList.length; i++) {
        while (
          newContent.includes(fileList[i].localImg) &&
          fileList[i].fileName
        ) {
          newContent = newContent.replace(
            fileList[i].localImg,
            fileList[i].url
          );
        }
      }
      const modify = data.replace(data, newContent);
      fs.writeFile(filePath, modify, () => {});
    }
  });
}

module.exports = router;
