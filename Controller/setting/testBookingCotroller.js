const TestBookingInfo = require("../../model/setting/testBooking/testBookingInfoSchema");

/// info 
exports.createTestBooking = async (req, res) => {
    const testBooking = new TestBookingInfo(req.body);
    try {
        const result = await testBooking.save();
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getAllTestBookings = (req, res) => {
    TestBookingInfo.find()
        .sort({ createdAt: 1 }) // Sort by creation date in ascending order
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}

exports.getTestBookingById = (req, res) => {
    TestBookingInfo.findById("665ad87bbbc4aaf8f4cbd195") // Use the extracted id to find the document
        .then((result) => {
            if (result) {
                res.json(result); // If document is found, send it as JSON response
            } else {
                res.status(404).json({ error: 'Document not found' }); // If document is not found, send 404 status with error message
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' }); // Handle other errors with 500 status and error message
        });
};

exports.updateTestBooking = (req, res) => {
    TestBookingInfo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}

exports.deleteTestBooking = (req, res) => {
    TestBookingInfo.findByIdAndDelete(req.params.id)
        .then((result) => {
            if (result) {
                res.json({ message: 'Test booking deleted successfully' });
            } else {
                res.status(404).json({ error: 'Document not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}


//// request 

const TestBookingRequest = require("../../model/setting/testBooking/testBookingRequestSchema");

exports.createTestBookingRequest = async (req, res) => {
    const testBookingRequest = new TestBookingRequest(req.body);
    try {
        const result = await testBookingRequest.save();
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getAllTestBookingRequests = (req, res) => {
    TestBookingRequest.find()
        .sort({ createdAt: -1 }) // Sort by creation date in ascending order
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}

exports.getTestBookingRequestById = (req, res) => {
    const { id } = req.params;
    TestBookingRequest.findById(id)
        .then((result) => {
            if (result) {
                res.json(result);
            } else {
                res.status(404).json({ error: 'Document not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};

exports.updateTestBookingRequest = (req, res) => {
    TestBookingRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}

exports.deleteTestBookingRequest = (req, res) => {
    TestBookingRequest.findByIdAndDelete(req.params.id)
        .then((result) => {
            if (result) {
                res.json({ message: 'Test booking request deleted successfully' });
            } else {
                res.status(404).json({ error: 'Document not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}