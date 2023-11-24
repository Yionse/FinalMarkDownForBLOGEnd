module.exports = function getEmailCode() {
  const min = 100000; // 最小值为100000
  const max = 999999; // 最大值为999999
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
