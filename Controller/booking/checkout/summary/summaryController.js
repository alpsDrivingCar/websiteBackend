const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");

exports.getBookingDetails = async (req, res) => {
    try {
        // Extract instructorsId and pupilId from query parameters or request body
        const {instructorsId, pupilId} = req.query; // or req.body, depending on how you're sending data

        // Validate IDs
        if (!mongoose.isValidObjectId(instructorsId) || !mongoose.isValidObjectId(pupilId)) {
            return res.status(400).json({error: "Invalid instructor or pupil ID"});
        }

        // Perform the query to get booking details
        const checkoutInfoData = await CheckoutInfo.find({
            'orderInfo.instructorsId': instructorsId,
            'studentInfo.pupilId': pupilId
        }).populate('orderInfo.instructorsId')
            .populate('orderInfo.instructorsId')// Populate to get instructor details
            .exec();

        if (checkoutInfoData.length === 0) {
            return res.status(404).json({message: "No booking details found for the given instructor and pupil IDs"});
        }

        const bookingDetails = checkoutInfoData.map(info => {
            const lessons = info.orderInfo.items.map((item, index) => {
                return {
                    lessonNumber: `Lesson ${index + 1}`,
                    reservationCode: info.orderInfo.reservationCode,
                    bookingDate: new Date(item.availableHours[0]).toLocaleDateString(),
                    bookingTime: `${new Date(item.availableHours[0]).toLocaleTimeString()} - ${new Date(item.availableHours[1]).toLocaleTimeString()}`,
                    price: info.orderInfo.price,
                    status: mapStatus(info.orderInfo.status) // Assuming you have a function to map status
                };
            });

            return {
                numberOfLessons: `${lessons.length} Lessons`,
                testBooking: info.orderInfo.testBooking === 'book' ? 'Yes' : 'No',
                postCode: info.orderInfo.postCode,
                price: info.orderInfo.price,
                instructor: {
                    name: `${info.orderInfo.instructorsId.firstName} ${info.orderInfo.instructorsId.lastName}`,
                    initials: getInitials(info.orderInfo.instructorsId.firstName, info.orderInfo.instructorsId.lastName)
                },
                lessons: lessons
            };
        });

        // Send the mapped booking details as a response
        res.json({bookingDetails: bookingDetails[0]});

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "An error occurred while fetching booking details"});
    }
};


function getInitials(firstName, lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function mapStatus(status) {
    // Implement status mapping logic here
    // For example:
    switch (status) {
        case 'success':
            return 'Done';
        case 'pending':
            return 'Still';
        case 'failure':
            return 'Canceled';
        default:
            return 'Unknown';
    }
}