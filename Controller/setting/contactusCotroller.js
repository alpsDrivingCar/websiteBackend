const ContactusSchema = require("../../model/setting/contactusSchema");
const {body, validationResult} = require('express-validator');

exports.createContactus = async (req, res) => {
    const contactusSchema = new ContactusSchema(req.body);

    const errors = await handleValidator(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({errors: errorMessages[0]});
    }

    console.log(req.body);
    contactusSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

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
exports.contactuss = (req, res) => {
    // result =   object  inside mongo database
    // ContactusSchema.findById(req.params.id)
    ContactusSchema.find()
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.contactusUpdate = (req, res) => {
    // result =   object  inside mongo database
    ContactusSchema.findByIdAndUpdate("6489c7239bdfd1bbc0d33afc").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteContactus = (req, res) => {
    ContactusSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.getAllContactUs = async (req, res) => {
    try {
        const results = await ContactusSchema.find();
        if (results.length === 0) {
            res.json({ data: [] });
        } else {
            res.json({ data: results });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};

exports.getContactUsById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await ContactusSchema.findById(id);

        if (!result) {
            res.status(404).json({ message: "Contact Us information not found" });
        } else {
            res.json({data: result});
        }
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};