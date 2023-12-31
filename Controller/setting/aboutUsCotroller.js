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
        const result = await AboutusSchema.findById("6591bc7ea8030987c14d38d0");
        res.json(result);
    } catch (err) {
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
