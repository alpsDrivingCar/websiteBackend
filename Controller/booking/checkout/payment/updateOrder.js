const CheckoutInfo = require("../../../../model/booking/checkout/payment/paymentSchema");
const PackageSchema = require("../../../../model/booking/package/packageSchema");
const PupilUserSchema = require("../../../../model/user/Pupil");
const mongoose = require("mongoose");
const axios = require('axios');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require("fs");
const NotificationCreator = require("../../../notification/notificationCreator");
const dotenv = require("dotenv");

dotenv.config(dotenv);


exports.updateOrderStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        // Update status
        var updateResult = await updateStatusById(id, status);
        const packageId = updateResult.checkoutInfo.orderInfo.items[0].packageId;

        if (updateResult.alreadyUpdated) {
            // If the order was already updated to "success", return a message indicating so
            return res.json({
                message: "Order status was already updated to success previously!",
                data: updateResult.checkoutInfo
            });
        }

        // Proceed with the rest of the logic if the update was actually performed
        const token = await getAuthToken();
        const apiResponse = await addPupilfireExternalAPI(updateResult.checkoutInfo, token);
        const pupilId = apiResponse.pupil._id;

        // Add updatePupilIdById here
        await addCreditToPupilAccount(pupilId, token, packageId);
        const updatedCheckoutInfo = await updatePupilIdById(id, pupilId); // Assuming id is the same as CheckoutInfo id
        const addLessonEvent1 = await processAvailableHours(updatedCheckoutInfo, pupilId, token);

        return res.json({
            message: "Order status updated successfully!",
            data: updatedCheckoutInfo,
            apiResponse: apiResponse, // Include the external API response
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
        const formattedStartTime = convertToSimpleTimeFormat(time); // Ensure formatTime is defined
        const formattedEndTime = addTwoHours(formattedStartTime); // Calculate endTime
        const formattedDateTime = convertDateToReadableFormat(time);
        // Call addLessonEvent for each time and store the result
        const result = await addLessonEvent(updatedCheckoutInfo, pupilId, formattedDateTime, formattedStartTime,formattedEndTime,token);
        results.push(result); // Add result to the array
    }

    return results; // Return the array of results
}

async function addCreditToPupilAccount(pupilId, token, packageId) {
    console.log('Starting addCreditToPupilAccount...');
    console.log('Inputs:', { pupilId, packageId });
    
    try {
        const apiUrl = `${process.env.DASHBOARD_URL}/api/lesson-payment/create`;
        console.log('API URL:', apiUrl);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        console.log('Headers prepared');

        const package = await getBookingPackageById(packageId);
        console.log('Retrieved package:', package);

        const payload = { 
            date: new Date().toISOString(),
            pupilId: pupilId,
            fee: package.priecBeforeSele - package.offerSaving || 0,
            method: "Card",
            privateNotes: "This payment has been credited to the pupil's account following a successful checkout on the website.",
            status: "Income",
            durationMinutes: package.numberHour * 60,
        };
        console.log('Preparing payload:', payload);

        const response = await axios.post(apiUrl, payload, { headers });
        console.log('API Response:', response.data);

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`API responded with status code ${response.status}`);
        }

        return response.data;

    } catch (error) {
        console.error('Error in addCreditToPupilAccount:', error);
        handleApiError(error);
    }
}

async function getBookingPackageById(id) {
    try {
        if (!mongoose.isValidObjectId(id)) {
            throw new Error('Invalid package ID format');
        }

        const result = await PackageSchema.findById(id);
        if (!result) {
            throw new Error('Package not found');
        }

        return result;
    } catch (error) {
        console.error('Error in getBookingPackageById:', error);
        throw error;
    }
}

async function addLessonEvent(updatedCheckoutInfo, pupilId, time, startTime,formattedEndTime,token) {
    const typeOfGearbox = updatedCheckoutInfo.orderInfo.typeOfGearbox.toLowerCase()
    try {

        // console.log(`startTime  ${startTime}`);
        // console.log(`instructorId  ${updatedCheckoutInfo.orderInfo.instructorsId.toString()}`);
        // console.log(`pupilId  ${pupilId}`);
        // console.log(`gearbox  ${typeOfGearbox}`);
        // console.log(`lessonType Web site lessons/661f96868ef5f48b31d1a241 `);
        // console.log(`date  ${time}`);
        // console.log(`endTime  ${formattedEndTime}`);
        const lessonEventData = {
            "startTime": startTime,
            "instructorId": updatedCheckoutInfo.orderInfo.instructorsId.toString(), // Convert ObjectId to string
            "pupilId": pupilId,
            "durationMinutes": "120", // Duration of the lesson in minutes
            "durationHours": "2", // Duration of the lesson in hours
            "gearbox": typeOfGearbox, // Type of gearbox, e.g., automatic or manual
            "lessonType": updatedCheckoutInfo.orderInfo.typeOfLesson, // Type of lesson, e.g., regular, intensive
            "pickUpLocation": "home", // Pickup location
            "dropOffLocation": "home", // Drop-off location
            "date": time, // Date and time of the lesson,
            "endTime": formattedEndTime,
           "lessonType": "Web site lessons/661f96868ef5f48b31d1a241"

        };


        console.log(`lessonEventData.startTime ${lessonEventData.startTime}`)
        console.log(`startTime ${startTime}`)

        if(lessonEventData.startTime ==startTime )
            console.log(`====`)

        const apiUrl = `${process.env.DASHBOARD_URL}/api/diary/lesson-event`;
        console.log("token" + token)
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };

        const response = await axios.post(apiUrl, lessonEventData, {headers});

        if (response.status < 200 || response.status >= 300) {
            throw new Error(`API responded with status code ${response.status} ${response.message}`);
        }

        return response.data;
    } catch (error) {
        const errMsg = error.message;
        console.log(`error ${error}`);
        throw new Error(`Add Lesson API Error: ${errMsg}`);
    }
}


