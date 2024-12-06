const ContactusSchema = require("../../model/setting/contactusSchema");
const {body, validationResult} = require('express-validator');
const NotificationCreator = require("../notification/notificationCreator");

exports.createContactus = async (req, res) => {
    const errors = await handleValidator(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        // Return the first error message
        return res.status(400).json({ errors: errorMessages[0] });
    }

    const contactus = new ContactusSchema(req.body);
    contactus.save()
        .then(async result => {
            // Create notification after saving contactus
            try {
                await NotificationCreator.createWebsiteAdminNotification(req.body.name, "Contact", result._id, "contactus");
                res.json(result);
            } catch (notificationErr) {
                console.error(notificationErr);
                res.status(500).json({ error: "An error occurred while creating the notification" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "An internal server error occurred" });
        });
};

async function handleValidator(req) {
    const validationChecks = [
        body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
        body('email').isEmail().withMessage('Invalid email'),
        body('location').notEmpty().withMessage('Location is required'),
        body('name').notEmpty().withMessage('Name is required'),
    ];

    for (const validationCheck of validationChecks) {
        await validationCheck.run(req);
    }

    return validationResult(req);
}
exports.contactuss = (req, res) => {
    ContactusSchema.find()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(400).json({ error: "An error occurred while fetching the data" });
        });
};

exports.contactusUpdate = (req, res) => {
    // Assuming "6489c7239bdfd1bbc0d33afc" is a placeholder for demonstration
    // For dynamic ID use: req.params.id
    const id = req.params.id || "6489c7239bdfd1bbc0d33afc";
    ContactusSchema.findByIdAndUpdate(id, req.body, { new: true }) // { new: true } to return the updated object
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Contact not found" });
            }
            res.json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "An error occurred during the update" });
        });
};

exports.deleteContactus = (req, res) => {
    ContactusSchema.findByIdAndDelete(req.params.id)
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Contact not found" });
            }
            res.json({ message: "Contact deleted successfully", data: result });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "An error occurred during the deletion" });
        });
};

exports.getAllContactUs = async (req, res) => {
    try {
        const results = await ContactusSchema.find()
        .sort({ createdAt: -1 });
        res.json({ data: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getContactUsById = async (req, res) => {
    try {
        const result = await ContactusSchema.findById(req.params.id);
        if (!result) {
            res.status(404).json({ message: "Contact Us information not found" });
        } else {
            res.json({ data: result });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};