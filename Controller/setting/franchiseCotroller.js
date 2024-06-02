const FranchiseSchema = require("../../model/setting/franchiseSchema");
const {body, validationResult} = require('express-validator');
const NotificationCreator = require("../notification/notificationCreator");

exports.createFranchise = async (req, res) => {
    const errors = await handleValidator(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages[0] });
    }

    const franchiseSchema = new FranchiseSchema(req.body);
   
    franchiseSchema.save()
        .then(async result => {
            // Create notification after saving franchise
            try {
                await NotificationCreator.createWebsiteAdminNotification(req.body.name, "Franchise", result._id, "franchise");
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
        body('location').notEmpty().withMessage('Location Name is required'),
        body('name').notEmpty().withMessage('name name is required')
    ];

    for (const validationCheck of validationChecks) {
        await validationCheck.run(req);
    }

    const errors = validationResult(req);
    return errors;
}
exports.allFranchise = (req, res) => {
    FranchiseSchema.find()
        .sort({ createdAt: -1 })
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        })
}


exports.getById = (req, res) => {
    const { id } = req.params; // Extract the id from request parameters
    FranchiseSchema.findById(id) // Use the extracted id to find the document
        .then((result) => {
            if (result) {
                res.json(result); // If document is found, send it as JSON response
            } else {
                res.status(404).json({ error: 'Document not found' }); // If document is not found, send 404 status with error message
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle other errors with 500 status and error message
        });
};

exports.franchiseUpdate = (req, res) => {
    FranchiseSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteFranchise = (req, res) => {
    FranchiseSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
