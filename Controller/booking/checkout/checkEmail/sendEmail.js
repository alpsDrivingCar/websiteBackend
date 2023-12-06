const nodemailer = require('nodemailer');
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");

exports.sendEmailForChechEmailValid = async (req, res) => {
  try {
    const { toEmails } = req.body;

    // Check if the email exists in your database
    let existingEmailRecord = await CheckEmail.findOne({ email: toEmails });

    let randomNumber;
    if (existingEmailRecord) {
      // Email already exists, generate a new 4-digit random number and update it
      randomNumber = generateRandomNumber(1000, 9999);
      existingEmailRecord.verificationNumber = randomNumber.toString();
      await existingEmailRecord.save();
    } else {
      // Email doesn't exist, generate a 4-digit random number and store the email
      randomNumber = generateRandomNumber(1000, 9999);
      const newEmailRecord = new CheckEmail({ email: toEmails, verificationNumber: randomNumber.toString() });
      await newEmailRecord.save();
    }

    // Send the confirmation email with the 4-digit random number
    await sendConfirmationEmail(toEmails, randomNumber);

    res.status(200).send('Email sent successfully!');
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error occurred' });
  }
};

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendConfirmationEmail(toEmails, randomNumber) {
  const subject = "Confirmation Request for Email";
  let text = "I sent an important email with the subject Request to Get a Lesson in Driving School,";
  text += `To confirm its delivery, please enter this code: <strong>${randomNumber}</strong>.\n`;
  text += "\nYour confirmation is much appreciated.";

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'alpsdrivingschool@gmail.com', // replace with your email
      pass: process.env.SECRET_PASSWORD, // replace with your password
    },
  });

  const mailOptions = {
    from: 'alpsdrivingschool@gmail.com',
    to: toEmails,
    subject: subject,
    html: text, // Use HTML for the email body to support the bold formatting
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}
