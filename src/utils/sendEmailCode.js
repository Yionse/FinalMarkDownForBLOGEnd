const nodemailer = require("nodemailer");

// 创建可重用的传输器对象
const transporter = nodemailer.createTransport({
  service: "qq",
  auth: {
    user: `${process.env.QQ}@qq.com`, // 您的QQ邮箱账号
    pass: `${process.env.AUTHORZATION_CODE}`, // 您的QQ邮箱授权码
  },
});

function sendEmailCode(qq, code) {
  // 发送邮件的配置选项
  const mailOptions = {
    from: `${process.env.QQ}@qq.com`, // 发件人地址
    to: `${qq}@qq.com`, // 收件人地址
    subject: "ZTC博客的验证码", // 邮件主题
    text: `The verification code is: ${code}`, // 邮件正文
  };
  // 发送邮件
  return transporter.sendMail(mailOptions);
}

module.exports = sendEmailCode;
