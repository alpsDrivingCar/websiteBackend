const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const helmet = require('helmet');
const cors = require("cors");


app.use(bodyParser.json())
app.use(bodyParser.text())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: true}))
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));

dotenv.config(dotenv);

//Routes
app.use('/api/booking/lesson', require('./routes/booking/lesson/LessonRoutes'))
app.use('/api/booking/instructors', require('./routes/booking/instructors/InstructorsBookingRoutes'))
app.use('/api/booking/timeLesson', require('./routes/booking/timeLesson/TimeLessonRoutes'))
// app.use('/api/booking/info', require('./routes/booking/info/InfoBookingRoutes'))
app.use('/api/home', require('./routes/home/HomeRoutes'))
app.use('/api/offer', require('./routes/offer/OfferRoutes'))
app.use('/api/setting/aboutus', require('./routes/setting/AboutUsRoutes'))
app.use('/api/setting/joinus', require('./routes/setting/JoinUsRoutes'))

app.use('/api/setting/contactUs', require('./routes/setting/ContactusRoutes'))
app.use('/api/create-checkout', require('./routes/booking/payment/PaymentRoutes'))


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//
// const stripe = require('stripe')(
//     process.env.STRIPE_PRIVATE_KEY
// )
//
// app.post('/create-checkout', async (req, res) => {
//     try {
//         const paymentIntent = await stripe.checkout.sessions.create({
//             // amount, // amount in cents
//             // currencycy: 'usd',
//             mode: 'payment', // Use 'payment' mode for one-time payments
//             success_url: req.body.success_url,
//             cancel_url: req.body.cancel_url,
//             line_items: req.body.items.map( item => {
//                 return {
//                     price_data:{
//                         currency: 'usd',
//                         product_data:{
//                             name :item.name
//                         },
//                         unit_amount: item.price
//                     },
//                     quantity:item.quantity
//                 }
//             }),
//         });
//
//         res.json({url: paymentIntent.url})
//     }catch (e) {
//         res.status(500).json({error : e.message})
//     }
// })







//mongoose
const {mongoose} = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true, useUnifiedTopology: true,
}).then(() => {
    // app.listen(3000)
    app.listen(process.env.PORT || 3000, () => {
        console.log("Server Run ")
    })
}).catch(err => {
        console.log("mongodb Error :" + err)
    })

module.exports = app
