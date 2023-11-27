module.exports = {
<<<<<<< HEAD
  success: (res, msg, data) => {
=======
  success: (res, data, msg, isShowMessage = false) => {
>>>>>>> bdcc09b (:rocket: 登录完成)
    res.send({
      code: 200,
      msg: msg || "Success",
      result: {
        ...data,
        isShowMessage: isShowMessage,
      },
    });
  },
  warn: (res, msg, data) => {
    res.send({
      code: 301,
      msg: msg || "warn",
      result: {
        ...data,
      },
    });
  },
  error: (res, msg, err) => {
    res.send({
      code: 400,
      msg: msg || "Error",
      result: {
        err,
      },
    });
  },
};
