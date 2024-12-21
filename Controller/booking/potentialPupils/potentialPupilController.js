const PotentialPupil = require("../../../model/booking/potentialPupils/potentialPupil");

exports.storePotentialPupil = async (req, res) => {
    try {
        const potentialPupil = new PotentialPupil(req.body);
        await potentialPupil.save();
        res.status(201).send(potentialPupil);
    } catch (error) {
        console.error('Error storing potential pupil:', error);
        res.status(400).json({
            message: 'Failed to store potential pupil',
            error: error.message
        });
    }
}