async function addPupilfireExternalAPI(updatedCheckoutInfo, token) {
    try {
        // Check if the pupil exists by email or phone number
        const existingPupil = await PupilUserSchema.findOne({
            $or: [
                { email: updatedCheckoutInfo.studentInfo.email },
                { phoneNumber: updatedCheckoutInfo.studentInfo.phoneNumber }
            ]
        });

        if (existingPupil) {
            console.log(`Existing pupil found: ${existingPupil}`);
            //here i need send email
            await sendWelcomeEmail(updatedCheckoutInfo.studentInfo.email, {
                name: existingPupil.firstName,
                phoneNumber: existingPupil.phoneNumber
            });

            return { pupil: existingPupil, isNew: false }; // Indicate that this is not a new entry
        }

        // Split name into parts
        const nameParts = updatedCheckoutInfo.studentInfo.name.split(' ');
        const firstName = nameParts[0]; // First part is first name
        const lastName = nameParts.slice(1).join(' '); // Rest joined together is last name

        // Proceed with external API call if pupil not found
        const apiUrl = `${process.env.DASHBOARD_URL}/api/pupil/create`;
        const payload = {
            "firstName": firstName,
            "lastName": lastName,
            "phoneNumber": updatedCheckoutInfo.studentInfo.phoneNumber,
            "email": updatedCheckoutInfo.studentInfo.email,
            "instructors": updatedCheckoutInfo.orderInfo.instructorsId,
            "snedLoginDetails": true
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };

        const response = await axios.post(apiUrl, payload, { headers });

        // Check if the response status is not in the 2xx range
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`API responded with status code ${response.status}`);
        }

        return response.data; // Indicate that this is a new entry
    } catch (error) {
        handleApiError(error);
    }
}

function handleApiError(error) {
    if (error.response) {
        const errMsg = (error.response.data && error.response.data.msg) || error.response.statusText || error.message;
        if (errMsg) {
            throw new Error(`API Error: ${errMsg}`);
        } else {
            throw new Error('An error occurred on the server.');
        }
    } else if (error.request) {
        throw new Error('API did not respond');
    } else {
        throw new Error('Error in setting up the API request ' + error.message);
    }
}

async function sendWelcomeEmail(email, data) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'alpsdrivingschool@gmail.com',
            pass: process.env.SECRET_PASSWORD,
        },
    });

    // Read the ejs template
    const template = fs.readFileSync('addNewOrderEmailTemplate.ejs', 'utf8');

    const htmlMessage = ejs.render(template, data);

    const mailOptions = {
        from: 'alpsdrivingschool@gmail.com',
        to: email,
        subject: `Welcome to Alps Driving School`,
        html: htmlMessage,
    };

    // Send email
    await transporter.sendMail(mailOptions);
}
async function updateStatusById(id, status) {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error('Invalid ID format');
    }

    const validStatuses = ['pending', 'success', 'failure'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
    }

    // First, find the existing CheckoutInfo to check its current status
    const existingCheckoutInfo = await CheckoutInfo.findById(id).exec();
    if (!existingCheckoutInfo) {
        throw new Error('Checkout info not found');
    }

    // Check if the current status is already "success"
    if (existingCheckoutInfo.orderInfo.status === 'success') {
        // Since the status is already "success", we don't proceed with the update
        // Instead, return the existingCheckoutInfo and possibly indicate that no update was needed
        return { alreadyUpdated: true, checkoutInfo: existingCheckoutInfo };
    }

    // If the status is not "success", proceed with the update
    const updatedCheckoutInfo = await CheckoutInfo.findByIdAndUpdate(
        id,
        { 'orderInfo.status': status },
        { new: true }
    ).exec();

    // Return the updatedCheckoutInfo along with an indication that an update was performed
    return { alreadyUpdated: false, checkoutInfo: updatedCheckoutInfo };
}


async function updatePupilIdById(id, pupilId) {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error('Invalid ID format');
    }

    // Assuming pupilId validation is required; adjust as necessary
    if (!pupilId) {
        throw new Error('Invalid pupilId value');
    }

    // Adjust the field to match your schema if necessary
    const updatedDocument = await CheckoutInfo.findByIdAndUpdate(
        id,
        { 'studentInfo.pupilId': pupilId }, // Update the pupilId field
        { new: true }
    ).exec();

    if (!updatedDocument) {
        throw new Error('Document not found');
    }
    console.log(`updatedDocument ${updatedDocument}`)
    return updatedDocument;
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
    return date;
}
function addTwoHours(date) {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 2);
    return newDate;
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
        const loginIdentifier = `${process.env.DASHBOARD_LOGIN_IDENTITIFER}`;
        const password = `${process.env.DASHBOARD_LOGIN_PASSWORD}`;

        // API endpoint
        const url = `${process.env.DASHBOARD_URL}/api/auth/login`;

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


