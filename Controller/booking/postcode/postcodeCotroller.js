const InstructorsUserSchema = require("../../../model/user/Instructor");
const PostcodeSearch = require("../../../model/postcode/PostcodeSearchSchema");

exports.validateUKPostcode = (req, res) => {
    let postcode = req.query.postcode;
    postcode = postcode.replace(/\s+/g, '').toUpperCase();
    const regexPattern = /^([Gg][Ii][Rr] ?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) ?[0-9][A-Za-z]{2})$/;

    if (!regexPattern.test(postcode)) {
        return res.status(400).json({ valid: false, message: 'Invalid UK postcode.' });
    }

    const filter = {
        "areas": {$regex: new RegExp("^" + postcode.substring(0, 3), "i")}
    };

    InstructorsUserSchema.find(filter)
        .then(async result => {
            const searchType = result.length === 0 ? 'postcodeNotExisting' : 'postcodeExisting';
            const documentId = "65a173b412374a1d2241edf0";

            // First, try to increment the searchCount if the postcode exists
            const updateResult = await PostcodeSearch.updateOne(
                { _id: documentId, [`${searchType}.name`]: postcode },
                { $inc: { [`${searchType}.$[elem].searchCount`]: 1 } },
                { arrayFilters: [{ "elem.name": postcode }] }
            );

            // If the postcode was not in the array and no document was updated, add it
            if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
                await PostcodeSearch.updateOne(
                    { _id: documentId },
                    { $push: { [searchType]: { name: postcode, searchCount: 1 } } }
                );
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'No trainers found. Please try another PostCode, such as NN2 8FW' });
            } else {
                return res.status(204).send();
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while processing your request.' });
        });
};

