const TestBookingSchema = require("../../../model/booking/testBooking/testBookingSchema");
const path = require('path'); // To help with path resolution.
const fs = require('fs'); // To check file existence.


exports.createTestBooking = (req, res) => {
    const testBookingSchema = new TestBookingSchema(req.body);

    console.log(req.body);
    testBookingSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });
}

exports.testBookings = (req, res) => {
    const filePath = path.join(__dirname, '../../../Controller/booking/testBooking/termsConditionsTest.html');

    // Log the full path you're trying to send.
    console.log("Attempting to serve file from:", filePath);

    // Check if the file exists.
    if (fs.existsSync(filePath)) {
        console.log("File exists!");
        return res.sendFile(filePath);
    } else {
        console.log("File does NOT exist!");
        return res.status(404).send('File not found.');
    }
}

exports.testBookingByInstructors = (req, res) => {
    // result =   object  inside mongo database
    // TestBookingSchema.findById(req.params.id)
    console.log(req.query)

    TestBookingSchema.findById("64cd116d18343dcb8ce98a1d")
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.testBookingUpdate = (req, res) => {
    // result =   object  inside mongo database
    TestBookingSchema.findByIdAndUpdate(req.params.id).updateOne(req.body)
        .then((result) => {
            res.send("Update " + result)
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteTestBooking = (req, res) => {
    TestBookingSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}
