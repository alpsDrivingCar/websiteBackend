const PotentialPupil = require("../../../model/booking/potentialPupils/potentialPupil");
const notificationCreator = require('../../notification/notificationCreator');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    // Configure your email service here
    service: 'gmail',
    auth: {
        user: "alpsdrivingschool@gmail.com",
        pass: process.env.SECRET_PASSWORD
    }
});

exports.getPotentialPupils = async (req, res) => {
    try {
        const potentialPupils = await PotentialPupil.find();
        res.status(200).json({
            data: potentialPupils
        });
    } catch (error) {
        console.error('Error getting potential pupils:', error);
        res.status(400).json({
            message: 'Failed to get potential pupils',
            error: error.message
        });
    }
};

exports.storePotentialPupil = async (req, res) => {
    try {
        if(!req.body.problem){
            req.body.problem = 'Did not complete the order';
        }
        
        const existingPupil = await PotentialPupil.findOne({ email: req.body.email });
        if (existingPupil) {
            return res.status(200).json({
                message: 'Potential pupil already exists',
                data: existingPupil
            });
        }
        req.body.name = `${req.body.firstName} ${req.body.middleName ? req.body.middleName + ' ' : ''}${req.body.lastName}`;
        const potentialPupil = new PotentialPupil(req.body);
        await potentialPupil.save();

        if (req.body.requestedAssistance) {
            
            // Create admin notification with area
            await notificationCreator.createAssistanceRequestAdminNotification(
                req.body.location || 'Not specified', // Add area parameter
                req.body.name,
                req.body.email,
                req.body.phoneNumber,
                new Date().toISOString()
            );

            // Send confirmation email
            const mailOptions = {
                from: "alpsdrivingschool@gmail.com",
                to: req.body.email,
                subject: "We've received your assistance request",
                html: `
                    <p>Dear ${req.body.name},</p>
                    <p>Thank you for reaching out to us. We have received your request for assistance, and our team will contact you as soon as possible to help with your enquiry.</p>
                    <p>If you have any urgent questions, please feel free to contact us on 0800 669 6700 or email us at alpsdrivingschool@gmail.com</p>
                    <p>Best regards,<br>The Alps Driving School Team</p>
                `
            };

            await transporter.sendMail(mailOptions);

            return res.status(201).json({
                message: "Thank you for your request! Our team will contact you shortly to assist with your enquiry.",
                data: potentialPupil
            });
        }

        res.status(201).send(potentialPupil);
    } catch (error) {
        console.error('Error storing potential pupil:', error);
        res.status(400).json({
            message: 'Failed to store potential pupil',
            error: error.message
        });
    }
}