const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");

exports.getBookingDetails = async (req, res) => {
    try {
        const { pupilId } = req.query;

        if (!mongoose.isValidObjectId(pupilId)) {
            return res.status(400).json({ error: "Invalid pupil ID" });
        }

        const checkoutInfoData = await CheckoutInfo.find({
            'studentInfo.pupilId': pupilId
        }).populate('orderInfo.instructorsId').exec();

        if (checkoutInfoData.length === 0) {
            return res.status(404).json({ message: "No booking details found" });
        }

        let allLessons = [];
        let instructorsMap = new Map();
        let totalPrice = 0; // Initialize total price

        checkoutInfoData.forEach(info => {
            const instructorId = info.orderInfo.instructorsId._id.toString();
            const instructorName = `${info.orderInfo.instructorsId.firstName} ${info.orderInfo.instructorsId.lastName}`;
            const instructorInitials = getInitials(info.orderInfo.instructorsId.firstName, info.orderInfo.instructorsId.lastName); // Ensure this function exists

            if (!instructorsMap.has(instructorId)) {
                instructorsMap.set(instructorId, {
                    name: instructorName,
                    id: instructorId,
                    initials: instructorInitials
                });
            }

            info.orderInfo.items.forEach((item, index) => {
                // Assuming each item's availableHours is an array of [startTime, endTime] pairs
                item.availableHours.forEach((hours, hoursIndex) => {
                    const startTime = new Date(hours[0]);
                    const endTime = new Date(hours[1]);

                    allLessons.push({
                        lessonNumber: `Lesson ${index + 1}.${hoursIndex + 1}`, // Adjusted to account for multiple slots per item
                        reservationCode: info.orderInfo.reservationCode,
                        bookingDate: startTime.toLocaleDateString(),
                        bookingTime: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
                        price: info.orderInfo.price,
                        status: mapStatus(info.orderInfo.status), // Assuming mapStatus function exists and works as expected
                        instructor_name: instructorName // Assuming instructorName is defined elsewhere
                    });
                });
            });

            // Sum up the prices from each CheckoutInfo entry
            totalPrice += info.orderInfo.price;
        });

        let instructorsArray = Array.from(instructorsMap.values());

        // Include the total price for all bookings
        const bookingDetails = {
            numberOfLessons: `${allLessons.length} Lessons`,
            testBooking: checkoutInfoData.some(info => info.orderInfo.testBooking === 'book') ? 'Yes' : 'No',
            postCode: checkoutInfoData[0].orderInfo.postCode, // Assuming consistency; adjust as needed
            totalPrice, // Total price from all CheckoutInfo entries
            instructors: instructorsArray,
            lessons: allLessons
        };

        res.json({ bookingDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching booking details" });
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