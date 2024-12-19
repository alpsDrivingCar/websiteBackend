const JoinusSchema = require("../../model/setting/joinusSchema");
const {body, validationResult} = require('express-validator');
const NotificationCreator = require("../notification/notificationCreator");

exports.createJoinus = async (req, res) => {
    const errors = await handleValidator(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages[0] });
    }

    const joinusSchema = new JoinusSchema(req.body);

    joinusSchema.save()
        .then(async result => {
            // Create notification after saving joinus
            try {
                await NotificationCreator.createWebsiteAdminNotification(req.body.name, "Joinus", result._id, "joinus");
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

exports.joinus = (req, res) => {
    JoinusSchema.find()
        .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (newest to oldest)
        .then((result) => {
            res.json({ data: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while fetching join us data' });
        });
};

exports.joinusById = (req, res) => {
    const id = req.params.id; // Get the ID from request parameters

    JoinusSchema.findById(id)
        .then((result) => {
            if (!result) {
                return res.status(404).json({ error: 'Join us data not found' }); // If no document found with the given ID
            }
            res.json({ data: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while fetching join us data' });
        });
};

exports.joinusUpdate = (req, res) => {
    JoinusSchema.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((result) => {
            if (!result) {
                return res.status(404).json({ error: 'Join us data not found' });
            }
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while updating join us data' });
        });
}

exports.deleteJoinus = (req, res) => {
    JoinusSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
