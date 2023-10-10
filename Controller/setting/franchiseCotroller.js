const FranchiseSchema = require("../../model/setting/franchiseSchema");
const {body, validationResult} = require('express-validator');

exports.createFranchise = async (req, res) => {
    const franchiseSchema = new FranchiseSchema(req.body);
    const errors = await handleValidator(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({errors: errorMessages[0]});
    }

    console.log(req.body);
    franchiseSchema.save()
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

exports.franchise = (req, res) => {

    FranchiseSchema.findById("64e648c09e3a26ecf93d9651")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

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
