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
app.use('/api/home', require('./routes/home/HomeRoutes'))
app.use('/api/offer', require('./routes/offer/OfferRoutes'))



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
