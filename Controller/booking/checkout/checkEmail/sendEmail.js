const nodemailer = require("nodemailer");

// send email
exports.sendEmailForChechEmailValid = async (req, res) => {
  const { subject, text, toEmails } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'alpsdrivingschool@gmail.com', // replace with your email
      pass: process.env.SECRET_PASSWORD, // replace with your password
    },
  });
  let mailOptions = {
      from: 'alpsdrivingschool@gmail.com',
      to: toEmails,
      subject: subject,
      text: text,
    };
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send('Error sending email');
    } else {
      res.status(200).send('Email sent successfully!');
    }
  });
});


