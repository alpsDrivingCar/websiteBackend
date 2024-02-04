const AboutusSchema = require("../../model/setting/aboutusSchema");

exports.createAboutus = async (req, res) => {
    try {
        const aboutusSchema = new AboutusSchema(req.body);
        const result = await aboutusSchema.save();
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};


exports.aboutus = async (req, res) => {
    try {
        const result = await AboutusSchema.find();

        // Check if the result array is empty
        if (result.length === 0) {
            res.json({ message: "No records found" });
        } else {
            res.json({ data: result });
        }
    } catch (err) {
        // Handle errors and respond with an error message and status code
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};

exports.aboutusUpdate = async (req, res) => {
    try {
        const result = await AboutusSchema.findByIdAndUpdate("6591bc7ea8030987c14d38d0", req.body, { new: true });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};

exports.deleteAboutus = async (req, res) => {
    try {
        await AboutusSchema.findByIdAndDelete(req.params.id);
        res.status(200).send("About us entry deleted successfully.");
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};

exports.getAboutById = async (req, res) => {
    try {
        const id = req.params.id; // Extract the ID from the request parameters
        const result = await AboutusSchema.findById(id); // Find the document by ID

        if (!result) {
            // If no document is found, respond with a 404 not found message
            res.status(404).json({ message: "About Us information not found" });
        } else {
            // If a document is found, return it
            res.json(result);
        }
    } catch (err) {
        // If there's an error (e.g., invalid ID format), respond with a 500 internal server error
        res.status(500).json({ error: "Internal server error" });
        console.error(err);
    }
};
