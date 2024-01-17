const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const mongoose = require("mongoose");


// In website after booking
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Update status
        const updatedCheckoutInfo = await updateStatusById(id, status);

        // Fire external API after successful update
        const apiResponse = await fireExternalAPI(updatedCheckoutInfo);
        console.log("apiResponse.pupil.id = " + apiResponse.pupil._id)

        const lessonEventData = {
            "startTime": "12:30 AM",
            "instructorId": updatedCheckoutInfo.orderInfo.instructorsId.toString(), // Convert ObjectId to string
            "pupilId": apiResponse.pupil._id,
            "durationMinutes": "60", // Duration of the lesson in minutes
            "durationHours": "2", // Duration of the lesson in hours
            "gearbox":"automatic", // Type of gearbox, e.g., automatic or manual
            "lessonType": updatedCheckoutInfo.orderInfo.typeOfLesson, // Type of lesson, e.g., regular, intensive
            "pickUpLocation": "home", // Pickup location
            "dropOffLocation": "home", // Drop-off location
            "date": "1/18/2024, 12:00:00 AM" // Date and time of the lesson
        };

        console.log('Start Time:', lessonEventData.startTime);
        console.log('Instructor ID:', lessonEventData.instructorId);
        console.log('Pupil ID:', lessonEventData.pupilId);
        console.log('Duration Minutes:', lessonEventData.durationMinutes);
        console.log('Duration Hours:', lessonEventData.durationHours);
        console.log('Gearbox:', lessonEventData.gearbox);
        console.log('Lesson Type:', lessonEventData.lessonType);
        console.log('Pickup Location:', lessonEventData.pickUpLocation);
        console.log('Drop-off Location:', lessonEventData.dropOffLocation);
        console.log('Date:', lessonEventData.date);

        const addLessonEvent1 = addLessonEvent(lessonEventData)
            
        res.json({
            message: "Order status updated successfully!",
            data: updatedCheckoutInfo,
            apiResponse: apiResponse, // Include the external API response
            addLessonEvent: addLessonEvent1 // Include the external API response
        });
    } catch (error) {
        // Error handling
        console.log("error.message " + error.message )
        if (['Invalid ID format', 'Invalid status value', 'Checkout info not found'].includes(error.message)) {
            return res.status(400).json({ error: error.message });
        } else {
            return res.status(500).json({ error: "An error occurred on the server. = " + error  });
        }
    }
};

const axios = require('axios');

async function addLessonEvent(eventData) {
    try {
        const apiUrl = 'https://alps-driving-car.herokuapp.com/api/diary/lesson-event';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDEzNjZmYWNjM2FkNmRlNDU4ZDFjMzAiLCJmaXJzdE5hbWUiOiJtb2hhbW1lZDEiLCJsYXN0TmFtZSI6Im1hbnNvdXIxIiwiZW1haWwiOiJtb2hhbW1lZC5tYW5zb3VyNDAwOUBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRibHh1TndQa05UYmxqL0wxUVM1ZnouQXZwU1EvUk93VEpyaC9qVmRJalI2dGp2b2xScVN5TyIsInBob25lTnVtYmVyIjoiMDc4ODEyMjYwOCIsImlzQWRtaW4iOnRydWUsImlzU3VwZXJ2aXNvciI6ZmFsc2UsImlzSW5zdHJ1Y3RvciI6ZmFsc2UsInJvbGVzIjpbInN1cGVydmlzb3IiXSwiY3JlYXRlZEF0IjoiMjAyMy0wMy0xNlQxODo1OTowNi41MDFaIiwidXBkYXRlZEF0IjoiMjAyNC0wMS0xNlQxNzowMzoxOS4yNzFaIiwiX192IjowLCJwZGZBZG1pbiI6W10sImRlc2NyaXB0aW9uIjoiQmFheiBpcyB0aGUgZmlyc3QgQXJhYmljIHNvY2lhbCBtZWRpYSBwbGF0Zm9ybSB0aGF0IHByb3ZpZGVzIGNvbW11bml0aWVzIGZvciB1c2VycyB0byBjb25uZWN0IHdpdGggb3RoZXJzIHdobyBzaGFyZSBzaW1pbGFyIGludGVyZXN0cywgaG9iYmllcyBhbmQgcGFzc2lvbnMuZWVlZmRcbiIsInByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvYWxwcy0xZjYwNi5hcHBzcG90LmNvbS9vL3N1cGVydmlzb3IlMkYxNzA0NTYyODI1MTk1Y3JvcHBlZC1pbWFnZS5qcGc_YWx0PW1lZGlhJnRva2VuPTBhYjg3ZTc1LWQxOTMtNGQyOS04NDI1LWU1NTZmYjc2MjE0YiIsImlhdCI6MTcwNTUxMTcyMywiZXhwIjoxNzA1NTk4MTIzfQ.Pi9CxSzD2YI4Y9tgTeVd482B-RM_xRtO5nOOIxUqVLs'
        };

        const response = await axios.post(apiUrl, eventData, { headers });

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`API responded with status code ${response.status}`);
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            console.log("error 33 " + error.message)
            console.log("error 33 " + error)
            const errMsg = error.response.data.message || error.response.statusText || error.message ;
            throw new Error(`API Error: ${errMsg}`);
        } else if (error.request) {
            throw new Error('API did not respond');
        } else {
            throw new Error('Error in setting up the API request');
        }
    }
}


