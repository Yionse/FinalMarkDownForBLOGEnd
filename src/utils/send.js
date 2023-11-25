module.exports = {
  success: (res, data, msg) => {
    res.send({
      code: 200,
      msg: msg || "Success",
      result: {
        ...data,
      },
    });
  },
  warn: (res, msg) => {
    res.send({
      code: 301,
      msg: msg || "warn",
    });
  },
  error: (res, err, msg) => {
    res.send({
      code: 400,
      msg: msg || "Error",
      result: {
        err,
      },
    });
  },
};
