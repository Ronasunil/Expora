const nodeMailer = require("nodemailer");
const pug = require("pug");

// const sendEmail = async function (mailContent) {
//   // Node mailer transporter
//   const transporter = nodeMailer.createTransport({
//     host: process.env.MAIL_TRAP_HOST,
//     port: +process.env.MAIL_TRAP_PORT,

//     auth: {
//       user: process.env.MAIL_TRAP_USERID,
//       pass: process.env.MAIL_TRAP_PASSWORD,
//     },
//   });

//   // Email options

//   const mailOptions = {
//     from: mailContent.from || "Rona sunil <ronasunilcoc@gmail.com>",
//     to: mailContent.email,
//     subject: mailContent.subject,
//     text: mailContent.message,
//   };

//   //  sending email
//   await transporter.sendMail(mailOptions);
// };

class Mailer {
  constructor(user, url) {
    this.email = user.email;
    this.name = user.name;
    this.from = "Rona sunil <ronasunilcoc@gmail.com>";
    this.url = url;
  }

  createTransporter() {
    // if (process.env.NODE_ENV === "production") {
    //   return 1;
    // }

    return nodeMailer.createTransport({
      host: process.env.MAIL_TRAP_HOST,
      port: +process.env.MAIL_TRAP_PORT,

      auth: {
        user: process.env.MAIL_TRAP_USERID,
        pass: process.env.MAIL_TRAP_PASSWORD,
      },
    });
  }

  createHtml(template, message) {
    console.log(template);
    const htmlMarkup = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      message,
      userName: this.name,
      url: this.url,
    });
    return htmlMarkup;
  }

  async send(template, message) {
    // converting pug to html
    const htmlMarkup = this.createHtml(template, message);

    const mailOptions = {
      from: this.from,
      to: this.email,
      message,
      html: htmlMarkup,
      url: this.url,
    };
    console.log(this.createTransporter());
    await this.createTransporter().sendMail(mailOptions);
  }

  async sendOtp(otp) {
    await this.send(
      "email",
      `Please enter this code ${otp} in the provided space on our website to verify your email address. The code will expire in 5 minutes`
    );
  }

  async sendResetPassword(resetUrl) {
    await this.send(
      "email",
      `Please note that this link ${resetUrl}. Which is valid for a limited time. Feel free to ignore if you don't want to change`
    );
  }
}

module.exports = Mailer;
