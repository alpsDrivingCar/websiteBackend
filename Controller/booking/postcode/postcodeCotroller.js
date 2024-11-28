const InstructorsUserSchema = require("../../../model/user/Instructor");
const PostcodeSearch = require("../../../model/postcode/PostcodeSearchSchema");
const PackageSchema = require("../../../model/booking/package/packageSchema");

exports.validateUKPostcode = async (req, res) => {
    try {
        let postcode = req.query.postcode;
        postcode = postcode.replace(/\s+/g, '').toUpperCase();

        // Check for booking packages first
        const hasPackages = await fetchBookingPackages(postcode);
        if (!hasPackages) {
            await trackPostcodeSearch(postcode, false);
            return res.status(404).json({ message: 'No trainers found. Please try another PostCode, such as NN2 8FW.' });
        }

        const regexPattern = /^([Gg][Ii][Rr] ?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) ?[0-9][A-Za-z]{2})$/;
        if (!regexPattern.test(postcode)) {
            return res.status(400).json({ valid: false, message: 'Invalid UK postcode.' });
        }

        const areaLength = determinePostcodeAreaLength(postcode);
        const areaRegex = new RegExp("^" + postcode.substring(0, areaLength), "i");

        const filter = {
            "areas": { $regex: areaRegex },
            "AcceptStudent": true,
            "status": "active"
        };

        const result = await InstructorsUserSchema.find(filter);
        await trackPostcodeSearch(postcode, result.length > 0);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No trainers found. Please try another PostCode, such as NN2 8FW' });
        } else {
            return res.status(204).send();
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};

// Helper function to track postcode searches
async function trackPostcodeSearch(postcode, exists) {
    const documentId = "65a173b412374a1d2241edf0";
    const searchType = exists ? 'postcodeExisting' : 'postcodeNotExisting';
    const areaLength = determinePostcodeAreaLength(postcode);
    const regexPostcode = new RegExp(`^${postcode.slice(0, areaLength)}`, 'i');
    const cleanPostcode = regexPostcode.source.replace(/^(\^|\$)/g, '').toUpperCase();
    // Try to increment the searchCount if the postcode exists
    const updateResult = await PostcodeSearch.updateOne(
        { _id: documentId, [`${searchType}.name`]: cleanPostcode },
        { $inc: { [`${searchType}.$[elem].searchCount`]: 1 } },
        { arrayFilters: [{ "elem.name": cleanPostcode }] }
    );

    // If the postcode was not in the array and no document was updated, add it
    if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
        await PostcodeSearch.updateOne(
            { _id: documentId },
            { $push: { [searchType]: { name: cleanPostcode, searchCount: 1 } } }
        );
    }
}

const determinePostcodeAreaLength = (postcode) => {
    switch (postcode.length) {
        case 5:
            return 2;
        case 6:
            return 3;
        case 7:
            return 4;
        default:
            return 3; // Default value, can be adjusted as needed
    }
};


const fetchBookingPackages = async (postcode) => {
    const areaLength = determinePostcodeAreaLength(postcode);
    const regexPostcode = new RegExp(`^${postcode.slice(0, areaLength)}`, 'i');

    console.log("regexPostcode = " + regexPostcode);

    const packages = await PackageSchema.find({
        "postCode.postCode": regexPostcode,
    });

    return packages.length > 0;
};

exports.getPostCodeAndGearboxOfOurInstructors = (req, res) => {
    InstructorsUserSchema.find({ isPotential: false }, 'areas -_id')
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

exports.getTopSearchedPostcodes = async (req, res) => {
    try {
        const postcodeDoc = await PostcodeSearch.findOne();
        if (!postcodeDoc) {
            return res.status(404).json({
                success: false,
                message: 'No postcode data found'
            });
        }

        // Map and sort existing postcodes
        const existingPostcodes = postcodeDoc.postcodeExisting
            .map(p => ({
                postcode: p.name,
                searchCount: p.searchCount,
                exists: true
            }))
            .sort((a, b) => b.searchCount - a.searchCount);

        // Map and sort non-existing postcodes
        const nonExistingPostcodes = postcodeDoc.postcodeNotExisting
            .map(p => ({
                postcode: p.name,
                searchCount: p.searchCount,
                exists: false
            }))
            .sort((a, b) => b.searchCount - a.searchCount);

        return res.status(200).json({
            success: true,
            data: {
                existing: existingPostcodes,
                nonExisting: nonExistingPostcodes
            }
        });
    } catch (error) {
        console.error('Error fetching top searched postcodes:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