async function fireExternalAPI(updatedCheckoutInfo) {
    try {
        const apiUrl = 'https://alps-driving-car.herokuapp.com/api/pupil/create';
        const payload = {
            "firstName": updatedCheckoutInfo.studentInfo.name,
            "lastName": updatedCheckoutInfo.studentInfo.name,
            "phoneNumber": updatedCheckoutInfo.studentInfo.phoneNumber,
            "email": updatedCheckoutInfo.studentInfo.email,
            "instructors":  updatedCheckoutInfo.orderInfo.instructorsId,
            "snedLoginDetails": true
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDEzNjZmYWNjM2FkNmRlNDU4ZDFjMzAiLCJmaXJzdE5hbWUiOiJtb2hhbW1lZDEiLCJsYXN0TmFtZSI6Im1hbnNvdXIxIiwiZW1haWwiOiJtb2hhbW1lZC5tYW5zb3VyNDAwOUBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRibHh1TndQa05UYmxqL0wxUVM1ZnouQXZwU1EvUk93VEpyaC9qVmRJalI2dGp2b2xScVN5TyIsInBob25lTnVtYmVyIjoiMDc4ODEyMjYwOCIsImlzQWRtaW4iOnRydWUsImlzU3VwZXJ2aXNvciI6ZmFsc2UsImlzSW5zdHJ1Y3RvciI6ZmFsc2UsInJvbGVzIjpbInN1cGVydmlzb3IiXSwiY3JlYXRlZEF0IjoiMjAyMy0wMy0xNlQxODo1OTowNi41MDFaIiwidXBkYXRlZEF0IjoiMjAyNC0wMS0xNlQxNzowMzoxOS4yNzFaIiwiX192IjowLCJwZGZBZG1pbiI6W10sImRlc2NyaXB0aW9uIjoiQmFheiBpcyB0aGUgZmlyc3QgQXJhYmljIHNvY2lhbCBtZWRpYSBwbGF0Zm9ybSB0aGF0IHByb3ZpZGVzIGNvbW11bml0aWVzIGZvciB1c2VycyB0byBjb25uZWN0IHdpdGggb3RoZXJzIHdobyBzaGFyZSBzaW1pbGFyIGludGVyZXN0cywgaG9iYmllcyBhbmQgcGFzc2lvbnMuZWVlZmRcbiIsInByb2ZpbGVJbWFnZSI6Imh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvYWxwcy0xZjYwNi5hcHBzcG90LmNvbS9vL3N1cGVydmlzb3IlMkYxNzA0NTYyODI1MTk1Y3JvcHBlZC1pbWFnZS5qcGc_YWx0PW1lZGlhJnRva2VuPTBhYjg3ZTc1LWQxOTMtNGQyOS04NDI1LWU1NTZmYjc2MjE0YiIsImlhdCI6MTcwNTUxMTcyMywiZXhwIjoxNzA1NTk4MTIzfQ.Pi9CxSzD2YI4Y9tgTeVd482B-RM_xRtO5nOOIxUqVLs'
        };

        console.log("payload" + " firstName = " + payload.firstName + ", lastName= " +payload.lastName + " ,phoneNumber=" + payload.phoneNumber + ", email="+ payload.email + ", instructorsid=" + payload.instructors)
        const response = await axios.post(apiUrl, payload, { headers });

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
    // Validation
    if (!mongoose.isValidObjectId(id)) {
        throw new Error('Invalid ID format');
    }

    const validStatuses = ['pending', 'success', 'failure'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
    }

    // Update operation
    const updatedCheckoutInfo = await CheckoutInfo.findByIdAndUpdate(
        id,
        { 'orderInfo.status': status },
        { new: true }
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
        const { saveStatus, changedSaveStatusBy } = req.body;

        // Validate the new save status
        if (!['un-save', 'save', 'in-progress'].includes(saveStatus)) {
            return res.status(400).json({ error: 'Invalid save status' });
        }

        // Check if changedSaveStatusBy is provided and not empty
        if (!changedSaveStatusBy || changedSaveStatusBy.trim() === '') {
            return res.status(400).json({ error: 'changedSaveStatusBy is required' });
        }

        // Update the document
        const updatedCheckoutInfo = await CheckoutInfo.findByIdAndUpdate(
            checkoutInfoId,
            { $set: { saveStatus, changedSaveStatusBy } },
            { new: true } // return the updated document
        );

        if (!updatedCheckoutInfo) {
            return res.status(404).json({ error: 'CheckoutInfo not found' });
        }

        res.json({ data: updatedCheckoutInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};