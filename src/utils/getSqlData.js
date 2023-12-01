const pool = require("./getDbContext");
function getSqlData(sql) {
  return new Promise((resolve, reject) => {
    try {
      pool.query(sql, (err, sqlRes) => {
        if (err) {
          reject(err);
        } else {
          resolve(sqlRes);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = getSqlData;
