const fs = require("fs");
const path = require("path");

function getContent(filePath) {
  return fs.readFileSync(
    path.join(__dirname, "../../mds", filePath),
    "utf-8",
    (err, content) => {
      if (err) return new Error("读取文件失败");
      console.log(content);
      return content;
    }
  );
}

module.exports = getContent;
