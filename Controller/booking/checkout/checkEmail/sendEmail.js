const nodemailer = require('nodemailer');
const CheckEmail = require("../../../../model/booking/checkout/checkEmail/checkEmailSchema");

exports.sendEmailForChechEmailValid = async (req, res) => {
  const { toEmails } = req.body;

  // Check if the email exists in your database
  let existingEmailRecord = await CheckEmail.findOne({ email: toEmails });

  if (existingEmailRecord) {
    // Email already exists, generate a new 4-digit random number and update it
    const newRandomNumber = generateRandomNumber(1000, 9999); // Generate a new 4-digit number
    existingEmailRecord.verificationNumber = newRandomNumber.toString(); // Update the random number
    await existingEmailRecord.save(); // Save the updated record

    // Send the confirmation email with the new bold 4-digit random number
    sendConfirmationEmail(toEmails, res, newRandomNumber);
  } else {
    // Email doesn't exist, generate a 4-digit random number and store the email
    const randomNumber = generateRandomNumber(1000, 9999); // Generate a 4-digit number

    // Save the email and random number in your database
    const newEmailRecord = new CheckEmail({ email: toEmails, verificationNumber: randomNumber.toString() });
    await newEmailRecord.save();

    // Send the confirmation email with the bold 4-digit random number
    sendConfirmationEmail(toEmails, res, randomNumber);
  }
};

function generateRandomNumber(min, max) {
  // Generate a random 4-digit number between min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendConfirmationEmail(toEmails, res, randomNumber = null) {
  const subject = "Confirmation Request for Email";
  let text = "I sent an important email with the subject Request to Get a Lesson in Driving School,";

  if (randomNumber !== null) {
    text += `To confirm its delivery, please enter this code: <strong>${randomNumber}</strong>.\n`;
  }

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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send('Error sending email');
    } else {
      res.status(200).send('Email sent successfully!');
    }
  });
}




