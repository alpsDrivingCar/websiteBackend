const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const helmet = require('helmet');
const cors = require("cors");
const authenticateAdmin = require('./Middleware/dashboardAdminAuth.js');
const { initializeScheduledGifts } = require('./Controller/gift/cards/giftPaymentCotroller');

app.use(bodyParser.json())
app.use(bodyParser.text())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(express.static(__dirname, { dotfiles: 'allow' }));

dotenv.config(dotenv);

//Routes booking
app.use('/api/booking/lesson', require('./routes/booking/lesson/LessonRoutes'))
app.use('//api/booking/lesson', require('./routes/booking/lesson/LessonRoutes')) // Remove after fixed in frontend
app.use('/api/booking/', require('./routes/booking/instructors/InstructorsBookingRoutes'))
app.use('/api/booking/timeLesson', require('./routes/booking/timeLesson/TimeLessonRoutes'))
app.use('/api/booking/packageBooking', authenticateAdmin, require('./routes/booking/package/PackageBookingRoutes'))
app.use('/api/checkout', require('./routes/booking/checkout/payment/PaymentRoutes'))
app.use('/api/email-check', require('./routes/booking/checkout/checkEmail/CheckEmailRoutes'))
app.use('/api/test-booking', require('./routes/booking/testBooking/TestBookingRoutes'))
app.use('/api/postcode', require('./routes/booking/postcode/PostcodeRoutes'))
app.use('/api/summary', require('./routes/booking/checkout/summary/SummaryRoutes'))
app.use('/api/booking/potentail-pupil', require('./routes/booking/potentialPupil/potentialPupil'))

//Routes setting
app.use('/api/setting/aboutus', require('./routes/setting/AboutUsRoutes'))
app.use('/api/setting/joinus', require('./routes/setting/JoinUsRoutes'))
app.use('/api/setting/contactUs', require('./routes/setting/ContactusRoutes'))
app.use('/api/setting/franchise', require('./routes/setting/FranchiseRoutes'))
app.use('/api/setting/testBooking', require('./routes/setting/TestBookingRouter'))

//Routes Locationsx
app.use('/api/locations', require('./routes/locations/LocationsRoutes'))

//Routes Locationsx
app.use('/api/gift', require('./routes/gift/GiftRoutes'))
app.use('/api/gift/checkout', require('./routes/gift/GiftCheckoutRoutes'))
app.use('/api/gift/info', require('./routes/gift/GiftInfoRoutes'))

//Routes fqa
app.use('/api/faqs', require('./routes/fqa/FqaRoute'))

//Routes franchise
app.use('/api/franchise', require('./routes/franchise/franchiseRoute'))


app.use('/api/home', require('./routes/home/HomeRoutes'))
app.use('/api/offer', require('./routes/offer/OfferRoutes'))

//Transactions
app.use('/api/transactions', authenticateAdmin, require('./routes/transactions/TransactionsRoutes'))


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Initialize scheduled gifts when server starts
initializeScheduledGifts().catch(console.error);

//mongoose
const { mongoose } = require('mongoose');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true, useUnifiedTopology: true,
}).then(() => {
    const port = process.env.PORT || 8000;
    const localUrl = `http://localhost:${port}`;
    const remoteUrlProd = 'https://alps-driving-website-prod-628456defbae.herokuapp.com';
    const remoteUrlDev = 'https://alps-driving-website-stg-34110f537a63.herokuapp.com';

    app.listen(port, () => {
        console.log("Server Run ");
        console.log(`Local URL: ${localUrl}`);
        console.log(`Remote URL (Production): ${remoteUrlProd}`);
        console.log(`Remote URL (Development): ${remoteUrlDev}`);
    });
}).catch(err => {
    console.log("mongodb Error :" + err);
});

module.exports = app