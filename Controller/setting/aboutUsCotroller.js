const AboutusSchema = require("../../model/setting/aboutusSchema");
const {body, validationResult} = require('express-validator');

exports.createAboutus = async (req, res) => {
    const aboutusSchema = new AboutusSchema(req.body);

    const errors = await handleValidator(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({errors: errorMessages[0]});
    }

    console.log(req.body);
    aboutusSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

async function handleValidator(req) {
    const validationChecks = [
        body('description').notEmpty().withMessage('description Name is required'),
        body('image').notEmpty().withMessage('image Name is required'),
        body('title').notEmpty().withMessage('title Name is required'),
    ];

    for (const validationCheck of validationChecks) {
        await validationCheck.run(req);
    }

    const errors = validationResult(req);
    return errors;
}

exports.aboutus = (req, res) => {

    AboutusSchema.findById("64e648c09e3a26ecf93d9651")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.aboutusUpdate = (req, res) => {
    AboutusSchema.findByIdAndUpdate("64b26a3bfeb691283105b1be").updateOne(req.body)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteAboutus = (req, res) => {
    AboutusSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
