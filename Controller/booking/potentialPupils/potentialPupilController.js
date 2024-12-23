const PotentialPupil = require("../../../model/booking/potentialPupils/potentialPupil");


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
        
        // Check if pupil already exists with the same email
        const existingPupil = await PotentialPupil.findOne({ email: req.body.email });
        if (existingPupil) {
            return res.status(200).json({
                message: 'Potential pupil already exists',
                data: existingPupil
            });
        }

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