const InstructorsUserSchema = require("../../../model/user/Instructor");
const PostcodeSearch = require("../../../model/postcode/PostcodeSearchSchema");
const PackageSchema = require("../../../model/booking/package/packageSchema");

exports.validateUKPostcode = async (req, res)  => {
    let postcode = req.query.postcode;
    postcode = postcode.replace(/\s+/g, '').toUpperCase();

    // Check for booking packages first
    const hasPackages = await fetchBookingPackages(postcode);
    if (!hasPackages) {
        return res.status(404).json({ message: 'No trainers found. Please try another PostCode, such as NN2 8FW.' });
    }

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

const fetchBookingPackages = async (postcode) => {
    // Adjust the regex to be even more inclusive if needed, or keep it targeted to the first 3 characters
    const regexPostcode = new RegExp(`^${postcode.slice(0, 3)}`, 'i');

    console.log("regexPostcode = " + regexPostcode);

    const packages = await PackageSchema.find({
        "postCode.postCode": regexPostcode,
    });

    return packages.length > 0;
};

exports.getPostCodeAndGearboxOfOurInstructors = (req, res) => {
    InstructorsUserSchema.find({ AcceptStudent: true, isPotential: false }, 'areas -_id')
        .then((results) => {
            // Extract the areas from the results, flatten the array, convert all to uppercase, and trim spaces to ensure uniqueness
            const allPostCodes = results.map(result => result.areas.map(area => area.toUpperCase().trim())).flat();
            // Remove duplicates by converting the array to a Set, then spread it back into an array
            const uniquePostCodes = [...new Set(allPostCodes)];
            // Assume gearbox types are predetermined
            const gearbox = ["Manual", "Automatic", "Electric"];
            // Structure the response under a `data` key
            res.status(200).json({
                data: {
                    postCode: uniquePostCodes,
                    gearbox
                }
            });
        })
        .catch((error) => {
            // Handle any errors that occur during the query
            res.status(500).json({ error: error.message });
        });
};


