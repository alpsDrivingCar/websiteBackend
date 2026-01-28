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
exports.allFranchise = async (req, res) => {
    try {
        const results = await FranchiseSchema.find()
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}


exports.getById = async (req, res) => {
    try {
        const result = await FranchiseSchema.findById(req.params.id);
        if (!result) {
            res.status(404).json({ error: 'Document not found' });
        } else {
            res.json(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.franchiseUpdate = (req, res) => {
    const id = req.params.id;
    FranchiseSchema.findByIdAndUpdate(id, req.body, { new: true })
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Franchise request not found" });
            }
            res.json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "An error occurred during the update" });
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
