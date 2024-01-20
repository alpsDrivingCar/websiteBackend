const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const mongoose = require("mongoose");
const axios = require('axios');

// In website after booking
exports.updateOrderStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        // Update status
        const updatedCheckoutInfo = await updateStatusById(id, status);
        const token = await getAuthToken();

        const apiResponse = await fireExternalAPI(updatedCheckoutInfo,token);
        const pupilId = apiResponse.pupil._id;
        // const pupilId = "";
        const addLessonEvent1 = await processAvailableHours(updatedCheckoutInfo, pupilId,token);
        res.json({
            message: "Order status updated successfully!",
            data: updatedCheckoutInfo,
            // apiResponse: apiResponse, // Include the external API response
            addLessonEvent: addLessonEvent1 // Include the external API response
        });
    } catch (error) {
        // Error handling
        console.log("error.message " + error.message)
        if (['Invalid ID format', 'Invalid status value', 'Checkout info not found'].includes(error.message)) {
            return res.status(400).json({error: error.message});
        } else {
            return res.status(404).json({error: "An error occurred on the server. = " + error});
        }
    }
};

async function processAvailableHours(updatedCheckoutInfo, pupilId,token) {
    const availableHours = updatedCheckoutInfo.orderInfo.items[0].availableHours;
    let results = []; // Array to store results

    for (const time of availableHours) {
        console.log("Original Time = " + time);
        const formattedStartTime = convertToSimpleTimeFormat(time); // Ensure formatTime is defined
        console.log("Formatted Start Time = " + formattedStartTime );
        console.log("Formatted Start Time = " + "3:00 AM");
        const formattedDateTime = convertDateToReadableFormat(time);
        // console.log("Formatted Start Time = " + formattedDateTime);


        // Call addLessonEvent for each time and store the result
        const result = await addLessonEvent(updatedCheckoutInfo, pupilId, formattedDateTime, formattedStartTime,token);
        results.push(result); // Add result to the array
    }

    return results; // Return the array of results
}


async function addLessonEvent(updatedCheckoutInfo, pupilId, time, startTime,Token) {
    const typeOfGearbox = updatedCheckoutInfo.orderInfo.typeOfGearbox.toLowerCase()
    try {

        const lessonEventData = {
            // "startTime": startTime.toString(),
            "startTime": "3:00 AM",
            "instructorId": updatedCheckoutInfo.orderInfo.instructorsId.toString(), // Convert ObjectId to string
            "pupilId": pupilId,
            // "pupilId": "65a98b7422778b555b38b105",
            "durationMinutes": "60", // Duration of the lesson in minutes
            "durationHours": "2", // Duration of the lesson in hours
            "gearbox": typeOfGearbox, // Type of gearbox, e.g., automatic or manual
            "lessonType": updatedCheckoutInfo.orderInfo.typeOfLesson, // Type of lesson, e.g., regular, intensive
            "pickUpLocation": "home", // Pickup location
            "dropOffLocation": "home", // Drop-off location
            "date": time // Date and time of the lesson
        };

        const apiUrl = 'https://alps-driving-car.herokuapp.com/api/diary/lesson-event';
        console.log("token" + token)
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };

        const response = await axios.post(apiUrl, lessonEventData, {headers});

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`API responded with status code ${response.status}`);
        }

        return response.data;
    } catch (error) {
        const errMsg = error.response.data.message || error.response.statusText || error.message;
        throw new Error(`Add Lesson API Error: ${errMsg}`);
    }
}


async function fireExternalAPI(updatedCheckoutInfo,token) {
    try {
        const apiUrl = 'https://alps-driving-car.herokuapp.com/api/pupil/create';
        const payload = {
            "firstName": updatedCheckoutInfo.studentInfo.name,
            "lastName": updatedCheckoutInfo.studentInfo.name,
            "phoneNumber": updatedCheckoutInfo.studentInfo.phoneNumber,
            "email": updatedCheckoutInfo.studentInfo.email,
            "instructors": updatedCheckoutInfo.orderInfo.instructorsId,
            "snedLoginDetails": true
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };

        console.log("payload" + " firstName = " + payload.firstName + ", lastName= " + payload.lastName + " ,phoneNumber=" + payload.phoneNumber + ", email=" + payload.email + ", instructorsid=" + payload.instructors)
        const response = await axios.post(apiUrl, payload, {headers});

        // Check if the response status is not in the 2xx range
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`API responded with status code ${response.status}`);
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx or specific error message
            const errMsg = error.response.data.msg || error.response.statusText;
            throw new Error(`API Error: ${errMsg}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('API did not respond');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('Error in setting up the API request');
        }
    }
}

async function updateStatusById(id, status) {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error('Invalid ID format');
    }

    const validStatuses = ['pending', 'success', 'failure'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
    }

    const updatedCheckoutInfo = await CheckoutInfo.findByIdAndUpdate(
        id,
        {'orderInfo.status': status},
        {new: true}
    ).exec();

    if (!updatedCheckoutInfo) {
        throw new Error('Checkout info not found');
    }

    return updatedCheckoutInfo;
}


/// IN DASHBORD
// //////////todo test 
exports.updateSaveStatusAndChangedBy = async (req, res) => {
    try {
        const checkoutInfoId = req.params.id;
        const {saveStatus, changedSaveStatusBy} = req.body;

        // Validate the new save status
        if (!['un-save', 'save', 'in-progress'].includes(saveStatus)) {
            return res.status(400).json({error: 'Invalid save status'});
        }

        // Check if changedSaveStatusBy is provided and not empty
        if (!changedSaveStatusBy || changedSaveStatusBy.trim() === '') {
            return res.status(400).json({error: 'changedSaveStatusBy is required'});
        }

        // Update the document
        const updatedCheckoutInfo = await CheckoutInfo.findByIdAndUpdate(
            checkoutInfoId,
            {$set: {saveStatus, changedSaveStatusBy}},
            {new: true} // return the updated document
        );

        if (!updatedCheckoutInfo) {
            return res.status(404).json({error: 'CheckoutInfo not found'});
        }

        res.json({data: updatedCheckoutInfo});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'An unexpected error occurred.'});
    }
};

function convertToSimpleTimeFormat(isoDateString) {
    const date = new Date(isoDateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function convertDateToReadableFormat(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

async function getAuthToken() {
    try {
        // Static login credentials
        const loginIdentifier = "ammmar40009@gmail.com";
        const password = "D5aAppfzp";

        // API endpoint
        const url = 'https://alps-driving-car.herokuapp.com/api/auth/login';

        // Making the POST request to the API
        const response = await axios.post(url, {
            loginIdentifier,
            password
        });

        // console.log("token" + response.data.user.token)
        // Extracting the token from the response
        if (response.data && response.data.user && response.data.user.token) {
            return response.data.user.token;
        } else {
            throw new Error('Token not found in the response');
        }
    } catch (error) {
        console.error('Error fetching auth token:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


