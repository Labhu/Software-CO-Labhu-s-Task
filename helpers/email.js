const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  tls: {
    rejectUnauthorized: false,
  },
  pool: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    // console.log("🚀 ~transporter.verify  error:", error);
  } else {
    console.log("Server is verified to send");
  }
});

class MailHelper {
  sendEmail = async (
    to,
    content,
    cc = null,
    from = `"Software-CO" ${process.env.MAIL_FROM}`
  ) => {
    let contacts = {
      to: Array.isArray(to) ? to.join(", ") : to,
      from,
    };

    if (cc) {
      contacts.cc = Array.isArray(cc) ? cc.join(", ") : cc;
    }

    let email = Object.assign({}, content, contacts);

    return await transporter.sendMail(email, (err, message) => {
      if (err) {
        console.log("🚀 ~ transporter.sendMail ~ err:", err);
      } else {
        console.log(message);
        return;
      }
    });
  };
}
module.exports = new MailHelper();
