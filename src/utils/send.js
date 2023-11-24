module.exports = {
  success: (res, data, code, msg) => {
    res.send({
      code: code || 200,
      msg: msg || "Success",
      result: {
        ...data,
      },
    });
  },
  error: (res, err, code, msg) => {
    res.send({
      code: code || 400,
      msg: msg || "Error",
      result: {
        err,
      },
    });
  },
};
