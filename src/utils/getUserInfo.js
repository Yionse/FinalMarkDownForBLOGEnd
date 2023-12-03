const getSqlData = require("./getSqlData");

const getUserInfo = async (user) => {
  const res = await getSqlData(`SELECT * FROM USERINFO WHERE qq = '${user}'`);
  return res[0];
};

module.exports = getUserInfo;
